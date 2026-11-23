import {
  CLIMATE_IMAGE_SOURCES,
  FACEBOOK_SOURCES,
  GLOBAL_STAGE_PHOTOGRAPHERS,
  ICE_PUBLISHER,
  type ImageSource,
  type RightsStatus,
} from '../content/media-sources';
import { RESEARCH_IMAGE_CREDITS } from '../content/research-image-credits';
import { YOUTUBE_SOURCES } from '../content/video-sources';
import type { Story } from '../domain/story';
import { youtubeId } from './youtube-embed';

/**
 * Citation standards used across the platform:
 * - Photos: TASL (Title, Author, Source, Licence), the format Creative
 *   Commons recommends for attribution.
 * - Videos: APA 7th edition for online video:
 *   Channel. (Year, Month Day). Title [Video]. Platform. URL
 */
export type Citation = {
  text: string;
  url?: string;
  rights: RightsStatus;
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** APA date: "2023, November 18", or "n.d." when unknown. */
export const apaDate = (iso: string | null | undefined): string => {
  const match = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return 'n.d.';
  return `${match[1]}, ${MONTHS[Number(match[2]) - 1]} ${Number(match[3])}`;
};

const longDate = (iso: string): string => {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${Number(match[3])} ${MONTHS[Number(match[2]) - 1]} ${match[1]}` : iso;
};

const sentence = (text: string): string => (/[.!?]$/.test(text) ? text : `${text}.`);

/** TASL text for a recorded image source. */
export const formatImageSource = (source: ImageSource): string => {
  const date = source.date ? `, ${longDate(source.date)}` : '';
  if (!source.title && !source.creator && /^Supplied by /.test(source.publisher)) {
    return `Photo ${source.publisher.charAt(0).toLowerCase()}${source.publisher.slice(1)}${date}. ${sentence(source.license)}`;
  }
  const title = source.title ? `“${source.title}”` : 'Photo';
  const creator = source.creator ? ` by ${source.creator}` : '';
  return `${title}${creator}, ${source.publisher}${date}. ${sentence(source.license)}`;
};

type StoryContext = Pick<Story, 'type' | 'title' | 'date' | 'website' | 'sourceCard'>;

/** Citation for one image on a page; `story` gives context for ICE photos. */
export const citeImage = (src: string, story?: StoryContext): Citation => {
  const wikimedia = RESEARCH_IMAGE_CREDITS[src];
  if (wikimedia) {
    const author = wikimedia.author === 'Unknown author' ? '' : ` by ${wikimedia.author}`;
    return {
      text: `“${wikimedia.title}”${author}, via Wikimedia Commons. ${sentence(wikimedia.license)}`,
      url: wikimedia.pageUrl,
      rights: 'open-licence',
    };
  }

  const recorded = CLIMATE_IMAGE_SOURCES[src];
  if (recorded) return { text: formatImageSource(recorded), url: recorded.url, rights: recorded.rights };

  if (story?.type === 'global-stage') {
    const photographer = GLOBAL_STAGE_PHOTOGRAPHERS[src];
    return {
      text: `Photo${photographer ? ` by ${photographer}` : ''}, ${ICE_PUBLISHER}, from “${story.title}”, ${longDate(story.date)}.`,
      url: story.website || undefined,
      rights: 'ice',
    };
  }

  const subject = story?.sourceCard?.primarySource;
  const about = story ? ` for “${story.title}”` : '';
  return {
    text: `Photo supplied by ${ICE_PUBLISHER}${about}${subject && !/^Photo\b/i.test(subject) ? ` (source: ${subject})` : ''}.`,
    url: story?.website || undefined,
    rights: 'ice',
  };
};

const normalizeUrl = (url: string): string => url.split('?')[0]!;

/** Collapses spaces and drops trailing separators like " |" from platform titles. */
export const cleanTitle = (title: string): string =>
  title.replace(/\s+/g, ' ').replace(/[\s|–—-]+$/u, '').trim();

/** APA 7 citation for an embedded video. */
export const citeVideo = (url: string, fallbackTitle?: string): Citation => {
  const id = youtubeId(url);
  const youtube = id ? YOUTUBE_SOURCES[id] : undefined;
  if (youtube) {
    return {
      text: `${youtube.channel}. (${apaDate(youtube.published)}). ${cleanTitle(youtube.title)} [Video]. YouTube. ${youtube.url}`,
      url: youtube.url,
      rights: /ICE Institute/i.test(youtube.channel) ? 'ice' : 'platform-embed',
    };
  }
  const facebook = FACEBOOK_SOURCES[normalizeUrl(url)];
  if (facebook) {
    // APA 7: with no known author, the title moves to the author position.
    return {
      text: facebook.publisher
        ? `${facebook.publisher}. (${apaDate(facebook.published)}). ${facebook.title} [Video]. Facebook. ${facebook.url}`
        : `${facebook.title} [Video]. (${apaDate(facebook.published)}). Facebook. ${facebook.url}`,
      url: facebook.url,
      rights: facebook.rights,
    };
  }
  return {
    text: `${fallbackTitle ?? 'Untitled video'} [Video]. (n.d.). ${url}`,
    url,
    rights: 'unconfirmed',
  };
};

export type SourceEntry = Citation & { count: number; kind: 'photo' | 'video' };

/** Images in page order, without repeats. */
export const storyImages = (story: Pick<Story, 'images' | 'chapters' | 'tourStops'>): string[] => [
  ...new Set([
    ...story.images,
    ...(story.chapters ?? []).flatMap((chapter) => [
      ...(chapter.images ?? []),
      ...(chapter.imagesAfter ?? []).flat(),
    ]),
    ...(story.tourStops ?? []).flatMap((stop) => stop.images),
  ]),
];

/**
 * The "Media sources" list for a page: one entry per distinct citation, with
 * how many photos share it, followed by one entry per video.
 */
export const mediaSourceList = (
  images: string[],
  videos: { url: string; title?: string }[],
  story?: StoryContext,
): SourceEntry[] => {
  const photos = new Map<string, SourceEntry>();
  for (const src of new Set(images)) {
    const citation = citeImage(src, story);
    const existing = photos.get(citation.text);
    if (existing) existing.count += 1;
    else photos.set(citation.text, { ...citation, count: 1, kind: 'photo' });
  }
  const seenVideos = new Set<string>();
  const videoEntries: SourceEntry[] = [];
  for (const video of videos) {
    const citation = citeVideo(video.url, video.title);
    if (seenVideos.has(citation.text)) continue;
    seenVideos.add(citation.text);
    videoEntries.push({ ...citation, count: 1, kind: 'video' });
  }
  return [...photos.values(), ...videoEntries];
};
