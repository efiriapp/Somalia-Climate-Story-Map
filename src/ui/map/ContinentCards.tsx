import type { ContinentCard } from '../../application/continent-visits';

type Props = {
  cards: ContinentCard[];
  onCountry: (country: string) => void;
  onReset: () => void;
};

export function ContinentCards({ cards, onCountry, onReset }: Props) {
  return (
    <div className="continent-board" aria-label="Countries visited by continent">
      <div className="continent-table-bar">
        <p>Visited continents</p>
        <button type="button" aria-label="Reset map" onClick={onReset}>
          Reset
        </button>
      </div>
      <table className="continent-table">
        <thead>
          <tr>
            <th>Continent</th>
            <th>Countries</th>
            <th>Frequency</th>
          </tr>
        </thead>
        <tbody>
          {cards.map((card) => (
            <tr key={card.continent}>
              <th scope="row">{card.continent}</th>
              <td>
                {card.countries.map((item) => (
                  <button key={item.country} type="button" onClick={() => onCountry(item.country)}>
                    {item.country}
                  </button>
                ))}
              </td>
              <td>{card.visited === 0 ? '' : card.visited}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
