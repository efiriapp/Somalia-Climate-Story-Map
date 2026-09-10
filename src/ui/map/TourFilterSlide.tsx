import type { ContinentId, TourFilter } from '../../application/continent-visits';
import { useLocale } from '../chrome/LocaleContext';

type Props = {
  open: boolean;
  filter: TourFilter;
  years: number[];
  continents: ContinentId[];
  countries: string[];
  onYear: (year: number | 'all') => void;
  onContinent: (continent: ContinentId | 'all') => void;
  onCountry: (country: string) => void;
};

export function TourFilterSlide({
  open,
  filter,
  years,
  continents,
  countries,
  onYear,
  onContinent,
  onCountry,
}: Props) {
  const { copy } = useLocale();
  return (
    <aside
      className={open ? 'tour-filter-slide open' : 'tour-filter-slide'}
      aria-hidden={!open}
      aria-label={copy.tourFilters}
    >
      <p>Filter</p>
      <label>
        Year
        <select
          value={String(filter.year)}
          onChange={(event) => onYear(event.target.value === 'all' ? 'all' : Number(event.target.value))}
        >
          <option value="all">All years</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </label>
      <label>
        Continent
        <select
          value={filter.continent}
          onChange={(event) =>
            onContinent(event.target.value === 'all' ? 'all' : (event.target.value as ContinentId))
          }
        >
          <option value="all">All continents</option>
          {continents.map((continent) => (
            <option key={continent} value={continent}>
              {continent}
            </option>
          ))}
        </select>
      </label>
      <label>
        Country
        <select value={filter.country} onChange={(event) => onCountry(event.target.value)}>
          <option value="all">All countries</option>
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </label>
    </aside>
  );
}
