import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, 'StoryList.tsx'), 'utf8');
const app = readFileSync(join(here, '..', 'App.tsx'), 'utf8');
const css = readFileSync(join(here, '..', 'theme.css'), 'utf8');

describe('ICE stories grid', () => {
  it('renders filtered ICE stories as hoverable image cards', () => {
    expect(source).toContain('story-grid');
    expect(source).toContain('story.images[0]');
    expect(source).toContain('formatLocaleDate');
    expect(app).toMatch(/screen === 'stories'[\s\S]{0,200}StoryList/);
    expect(app).toContain('filterCatalog(scoped, applied)');
    expect(css).toContain('.story-grid');
    expect(css).toMatch(/\.story-card:hover[\s\S]{0,180}transform:/);
  });
});
