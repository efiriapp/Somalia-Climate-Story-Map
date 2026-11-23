import { describe, expect, it } from 'vitest';
import { RESEARCH_IMAGE_CREDITS } from '../content/research-image-credits';
import { stories } from '../content/stories';
import { formatImageCredit } from './image-credits';
import { localizeStory } from './localize-content';
import { storyMediaCredit } from './media-source-credit';

const wikimediaStories = stories.filter((story) => story.images[0]?.startsWith('/images/research/'));

describe('research photo credits', () => {
  it('has a credit with licence and file page for every research photo in use', () => {
    expect(wikimediaStories.length).toBeGreaterThan(0);
    for (const story of wikimediaStories) {
      const credit = RESEARCH_IMAGE_CREDITS[story.images[0]!];
      expect(credit, story.images[0]).toBeDefined();
      expect(credit!.license).not.toBe('See file page');
      expect(credit!.pageUrl).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    }
  });

  it('names title, author, licence and source', () => {
    expect(
      formatImageCredit({ title: 'Farm', author: 'A. Person', license: 'CC BY-SA 4.0', licenseUrl: null, pageUrl: '' }),
    ).toBe('“Farm” by A. Person, CC BY-SA 4.0, via Wikimedia Commons');
    expect(
      formatImageCredit({ title: 'Cattle', author: 'Unknown author', license: 'Public domain', licenseUrl: null, pageUrl: '' }),
    ).toBe('“Cattle”, Public domain, via Wikimedia Commons');
  });

  it.each(['en', 'so', 'ar'] as const)('shows the real credit and photo page in %s', (locale) => {
    for (const story of wikimediaStories) {
      const credit = RESEARCH_IMAGE_CREDITS[story.images[0]!]!;
      const localized = localizeStory(story, locale);
      expect(localized.sourceCard?.primarySource).toContain(credit.license);
      expect(localized.sourceCard?.primarySource).not.toMatch(/Somalia imagery|Sawirada Soomaaliya|صور الصومال/);
      const values = localized.sourceCard?.extras?.map((row) => row.value) ?? [];
      expect(values).toContain(credit.pageUrl);
      expect(storyMediaCredit(localized)?.text).toContain('via Wikimedia Commons');
    }
  });
});
