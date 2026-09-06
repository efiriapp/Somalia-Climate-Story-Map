import { useEffect, useMemo, useRef, useState } from 'react';
import { searchByLabel } from '../../domain/somalia';
import { useLocale } from './LocaleContext';

export type SearchOption = { slug: string; label: string };

type Props = {
  label: string;
  allLabel: string;
  value: string;
  options: SearchOption[];
  onChange: (slug: string) => void;
};

export function SearchSelect({ label, allLabel, value, options, onChange }: Props) {
  const { copy } = useLocale();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const root = useRef<HTMLDivElement>(null);

  const selected = options.find((option) => option.slug === value);
  const matches = useMemo(() => searchByLabel(options, query), [options, query]);

  useEffect(() => {
    setQuery('');
  }, [options]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const choose = (slug: string) => {
    onChange(slug);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="search-select" ref={root}>
      <button
        type="button"
        className="filter-control search-select-toggle"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {selected ? selected.label : label}
      </button>
      {open ? (
        <div className="search-select-menu">
          <input
            className="search-select-input"
            value={query}
            autoFocus
            placeholder={`Search ${label.toLowerCase()}...`}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="button" className="search-select-option" onClick={() => choose('all')}>
            {allLabel}
          </button>
          {matches.map((option) => (
            <button
              key={option.slug}
              type="button"
              className={option.slug === value ? 'search-select-option active' : 'search-select-option'}
              onClick={() => choose(option.slug)}
            >
              {option.label}
            </button>
          ))}
          {matches.length === 0 ? <p className="search-select-empty">{copy.noMatches}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
