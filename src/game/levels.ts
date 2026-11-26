import { enemyTypes } from './rules';

export type Platform = { x: number; y: number; w: number; h: number };
export function createLevel(level: number) {
  const count = level === 1 ? 14 : 17;
  const platforms: Platform[] = [];
  const enemies: { base: number; x: number; y: number; range: number; kind: string; speed: number }[] = [];
  const fireflies: { x: number; y: number; taken: boolean }[] = [];
  const sections: { gap: number; width: number; speed: number }[] = [];
  let x = 0;
  for (let i = 0; i < count; i++) {
    const progress = i / (count - 1);
    const gap = Math.round((level === 1 ? 82 : 92) + progress * (level === 1 ? 34 : 28));
    const width = Math.round((level === 1 ? 520 : 480) - progress * 180);
    const y = i === count - 1 ? 425 : [450, 435, 420, 440][i % 4] ?? 450;
    const speed = 1 + progress * .9 + (level === 2 ? .25 : 0);
    sections.push({ gap, width, speed });
    platforms.push({ x, y, w: width, h: 550 - y });
    if (i < count - 1 && i % 2 === 0) {
      platforms.push({ x: x + 155, y: y - 90, w: 150 - Math.round(progress * 25), h: 25 });
      fireflies.push({ x: x + 220, y: y - 125, taken: false });
    }
    if (i > 0 && i < count - 1) {
      const types = enemyTypes(level);
      const kind = types[(i - 1) % types.length] ?? 'golem';
      const base = x + width * .58;
      enemies.push({ base, x: base, y, range: kind === 'plant' ? 0 : 55 + progress * 45, kind, speed });
      if (progress > (level === 1 ? .5 : .3) && i % 2 === 0) {
        const base = x + width * .15;
        enemies.push({ base, x: base, y, range: 0, kind: 'plant', speed });
      }
    }
    x += width + (i < count - 1 ? gap : 0);
  }
  return { platforms, enemies, fireflies, sections, worldWidth: x, chestX: x - 200, portalX: x - 85 };
}