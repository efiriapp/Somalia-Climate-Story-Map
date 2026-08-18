import { playCalendarTick } from '../../application/tour-sound';
import { tourDateParts } from '../../application/global-tour';

const YEARS = ['2023', '2024', '2025', '2026'];
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const DAYS = Array.from({ length: 31 }, (_, index) => String(index + 1).padStart(2, '0'));
const ITEM_HEIGHT = 2.7;

const isoFromParts = (year: string, month: string, day: string): string => {
  const monthNumber = String(Math.max(1, MONTHS.indexOf(month) + 1)).padStart(2, '0');
  return `${year}-${monthNumber}-${day}`;
};

type ColumnProps = {
  label: string;
  value: string;
  items: string[];
  onChange: (value: string) => void;
};

const ReelColumn = ({ label, value, items, onChange }: ColumnProps) => {
  const index = Math.max(0, items.indexOf(value));
  return (
    <div className="date-reel-col">
      <span className="date-reel-label">{label}</span>
      <div
        className="date-reel-window"
        onWheel={(event) => {
          event.preventDefault();
          event.stopPropagation();
          const delta = event.deltaY > 0 ? 1 : -1;
          const next = Math.min(items.length - 1, Math.max(0, index + delta));
          if (next !== index) {
            onChange(items[next]);
          }
        }}
      >
        <div
          className="date-reel-track"
          style={{ transform: `translateY(${(1 - index) * ITEM_HEIGHT}rem)` }}
        >
          {items.map((item) => (
            <button
              key={item}
              type="button"
              className={item === value ? 'date-reel-item active' : 'date-reel-item'}
              onClick={() => onChange(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

type Props = {
  isoDate: string;
  onDateChange: (iso: string) => void;
  onPrev: () => void;
  onNext: () => void;
};

export function DateReel({ isoDate, onDateChange, onPrev, onNext }: Props) {
  const parts = tourDateParts(isoDate);
  const change = (next: { year?: string; month?: string; day?: string }) => {
    playCalendarTick();
    onDateChange(
      isoFromParts(next.year ?? parts.year, next.month ?? parts.month, next.day ?? parts.day),
    );
  };
  return (
    <aside className="date-reel" aria-label={`ICE Institute's calendar ${parts.year} ${parts.month} ${parts.day}`}>
      <p className="date-reel-kicker">ICE Institute's calendar</p>
      <div className="date-reel-body">
        <div className="date-reel-face">
          <ReelColumn label="Year" value={parts.year} items={YEARS} onChange={(year) => change({ year })} />
          <ReelColumn label="Month" value={parts.month} items={MONTHS} onChange={(month) => change({ month })} />
          <ReelColumn label="DAY" value={parts.day} items={DAYS} onChange={(day) => change({ day })} />
        </div>
        <div className="date-reel-nav">
          <button
            type="button"
            aria-label="Previous stop"
            onClick={() => {
              playCalendarTick();
              onPrev();
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 15l6-6 6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next stop"
            onClick={() => {
              playCalendarTick();
              onNext();
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
