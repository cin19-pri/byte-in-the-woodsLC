type EmbeddedArtwork = {
  width: number;
  height: number;
  pixels: string;
};

/**
 * A self-contained inline SVG, with the original transparent pixels embedded
 * losslessly. Both React images and Canvas drawImage can use the same URL.
 * No DOM/browser globals are used here, so the initial menu also supports SSR.
 */
export function inlineSvg({ width, height, pixels }: EmbeddedArtwork): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><image width="${width}" height="${height}" href="data:image/png;base64,${pixels}"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}