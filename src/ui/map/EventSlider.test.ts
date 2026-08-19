import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const map = readFileSync(join(here, 'GlobalStageMap.tsx'), 'utf8');
const app = readFileSync(join(here, '..', 'App.tsx'), 'utf8');

describe('ICE at Global Stage events', () => {
  it('uses next/back and hover popups instead of map-scroll event jumping', () => {
    expect(map).toContain('Previous event');
    expect(map).toContain('Next event');
    expect(map).toContain('NavigationControl');
    expect(map).toContain('mouseenter');
    expect(map).not.toContain("addEventListener('wheel'");
    expect(map).not.toContain('EventSlider');
    expect(app).toContain('GlobalStageMap');
    expect(app).not.toContain('GlobalStagePage');
    expect(app).toContain('<SiteFooter');
  });
});
