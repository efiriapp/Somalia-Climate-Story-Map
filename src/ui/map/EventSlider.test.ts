import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const map = readFileSync(join(here, 'GlobalStageMap.tsx'), 'utf8');
const app = readFileSync(join(here, '..', 'App.tsx'), 'utf8');

describe('ICE at Global Stage events', () => {
  it('uses map scroll and a popup instead of a right-side slider', () => {
    expect(map).toContain('tour-popup-card');
    expect(map).toContain('wheel');
    expect(map).not.toContain('EventSlider');
    expect(map).not.toContain('event-slider');
    expect(app).toContain('GlobalStageMap');
    expect(app).not.toContain('GlobalStagePage');
    expect(app).toContain('<SiteFooter');
  });
});
