import { useLocale } from '../chrome/LocaleContext';
import { WatchMap } from './WatchMap';
import { WatchSources } from './WatchSources';

type Props = {
  title: string;
  intro: string;
};

/**
 * Charcoal Watch and Deforestation Watch: same layout as the other watch
 * pages (title, intro, full-width Somalia map, sources). Data and map layers
 * are added later; until then the map shows Somalia only.
 */
export function PlannedWatchPage({ title, intro }: Props) {
  const { copy } = useLocale();
  return (
    <article className="detail watch-page" aria-label={title}>
      <h1>{title}</h1>
      <p className="watch-intro">{intro}</p>
      <p className="watch-disclaimer" role="note">
        {copy.watchComingSoon}
      </p>
      <WatchMap points={[]} label={title} />
      <WatchSources sources={[]} />
    </article>
  );
}
