import { useLayoutEffect, useMemo, useState } from 'react';
import { filterCatalog } from '../application/filter-catalog';
import { resolveMapView } from '../application/resolve-map-view';
import { aboutIce } from '../content/about-ice';
import { stories as catalog } from '../content/stories';
import { defaultFilterCriteria, type ContentType, type FilterCriteria } from '../domain/story';
import { FilterPanel } from './chrome/FilterPanel';
import { SiteFooter } from './chrome/SiteFooter';
import { StoryDetail } from './catalog/StoryDetail';
import { StoryList } from './catalog/StoryList';
import { MapPane } from './map/MapPane';
import { GlobalStageMap } from './map/GlobalStageMap';

type Screen = 'about' | 'research' | 'stories' | 'global-stage';

const catalogTypeFor = (screen: Screen): ContentType =>
  screen === 'research' ? 'research-story' : 'ice-story';

export default function App() {
  const [draft, setDraft] = useState<FilterCriteria>(defaultFilterCriteria);
  const [applied, setApplied] = useState<FilterCriteria>(defaultFilterCriteria);
  const [advancedOpen, setAdvancedOpen] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>('stories');

  const scoped = useMemo(
    () => catalog.filter((story) => story.type === catalogTypeFor(screen)),
    [screen],
  );
  const matches = useMemo(() => filterCatalog(scoped, applied), [scoped, applied]);
  const view = useMemo(() => resolveMapView(applied, matches), [applied, matches]);
  const detail = selectedId ? catalog.find((story) => story.id === selectedId) : undefined;

  useLayoutEffect(() => {
    if (!selectedId) return;
    window.scrollTo(0, 0);
  }, [selectedId]);

  const openScreen = (next: Screen) => {
    setScreen(next);
    setSelectedId(null);
  };

  return (
    <div>
      <header className="topbar">
        <img className="topbar-logo" src="/logos/simad.webp" alt="SIMAD University" />
        <div className="topbar-title">Somali Climate Data Storytelling Platform</div>
        <img className="topbar-logo ice" src="/logos/ice-mark.png" alt="Institute of Climate and Environment" />
      </header>
      <nav className="nav" aria-label="Primary">
        <button
          type="button"
          className={screen === 'about' ? 'active' : ''}
          onClick={() => openScreen('about')}
        >
          About ICE Institute
        </button>
        <button
          type="button"
          className={screen === 'research' ? 'active' : ''}
          onClick={() => openScreen('research')}
        >
          ICE Institute Research Stories
        </button>
        <button
          type="button"
          className={screen === 'stories' ? 'active' : ''}
          onClick={() => openScreen('stories')}
        >
          Stories
        </button>
        <button
          type="button"
          className={screen === 'global-stage' ? 'active' : ''}
          onClick={() => openScreen('global-stage')}
        >
          ICE at Global Stage
        </button>
      </nav>

      {screen === 'about' ? (
        <article className="detail about-ice" aria-label="About ICE Institute">
          <h1>{aboutIce.title}</h1>
          {aboutIce.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
          <p>
            <strong>More information:</strong>{' '}
            <a href={aboutIce.website} target="_blank" rel="noreferrer">
              {aboutIce.website}
            </a>
          </p>
        </article>
      ) : screen === 'global-stage' ? (
        <GlobalStageMap stories={catalog} onClose={() => openScreen('stories')} />
      ) : detail && (detail.type === 'ice-story' || detail.chapters) ? (
        <StoryDetail story={detail} onBack={() => setSelectedId(null)} />
      ) : detail ? (
        <article className="detail">
          <button className="back" type="button" onClick={() => setSelectedId(null)}>
            ← Back to catalog
          </button>
          <p className="story-type">{detail.type === 'research-story' ? 'Research' : 'Story'}</p>
          <h1>{detail.title}</h1>
          {detail.images[0] ? <img src={detail.images[0]} alt="" /> : null}
          <p className="story-meta">
            {detail.date} · {detail.location.name} · SDG {detail.sdgs.join(', ')}
          </p>
          <p>{detail.body}</p>
          {detail.website ? (
            <p>
              <strong>More information:</strong>{' '}
              <a href={detail.website} target="_blank" rel="noreferrer">
                {detail.website}
              </a>
            </p>
          ) : null}
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
                stories={scoped}
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
            <h2 className="section-title">
              {screen === 'research' ? 'ICE Institute Research Stories' : 'Latest stories'}
            </h2>
          </div>
          {screen === 'stories' ? (
            <StoryList
              stories={matches}
              selectedId={selectedId}
              onSelect={setSelectedId}
              typeLabel="Story"
              layout="grid"
            />
          ) : (
            <div className="catalog">
              <MapPane stories={matches} view={view} selectedId={selectedId} onSelect={setSelectedId} />
              <div className="list-pane">
                <StoryList
                  stories={matches}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  typeLabel="Research"
                />
              </div>
            </div>
          )}
        </>
      )}
      {screen === 'global-stage' ? null : <SiteFooter />}
    </div>
  );
}
