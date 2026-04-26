const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// Random map generator — generates walls for a given world size.
// Returns empty array for the smallest map (`small` world is 1 screen — no walls).
function generateWalls(world, mapSize) {
  if (mapSize === 'small') return []; // small mapa bez zdí

  const walls = [];
  const padding = 100; // odsazení od okraje
  const area = world.w * world.h;

  // Cílový počet zdí — škáluje s plochou
  // medium ≈ 14, large ≈ 30, huge ≈ 70
  const targetCount = Math.round(8 + area / 150000);

  const SIZES = [
    { w: 30, h: 100 }, { w: 30, h: 150 }, { w: 30, h: 200 },
    { w: 100, h: 30 }, { w: 150, h: 30 }, { w: 200, h: 30 },
    { w: 60, h: 60 }, { w: 80, h: 80 }, { w: 100, h: 100 },
    { w: 200, h: 30 }, { w: 30, h: 200 },
    { w: 150, h: 50 }, { w: 50, h: 150 },
  ];

  function overlaps(rect) {
    const margin = 60; // minimální průchod mezi zdmi
    for (const w of walls) {
      if (rect.x < w.x + w.w + margin && rect.x + rect.w + margin > w.x &&
          rect.y < w.y + w.h + margin && rect.y + rect.h + margin > w.y) {
        return true;
      }
    }
    return false;
  }

  let attempts = 0;
  const maxAttempts = targetCount * 40;

  while (walls.length < targetCount && attempts < maxAttempts) {
    attempts++;
    const size = SIZES[Math.floor(Math.random() * SIZES.length)];
    const x = Math.round(padding + Math.random() * (world.w - 2 * padding - size.w));
    const y = Math.round(padding + Math.random() * (world.h - 2 * padding - size.h));
    const rect = { x, y, w: size.w, h: size.h };

    if (overlaps(rect)) continue;

    // ~40% kámen, ~60% dřevo
    const type = Math.random() < 0.4 ? 'stone' : 'wood';
    walls.push({ ...rect, type });
  }

  return walls;
}

const WORLD_SIZES = {
  small:  { w: 960,  h: 600,  label: 'Small (1 screen)' },
  medium: { w: 1400, h: 900,  label: 'Medium' },
  large:  { w: 2400, h: 1800, label: 'Large' },
  huge:   { w: 3200, h: 3200, label: 'Huge' },
};
const DEFAULT_MAP = 'medium';
const MAX_PLAYERS = 8;

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────
const rooms = {}; // code -> { code, hostId, started, players: { socketId: {...} } }

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do {
    code = '';
    for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  } while (rooms[code]);
  return code;
}

function lobbySnapshot(room) {
  return {
    code: room.code,
    hostId: room.hostId,
    started: room.started,
    mapSize: room.mapSize || DEFAULT_MAP,
    availableMaps: Object.keys(WORLD_SIZES).map(id => ({
      id,
      label: WORLD_SIZES[id].label,
      w: WORLD_SIZES[id].w,
      h: WORLD_SIZES[id].h,
    })),
    players: Object.values(room.players).map(p => ({
      id: p.id,
      name: p.name,
      character: p.character,
      ready: p.ready,
      isHost: p.isHost,
    })),
  };
}

function broadcastLobby(code) {
  const room = rooms[code];
  if (!room) return;
  io.to(code).emit('lobby:update', lobbySnapshot(room));
}

function broadcastScoreboard(code) {
  const room = rooms[code];
  if (!room) return;
  const scoreboard = Object.values(room.players).map(p => ({
    id: p.id,
    name: p.name,
    character: p.character,
    kills: p.kills || 0,
    deaths: p.deaths || 0,
    ping: p.ping || 0,
  }));
  io.to(code).emit('game:scoreboard', scoreboard);
}

// ─────────────────────────────────────────────
// Sockets
// ─────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('connect', socket.id);
  let roomCode = null;

  function leaveRoom() {
    if (!roomCode) return;
    const room = rooms[roomCode];
    if (!room) { roomCode = null; return; }

    delete room.players[socket.id];
    socket.leave(roomCode);

    if (Object.keys(room.players).length === 0) {
      delete rooms[roomCode];
    } else {
      if (room.hostId === socket.id) {
        const next = Object.values(room.players)[0];
        room.hostId = next.id;
        next.isHost = true;
        next.ready = true;
      }
      broadcastLobby(roomCode);
    }
    roomCode = null;
  }

  socket.on('lobby:create', (data, cb) => {
    try {
      leaveRoom();
      const name = String(data?.name || 'Player').slice(0, 16).trim() || 'Player';
      const character = String(data?.character || 'soldier');
      const code = genCode();
      rooms[code] = {
        code,
        hostId: socket.id,
        started: false,
        mapSize: DEFAULT_MAP,
        players: {
          [socket.id]: { id: socket.id, name, character, ready: true, isHost: true },
        },
      };
      socket.join(code);
      roomCode = code;
      cb && cb({ ok: true, code });
      broadcastLobby(code);
    } catch (e) {
      console.error('lobby:create error:', e);
      cb && cb({ ok: false, error: 'Server error' });
    }
  });

  socket.on('lobby:join', (data, cb) => {
    try {
      leaveRoom();
      const code = String(data?.code || '').toUpperCase().trim();
      const name = String(data?.name || 'Player').slice(0, 16).trim() || 'Player';
      const character = String(data?.character || 'soldier');

      const room = rooms[code];
      if (!room) return cb && cb({ ok: false, error: 'Room does not exist' });
      if (room.started) return cb && cb({ ok: false, error: 'Game already started' });
      if (Object.keys(room.players).length >= MAX_PLAYERS) {
        return cb && cb({ ok: false, error: 'Room is full' });
      }

      room.players[socket.id] = {
        id: socket.id, name, character, ready: false, isHost: false,
      };
      socket.join(code);
      roomCode = code;
      cb && cb({ ok: true, code });
      broadcastLobby(code);
    } catch (e) {
      console.error('lobby:join error:', e);
      cb && cb({ ok: false, error: 'Server error' });
    }
  });

  socket.on('lobby:setCharacter', (data) => {
    const room = rooms[roomCode];
    if (!room || room.started) return;
    const p = room.players[socket.id];
    if (!p) return;
    p.character = String(data?.character || 'soldier');
    broadcastLobby(roomCode);
  });

  socket.on('lobby:toggleReady', () => {
    const room = rooms[roomCode];
    if (!room || room.started) return;
    const p = room.players[socket.id];
    if (!p || p.isHost) return;
    p.ready = !p.ready;
    broadcastLobby(roomCode);
  });

  socket.on('lobby:setMapSize', (data) => {
    const room = rooms[roomCode];
    if (!room || room.started) return;
    if (room.hostId !== socket.id) return; // jenom host
    const id = String(data?.mapSize || '');
    if (!WORLD_SIZES[id]) return;
    room.mapSize = id;
    broadcastLobby(roomCode);
  });

  socket.on('lobby:chat', (data) => {
    const room = rooms[roomCode];
    if (!room) return;
    const p = room.players[socket.id];
    if (!p) return;
    const text = String(data?.text || '').slice(0, 200).trim();
    if (!text) return;
    io.to(roomCode).emit('lobby:chat', { from: p.name, text });
  });

  socket.on('lobby:start', () => {
    const room = rooms[roomCode];
    if (!room || room.started) return;
    if (room.hostId !== socket.id) return;
    const players = Object.values(room.players);
    if (!players.every(p => p.ready)) {
      socket.emit('lobby:error', 'Some players are not ready');
      return;
    }
    room.started = true;
    const world = WORLD_SIZES[room.mapSize] || WORLD_SIZES[DEFAULT_MAP];
    const walls = generateWalls(world, room.mapSize).map(w => ({ ...w, hp: w.type === 'wood' ? 80 : Infinity }));

    // najdi nekolidující spawn pozici
    function spawnPos() {
      for (let i = 0; i < 30; i++) {
        const x = 100 + Math.random() * (world.w - 200);
        const y = 100 + Math.random() * (world.h - 200);
        let collide = false;
        for (const w of walls) {
          const cx = Math.max(w.x, Math.min(x, w.x + w.w));
          const cy = Math.max(w.y, Math.min(y, w.y + w.h));
          if ((x - cx) ** 2 + (y - cy) ** 2 < 30 * 30) { collide = true; break; }
        }
        if (!collide) return { x, y };
      }
      return { x: world.w / 2, y: world.h / 2 };
    }

    for (const p of players) {
      const sp = spawnPos();
      p.x = sp.x; p.y = sp.y;
      p.hp = 100; p.maxHp = 100; p.angle = 0;
      p.lastUpdate = Date.now(); p.shotTimes = [];
      p.kills = 0; p.deaths = 0; p.ping = 0;
    }
    room.world = { w: world.w, h: world.h };
    room.walls = walls; // serverside walls (s HP pro dřevěné)
    room.spawnPos = spawnPos;

    io.to(roomCode).emit('game:start', {
      world: { w: world.w, h: world.h },
      walls: walls.map(w => ({ x: w.x, y: w.y, w: w.w, h: w.h, type: w.type, hp: w.hp === Infinity ? null : w.hp })),
      players: players.map(p => ({
        id: p.id, name: p.name, character: p.character,
        x: p.x, y: p.y, hp: p.hp, maxHp: p.maxHp,
      })),
    });
  });

  // ── HRA (relay) ─────────────────────────────
  socket.on('game:state', (s) => {
    const room = rooms[roomCode];
    if (!room || !room.started) return;
    const p = room.players[socket.id];
    if (!p) return;
    if (typeof s?.x !== 'number' || typeof s?.y !== 'number') return;

    p.x = Math.max(0, Math.min(room.world.w, s.x));
    p.y = Math.max(0, Math.min(room.world.h, s.y));
    p.angle = s.angle ?? 0;
    p.hp = s.hp ?? p.hp;

    socket.to(roomCode).emit('game:state', {
      id: socket.id, x: p.x, y: p.y, angle: p.angle, hp: p.hp, t: Date.now(),
    });
  });

  socket.on('game:shoot', (d) => {
    const room = rooms[roomCode];
    if (!room || !room.started) return;
    const p = room.players[socket.id];
    if (!p) return;
    const now = Date.now();
    p.shotTimes = (p.shotTimes || []).filter(t => now - t < 1000);
    if (p.shotTimes.length >= 15) return;
    p.shotTimes.push(now);
    socket.to(roomCode).emit('game:shoot', {
      ownerId: socket.id,
      x: d?.x ?? p.x, y: d?.y ?? p.y,
      angle: d?.angle ?? 0,
      weapon: String(d?.weapon || 'pistol'),
    });
  });

  socket.on('game:hit', (d) => {
    const room = rooms[roomCode];
    if (!room || !room.started) return;
    const target = room.players[socket.id];
    if (!target) return;
    const damage = Math.max(0, Math.min(100, Number(d?.damage) || 0));
    target.hp = Math.max(0, target.hp - damage);
    if (target.hp === 0) {
      // přidělit kill / death
      const shooterId = String(d?.shooterId || '');
      const shooter = shooterId && room.players[shooterId];
      if (shooter && shooter.id !== target.id) {
        shooter.kills = (shooter.kills || 0) + 1;
      }
      target.deaths = (target.deaths || 0) + 1;

      target.hp = target.maxHp;
      const sp = room.spawnPos ? room.spawnPos() : { x: room.world.w / 2, y: room.world.h / 2 };
      target.x = sp.x;
      target.y = sp.y;
      io.to(roomCode).emit('game:respawn', {
        id: socket.id, x: target.x, y: target.y, hp: target.hp,
      });
      broadcastScoreboard(roomCode);
    }
  });

  socket.on('game:ability', (d) => {
    const room = rooms[roomCode];
    if (!room || !room.started) return;
    socket.to(roomCode).emit('game:ability', {
      id: socket.id, type: String(d?.type || ''), payload: d?.payload || {},
    });
  });

  socket.on('game:wallHit', (d) => {
    const room = rooms[roomCode];
    if (!room || !room.started || !room.walls) return;
    const idx = Number(d?.idx);
    const damage = Math.max(0, Math.min(100, Number(d?.damage) || 0));
    const wall = room.walls[idx];
    if (!wall || wall.type !== 'wood' || wall.hp === Infinity) return;
    wall.hp -= damage;
    if (wall.hp <= 0) {
      wall.hp = 0;
      wall.destroyed = true;
      io.to(roomCode).emit('game:wallDestroyed', { idx });
    } else {
      io.to(roomCode).emit('game:wallHp', { idx, hp: wall.hp });
    }
  });

  // Ping/pong + ping update
  socket.on('game:ping', (clientTime) => {
    socket.emit('game:pong', clientTime);
  });

  socket.on('game:reportPing', (ms) => {
    const room = rooms[roomCode];
    if (!room || !room.players[socket.id]) return;
    room.players[socket.id].ping = Math.max(0, Math.min(9999, Number(ms) || 0));
  });

  socket.on('disconnect', () => {
    console.log('disconnect', socket.id);
    if (roomCode) {
      const room = rooms[roomCode];
      if (room) {
        io.to(roomCode).emit('player:left', socket.id);
      }
      leaveRoom();
    }
  });
});

process.on('uncaughtException', (e) => console.error('uncaught:', e));
process.on('unhandledRejection', (e) => console.error('rejection:', e));

// Periodicky posílat scoreboard (ping se aktualizuje)
setInterval(() => {
  for (const code in rooms) {
    if (rooms[code].started) broadcastScoreboard(code);
  }
}, 2000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Listening on :${PORT}`));