import type { Citation, SourceEntry } from '../../application/citations';
import { useLocale } from '../chrome/LocaleContext';

/** Citation text with its URL turned into a link (APA puts the URL last). */
function CitationText({ citation, linkLabel }: { citation: Citation; linkLabel: string }) {
  const { text, url } = citation;
  if (!url) return <>{text}</>;
  if (text.endsWith(url)) {
    return (
      <>
        {text.slice(0, -url.length)}
        <a href={url} target="_blank" rel="noreferrer">
          {url}
        </a>
      </>
    );
  }
  return (
    <>
      {text}{' '}
      <a href={url} target="_blank" rel="noreferrer">
        {linkLabel}
      </a>
    </>
  );
}

/** Citation shown directly under an embedded video. */
export function VideoCitation({ citation }: { citation: Citation }) {
  const { copy } = useLocale();
  return (
    <p className="media-citation">
      <span className="media-kind">{copy.mediaVideo}:</span>{' '}
      <CitationText citation={citation} linkLabel={copy.mediaSourcePage} />
    </p>
  );
}

/** "Media sources" list at the end of a page: every photo and video, cited. */
export function MediaSources({ entries }: { entries: SourceEntry[] }) {
  const { copy } = useLocale();
  if (entries.length === 0) return null;
  return (
    <section className="media-sources" aria-label={copy.mediaSources}>
      <h2>{copy.mediaSources}</h2>
      <ol>
        {entries.map((entry) => (
          <li key={`${entry.kind}:${entry.text}`}>
            <span className="media-kind">
              {entry.kind === 'video'
                ? copy.mediaVideo
                : entry.count > 1
                  ? `${entry.count} ${copy.mediaPhotos}`
                  : copy.mediaPhoto}
              :
            </span>{' '}
            <CitationText citation={entry} linkLabel={copy.mediaSourcePage} />
          </li>
        ))}
      </ol>
      <p className="media-sources-note">{copy.mediaSourcesNote}</p>
    </section>
  );
}
