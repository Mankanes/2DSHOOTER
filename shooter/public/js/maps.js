// Definice map pro každou velikost.
// Každá zeď: { x, y, w, h, type } kde type je 'stone' nebo 'wood'
// 'stone' — neprůstřelná, neproniknutelná
// 'wood'  — neproniknutelná pro hráče, kulky ji prostřelí (zeď má HP)

export const MAPS = {
    small: {
      walls: [
        // střed: malý kamenný kryt + dřevěné stěny
        { x: 380, y: 280, w: 60, h: 40, type: 'stone' },
        { x: 480, y: 280, w: 60, h: 40, type: 'stone' },
        { x: 200, y: 150, w: 20, h: 100, type: 'wood' },
        { x: 740, y: 350, w: 20, h: 100, type: 'wood' },
        { x: 100, y: 450, w: 120, h: 20, type: 'wood' },
        { x: 740, y: 130, w: 120, h: 20, type: 'wood' },
      ],
    },
  
    medium: {
      walls: [
        // 4 kamenné kryty v rozích vnitřní oblasti
        { x: 250, y: 200, w: 80, h: 30, type: 'stone' },
        { x: 1070, y: 200, w: 80, h: 30, type: 'stone' },
        { x: 250, y: 670, w: 80, h: 30, type: 'stone' },
        { x: 1070, y: 670, w: 80, h: 30, type: 'stone' },
        // střed: kamenný komplex
        { x: 660, y: 400, w: 80, h: 100, type: 'stone' },
        { x: 580, y: 380, w: 240, h: 20, type: 'stone' },
        { x: 580, y: 500, w: 240, h: 20, type: 'stone' },
        // dřevěné krátké stěny pro krytí
        { x: 500, y: 150, w: 20, h: 120, type: 'wood' },
        { x: 880, y: 630, w: 20, h: 120, type: 'wood' },
        { x: 150, y: 400, w: 100, h: 20, type: 'wood' },
        { x: 1150, y: 480, w: 100, h: 20, type: 'wood' },
      ],
    },
  
    large: {
      walls: [
        // okrajové kryty
        { x: 200, y: 250, w: 150, h: 30, type: 'stone' },
        { x: 2050, y: 250, w: 150, h: 30, type: 'stone' },
        { x: 200, y: 1520, w: 150, h: 30, type: 'stone' },
        { x: 2050, y: 1520, w: 150, h: 30, type: 'stone' },
        // střed - kamenný komplex
        { x: 1100, y: 800, w: 200, h: 30, type: 'stone' },
        { x: 1100, y: 970, w: 200, h: 30, type: 'stone' },
        { x: 1100, y: 800, w: 30, h: 200, type: 'stone' },
        { x: 1270, y: 800, w: 30, h: 200, type: 'stone' },
        // šachovnice dřevěných stěn
        { x: 600, y: 500, w: 30, h: 200, type: 'wood' },
        { x: 800, y: 600, w: 200, h: 30, type: 'wood' },
        { x: 1500, y: 500, w: 200, h: 30, type: 'wood' },
        { x: 1700, y: 600, w: 30, h: 200, type: 'wood' },
        { x: 600, y: 1100, w: 200, h: 30, type: 'wood' },
        { x: 800, y: 1200, w: 30, h: 200, type: 'wood' },
        { x: 1500, y: 1200, w: 30, h: 200, type: 'wood' },
        { x: 1700, y: 1100, w: 200, h: 30, type: 'wood' },
        // dlouhé bariéry
        { x: 400, y: 900, w: 30, h: 250, type: 'stone' },
        { x: 1970, y: 700, w: 30, h: 250, type: 'stone' },
      ],
    },
  
    huge: {
      walls: [
        // pevnost ve středu
        { x: 1500, y: 1500, w: 200, h: 30, type: 'stone' },
        { x: 1500, y: 1670, w: 200, h: 30, type: 'stone' },
        { x: 1500, y: 1500, w: 30, h: 200, type: 'stone' },
        { x: 1670, y: 1500, w: 30, h: 200, type: 'stone' },
        // 4 satelitní bunkry
        { x: 600, y: 600, w: 100, h: 100, type: 'stone' },
        { x: 2500, y: 600, w: 100, h: 100, type: 'stone' },
        { x: 600, y: 2500, w: 100, h: 100, type: 'stone' },
        { x: 2500, y: 2500, w: 100, h: 100, type: 'stone' },
        // okrajové dřevěné palisády
        { x: 300, y: 1500, w: 30, h: 300, type: 'wood' },
        { x: 2870, y: 1500, w: 30, h: 300, type: 'wood' },
        { x: 1500, y: 300, w: 300, h: 30, type: 'wood' },
        { x: 1500, y: 2870, w: 300, h: 30, type: 'wood' },
        // dřevěné labyrint stěny
        { x: 1000, y: 1000, w: 30, h: 400, type: 'wood' },
        { x: 1000, y: 1000, w: 400, h: 30, type: 'wood' },
        { x: 2200, y: 1800, w: 30, h: 400, type: 'wood' },
        { x: 1800, y: 2200, w: 400, h: 30, type: 'wood' },
        // diagonální menší bariéry
        { x: 800, y: 1900, w: 200, h: 30, type: 'wood' },
        { x: 2200, y: 1100, w: 200, h: 30, type: 'wood' },
        { x: 1100, y: 600, w: 30, h: 150, type: 'stone' },
        { x: 1900, y: 2400, w: 30, h: 150, type: 'stone' },
      ],
    },
  };
  
  export const WOOD_HP = 80; // dřevěná zeď absorbuje takhle moc damage před zničením
  
  // Kolize: vrátí true pokud kruh (cx, cy, r) prochází obdélníkem
  export function circleRectCollide(cx, cy, r, rect) {
    const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
    const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
    const dx = cx - closestX;
    const dy = cy - closestY;
    return dx * dx + dy * dy < r * r;
  }
  
  // Kolize bod-obdélník (pro kulky)
  export function pointInRect(x, y, rect) {
    return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
  }