import { describe, expect, it } from 'vitest';
import { createLevel } from '@/game/levels';
describe('Extended progressively harder forests', () => {
  for (const level of [1, 2]) {
    it(`makes level ${level} longer than the former 2340-unit course`, () => {
      expect(createLevel(level).worldWidth).toBeGreaterThan(2340 * 2);
    });
    it(`increases jump gaps and enemy speed toward the end of level ${level}`, () => {
      const { sections } = createLevel(level);
      for (let i = 1; i < sections.length; i++) {
        expect(sections[i]?.gap).toBeGreaterThan(sections[i - 1]?.gap ?? 0);
        expect(sections[i]?.width).toBeLessThan(sections[i - 1]?.width ?? 0);
        expect(sections[i]?.speed).toBeGreaterThan(sections[i - 1]?.speed ?? 0);
        expect(sections[i]?.gap).toBeLessThanOrEqual(120);
      }
    });
    it(`places the chest safely on the final platform in level ${level}`, () => {
      const layout = createLevel(level);
      const final = layout.platforms.at(-1);
      expect(final).toBeDefined();
      expect(layout.chestX).toBeGreaterThan((final?.x ?? 0) + 40);
      expect(layout.portalX).toBeLessThan(layout.worldWidth);
    });
  }
  it('makes night longer and harder than day', () => {
    expect(createLevel(2).worldWidth).toBeGreaterThan(createLevel(1).worldWidth);
    expect(createLevel(2).sections[0]?.gap).toBeGreaterThan(createLevel(1).sections[0]?.gap ?? 0);
  });
});