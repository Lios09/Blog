import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Each path must stay a static `join(process.cwd(), "assets/fonts/…")`
 * so file tracing copies the fonts into `.next/standalone`.
 */
function toArrayBuffer(buffer: Buffer) {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  );
}

const [geistSemiBold, geistMono] = await Promise.all([
  readFile(join(process.cwd(), "assets/fonts/Geist-SemiBold.ttf")).then(
    toArrayBuffer,
  ),
  readFile(join(process.cwd(), "assets/fonts/GeistMono-Regular.ttf")).then(
    toArrayBuffer,
  ),
]);

export const ogFonts = [
  {
    name: "Geist",
    data: geistSemiBold as ArrayBuffer,
    weight: 600 as const,
    style: "normal" as const,
  },
  {
    name: "Geist Mono",
    data: geistMono as ArrayBuffer,
    weight: 400 as const,
    style: "normal" as const,
  },
];
