import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, 'EventSlider.tsx'), 'utf8');
const map = readFileSync(join(here, 'GlobalStageMap.tsx'), 'utf8');
const app = readFileSync(join(here, '..', 'App.tsx'), 'utf8');

describe('EventSlider', () => {
  it('puts date-ordered event cards on the right of the full-screen globe', () => {
    expect(source).toContain('event-slider');
    expect(source).toContain('onWheel');
    expect(source).toContain('stop.images');
    expect(source).toContain('stop.title');
    expect(source).toContain('stop.summary');
    expect(source).toContain('More information');
    expect(source).toContain('formatTourDate');
    expect(map).toContain('EventSlider');
    expect(map).toContain('tour-right-stack');
    expect(app).toContain('GlobalStageMap');
    expect(app).not.toContain('GlobalStagePage');
    expect(app).toContain('<SiteFooter');
  });
});
