import type { FilterCriteria, Story } from '../domain/story';

const haystack = (story: Story): string =>
  `${story.title} ${story.summary} ${story.body}`.toLowerCase();

const keywordHits = (story: Story, query: string): number => {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
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
  const query = criteria.query.trim().toLowerCase();

  const matched = stories.filter((story) => {
    if (criteria.type !== 'all' && story.type !== criteria.type) {
      return false;
    }
    if (query && !haystack(story).includes(query)) {
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
