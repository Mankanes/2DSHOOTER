// SPRITES — načítá Kenney top-down shooter PNG sprity
//
// Kenney sprity jsou orientované "hlavou nahoru" (úhel = -PI/2).
// Náš souřadnicový systém má hráče "kouká doprava" (úhel = 0).
// Proto otočíme sprity o +PI/2 = 90° doprava.

const SPRITE_ROTATION_OFFSET = Math.PI / 2;

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
    if (loadedCount === totalCount) {
      loadCallbacks.forEach(cb => cb());
      loadCallbacks.length = 0;
    }
  };
  img.onerror = () => {
    console.warn('Failed to load sprite:', src);
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
const WEAPON_DRAW_SIZE = 36;
const WEAPON_OFFSET = 20; // jak daleko od středu hráče je zbraň

/**
 * Nakreslí postavu (s integrovanou zbraní v ruce).
 * Kenney sprity už mají postavu se zbraní, takže kreslíme jen ji.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} characterType - 'soldier' | 'tank' | 'medic' | 'ghost'
 * @param {string} weapon - aktuální zbraň (zatím ignorováno, Kenney sprite má svou)
 * @param {number} x, y - pozice na canvasu (svět coords)
 * @param {number} angle - úhel rotace v radiánech (0 = doprava)
 * @param {object} opts - { alpha, scale }
 */
export function drawCharacter(ctx, characterType, weapon, x, y, angle, opts = {}) {
  const charSrc = CHARACTER_FILES[characterType] || CHARACTER_FILES.soldier;
  const charImg = images[charSrc];

  ctx.save();
  if (opts.alpha != null) ctx.globalAlpha = opts.alpha;
  ctx.translate(x, y);
  ctx.rotate((angle || 0) + SPRITE_ROTATION_OFFSET);

  if (charImg && charImg.complete && !charImg._failed && charImg.naturalWidth > 0) {
    const size = (opts.scale || 1) * CHAR_DRAW_SIZE;
    // Kenney sprity mají zbraň vyčnívající nahoru; centrujeme bod zájmu
    ctx.drawImage(charImg, -size / 2, -size / 2, size, size);
  } else {
    // Fallback - jednoduchý kruh dokud se sprite nenačte (nebo pokud chybí soubor)
    drawFallback(ctx, characterType);
  }

  ctx.restore();
}

/**
 * Volitelně překreslí zbraň zvlášť. Kenney sprity ji už mají,
 * takže tohle je extra option (např. když hráč přepne zbraň).
 * Aktuálně to nepoužíváme — postava drží svou default zbraň ze spritu.
 */
export function drawWeaponOverlay(ctx, weapon, x, y, angle, opts = {}) {
  const weaponSrc = WEAPON_FILES[weapon];
  const img = images[weaponSrc];
  if (!img || !img.complete || img._failed) return;

  ctx.save();
  if (opts.alpha != null) ctx.globalAlpha = opts.alpha;
  ctx.translate(x, y);
  ctx.rotate((angle || 0) + SPRITE_ROTATION_OFFSET);
  const size = (opts.scale || 1) * WEAPON_DRAW_SIZE;
  ctx.drawImage(img, -size / 2, -size / 2 - WEAPON_OFFSET, size, size);
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