import type { ContinentId, ContinentSummary } from '../../application/continent-visits';

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
  return (
    <ul className="continent-summary-cards" aria-label="Continent summary">
      <li>
        <button
          type="button"
          className={activeTotal ? 'continent-summary-card total active' : 'continent-summary-card total'}
          onClick={onTotal}
        >
          <span>Total</span>
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
            <span>{card.continent}</span>
            <strong>{card.count}</strong>
          </button>
        </li>
      ))}
    </ul>
  );
}
