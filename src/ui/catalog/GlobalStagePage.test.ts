import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, 'GlobalStagePage.tsx'), 'utf8');
const app = readFileSync(join(here, '..', 'App.tsx'), 'utf8');
const stories = readFileSync(join(here, '../../content/stories.ts'), 'utf8');

describe('GlobalStagePage', () => {
  it('shows every ICE world event as a full text page with images', () => {
    expect(source).toContain('global-stage-page');
    expect(source).toContain('type === \'global-stage\'');
    expect(source).toContain('story.images');
    expect(source).toContain('story.summary');
    expect(source).toContain('story.body');
    expect(source).toContain('formatTourDate');
    expect(app).toContain('copy.globalStage');
    expect(app).toContain("openScreen('global-stage')");
    expect(stories).toContain("type: 'global-stage'");
  });

  it('ends each event that has photos with the ICE source credit', () => {
    expect(source).toContain('MediaSourceCredit');
    expect(source).toContain('storyMediaCredit(story)');
    expect(source.lastIndexOf('MediaSourceCredit')).toBeGreaterThan(source.lastIndexOf('More information'));
  });
});
