import type { Locale } from './locale';
import { EXTRA_LABELS } from './locale';
import { aboutIce } from '../content/about-ice';
import {
  climateImpactHub,
  type ClimateImpactPage,
} from '../content/climate-impact';
import { siteFooter } from '../content/site-footer';
import type { Story } from '../domain/story';
import { ABOUT_AR, CLIMATE_HUB_AR, CLIMATE_PAGES_AR, FOOTER_AR } from '../content/ar/pages';
import { STORY_AR, type StoryAr } from '../content/ar/stories';
import { ABOUT_SO, CLIMATE_HUB_SO, CLIMATE_PAGES_SO, FOOTER_SO } from '../content/so/pages';
import { STORY_SO, type StorySo } from '../content/so/stories';

type StoryLocale = StorySo | StoryAr;

const localizeExtras = (
  extras: NonNullable<Story['sourceCard']>['extras'],
  packExtras: NonNullable<StoryLocale['sourceCard']>['extras'] | undefined,
  locale: Locale,
): NonNullable<Story['sourceCard']>['extras'] => {
  if (packExtras) {
    return packExtras.map((row, index) => ({
      label: row.label,
      value: row.value ?? extras?.[index]?.value ?? '',
    }));
  }
  if (!extras) return extras;
  const labels = EXTRA_LABELS[locale];
  return extras.map((row) => ({
    label: labels[row.label] ?? row.label,
    value: row.value,
  }));
};

const applyStoryPack = (story: Story, pack: StoryLocale | undefined, locale: Locale): Story => {
  if (!pack) return story;
  return {
    ...story,
    title: pack.title ?? story.title,
    summary: pack.summary ?? story.summary,
    body: pack.body ?? story.body,
    featuredPerson: pack.featuredPerson ?? story.featuredPerson,
    placeLabel: pack.placeLabel ?? story.placeLabel,
    mapTitle: pack.mapTitle ?? story.mapTitle,
    videoTitle: pack.videoTitle ?? story.videoTitle,
    location: {
      ...story.location,
      name: pack.locationName ?? story.location.name,
    },
    chapters: story.chapters?.map((chapter, index) => ({
      ...chapter,
      heading: pack.chapters?.[index]?.heading ?? chapter.heading,
      paragraphs: pack.chapters?.[index]?.paragraphs ?? chapter.paragraphs,
    })),
    tourStops: story.tourStops?.map((stop, index) => ({
      ...stop,
      title: pack.tourStops?.[index]?.title ?? stop.title,
      description: pack.tourStops?.[index]?.description ?? stop.description,
    })),
    stats: story.stats?.map((stat, index) => ({
      ...stat,
      label: pack.stats?.[index]?.label ?? stat.label,
      value: pack.stats?.[index]?.value ?? stat.value,
    })),
    sourceCard: story.sourceCard
      ? {
          ...story.sourceCard,
          place: pack.sourceCard?.place ?? story.sourceCard.place,
          city: pack.sourceCard?.city ?? story.sourceCard.city,
          regionLabel: pack.sourceCard?.regionLabel ?? story.sourceCard.regionLabel,
          country: pack.sourceCard?.country ?? story.sourceCard.country,
          category: pack.sourceCard?.category ?? story.sourceCard.category,
          impactAreas: pack.sourceCard?.impactAreas ?? story.sourceCard.impactAreas,
          featuredPerson: pack.sourceCard?.featuredPerson ?? story.sourceCard.featuredPerson,
          primarySource: pack.sourceCard?.primarySource ?? story.sourceCard.primarySource,
          extras: localizeExtras(story.sourceCard.extras, pack.sourceCard?.extras, locale),
        }
      : story.sourceCard,
  };
};

const applyClimatePack = (
  page: ClimateImpactPage,
  pack:
    | (typeof CLIMATE_PAGES_SO)[ClimateImpactPage['id']]
    | (typeof CLIMATE_PAGES_AR)[ClimateImpactPage['id']]
    | undefined,
): ClimateImpactPage => {
  if (!pack) return page;
  return {
    ...page,
    title: pack.title ?? page.title,
    kicker: pack.kicker ?? page.kicker,
    lede: pack.lede ?? page.lede,
    paragraphs: pack.paragraphs ?? page.paragraphs,
    chapters: page.chapters.map((chapter, index) => ({
      ...chapter,
      heading: pack.chapters?.[index]?.heading ?? chapter.heading,
      paragraphs: pack.chapters?.[index]?.paragraphs ?? chapter.paragraphs,
    })),
    sourceLabel: pack.sourceLabel ?? page.sourceLabel,
  };
};

export const localizeAbout = (locale: Locale) => {
  if (locale === 'so') return ABOUT_SO;
  if (locale === 'ar') return ABOUT_AR;
  return aboutIce;
};

export const localizeClimateHub = (locale: Locale) => {
  if (locale === 'so') return CLIMATE_HUB_SO;
  if (locale === 'ar') return CLIMATE_HUB_AR;
  return climateImpactHub;
};

export const localizeClimatePage = (page: ClimateImpactPage, locale: Locale): ClimateImpactPage => {
  if (locale === 'so') return applyClimatePack(page, CLIMATE_PAGES_SO[page.id]);
  if (locale === 'ar') return applyClimatePack(page, CLIMATE_PAGES_AR[page.id]);
  return page;
};

export const localizeStory = (story: Story, locale: Locale): Story => {
  if (locale === 'so') return applyStoryPack(story, STORY_SO[story.id] as StorySo | undefined, 'so');
  if (locale === 'ar') return applyStoryPack(story, STORY_AR[story.id] as StoryAr | undefined, 'ar');
  return story;
};

export const localizeFooter = (locale: Locale) => {
  if (locale === 'so') return { ...siteFooter, ...FOOTER_SO };
  if (locale === 'ar') return { ...siteFooter, ...FOOTER_AR };
  return siteFooter;
};
