export const youtubeId = (url: string): string | null =>
  url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/)?.[1] ?? null;

export const youtubeEmbedSrc = (url: string): string | null => {
  const id = youtubeId(url);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
};

const facebookVideoHref = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    if (!/(^|\.)facebook\.com$/i.test(parsed.hostname)) {
      return null;
    }
    if (!/\/(?:share\/(?:v|r)\/|watch\/?|reel\/|[^/]+\/videos\/)/i.test(`${parsed.pathname}${parsed.search}`)) {
      return null;
    }
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`;
  } catch {
    return null;
  }
};

export const videoEmbedSrc = (url: string): string | null => youtubeEmbedSrc(url) ?? facebookVideoHref(url);
