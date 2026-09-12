import type { FilterCriteria, Story } from '../domain/story';
import { THEMES } from '../domain/themes';

const themeLabels = (slugs: string[]): string =>
  slugs
    .map((slug) => THEMES.find((theme) => theme.slug === slug)?.label ?? slug)
    .join(' ');

const haystack = (story: Story): string => {
  const chapterText =
    story.chapters
      ?.flatMap((chapter) => [chapter.heading, ...chapter.paragraphs])
      .join(' ') ?? '';
  const sourceCardText = story.sourceCard
    ? [
        story.sourceCard.place,
        story.sourceCard.city,
        story.sourceCard.regionLabel,
        story.sourceCard.country,
        story.sourceCard.category,
        story.sourceCard.featuredPerson,
        ...(story.sourceCard.impactAreas ?? []),
        ...(story.sourceCard.extras?.flatMap((extra) => [extra.label, extra.value]) ?? []),
      ].join(' ')
    : '';
  const tourText =
    story.tourStops
      ?.flatMap((stop) => [stop.region, stop.place ?? '', stop.title, stop.description])
      .join(' ') ?? '';

  return [
    story.title,
    story.summary,
    story.body,
    story.location.name,
    story.country,
    story.region,
    story.district,
    story.featuredPerson ?? '',
    story.placeLabel ?? '',
    story.mapTitle ?? '',
    themeLabels(story.themes),
    story.themes.join(' '),
    chapterText,
    sourceCardText,
    tourText,
  ]
    .join(' ')
    .toLowerCase();
};

const queryWords = (query: string): string[] =>
  query.toLowerCase().trim().split(/\s+/).filter(Boolean);

const matchesQuery = (story: Story, query: string): boolean => {
  const words = queryWords(query);
  if (words.length === 0) return true;
  const text = haystack(story);
  return words.every((word) => text.includes(word));
};

const keywordHits = (story: Story, query: string): number => {
  const words = queryWords(query);
  if (words.length === 0) return 0;
  const text = haystack(story);
  return words.reduce((total, word) => {
    const matches = text.split(word).length - 1;
    return total + matches;
  }, 0);
};

const compareStories = (a: Story, b: Story, criteria: FilterCriteria): number => {
  switch (criteria.sort) {
    case 'oldest':
      return a.date.localeCompare(b.date) || a.title.localeCompare(b.title);
    case 'title':
      return a.title.localeCompare(b.title);
    case 'keywords':
      return keywordHits(b, criteria.query) - keywordHits(a, criteria.query);
    case 'newest':
    default:
      return b.date.localeCompare(a.date) || a.title.localeCompare(b.title);
  }
};

export const filterCatalog = (stories: Story[], criteria: FilterCriteria): Story[] => {
  const matched = stories.filter((story) => {
    if (criteria.region !== 'all' && story.region !== criteria.region) {
      return false;
    }
    if (criteria.district !== 'all' && story.district !== criteria.district) {
      return false;
    }
    if (!matchesQuery(story, criteria.query)) {
      return false;
    }
    if (criteria.themes.length > 0 && !criteria.themes.some((theme) => story.themes.includes(theme))) {
      return false;
    }
    if (criteria.year !== 'all') {
      const year = Number.parseInt(story.date.slice(0, 4), 10);
      if (year !== criteria.year) {
        return false;
      }
    }
    if (criteria.sdgs.length > 0 && !criteria.sdgs.some((sdg) => story.sdgs.includes(sdg))) {
      return false;
    }
    return true;
  });

  return [...matched].sort((a, b) => compareStories(a, b, criteria));
};
