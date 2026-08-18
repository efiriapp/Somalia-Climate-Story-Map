import { useMemo, useState } from 'react';
import { filterCatalog } from '../application/filter-catalog';
import { resolveMapView } from '../application/resolve-map-view';
import { stories as catalog } from '../content/stories';
import { defaultFilterCriteria, type FilterCriteria } from '../domain/story';
import { FilterPanel } from './chrome/FilterPanel';
import { StoryList } from './catalog/StoryList';
import { MapPane } from './map/MapPane';
import { GlobalStageMap } from './map/GlobalStageMap';

export default function App() {
  const [draft, setDraft] = useState<FilterCriteria>(defaultFilterCriteria);
  const [applied, setApplied] = useState<FilterCriteria>(defaultFilterCriteria);
  const [advancedOpen, setAdvancedOpen] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [screen, setScreen] = useState<'stories' | 'global-stage'>('stories');

  const matches = useMemo(() => filterCatalog(catalog, applied), [applied]);
  const view = useMemo(() => resolveMapView(applied, matches), [applied, matches]);
  const detail = selectedId ? catalog.find((story) => story.id === selectedId) : undefined;

  return (
    <div>
      <header className="topbar">
        <img className="topbar-logo" src="/logos/simad.webp" alt="SIMAD University" />
        <div className="topbar-title">Somali Climate Storytelling Map Platform</div>
        <img className="topbar-logo ice" src="/logos/ice-mark.png" alt="Institute of Climate and Environment" />
      </header>
      <nav className="nav" aria-label="Primary">
        <button
          type="button"
          className={screen === 'stories' ? 'active' : ''}
          onClick={() => setScreen('stories')}
        >
          Stories
        </button>
        <button
          type="button"
          className={screen === 'global-stage' ? 'active' : ''}
          onClick={() => setScreen('global-stage')}
        >
          ICE Institute at Global Stage
        </button>
      </nav>

      {screen === 'global-stage' ? (
        <GlobalStageMap stories={catalog} onClose={() => setScreen('stories')} />
      ) : detail ? (
        <article className="detail">
          <button className="back" type="button" onClick={() => setSelectedId(null)}>
            ← Back to catalog
          </button>
          <p className="story-type">Story</p>
          <h1>{detail.title}</h1>
          <p className="story-meta">
            {detail.date} · {detail.location.name} · SDG {detail.sdgs.join(', ')}
          </p>
          <p>{detail.body}</p>
        </article>
      ) : (
        <>
          <div className="search-wrap">
            <p className="kicker">Search</p>
            <input
              className="search-input"
              value={draft.query}
              placeholder="Search by keywords"
              onChange={(event) => setDraft({ ...draft, query: event.target.value })}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  setApplied(draft);
                }
              }}
            />
            <button
              className="advanced-toggle"
              type="button"
              onClick={() => setAdvancedOpen((open) => !open)}
            >
              {advancedOpen ? '▼' : '►'} Advanced options
            </button>
            {advancedOpen ? (
              <FilterPanel
                stories={catalog}
                draft={draft}
                onDraftChange={(next) => {
                  setDraft(next);
                  setApplied(next);
                }}
                onApply={() => {
                  setApplied(draft);
                  setSelectedId(null);
                }}
              />
            ) : null}
            <h2 className="section-title">Latest stories</h2>
          </div>
          <div className="catalog">
            <MapPane stories={matches} view={view} selectedId={selectedId} onSelect={setSelectedId} />
            <div className="list-pane">
              <StoryList stories={matches} selectedId={selectedId} onSelect={setSelectedId} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
