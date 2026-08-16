import { THEMES } from '../../domain/themes';
import {
  type ContentType,
  type FilterCriteria,
  type SortKey,
  type Story,
} from '../../domain/story';

type Props = {
  stories: Story[];
  draft: FilterCriteria;
  onDraftChange: (next: FilterCriteria) => void;
  onApply: () => void;
  onClearType: () => void;
};

const yearsIn = (stories: Story[]): number[] =>
  [...new Set(stories.map((story) => Number.parseInt(story.date.slice(0, 4), 10)))].sort(
    (a, b) => b - a,
  );

const sdgsIn = (stories: Story[]) =>
  [...new Set(stories.flatMap((story) => story.sdgs))].sort((a, b) => a - b);

export function FilterPanel({ stories, draft, onDraftChange, onApply, onClearType }: Props) {
  return (
    <div>
      <div className="filter-grid">
        <label>
          <select
            className="filter-control"
            value={draft.type}
            onChange={(event) =>
              onDraftChange({ ...draft, type: event.target.value as ContentType | 'all' })
            }
          >
            <option value="all">Content type</option>
            <option value="ice-story">Stories</option>
            <option value="global-stage">Global stage</option>
          </select>
          {draft.type === 'ice-story' ? (
            <div className="chips">
              <span className="chip">
                Stories
                <button type="button" aria-label="Remove Stories filter" onClick={onClearType}>
                  ×
                </button>
              </span>
            </div>
          ) : null}
          {draft.type === 'global-stage' ? (
            <div className="chips">
              <span className="chip">
                Global stage
                <button type="button" aria-label="Remove Global Stage filter" onClick={onClearType}>
                  ×
                </button>
              </span>
            </div>
          ) : null}
        </label>
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
