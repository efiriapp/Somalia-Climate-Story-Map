import { readFileSync, writeFileSync } from 'node:fs';
import { researchStories } from '../src/content/research-stories.ts';

const path = new URL('../src/content/research-stories.ts', import.meta.url);
let src = readFileSync(path, 'utf8');
let fixed = 0;

const esc = (value) => value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

for (const story of researchStories) {
  const count = (story.summary.match(/[.!?](?:\s|$)/g) ?? []).length;
  if (count >= 3 && count <= 5) continue;
  const paras = story.chapters?.flatMap((c) => c.paragraphs) ?? [story.body];
  const sentences =
    paras
      .join(' ')
      .match(/[^.!?]+[.!?]+/g)
      ?.map((s) => s.trim())
      .filter(Boolean) ?? [];
  const summary = sentences.slice(0, 4).join(' ');
  const needle = `summary: '${esc(story.summary)}'`;
  const replacement = `summary: '${esc(summary)}'`;
  if (!src.includes(needle)) {
    console.log('MISS', story.id, count);
    continue;
  }
  src = src.replace(needle, replacement);
  fixed += 1;
}

writeFileSync(path, src);
console.log('fixed', fixed);
