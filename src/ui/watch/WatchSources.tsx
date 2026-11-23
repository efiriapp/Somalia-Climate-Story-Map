import { useLocale } from '../chrome/LocaleContext';

export type WatchSource = { text: string; url: string };

/** Official agencies to follow for real warnings. */
export const OFFICIAL_SOURCES: WatchSource[] = [
  { text: 'Somali Disaster Management Agency (SoDMA)', url: 'https://sodma.gov.so/' },
  { text: 'FAO Somalia Water and Land Information Management (SWALIM)', url: 'https://faoswalim.org/' },
  { text: 'Food Security and Nutrition Analysis Unit, Somalia (FSNAU)', url: 'https://fsnau.org/' },
  { text: 'Famine Early Warning Systems Network (FEWS NET), Somalia', url: 'https://fews.net/east-africa/somalia' },
];

/** Disclaimer shown at the top of each watch page. */
export function WatchDisclaimer() {
  const { copy } = useLocale();
  return (
    <p className="watch-disclaimer" role="note">
      {copy.watchDisclaimer}
    </p>
  );
}

/** Data credits (CC BY 4.0 / Copernicus) and official sources at the end of a watch page. */
export function WatchSources({ sources }: { sources: WatchSource[] }) {
  const { copy } = useLocale();
  return (
    <section className="media-sources watch-sources" aria-label={copy.watchSources}>
      <h2>{copy.watchSources}</h2>
      <ol>
        {[...sources, ...OFFICIAL_SOURCES].map((source) => (
          <li key={source.url + source.text}>
            {source.text}{' '}
            <a href={source.url} target="_blank" rel="noreferrer">
              {source.url}
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Loading, rate-limit and error messages shared by the watch pages. */
export function WatchStatusMessage({ state }: { state: { status: string; message?: string } }) {
  const { copy } = useLocale();
  if (state.status === 'loading') {
    return (
      <p className="watch-message" role="status">
        {copy.watchLoading}
      </p>
    );
  }
  if (state.status === 'error') {
    return (
      <p className="watch-message watch-message-error" role="alert">
        {state.message === 'rate-limited' ? copy.watchRateLimited : copy.watchError}
      </p>
    );
  }
  return null;
}
