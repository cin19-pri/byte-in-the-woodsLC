import Matter from "matter-js";
import { art } from "./art";
import { INITIAL_LIVES, collectFirefly, takeDamage } from "./rules";
type Callbacks = { onLives: (n: number) => void; onChest: () => void; onDefeat: () => void; onProgress: (n: number) => void; sound: (kind: "jump" | "collect" | "damage") => void };
import { createLevel, type Platform } from "./levels";
export class ForestEngine {
  private engine = Matter.Engine.create({ gravity: { x: 0, y: 1.6 } });
  private player = Matter.Bodies.rectangle(90, 390, 32, 64, { friction: 0, frictionAir: .015, inertia: Infinity, restitution: 0 });
  private platforms: Platform[];
  private ledges: Matter.Body[] = [];
  private images: Record<string, HTMLImageElement> = {};
  private colors = { grass: "", earth: "", "earth-light": "", rock: "", "rock-dark": "", crystal: "", ink: "", spark: "", light: "" };
  private keys = new Set<string>();
  private raf = 0;
  private last = 0;
  private elapsed = 0;
  private camera = 0;
  private lives = INITIAL_LIVES;
  private invulnerable = 0;
  private grounded = false;
  private facing = 1;
  private paused = false;
  private disposed = false;
  private completed = false;
  private checkpoint = { x: 90, y: 390 };
  private fireflies = [{ x: 360, y: 330, taken: false }, { x: 970, y: 275, taken: false }, { x: 1620, y: 305, taken: false }];
  private enemies: { base: number; x: number; y: number; range: number; kind: string; speed: number }[];
  private messages: { text: string; x: number; y: number; end: number }[] = [];
  readonly worldWidth: number;
  private chestX: number;
  private portalX: number;
  private viewWidth = 960;
  private viewHeight = 540;
  private resize = () => {
    const bounds = this.canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    this.viewWidth = Math.max(320, Math.min(1600, 540 * bounds.width / bounds.height));
    this.viewHeight = this.viewWidth * bounds.height / bounds.width;
    this.canvas.width = Math.round(this.viewWidth);
    this.canvas.height = Math.round(this.viewHeight);
  };
  constructor(private canvas: HTMLCanvasElement, readonly level: number, private callbacks: Callbacks) {
    const layout = createLevel(level);
    this.platforms = layout.platforms;
    this.enemies = layout.enemies;
    this.fireflies = layout.fireflies;
    this.worldWidth = layout.worldWidth;
    this.chestX = layout.chestX;
    this.portalX = layout.portalX;
    const platformBodies = this.platforms.map(p => {
      const body = Matter.Bodies.rectangle(p.x + p.w / 2, p.y + p.h / 2, p.w, p.h, { isStatic: true, friction: 0 });
      if (p.h < 50) this.ledges.push(body);
      return body;
    });
    Matter.Composite.add(this.engine.world, [this.player, ...platformBodies]);
    const styles = getComputedStyle(document.documentElement);
    for (const name of Object.keys(this.colors) as (keyof typeof this.colors)[]) this.colors[name] = styles.getPropertyValue(`--canvas-${name}`).trim();
    for (const [name, url] of Object.entries(art)) { const image = new Image(); image.src = url; this.images[name] = image; }
    this.resize(); window.addEventListener("resize", this.resize);
    window.addEventListener("keydown", this.keyDown); window.addEventListener("keyup", this.keyUp); window.addEventListener("blur", this.blur);
    this.raf = requestAnimationFrame(this.frame);
  }
  setPaused(value: boolean) { this.paused = value; this.keys.clear(); }
  input(key: string, down: boolean) { if (down) { this.keys.add(key); if (key === "jump") this.jump(); } else this.keys.delete(key); }
  private keyDown = (e: KeyboardEvent) => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", " "].includes(e.key)) { e.preventDefault(); if (!this.paused) { if ((e.key === " " || e.key === "ArrowUp") && !e.repeat) this.jump(); this.keys.add(e.key); } }
  };
  private keyUp = (e: KeyboardEvent) => { this.keys.delete(e.key); };
  private blur = () => { this.keys.clear(); };
  private jump() { if (this.grounded && !this.paused) { Matter.Body.setVelocity(this.player, { x: this.player.velocity.x, y: -16 }); this.grounded = false; this.callbacks.sound("jump"); } }
  private damage(fall: boolean) {
    if (this.elapsed < this.invulnerable && !fall) return;
    this.lives = takeDamage(this.lives); this.callbacks.onLives(this.lives); this.callbacks.sound("damage"); this.invulnerable = this.elapsed + 1800;
    if (!this.lives) { this.paused = true; this.callbacks.onDefeat(); return; }
    if (fall) { Matter.Body.setPosition(this.player, this.checkpoint); Matter.Body.setVelocity(this.player, { x: 0, y: 0 }); }
    else Matter.Body.setVelocity(this.player, { x: -this.facing * 5, y: -7 });
  }
  private frame = (time: number) => {
    if (this.disposed) return;
    const dt = Math.min(time - (this.last || time), 33.3); this.last = time;
    if (!this.paused) {
      this.elapsed += dt;
      const xdir = (this.keys.has("ArrowRight") || this.keys.has("right") ? 1 : 0) - (this.keys.has("ArrowLeft") || this.keys.has("left") ? 1 : 0);
      if (xdir) this.facing = xdir;
      Matter.Body.setVelocity(this.player, { x: xdir * 4.6, y: this.player.velocity.y });
      for (const ledge of this.ledges) ledge.isSensor = this.player.velocity.y < 0 || this.player.position.y + 32 > ledge.bounds.min.y + 8;
      Matter.Engine.update(this.engine, dt || 16.67);
      const pos = this.player.position;
      if (pos.x < 20) Matter.Body.setPosition(this.player, { x: 20, y: pos.y });
      this.grounded = this.platforms.some(p => pos.x + 13 > p.x && pos.x - 13 < p.x + p.w && Math.abs(pos.y + 32 - p.y) < 5 && Math.abs(this.player.velocity.y) < 2);
      if (this.grounded) {
        const safePlatform = this.platforms.find(p => p.h > 50 && pos.x > p.x + 45 && pos.x < p.x + p.w - 45 && Math.abs(pos.y + 32 - p.y) < 5);
        if (safePlatform) this.checkpoint = { x: pos.x, y: pos.y - 15 };
      }
      if (pos.y > 650) this.damage(true);
      for (const f of this.fireflies) if (!f.taken && Math.hypot(pos.x - f.x, pos.y - f.y) < 52) { f.taken = true; const previousLives = this.lives; this.lives = collectFirefly(this.lives); this.callbacks.onLives(this.lives); this.callbacks.sound("collect"); this.messages.push({ text: this.lives > previousLives ? "+1 vida ✦" : "", x: f.x, y: f.y, end: this.elapsed + 1300 }); }
      for (const e of this.enemies) { e.x = e.base + Math.sin(this.elapsed * e.speed / 850 + e.base) * e.range; if (Math.abs(pos.x - e.x) < 38 && Math.abs(pos.y - (e.y - 28)) < 52) this.damage(false); }
      this.camera = Math.max(0, Math.min(this.worldWidth - this.viewWidth, pos.x - this.viewWidth / 3));
      this.callbacks.onProgress(Math.min(100, Math.floor(pos.x / this.chestX * 100)));
      if (pos.x > this.chestX && !this.completed) { this.completed = true; this.paused = true; this.callbacks.onChest(); }
    }
    this.draw(); this.raf = requestAnimationFrame(this.frame);
  };
  private image(ctx: CanvasRenderingContext2D, name: string, x: number, y: number, w: number, h: number) {
    const im = this.images[name]; if (im?.complete && im.naturalWidth) ctx.drawImage(im, x, y, w, h);
  }
  private crystal(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    ctx.fillStyle = this.colors.crystal; ctx.beginPath(); ctx.moveTo(x, y - size); ctx.lineTo(x + size * .5, y - size * .35); ctx.lineTo(x + size * .3, y + size * .5); ctx.lineTo(x, y + size); ctx.lineTo(x - size * .4, y + size * .3); ctx.lineTo(x - size * .5, y - size * .4); ctx.closePath(); ctx.fill(); ctx.strokeStyle = this.colors.light; ctx.lineWidth = 1; ctx.stroke();
  }
  private draw() {
    const c = this.canvas.getContext("2d"); if (!c) return;
    c.clearRect(0, 0, this.viewWidth, this.viewHeight);
    c.save();
    c.translate(0, this.viewHeight - 540);
    const bg = this.images[this.level === 1 ? "day" : "night"];
    if (bg?.complete && bg.naturalWidth) {
      const height = Math.max(540, this.viewHeight);
      const width = Math.max(this.viewWidth, height * bg.naturalWidth / bg.naturalHeight);
      const offset = (width - this.viewWidth) * this.camera / (this.worldWidth - this.viewWidth);
      c.drawImage(bg, -offset, 540 - height, width, height);
    }
    c.save(); c.translate(-this.camera, 0);
    for (const p of this.platforms) {
      const soil = c.createLinearGradient(0, p.y, 0, p.y + p.h);
      soil.addColorStop(0, this.colors["earth-light"]); soil.addColorStop(1, this.colors.earth);
      c.fillStyle = soil; c.beginPath(); c.roundRect(p.x, p.y, p.w, p.h, [5, 5, 10, 10]); c.fill();
      c.globalAlpha = .3; c.fillStyle = this.colors.rock;
      for (let x = p.x + 10; x < p.x + p.w - 10; x += 23) for (let y = p.y + 19; y < p.y + p.h - 6; y += 17) {
        c.beginPath(); c.ellipse(x + Math.sin(x+y)*5, y, 2 + Math.abs(Math.sin(x))*3, 1.5, .2, 0, Math.PI*2); c.fill();
      }
      c.globalAlpha = 1; c.fillStyle = this.colors.grass;
      c.beginPath(); c.moveTo(p.x, p.y+7); c.quadraticCurveTo(p.x, p.y-2, p.x+8, p.y);
      for (let x = p.x+8; x < p.x+p.w-8; x += 14) c.quadraticCurveTo(x+7,p.y-2+Math.sin(x)*2,x+14,p.y);
      c.lineTo(p.x+p.w,p.y+9); c.lineTo(p.x,p.y+11);c.closePath();c.fill();

    }
    for (const f of this.fireflies) if (!f.taken) { const y = f.y + Math.sin(this.elapsed / 500 + f.x) * 8; c.save(); c.shadowColor = this.colors.spark; c.shadowBlur = 25; this.image(c, "firefly", f.x - 22, y - 24, 44, 48); c.restore(); }
    for (const e of this.enemies) {
      const walker = e.kind === "golem" || e.kind === "pincers";
      const name = walker ? `${e.kind}${Math.floor(this.elapsed / 160) % 4 + 1}` : e.kind;
      const im = this.images[name];
      const h = e.kind === "spirit" ? 64 : e.kind === "pincers" ? 46 : 62;
      const w = im?.naturalHeight ? h * im.naturalWidth / im.naturalHeight : 64;
      const bob = e.kind === "spirit" ? -30 + Math.sin(this.elapsed/450)*9 : 2;
      // Walkers face their travel direction; the golem art faces left.
      const dir = Math.cos(this.elapsed * e.speed / 850 + e.base) >= 0 ? 1 : -1;
      c.save(); c.translate(e.x, e.y + bob);
      if (e.kind === "golem") c.scale(-dir, 1);
      this.image(c, name, -w/2, -h, w, h); c.restore();
    }
    // Portal and the magical chest sit on the final platform.
    c.save(); c.translate(this.portalX, 355); c.shadowColor = this.colors.crystal; c.shadowBlur = 20; c.strokeStyle = this.colors.crystal; c.lineWidth = 12; c.beginPath(); c.ellipse(0, 0, 35, 65, 0, 0, Math.PI * 2); c.stroke(); c.globalAlpha = .25; c.fillStyle = this.colors.crystal; c.fill(); c.restore();
    c.save(); c.shadowColor = this.colors.crystal; c.shadowBlur = 15;
    this.image(c, "closed", this.chestX, 349, 80, 76); c.restore();
    const pos = this.player.position;
    if (this.elapsed > this.invulnerable || Math.floor(this.elapsed / 100) % 2 === 0) {
      c.save(); c.translate(pos.x, pos.y + 32); c.scale(this.facing, 1);
      const moving = Math.abs(this.player.velocity.x) > .5;
      const frame = !this.grounded ? "jump" : moving ? ["run1", "run2", "run3"][Math.floor(this.elapsed / 110) % 3] : "idle";
      this.image(c, frame ?? "idle", -31, -87, 62, 89); c.restore();
    }
    for (const m of this.messages) if (m.end > this.elapsed) { c.fillStyle = this.colors.spark; c.font = "600 18px Poppins"; c.fillText(m.text, m.x - 25, m.y - (1300 - (m.end - this.elapsed)) / 30); }
    // Ambient particles, kept within the scene and away from interface text.
    for (let i = 0; i < 25; i++) { c.globalAlpha = .35 + Math.sin(this.elapsed / 600 + i) * .3; c.fillStyle = this.colors.spark; c.beginPath(); c.arc((i * 97 + 100) % this.worldWidth, 120 + (i * 53) % 270 + Math.sin(this.elapsed / 1000 + i) * 8, 1.5, 0, Math.PI * 2); c.fill(); }
    c.restore();
    c.restore();
  }
  dispose() { this.disposed = true; cancelAnimationFrame(this.raf); window.removeEventListener("resize", this.resize); window.removeEventListener("keydown", this.keyDown); window.removeEventListener("keyup", this.keyUp); window.removeEventListener("blur", this.blur); Matter.Composite.clear(this.engine.world, false); Matter.Engine.clear(this.engine); }
}