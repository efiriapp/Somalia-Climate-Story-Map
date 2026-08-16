import { tourDateParts } from '../../application/global-tour';

const YEARS = ['2023', '2024', '2025', '2026'];
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const DAYS = Array.from({ length: 31 }, (_, index) => String(index + 1).padStart(2, '0'));
const ITEM_HEIGHT = 2.7;

type ColumnProps = {
  label: string;
  value: string;
  items: string[];
};

const ReelColumn = ({ label, value, items }: ColumnProps) => {
  const index = Math.max(0, items.indexOf(value));
  return (
    <div className="date-reel-col">
      <span className="date-reel-label">{label}</span>
      <div className="date-reel-window">
        <div
          className="date-reel-track"
          style={{ transform: `translateY(${(1 - index) * ITEM_HEIGHT}rem)` }}
        >
          {items.map((item) => (
            <div key={item} className={item === value ? 'date-reel-item active' : 'date-reel-item'}>
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

type Props = {
  isoDate: string;
};

export function DateReel({ isoDate }: Props) {
  const parts = tourDateParts(isoDate);
  return (
    <aside className="date-reel" aria-label={`ICE Institute's calendar ${parts.year} ${parts.month} ${parts.day}`}>
      <p className="date-reel-kicker">ICE Institute's calendar</p>
      <div className="date-reel-face">
        <ReelColumn label="Year" value={parts.year} items={YEARS} />
        <ReelColumn label="Month" value={parts.month} items={MONTHS} />
        <ReelColumn label="Date" value={parts.day} items={DAYS} />
      </div>
    </aside>
  );
}
