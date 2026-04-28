// SPRITES — načítá Kenney top-down shooter PNG sprity
//
// Kenney sprite: hlava postavy v _stand obrázku míří NAHORU.
// V našem souřadném systému úhel 0 = doprava.
// Aby hlava směřovala ke kursoru: rotujeme o +PI/2.

const SPRITE_ROTATION_OFFSET = Math.PI / 2;

// DEBUG: nastav na true pokud ti rotace nesedí, uvidíš barevné značky
const DEBUG_ROTATION = true;

// Cesty k souborům — null znamená "tenhle nemám, kresli kruh / nepoužívej"
const CHARACTER_FILES = {
  soldier: '/images/char_soldier.png',
  tank:    '/images/char_tank.png',
  medic:   '/images/char_medic.png',
  ghost:   '/images/char_ghost.png',
};

// Zbraně — pokud máš jen některé z Kenney packu, ostatní nech null
// (postava bude vidět ze spritu, weapon overlay se nepoužívá)
const WEAPON_FILES = {
  pistol:  '/images/weapon_pistol.png',
  rifle:   '/images/weapon_rifle.png',
  shotgun: null,  // chybí v Kenney packu
  smg:     '/images/weapon_smg.png',
  grenade: null,  // chybí v Kenney packu
};

// Cache obrázků
const images = {};
let loadedCount = 0;
let totalCount = 0;
const loadCallbacks = [];

function loadImage(src) {
  if (images[src]) return images[src];
  totalCount++;
  const img = new Image();
  img.onload = () => {
    loadedCount++;
    console.log(`✓ Loaded sprite: ${src} (${img.naturalWidth}x${img.naturalHeight})`);
    if (loadedCount === totalCount) {
      loadCallbacks.forEach(cb => cb());
      loadCallbacks.length = 0;
    }
  };
  img.onerror = () => {
    console.warn('✗ Failed to load sprite:', src);
    loadedCount++;
    img._failed = true;
  };
  img.src = src;
  images[src] = img;
  return img;
}

// Spustí načítání všech spritů hned při importu
function preloadAll() {
  for (const k in CHARACTER_FILES) {
    if (CHARACTER_FILES[k]) loadImage(CHARACTER_FILES[k]);
  }
  for (const k in WEAPON_FILES) {
    if (WEAPON_FILES[k]) loadImage(WEAPON_FILES[k]);
  }
}
preloadAll();

export function onSpritesLoaded(cb) {
  if (loadedCount >= totalCount && totalCount > 0) cb();
  else loadCallbacks.push(cb);
}

// Velikosti (Kenney sprity jsou ~80×80 px, my chceme ~50 px průměr na canvasu)
const CHAR_DRAW_SIZE = 50;
const WEAPON_DRAW_SIZE = 32;
// Pozice zbraně relativně ke středu postavy (po rotaci)
// Kenney systém: nahoru = před postavou, vpravo = strana ruky
const WEAPON_OFFSET_X = 12;  // doprava (do ruky)
const WEAPON_OFFSET_Y = -8;  // mírně nahoru (před postavou)

/**
 * Nakreslí postavu a její aktuální zbraň zvlášť.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} characterType - 'soldier' | 'tank' | 'medic' | 'ghost'
 * @param {string} weapon - aktuální zbraň ('pistol' | 'rifle' | 'shotgun' | 'smg' | 'grenade')
 * @param {number} x, y - pozice na canvasu (svět coords)
 * @param {number} angle - úhel rotace v radiánech (0 = doprava)
 * @param {object} opts - { alpha, scale }
 */
export function drawCharacter(ctx, characterType, weapon, x, y, angle, opts = {}) {
  const charSrc = CHARACTER_FILES[characterType] || CHARACTER_FILES.soldier;
  const charImg = images[charSrc];
  const scale = opts.scale || 1;

  ctx.save();
  if (opts.alpha != null) ctx.globalAlpha = opts.alpha;
  ctx.translate(x, y);
  ctx.rotate((angle || 0) + SPRITE_ROTATION_OFFSET);

  // 1) Postava
  if (charImg && charImg.complete && !charImg._failed && charImg.naturalWidth > 0) {
    const size = scale * CHAR_DRAW_SIZE;
    ctx.drawImage(charImg, -size / 2, -size / 2, size, size);
  } else {
    drawFallback(ctx, characterType);
  }

  // DEBUG overlay (pouze když DEBUG_ROTATION = true)
  if (DEBUG_ROTATION) {
    // RŮŽOVÝ obdélník na "vrcholu" lokálního Y (po rotaci tam směřuje "nahoru" v sprite)
    ctx.fillStyle = 'magenta';
    ctx.fillRect(-3, -45, 6, 6); // nahoře v sprite = kde má být hlava
    // ZELENÁ šipka ve směru úhlu (kde je kursor v lokálním systému)
    ctx.strokeStyle = 'lime';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(45, 0);
    ctx.stroke();
  }

  // 2) Zbraň navrch (offset doprava = strana ruky postavy v jejich orientaci hlavou nahoru)
  const weaponSrc = WEAPON_FILES[weapon];
  if (weaponSrc) {
    const wImg = images[weaponSrc];
    if (wImg && wImg.complete && !wImg._failed && wImg.naturalWidth > 0) {
      const wSize = scale * WEAPON_DRAW_SIZE;
      // posun: vpravo od středu (ruka), mírně nahoru (před hráčem)
      ctx.drawImage(wImg, WEAPON_OFFSET_X - wSize / 2, WEAPON_OFFSET_Y - wSize / 2, wSize, wSize);
    }
  }

  ctx.restore();
}

// Fallback když sprite chybí
function drawFallback(ctx, characterType) {
  const colors = {
    soldier: '#4ecdc4', tank: '#a06cd5',
    medic: '#5ec85e',   ghost: '#888888',
  };
  ctx.fillStyle = colors[characterType] || '#ff6b6b';
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  // šipka "nahoru" (po rotaci = směr myši)
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -26);
  ctx.stroke();
}

export const SPRITE_RADIUS = 18; // kolize radius zůstává stejný