import { useEffect } from 'react';

type PageMeta = {
  platform: string;
  title?: string;
  description?: string;
  image?: string;
};

const DESCRIPTION_LIMIT = 160;

export const pageTitle = (platform: string, title?: string): string =>
  title ? `${title} | ${platform}` : platform;

export const clipDescription = (text: string): string => {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= DESCRIPTION_LIMIT) return clean;
  const cut = clean.slice(0, DESCRIPTION_LIMIT - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
};

const setMeta = (selector: string, value: string | undefined) => {
  const element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) return;
  if (element.dataset.defaultContent === undefined) {
    element.dataset.defaultContent = element.content;
  }
  element.content = value ?? element.dataset.defaultContent;
};

/**
 * Updates the tab title and description tags for the current page. Static
 * defaults live in index.html for crawlers that do not run JavaScript.
 */
export function usePageMeta({ platform, title, description, image }: PageMeta): void {
  useEffect(() => {
    const fullTitle = pageTitle(platform, title);
    document.title = fullTitle;
    const summary = description ? clipDescription(description) : undefined;
    setMeta('meta[name="description"]', summary);
    setMeta('meta[property="og:title"]', title ? fullTitle : undefined);
    setMeta('meta[property="og:description"]', summary);
    setMeta(
      'meta[property="og:image"]',
      image ? new URL(image, window.location.origin).href : undefined,
    );
  }, [platform, title, description, image]);
}
