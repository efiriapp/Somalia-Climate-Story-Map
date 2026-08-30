import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, 'ClimateImpactPage.tsx'), 'utf8');
const app = readFileSync(join(here, '..', 'App.tsx'), 'utf8');

describe('ClimateImpactPage', () => {
  it('opens Floods, Droughts, and Heat waves from a Climate Impact hub', () => {
    expect(source).toContain('climate-impact-grid');
    expect(source).toContain('climate-impact-card');
    expect(source).toContain('climateImpactPages');
    expect(source).toContain('{item.title}');
    expect(source).toContain('Back to Climate Impact');
    expect(app).toContain('ClimateImpactPage');
    expect(app).toContain("openScreen('climate-impact')");
  });
});
