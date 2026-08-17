import type { ContinentSummary } from '../../application/continent-visits';

type Props = {
  cards: ContinentSummary[];
};

export function ContinentSummaryCards({ cards }: Props) {
  return (
    <ul className="continent-summary-cards" aria-label="Continent summary">
      {cards.map((card) => (
        <li key={card.continent} className="continent-summary-card">
          <span>{card.continent}</span>
          <strong>{card.count}</strong>
        </li>
      ))}
    </ul>
  );
}
