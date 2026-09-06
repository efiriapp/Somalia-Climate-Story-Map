import type { Locale } from './locale';
import { aboutIce } from '../content/about-ice';
import {
  climateImpactHub,
  type ClimateImpactPage,
} from '../content/climate-impact';
import { siteFooter } from '../content/site-footer';
import type { Story } from '../domain/story';
import { ABOUT_SO, CLIMATE_HUB_SO, CLIMATE_PAGES_SO, FOOTER_SO } from '../content/so/pages';
import { STORY_SO, type StorySo } from '../content/so/stories';

export const localizeAbout = (locale: Locale) => (locale === 'so' ? ABOUT_SO : aboutIce);

export const localizeClimateHub = (locale: Locale) =>
  locale === 'so' ? CLIMATE_HUB_SO : climateImpactHub;

export const localizeClimatePage = (page: ClimateImpactPage, locale: Locale): ClimateImpactPage => {
  if (locale !== 'so') return page;
  const so = CLIMATE_PAGES_SO[page.id];
  if (!so) return page;
  return {
    ...page,
    title: so.title ?? page.title,
    kicker: so.kicker ?? page.kicker,
    lede: so.lede ?? page.lede,
    paragraphs: so.paragraphs ?? page.paragraphs,
    chapters: page.chapters.map((chapter, index) => ({
      ...chapter,
      heading: so.chapters?.[index]?.heading ?? chapter.heading,
      paragraphs: so.chapters?.[index]?.paragraphs ?? chapter.paragraphs,
    })),
    sourceLabel: so.sourceLabel ?? page.sourceLabel,
  };
};

export const localizeStory = (story: Story, locale: Locale): Story => {
  if (locale !== 'so') return story;
  const so = STORY_SO[story.id] as StorySo | undefined;
  if (!so) return story;
  return {
    ...story,
    title: so.title ?? story.title,
    summary: so.summary ?? story.summary,
    body: so.body ?? story.body,
    featuredPerson: so.featuredPerson ?? story.featuredPerson,
    placeLabel: so.placeLabel ?? story.placeLabel,
    mapTitle: so.mapTitle ?? story.mapTitle,
    location: {
      ...story.location,
      name: so.locationName ?? story.location.name,
    },
    chapters: story.chapters?.map((chapter, index) => ({
      ...chapter,
      heading: so.chapters?.[index]?.heading ?? chapter.heading,
      paragraphs: so.chapters?.[index]?.paragraphs ?? chapter.paragraphs,
    })),
    tourStops: story.tourStops?.map((stop, index) => ({
      ...stop,
      title: so.tourStops?.[index]?.title ?? stop.title,
      description: so.tourStops?.[index]?.description ?? stop.description,
    })),
    stats: story.stats?.map((stat, index) => ({
      ...stat,
      label: so.stats?.[index]?.label ?? stat.label,
      value: so.stats?.[index]?.value ?? stat.value,
    })),
    sourceCard: story.sourceCard
      ? {
          ...story.sourceCard,
          place: so.sourceCard?.place ?? story.sourceCard.place,
          city: so.sourceCard?.city ?? story.sourceCard.city,
          regionLabel: so.sourceCard?.regionLabel ?? story.sourceCard.regionLabel,
          country: so.sourceCard?.country ?? story.sourceCard.country,
          category: so.sourceCard?.category ?? story.sourceCard.category,
          impactAreas: so.sourceCard?.impactAreas ?? story.sourceCard.impactAreas,
          featuredPerson: so.sourceCard?.featuredPerson ?? story.sourceCard.featuredPerson,
          primarySource: so.sourceCard?.primarySource ?? story.sourceCard.primarySource,
        }
      : story.sourceCard,
  };
};

export const localizeFooter = (locale: Locale) =>
  locale === 'so' ? { ...siteFooter, ...FOOTER_SO } : siteFooter;
