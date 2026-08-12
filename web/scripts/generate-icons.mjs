import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const svg = readFileSync(join(root, "favicon.svg"));

const sizes = [
  ["favicon-16.png", 16],
  ["favicon-32.png", 32],
  ["apple-touch-icon.png", 180],
  ["icon-192.png", 192],
  ["icon-512.png", 512],
];

for (const [name, size] of sizes) {
  const png = await sharp(svg).resize(size, size).png().toBuffer();
  writeFileSync(join(root, name), png);
  console.log(`wrote ${name}`);
}
