import { RESEARCH_IMAGE_CREDITS, type ImageCredit } from '../content/research-image-credits';
import type { Story } from '../domain/story';
import type { Locale } from './locale';

const PHOTO_PREFIX: Record<Locale, string> = { en: 'Photo', so: 'Sawir', ar: 'صورة' };
const COMMONS_HOME = /^https?:\/\/commons\.wikimedia\.org\/?$/;

/**
 * Creative Commons credit: title, author, licence and source.
 * Public-domain and CC0 photos without a named author skip the author.
 */
export const formatImageCredit = (credit: ImageCredit): string => {
  const author = credit.author === 'Unknown author' ? '' : ` by ${credit.author}`;
  return `“${credit.title}”${author}, ${credit.license}, via Wikimedia Commons`;
};

/**
 * Replaces the generic "Wikimedia Commons" credit on a research story with
 * the real author and licence of its photo, and points the "Photo page" link
 * at the photo's own Commons page (which shows the full licence).
 */
export const withImageCredit = (story: Story, locale: Locale): Story => {
  const credit = story.images[0] ? RESEARCH_IMAGE_CREDITS[story.images[0]] : undefined;
  if (!credit || !story.sourceCard) return story;
  return {
    ...story,
    sourceCard: {
      ...story.sourceCard,
      primarySource: `${PHOTO_PREFIX[locale]}: ${formatImageCredit(credit)}`,
      extras: story.sourceCard.extras?.map((row) =>
        COMMONS_HOME.test(row.value) ? { ...row, value: credit.pageUrl } : row,
      ),
    },
  };
};
