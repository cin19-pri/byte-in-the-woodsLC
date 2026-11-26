import { describe, expect, it } from "vitest";
import { art } from "@/game/art";

describe("Portable game artwork", () => {
  it.each(Object.entries(art))("loads %s without an asset host", (_name, source) => {
    const url = new URL(source);
    expect(url.protocol).toBe("data:");
    expect(url.host).toBe("");
    expect(url.pathname.startsWith("image/svg+xml;charset=utf-8,")).toBe(true);
  });

  it("retains all three distinct Ada movement frames", () => {
    expect(new Set([art.run1, art.run2, art.run3]).size).toBe(3);
  });

  it("retains four distinct walking frames for each ground enemy", () => {
    expect(new Set([art.golem1, art.golem2, art.golem3, art.golem4]).size).toBe(4);
    expect(new Set([art.pincers1, art.pincers2, art.pincers3, art.pincers4]).size).toBe(4);
  });
});