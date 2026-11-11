/**
 * Copies the navigation icons out of Microsoft's Fluent Emoji (flat) set
 * (MIT licence, via @iconify-json/fluent-emoji-flat) into src/assets/nav-icons/
 * as small standalone SVG files, so the site does not ship the whole set.
 *
 *   node ./scripts/extract-nav-icons.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const set = require('@iconify-json/fluent-emoji-flat/icons.json');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'src', 'assets', 'nav-icons');

/** Page -> Fluent Emoji name. */
export const NAV_ICONS = {
  research: 'microscope',
  stories: 'open-book',
  'climate-impact': 'thermometer',
  'global-stage': 'globe-showing-europe-africa',
  'flood-watch': 'water-wave',
  'drought-watch': 'desert',
  'charcoal-watch': 'fire',
  'deforestation-watch': 'wood',
};

mkdirSync(outDir, { recursive: true });
for (const [page, name] of Object.entries(NAV_ICONS)) {
  const icon = set.icons[name] ?? set.icons[set.aliases?.[name]?.parent];
  if (!icon) throw new Error(`Icon ${name} not found`);
  const width = icon.width ?? set.width ?? 32;
  const height = icon.height ?? set.height ?? 32;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">${icon.body}</svg>\n`;
  writeFileSync(join(outDir, `${page}.svg`), svg);
  console.log(`${page}.svg <- ${name} (${svg.length} bytes)`);
}
writeFileSync(
  join(outDir, 'LICENSE.txt'),
  'Icons from Fluent Emoji by Microsoft Corporation, MIT License.\nhttps://github.com/microsoft/fluentui-emoji/blob/main/LICENSE\n',
);
