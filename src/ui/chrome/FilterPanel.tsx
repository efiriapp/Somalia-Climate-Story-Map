import { THEMES } from '../../domain/themes';
import { districtsForRegion, REGIONS, type RegionSlug } from '../../domain/somalia';
import { type FilterCriteria, type SortKey, type Story } from '../../domain/story';
import { SearchSelect } from './SearchSelect';

type Props = {
  stories: Story[];
  draft: FilterCriteria;
  onDraftChange: (next: FilterCriteria) => void;
  onApply: () => void;
};

const yearsIn = (stories: Story[]): number[] =>
  [...new Set(stories.map((story) => Number.parseInt(story.date.slice(0, 4), 10)))].sort(
    (a, b) => b - a,
  );

const sdgsIn = (stories: Story[]) =>
  [...new Set(stories.flatMap((story) => story.sdgs))].sort((a, b) => a - b);

export function FilterPanel({ stories, draft, onDraftChange, onApply }: Props) {
  const region = (draft.region === 'all' ? 'all' : draft.region) as RegionSlug | 'all';
  const districts = districtsForRegion(region);

  return (
    <div>
      <div className="filter-grid">
        <SearchSelect
          label="Region"
          allLabel="All regions"
          value={draft.region}
          options={REGIONS}
          onChange={(nextRegion) => {
            const allowed = districtsForRegion(nextRegion === 'all' ? 'all' : (nextRegion as RegionSlug));
            const districtStillValid = allowed.some((item) => item.slug === draft.district);
            onDraftChange({
              ...draft,
              region: nextRegion,
              district: districtStillValid ? draft.district : 'all',
            });
          }}
        />
        <SearchSelect
          label="District"
          allLabel="All districts"
          value={draft.district}
          options={districts}
          onChange={(nextDistrict) =>
            onDraftChange({
              ...draft,
              district: nextDistrict,
            })
          }
        />
        <label>
          <select
            className="filter-control"
            value={draft.themes[0] ?? ''}
            onChange={(event) =>
              onDraftChange({
                ...draft,
                themes: event.target.value ? [event.target.value] : [],
              })
            }
          >
            <option value="">Themes</option>
            {THEMES.map((theme) => (
              <option key={theme.slug} value={theme.slug}>
                {theme.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <select
            className="filter-control"
            value={draft.sdgs[0] ?? ''}
            onChange={(event) =>
              onDraftChange({
                ...draft,
                sdgs: event.target.value ? [Number(event.target.value) as FilterCriteria['sdgs'][number]] : [],
              })
            }
          >
            <option value="">SDGs</option>
            {sdgsIn(stories).map((sdg) => (
              <option key={sdg} value={sdg}>
                SDG {sdg}
              </option>
            ))}
          </select>
        </label>
        <label>
          <select
            className="filter-control"
            value={draft.year === 'all' ? '' : String(draft.year)}
            onChange={(event) =>
              onDraftChange({
                ...draft,
                year: event.target.value ? Number(event.target.value) : 'all',
              })
            }
          >
            <option value="">Date — any</option>
            {yearsIn(stories).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
        <label>
          <select
            className="filter-control"
            value={draft.sort}
            onChange={(event) => onDraftChange({ ...draft, sort: event.target.value as SortKey })}
          >
            <option value="keywords">Sort by most keywords</option>
            <option value="newest">Sort by newest</option>
            <option value="oldest">Sort by oldest</option>
            <option value="title">Sort by title</option>
          </select>
        </label>
      </div>
      <div className="apply-row">
        <button className="apply" type="button" onClick={onApply}>
          Apply
        </button>
      </div>
    </div>
  );
}
