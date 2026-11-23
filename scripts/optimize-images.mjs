/**
 * Shrinks oversized photos in public/images in place, keeping each file's
 * path and format so no content references change.
 *
 *   npm run images:optimize           # rewrite files that get smaller
 *   npm run images:optimize -- --check  # list files over budget, exit 1 if any
 *
 * Photos are capped at 1920 px on the long edge and re-encoded (JPEG q80
 * mozjpeg, WebP q80, AVIF q55, PNG palette-compressed). A file is only
 * rewritten when the result is at least 10% smaller. Embedded metadata
 * (EXIF, IPTC, XMP: photographer, copyright, captions) is kept, because it
 * records who owns each photo.
 */
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const imageDir = join(root, 'public', 'images');
const MAX_EDGE = 1920;
const BUDGET_BYTES = 500 * 1024;
const checkOnly = process.argv.includes('--check');

const walk = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(dir, entry.name);
      return entry.isDirectory() ? walk(path) : [path];
    }),
  );
  return files.flat();
};

const encoders = {
  '.jpg': (img) => img.jpeg({ quality: 80, mozjpeg: true }),
  '.jpeg': (img) => img.jpeg({ quality: 80, mozjpeg: true }),
  '.webp': (img) => img.webp({ quality: 80 }),
  '.avif': (img) => img.avif({ quality: 55 }),
  '.png': (img) => img.png({ palette: true, quality: 85, compressionLevel: 9 }),
};

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

const files = (await walk(imageDir)).filter((file) => encoders[extname(file).toLowerCase()]);
let before = 0;
let after = 0;
const overBudget = [];

for (const file of files) {
  const name = relative(root, file);
  const size = (await stat(file)).size;
  before += size;

  if (checkOnly) {
    after += size;
    if (size > BUDGET_BYTES) overBudget.push(`${name} (${kb(size)})`);
    continue;
  }

  const input = await readFile(file);
  const encode = encoders[extname(file).toLowerCase()];
  const output = await encode(
    sharp(input).rotate().keepMetadata().resize({
      width: MAX_EDGE,
      height: MAX_EDGE,
      fit: 'inside',
      withoutEnlargement: true,
    }),
  ).toBuffer();

  if (output.length < size * 0.9) {
    await writeFile(file, output);
    after += output.length;
    console.log(`${name}: ${kb(size)} -> ${kb(output.length)}`);
  } else {
    after += size;
  }
  if (Math.min(size, output.length) > BUDGET_BYTES) {
    overBudget.push(`${name} (${kb(Math.min(size, output.length))})`);
  }
}

console.log(`\n${files.length} images: ${kb(before)} -> ${kb(after)}`);
if (overBudget.length) {
  console.log(`Over ${kb(BUDGET_BYTES)} budget:\n  ${overBudget.join('\n  ')}`);
  if (checkOnly) process.exitCode = 1;
}
