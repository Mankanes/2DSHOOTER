export class Bullet {
  constructor({ x, y, angle, speed, life, damage, ownerId }) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = life;
    this.damage = damage;
    this.ownerId = ownerId;
    this.dead = false;
  }

  // Vrací { hitWallIdx, type } pokud kulka trefila zeď
  update(dt, worldW, worldH, walls) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;

    if (this.life <= 0 || this.x < 0 || this.x > worldW || this.y < 0 || this.y > worldH) {
      this.dead = true;
      return null;
    }

    if (walls) {
      for (let i = 0; i < walls.length; i++) {
        const w = walls[i];
        if (w.destroyed) continue;
        if (this.x >= w.x && this.x <= w.x + w.w && this.y >= w.y && this.y <= w.y + w.h) {
          this.dead = true;
          return { hitWallIdx: i, type: w.type };
        }
      }
    }
    return null;
  }
}