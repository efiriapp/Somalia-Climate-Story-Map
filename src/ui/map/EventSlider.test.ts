import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const map = readFileSync(join(here, 'GlobalStageMap.tsx'), 'utf8');
const app = readFileSync(join(here, '..', 'App.tsx'), 'utf8');

describe('ICE at Global Stage events', () => {
  it('uses Next and Back labels without map-scroll event jumping', () => {
    expect(map).toMatch(/>\s*Back\s*</);
    expect(map).toMatch(/>\s*Next\s*</);
    expect(map).toContain('NavigationControl');
    expect(map).toContain('tour-right-stack');
    expect(map).toContain('event-card');
    expect(map).toContain("new Marker({ color:");
    expect(map).toContain('CITY_ZOOM');
    expect(map).toContain('new Popup');
    expect(map).toContain('MOGADISHU_HOME');
    expect(map).toContain('POPUP_HOLD_MS');
    expect(map).not.toContain("addEventListener('wheel'");
    expect(map).not.toContain('EventSlider');
    expect(app).toContain('GlobalStageMap');
    expect(app).not.toContain('GlobalStagePage');
    expect(app).toContain('<SiteFooter');
  });
});
