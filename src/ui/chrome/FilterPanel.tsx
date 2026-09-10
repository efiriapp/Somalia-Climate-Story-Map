import { themeLabel } from '../../application/locale';
import { THEMES } from '../../domain/themes';
import { districtsForRegion, REGIONS, type RegionSlug } from '../../domain/somalia';
import { type FilterCriteria, type SortKey, type Story } from '../../domain/story';
import { SearchSelect } from './SearchSelect';
import { useLocale } from './LocaleContext';

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
  const { copy, locale } = useLocale();
  const region = (draft.region === 'all' ? 'all' : draft.region) as RegionSlug | 'all';
  const districts = districtsForRegion(region);
  const themesInCatalog = THEMES.filter((theme) =>
    stories.some((story) => story.themes.includes(theme.slug)),
  );

  return (
    <div>
      <div className="filter-grid">
        <SearchSelect
          label={copy.region}
          allLabel={copy.allRegions}
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
          label={copy.district}
          allLabel={copy.allDistricts}
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
            <option value="">{copy.themes}</option>
            {themesInCatalog.map((theme) => (
              <option key={theme.slug} value={theme.slug}>
                {themeLabel(theme.slug, locale)}
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
            <option value="">{copy.sdgs}</option>
            {sdgsIn(stories).map((sdg) => (
              <option key={sdg} value={sdg}>
                {copy.sdgPrefix} {sdg}
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
            <option value="">{copy.dateAny}</option>
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
            <option value="keywords">{copy.sortKeywords}</option>
            <option value="newest">{copy.sortNewest}</option>
            <option value="oldest">{copy.sortOldest}</option>
            <option value="title">{copy.sortTitle}</option>
          </select>
        </label>
      </div>
      <div className="apply-row">
        <button className="apply" type="button" onClick={onApply}>
          {copy.apply}
        </button>
      </div>
    </div>
  );
}
