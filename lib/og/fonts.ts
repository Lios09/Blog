import { readFile } from "node:fs/promises";
import { join } from "node:path";

const fontsDir = join(process.cwd(), "assets/fonts");

async function loadFont(filename: string) {
  const buffer = await readFile(join(fontsDir, filename));
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  );
}

const [geistSemiBold, geistMono] = await Promise.all([
  loadFont("Geist-SemiBold.ttf"),
  loadFont("GeistMono-Regular.ttf"),
]);

export const ogFonts = [
  {
    name: "Geist",
    data: geistSemiBold,
    weight: 600 as const,
    style: "normal" as const,
  },
  {
    name: "Geist Mono",
    data: geistMono,
    weight: 400 as const,
    style: "normal" as const,
  },
];
