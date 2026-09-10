export type MediaCredit = {
  text: string;
  url?: string;
};

type StoryMediaFields = {
  images: string[];
  website?: string;
  videoUrl?: string;
  videos?: { url: string }[];
  sourceCard?: { primarySource: string };
  chapters?: { images?: string[]; imagesAfter?: string[][] }[];
  tourStops?: { images: string[] }[];
};

type ClimateMediaFields = {
  images: string[];
  videos: { url: string }[];
  sourceLabel: string;
  sourceUrl: string;
};

const PHOTO_CREDIT_PREFIX = /^(Photo|Sawir|صورة):\s*/i;

export const formatMediaSourceCredit = (label: string): string => {
  const trimmed = label.trim();
  if (PHOTO_CREDIT_PREFIX.test(trimmed)) {
    return `Source: ${trimmed.replace(PHOTO_CREDIT_PREFIX, '')}`;
  }
  if (/^ICE Institute\b/i.test(trimmed) || /^Machadka ICE\b/i.test(trimmed) || /^معهد ICE\b/i.test(trimmed)) {
    return `Source: ${trimmed}`;
  }
  return `Source: ICE Institute — ${trimmed}`;
};

const storyHasEmbeddedMedia = (story: StoryMediaFields): boolean =>
  story.images.length > 0 ||
  Boolean(story.videoUrl) ||
  (story.videos?.length ?? 0) > 0 ||
  (story.chapters ?? []).some(
    (chapter) => (chapter.images?.length ?? 0) > 0 || (chapter.imagesAfter?.flat().length ?? 0) > 0,
  ) ||
  (story.tourStops ?? []).some((stop) => stop.images.length > 0);

export const storyMediaCredit = (story: StoryMediaFields): MediaCredit | null => {
  if (!storyHasEmbeddedMedia(story)) {
    return null;
  }
  return {
    text: formatMediaSourceCredit(story.sourceCard?.primarySource ?? 'ICE Institute'),
    url: story.website || undefined,
  };
};

export const climateMediaCredit = (page: ClimateMediaFields): MediaCredit | null => {
  if (page.images.length === 0 && page.videos.length === 0) {
    return null;
  }
  return {
    text: formatMediaSourceCredit(page.sourceLabel),
    url: page.sourceUrl || undefined,
  };
};

export const videoEmbedCredit = (title: string, outlet?: string): MediaCredit => {
  const trimmedTitle = title.trim();
  const trimmedOutlet = outlet?.trim();
  if (!trimmedOutlet) {
    return { text: `Source: ${trimmedTitle}` };
  }
  if (trimmedTitle.toLowerCase().includes(trimmedOutlet.toLowerCase())) {
    return { text: `Source: ${trimmedTitle}` };
  }
  return { text: `Source: ${trimmedOutlet} — ${trimmedTitle}` };
};
