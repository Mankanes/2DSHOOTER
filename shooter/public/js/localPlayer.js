export class LocalPlayer {
  constructor(x, y, character) {
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.character = character;
    this.speed = character.speed;
    this.maxHp = character.maxHp;
    this.hp = character.maxHp;
    this.color = character.color;
    this.fireCooldown = 0;
    this.abilityCooldown = 0;
    this.shieldUntil = 0;
    this.invisibleUntil = 0;
    this.name = '';
    // last movement direction (for dash etc.)
    this.moveDirX = 0;
    this.moveDirY = 0;
  }

  update(dt, input, mouse, worldW, worldH) {
    let dx = 0, dy = 0;
    if (input.up)    dy -= 1;
    if (input.down)  dy += 1;
    if (input.left)  dx -= 1;
    if (input.right) dx += 1;
    const len = Math.hypot(dx, dy);
    if (len > 0) { dx /= len; dy /= len; }

    // save direction for abilities (dash etc.)
    this.moveDirX = dx;
    this.moveDirY = dy;

    // delta posunu v tomhle framu
    const moveX = dx * this.speed * dt;
    const moveY = dy * this.speed * dt;

    // klamp pomáhá nezatížit kolize, ale skutečnou kolizi řeší volající
    this._wantMoveX = moveX;
    this._wantMoveY = moveY;

    this.angle = Math.atan2(mouse.y - this.y, mouse.x - this.x);

    this.fireCooldown    = Math.max(0, this.fireCooldown - dt);
    this.abilityCooldown = Math.max(0, this.abilityCooldown - dt);
  }

  // posun s kontrolou kolizí (volá game.js po update)
  applyMove(walls, worldW, worldH) {
    const r = 18; // poloměr hráče
    let nx = this.x + (this._wantMoveX || 0);
    let ny = this.y + (this._wantMoveY || 0);

    // axis-separated: nejdřív X (umožní sliding podle zdi)
    let testX = nx;
    for (const w of walls) {
      if (w.destroyed) continue;
      const cx = Math.max(w.x, Math.min(testX, w.x + w.w));
      const cy = Math.max(w.y, Math.min(this.y, w.y + w.h));
      const dx = testX - cx, dy = this.y - cy;
      if (dx * dx + dy * dy < r * r) {
        // odstrč hráče zpátky podle směru pohybu
        if (this._wantMoveX > 0) testX = w.x - r;
        else if (this._wantMoveX < 0) testX = w.x + w.w + r;
      }
    }
    this.x = Math.max(r, Math.min(worldW - r, testX));

    // pak Y
    let testY = ny;
    for (const w of walls) {
      if (w.destroyed) continue;
      const cx = Math.max(w.x, Math.min(this.x, w.x + w.w));
      const cy = Math.max(w.y, Math.min(testY, w.y + w.h));
      const dx = this.x - cx, dy = testY - cy;
      if (dx * dx + dy * dy < r * r) {
        if (this._wantMoveY > 0) testY = w.y - r;
        else if (this._wantMoveY < 0) testY = w.y + w.h + r;
      }
    }
    this.y = Math.max(r, Math.min(worldH - r, testY));

    this._wantMoveX = 0;
    this._wantMoveY = 0;
  }
}