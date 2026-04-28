// SPRITES — top-down pixel-art postavy a zbraně, kreslené přes Canvas API
//
// Konvence: souřadnice jsou centrované na (0,0) — hráč je střed.
// Volající už udělal ctx.translate(x, y) a ctx.rotate(angle).
// Hráč "kouká doprava" v lokálním souřadném systému (úhel 0 = doprava).

const RADIUS = 18; // kolize radius — postava se kreslí v této velikosti

// ── ZBRANĚ ──────────────────────────────────────
// Kreslené po rotaci — vždy na pravé straně postavy (kde je ruka)
function drawWeapon(ctx, weapon, color = '#1a1a1a') {
  ctx.fillStyle = color;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;

  if (weapon === 'pistol') {
    // krátká pistole
    ctx.fillRect(8, -2, 14, 5);
    ctx.fillStyle = '#3d3d3d';
    ctx.fillRect(20, -3, 3, 7); // ústí
  } else if (weapon === 'rifle') {
    // dlouhá puška se zaměřovačem
    ctx.fillRect(6, -2, 24, 4);
    ctx.fillStyle = '#3d3d3d';
    ctx.fillRect(28, -3, 3, 6);
    ctx.fillRect(13, -4, 5, 2); // zásobník
  } else if (weapon === 'shotgun') {
    // tlustá brokovnice
    ctx.fillRect(6, -3, 20, 7);
    ctx.fillStyle = '#3d3d3d';
    ctx.fillRect(24, -4, 3, 9);
  } else if (weapon === 'smg') {
    // kompaktní samopal
    ctx.fillRect(7, -2, 16, 5);
    ctx.fillStyle = '#3d3d3d';
    ctx.fillRect(21, -3, 3, 7);
    ctx.fillRect(11, 3, 4, 4); // grip
  } else if (weapon === 'grenade') {
    // launcher — krátká tlustá hlaveň
    ctx.fillRect(8, -3, 14, 7);
    ctx.fillStyle = '#5c4019';
    ctx.fillRect(20, -4, 4, 9);
  } else {
    // default
    ctx.fillRect(8, -2, 14, 5);
  }
}

// ── POSTAVY ─────────────────────────────────────
// Každá funkce kreslí postavu centrovanou na (0,0)

function drawSoldier(ctx, weapon) {
  // tělo — taktická vesta
  ctx.fillStyle = '#3a5a3a'; // vojenská zelená
  ctx.beginPath();
  ctx.arc(0, 0, RADIUS, 0, Math.PI * 2);
  ctx.fill();

  // vesta — tmavší pás
  ctx.fillStyle = '#2a4a2a';
  ctx.fillRect(-12, -8, 6, 16);

  // helma — hnědá s páskou
  ctx.fillStyle = '#6b5b3e';
  ctx.beginPath();
  ctx.arc(0, 0, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3d2f1a';
  ctx.fillRect(-11, -2, 22, 2); // helma páska

  // ramena
  ctx.fillStyle = '#3a5a3a';
  ctx.fillRect(-2, -RADIUS - 1, 4, 3); // krk
  ctx.fillRect(2, -8, 8, 5);   // pravé rameno
  ctx.fillRect(2, 3, 8, 5);    // levé rameno

  // zbraň
  drawWeapon(ctx, weapon, '#1a1a1a');
}

function drawTank(ctx, weapon) {
  // tělo — robot, kovový panel
  ctx.fillStyle = '#5a5a6e';
  ctx.fillRect(-RADIUS, -RADIUS, RADIUS * 2, RADIUS * 2);

  // panely — pixelový pattern
  ctx.fillStyle = '#3a3a4e';
  ctx.fillRect(-RADIUS, -RADIUS, RADIUS * 2, 2);   // horní okraj
  ctx.fillRect(-RADIUS, RADIUS - 2, RADIUS * 2, 2); // spodní okraj
  ctx.fillRect(-RADIUS, -2, RADIUS * 2, 4);          // střed

  // hlava — kovová s vizorem
  ctx.fillStyle = '#7a7a8e';
  ctx.beginPath();
  ctx.arc(0, 0, 11, 0, Math.PI * 2);
  ctx.fill();
  // vizor — svítící pásek
  ctx.fillStyle = '#a06cd5';
  ctx.fillRect(2, -3, 8, 6);
  // glow
  ctx.fillStyle = '#d0a0ff';
  ctx.fillRect(7, -1, 3, 2);

  // pancéřová ramena
  ctx.fillStyle = '#4a4a5e';
  ctx.fillRect(2, -10, 9, 6);
  ctx.fillRect(2, 4, 9, 6);

  // šrouby
  ctx.fillStyle = '#2a2a3e';
  ctx.fillRect(-RADIUS + 2, -RADIUS + 2, 2, 2);
  ctx.fillRect(RADIUS - 4, -RADIUS + 2, 2, 2);
  ctx.fillRect(-RADIUS + 2, RADIUS - 4, 2, 2);
  ctx.fillRect(RADIUS - 4, RADIUS - 4, 2, 2);

  // zbraň (Tank má brokovnici)
  drawWeapon(ctx, weapon, '#1a1a2a');
}

function drawMedic(ctx, weapon) {
  // tělo — bílý plášť
  ctx.fillStyle = '#e0e0e0';
  ctx.beginPath();
  ctx.arc(0, 0, RADIUS, 0, Math.PI * 2);
  ctx.fill();

  // červený kříž (medic znak) — viditelný shora na zádech
  ctx.fillStyle = '#cc2222';
  ctx.fillRect(-10, -2, 8, 4);   // horizontální
  ctx.fillRect(-8, -6, 4, 12);   // vertikální

  // hlava — světlá kůže
  ctx.fillStyle = '#f0c8a0';
  ctx.beginPath();
  ctx.arc(0, 0, 9, 0, Math.PI * 2);
  ctx.fill();

  // čepice — bílá s zeleným pruhem
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, 9, -Math.PI / 2 - 0.5, Math.PI / 2 + 0.5);
  ctx.fill();
  ctx.fillStyle = '#5ec85e';
  ctx.fillRect(-4, -9, 8, 2); // zelený pruh

  // ramena (bílá)
  ctx.fillStyle = '#e0e0e0';
  ctx.fillRect(2, -8, 8, 5);
  ctx.fillRect(2, 3, 8, 5);

  // zbraň
  drawWeapon(ctx, weapon, '#2a2a2a');
}

function drawGhost(ctx, weapon) {
  // tělo — tmavošedé, jakoby kapuce
  ctx.fillStyle = '#3a3a3a';
  ctx.beginPath();
  ctx.arc(0, 0, RADIUS, 0, Math.PI * 2);
  ctx.fill();

  // mlha okolo
  ctx.strokeStyle = 'rgba(150, 150, 180, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, RADIUS + 2, 0, Math.PI * 2);
  ctx.stroke();

  // kapuce — tmavé záhyby
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(-2, 0, 13, -Math.PI / 2 - 0.6, Math.PI / 2 + 0.6, true);
  ctx.fill();

  // jen oči vidět z kapuce — svítící
  ctx.fillStyle = '#a0e0ff';
  ctx.fillRect(3, -4, 3, 2);
  ctx.fillRect(3, 2, 3, 2);
  // glow
  ctx.fillStyle = 'rgba(160, 224, 255, 0.4)';
  ctx.fillRect(2, -5, 5, 4);
  ctx.fillRect(2, 1, 5, 4);

  // tichá zbraň — tmavá
  drawWeapon(ctx, weapon, '#0a0a0a');
}

// ── PUBLIC API ──────────────────────────────────
const RENDERERS = {
  soldier: drawSoldier,
  tank: drawTank,
  medic: drawMedic,
  ghost: drawGhost,
};

/**
 * Nakreslí postavu na canvas. Volat po ctx.save() + translate na pozici hráče.
 * Funkce sama udělá rotate(angle) a draw všeho.
 */
export function drawCharacter(ctx, characterType, weapon, x, y, angle, opts = {}) {
  const renderer = RENDERERS[characterType] || drawSoldier;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle || 0);
  if (opts.alpha != null) ctx.globalAlpha = opts.alpha;
  renderer(ctx, weapon);
  ctx.restore();
}

export const SPRITE_RADIUS = RADIUS;