import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, 'ClimateImpactPage.tsx'), 'utf8');
const app = readFileSync(join(here, '..', 'App.tsx'), 'utf8');

describe('ClimateImpactPage', () => {
  it('opens Floods, Droughts, Heat waves, El Niño, and La Niña from a Climate Impact hub', () => {
    expect(source).toContain('climate-impact-hub');
    expect(source).toContain('climate-impact-grid');
    expect(source).toContain('climate-impact-card');
    expect(source).toContain('climateImpactPages');
    expect(source).toContain('{item.title}');
    expect(source).toContain('Back to Climate Impact');
    expect(app).toContain('ClimateImpactPage');
    expect(app).toContain("openScreen('climate-impact')");
  });

  it('shows matched images on hub cards and full pages, with video embeds at the end', () => {
    expect(source).toContain('item.images[0]');
    expect(source).toContain('splitStoryImages');
    expect(source).toContain('page.chapters');
    expect(source).toContain('videoEmbedSrc');
    expect(source).toContain('page.videos');
    expect(source).toContain('story-video');
  });

  it('spreads images through the article instead of one compact top gallery', () => {
    expect(source).toContain('splitStoryImages(page.images)');
    expect(source).not.toMatch(/page\.images\.map\s*\(/);
    expect(source).not.toContain('className="story-gallery"');
    expect(source).toContain('story-spread-first');
    expect(source).toContain('story-spread-middle');
    expect(source).toContain('story-spread-end');
    expect(source.indexOf('story-lede')).toBeLessThan(source.indexOf('story-spread-first'));
    expect(source.indexOf('story-spread-first')).toBeLessThan(source.indexOf('page.paragraphs.map'));
    expect(source.indexOf('page.paragraphs.map')).toBeLessThan(source.indexOf('page.chapters.map'));
    expect(source.indexOf('story-spread-middle')).toBeGreaterThan(source.indexOf('page.chapters.map'));
    expect(source.indexOf('story-spread-end')).toBeGreaterThan(source.indexOf('page.chapters.map'));
    expect(source.indexOf('story-spread-end')).toBeLessThan(source.indexOf('page.videos.map'));
    expect(source.indexOf('sourceUrl')).toBeLessThan(source.indexOf('page.videos.map'));
  });

  it('ends each hazard page with a visible source credit for pictures and video', () => {
    expect(source).toContain('MediaSourceCredit');
    expect(source).toContain('climateMediaCredit(page)');
    expect(source.lastIndexOf('MediaSourceCredit')).toBeGreaterThan(source.lastIndexOf('page.videos.map'));
  });

  it('captions each climate video embed with the film title, not an ICE Institute credit', () => {
    expect(source).toContain('videoEmbedCredit(video.title)');
    expect(source.indexOf('iframe')).toBeLessThan(source.indexOf('videoEmbedCredit(video.title)'));
  });

  it('credits Climate Impact hub photos with the ICE source line', () => {
    expect(source).toContain('climate-impact-hub');
    expect(source).toContain('formatMediaSourceCredit');
    expect(source.lastIndexOf('MediaSourceCredit')).toBeGreaterThan(source.lastIndexOf('climate-impact-grid'));
  });
});

