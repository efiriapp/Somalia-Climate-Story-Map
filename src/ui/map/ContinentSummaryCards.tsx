import type { ContinentId, ContinentSummary } from '../../application/continent-visits';

type Props = {
  cards: ContinentSummary[];
  activeContinent?: ContinentId;
  onContinent: (continent: ContinentId) => void;
};

export function ContinentSummaryCards({ cards, activeContinent, onContinent }: Props) {
  return (
    <ul className="continent-summary-cards" aria-label="Continent summary">
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
