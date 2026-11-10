import { describe, expect, it } from 'vitest';
import { CHROME } from '../application/locale';
import { STORY_AR } from './ar/stories';
import { CLIMATE_PAGES_AR } from './ar/pages';
import { climateImpactPages } from './climate-impact';
import { STORY_SO } from './so/stories';
import { CLIMATE_PAGES_SO } from './so/pages';
import { stories } from './stories';

/**
 * Guards the Somali and Arabic packs against drifting from the English
 * source: a new or edited English story must be translated too.
 */
const packs = { so: STORY_SO, ar: STORY_AR } as const;
const climatePacks = { so: CLIMATE_PAGES_SO, ar: CLIMATE_PAGES_AR } as const;

describe.each(Object.entries(packs))('%s story pack', (_locale, pack) => {
  it('translates title, summary and body of every story', () => {
    const missing = stories
      .filter((story) => !pack[story.id]?.title || !pack[story.id]?.summary || !pack[story.id]?.body)
      .map((story) => story.id);
    expect(missing).toEqual([]);
  });

  it('has no entries for stories that no longer exist', () => {
    const ids = new Set(stories.map((story) => story.id));
    expect(Object.keys(pack).filter((id) => !ids.has(id))).toEqual([]);
  });

  it('keeps the same number of chapters, paragraphs and tour stops as English', () => {
    const mismatched: string[] = [];
    for (const story of stories) {
      const entry = pack[story.id];
      if (!entry) continue;
      if (entry.chapters && story.chapters) {
        if (entry.chapters.length !== story.chapters.length) {
          mismatched.push(`${story.id}: chapters`);
        } else {
          story.chapters.forEach((chapter, index) => {
            if (entry.chapters?.[index]?.paragraphs.length !== chapter.paragraphs.length) {
              mismatched.push(`${story.id}: chapter ${index + 1} paragraphs`);
            }
          });
        }
      }
      if (entry.tourStops && story.tourStops && entry.tourStops.length !== story.tourStops.length) {
        mismatched.push(`${story.id}: tour stops`);
      }
    }
    expect(mismatched).toEqual([]);
  });
});

describe.each(Object.entries(climatePacks))('%s climate impact pack', (_locale, pack) => {
  it('covers every climate hazard page', () => {
    expect(Object.keys(pack).sort()).toEqual(climateImpactPages.map((page) => page.id).sort());
  });
});

describe('interface copy', () => {
  it('defines the same labels in English, Somali and Arabic', () => {
    const english = Object.keys(CHROME.en).sort();
    expect(Object.keys(CHROME.so).sort()).toEqual(english);
    expect(Object.keys(CHROME.ar).sort()).toEqual(english);
  });
});
