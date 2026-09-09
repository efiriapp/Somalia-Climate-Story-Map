import { describe, expect, it } from 'vitest';
import { aboutIce } from '../content/about-ice';
import { climateImpactHub, climateImpactPages } from '../content/climate-impact';
import { stories } from '../content/stories';
import { STORY_AR } from '../content/ar/stories';
import { STORY_SO } from '../content/so/stories';
import {
  localizeAbout,
  localizeClimateHub,
  localizeClimatePage,
  localizeFooter,
  localizeStory,
} from './localize-content';
import { localizeCreditText, themeLabel } from './locale';

describe('localizeContent', () => {
  it('keeps English pages in English and converts full bodies to Somali and Arabic', () => {
    expect(localizeAbout('en').paragraphs[0]).toBe(aboutIce.paragraphs[0]);
    expect(localizeAbout('so').paragraphs[0]).toMatch(/Machadka Cimilada/);
    expect(localizeAbout('so').paragraphs).toHaveLength(aboutIce.paragraphs.length);
    expect(localizeAbout('ar').paragraphs[0]).toMatch(/معهد المناخ|ICE/);
    expect(localizeAbout('ar').paragraphs).toHaveLength(aboutIce.paragraphs.length);

    expect(localizeClimateHub('en').lede).toBe(climateImpactHub.lede);
    expect(localizeClimateHub('so').lede).toMatch(/Daadad|abaaraha|cimilada/i);
    expect(localizeClimateHub('ar').lede).toMatch(/فيضان|جفاف|مناخ/);

    const floods = climateImpactPages.find((page) => page.id === 'floods')!;
    const floodsSo = localizeClimatePage(floods, 'so');
    expect(floodsSo.lede).not.toBe(floods.lede);
    expect(floodsSo.lede).toMatch(/daad/i);
    expect(floodsSo.chapters).toHaveLength(floods.chapters.length);
    expect(floodsSo.chapters[0].paragraphs).toHaveLength(floods.chapters[0].paragraphs.length);
    expect(floodsSo.paragraphs[0]).not.toBe(floods.paragraphs[0]);

    const floodsAr = localizeClimatePage(floods, 'ar');
    expect(floodsAr.lede).not.toBe(floods.lede);
    expect(floodsAr.lede).toMatch(/فيضان/);
    expect(floodsAr.chapters).toHaveLength(floods.chapters.length);
    expect(floodsAr.chapters[0].paragraphs).toHaveLength(floods.chapters[0].paragraphs.length);

    const green = stories.find((item) => item.id === 'green-champions')!;
    const greenSo = localizeStory(green, 'so');
    expect(greenSo.title).toMatch(/Horyaallada Cagaaran|Green Champions/);
    expect(greenSo.summary).not.toBe(green.summary);
    expect(greenSo.chapters?.length).toBe(green.chapters?.length);
    expect(greenSo.chapters?.[0].heading).not.toBe(green.chapters?.[0].heading);

    const greenAr = localizeStory(green, 'ar');
    expect(greenAr.title).toMatch(/أبطال الخضراء|Green Champions|الأبطال الخضر/);
    expect(greenAr.summary).not.toBe(green.summary);
    expect(greenAr.chapters?.length).toBe(green.chapters?.length);
    expect(greenAr.chapters?.[0].heading).not.toBe(green.chapters?.[0].heading);

    const cop = stories.find((item) => item.id === 'decoding-cop27')!;
    expect(localizeStory(cop, 'so').summary).not.toBe(cop.summary);
    expect(localizeStory(cop, 'ar').summary).not.toBe(cop.summary);
    expect(localizeStory(green, 'en').summary).toBe(green.summary);
  });

  it('translates every story (including research) into Somali with matching chapter counts', () => {
    for (const story of stories) {
      expect(STORY_SO[story.id], story.id).toBeTruthy();
      const so = localizeStory(story, 'so');
      expect(so.title).not.toBe(story.title);
      expect(so.summary).not.toBe(story.summary);
      expect(so.body).not.toBe(story.body);
      expect(so.chapters?.length ?? 0).toBe(story.chapters?.length ?? 0);
      story.chapters?.forEach((chapter, index) => {
        expect(so.chapters?.[index].heading).not.toBe(chapter.heading);
        expect(so.chapters?.[index].paragraphs).toHaveLength(chapter.paragraphs.length);
      });
      expect(so.tourStops?.length ?? 0).toBe(story.tourStops?.length ?? 0);
    }

    for (const page of climateImpactPages) {
      const so = localizeClimatePage(page, 'so');
      expect(so.lede).not.toBe(page.lede);
      expect(so.chapters).toHaveLength(page.chapters.length);
      page.chapters.forEach((chapter, index) => {
        expect(so.chapters[index].heading).not.toBe(chapter.heading);
        expect(so.chapters[index].paragraphs).toHaveLength(chapter.paragraphs.length);
      });
    }

    expect(localizeFooter('so').comment).toMatch(/sheekaynta cimilada/i);
    expect(themeLabel('youth', 'so')).toBe('Dhallinyaro');
    expect(localizeCreditText('Source: ICE Institute', 'so')).toBe('Isha: ICE Institute');
  });

  it('translates every story (including research) into Arabic with matching chapter counts', () => {
    for (const story of stories) {
      expect(STORY_AR[story.id], story.id).toBeTruthy();
      const ar = localizeStory(story, 'ar');
      expect(ar.title).not.toBe(story.title);
      expect(ar.summary).not.toBe(story.summary);
      expect(ar.body).not.toBe(story.body);
      expect(ar.chapters?.length ?? 0).toBe(story.chapters?.length ?? 0);
      story.chapters?.forEach((chapter, index) => {
        expect(ar.chapters?.[index].heading).not.toBe(chapter.heading);
        expect(ar.chapters?.[index].paragraphs).toHaveLength(chapter.paragraphs.length);
      });
      expect(ar.tourStops?.length ?? 0).toBe(story.tourStops?.length ?? 0);
    }

    for (const page of climateImpactPages) {
      const ar = localizeClimatePage(page, 'ar');
      expect(ar.lede).not.toBe(page.lede);
      expect(ar.chapters).toHaveLength(page.chapters.length);
      page.chapters.forEach((chapter, index) => {
        expect(ar.chapters[index].heading).not.toBe(chapter.heading);
        expect(ar.chapters[index].paragraphs).toHaveLength(chapter.paragraphs.length);
      });
    }

    expect(localizeFooter('ar').comment).toMatch(/سرد|قصص|مناخ/);
    expect(themeLabel('youth', 'ar')).toMatch(/شباب/);
    expect(localizeCreditText('Source: ICE Institute', 'ar')).toMatch(/^مصدر: ICE Institute$/);
  });
});
