import type { ContinentCard } from '../../application/continent-visits';

type Props = {
  cards: ContinentCard[];
  onCountry: (country: string) => void;
};

export function ContinentCards({ cards, onCountry }: Props) {
  return (
    <div className="continent-board" aria-label="Countries visited by continent">
      {cards.map((card) => (
        <article key={card.continent} className="continent-card">
          <h2>{card.continent}</h2>
          <p className="continent-stats">
            <span>Connected {card.connected}</span>
            <span>Visited {card.visited}</span>
          </p>
          <div className="continent-countries">
            {card.countries.map((item) => (
              <button key={item.country} type="button" onClick={() => onCountry(item.country)}>
                {item.country}
                <small>{item.visits}</small>
              </button>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
