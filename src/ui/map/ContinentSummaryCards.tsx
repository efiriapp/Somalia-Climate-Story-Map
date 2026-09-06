import type { ContinentId, ContinentSummary } from '../../application/continent-visits';
import { continentLabel } from '../../application/locale';
import { useLocale } from '../chrome/LocaleContext';

type Props = {
  cards: ContinentSummary[];
  total: number;
  activeContinent?: ContinentId;
  activeTotal: boolean;
  onContinent: (continent: ContinentId) => void;
  onTotal: () => void;
};

export function ContinentSummaryCards({
  cards,
  total,
  activeContinent,
  activeTotal,
  onContinent,
  onTotal,
}: Props) {
  const { copy, locale } = useLocale();
  return (
    <ul className="continent-summary-cards" aria-label={copy.continentSummary}>
      <li>
        <button
          type="button"
          className={activeTotal ? 'continent-summary-card total active' : 'continent-summary-card total'}
          onClick={onTotal}
        >
          <span>{copy.total}</span>
          <strong>{total}</strong>
        </button>
      </li>
      {cards.map((card) => (
        <li key={card.continent}>
          <button
            type="button"
            className={card.continent === activeContinent ? 'continent-summary-card active' : 'continent-summary-card'}
            onClick={() => onContinent(card.continent)}
          >
            <span>{continentLabel(card.continent, locale)}</span>
            <strong>{card.count}</strong>
          </button>
        </li>
      ))}
    </ul>
  );
}
