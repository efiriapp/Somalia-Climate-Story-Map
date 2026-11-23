import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, 'SiteFooter.tsx'), 'utf8');
const app = readFileSync(join(here, '..', 'App.tsx'), 'utf8');
const globalStage = readFileSync(join(here, '..', 'map', 'GlobalStageMap.tsx'), 'utf8');
const copy = readFileSync(join(here, '../../content/site-footer.ts'), 'utf8');

describe('SiteFooter', () => {
  it('uses one standard footer with ICE credits on catalog and story pages', () => {
    expect(source).toContain('site-footer');
    expect(source).toContain('localizeFooter');
    expect(source).toContain('footer.comment');
    expect(source).toContain('footer.copyright');
    expect(copy).toContain('Institute of Climate and Environment');
    expect(copy).toContain('SIMAD University');
    expect(copy).toContain('climate storytelling series');
    expect(copy).toContain('https://ice.simad.edu.so/');
    expect(app).toContain('<SiteFooter');
    expect(app).toMatch(/catalog[\s\S]*SiteFooter|SiteFooter[\s\S]*catalog/);
    expect(globalStage).not.toContain('SiteFooter');
  });

  it('shows the combined SIMAD + ICE web logo instead of the old separate logos', () => {
    expect(source).toContain('src="/logos/simad-ice-web.webp"');
    expect(source).not.toContain('/logos/ice-mark.png');
    expect(source).not.toContain('/logos/simad.webp');
  });
});
