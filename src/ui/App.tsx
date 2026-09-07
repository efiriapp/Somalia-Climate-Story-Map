import { useLayoutEffect, useMemo, useState } from 'react';
import { flagIconUrl } from '../application/country-flag';
import { filterCatalog } from '../application/filter-catalog';
import { chromeCopy, formatLocaleDate, type Locale } from '../application/locale';
import { localizeAbout, localizeStory } from '../application/localize-content';
import { storyMediaCredit } from '../application/media-source-credit';
import {
  labelForRelatedTarget,
  relatedTargetsForStory,
  type RelatedTarget,
} from '../application/related-links';
import { resolveMapView } from '../application/resolve-map-view';
import { scrollPageToTop } from '../application/scroll-page-top';
import { stories as catalog } from '../content/stories';
import { defaultFilterCriteria, type ContentType, type FilterCriteria } from '../domain/story';
import { FilterPanel } from './chrome/FilterPanel';
import { LocaleProvider } from './chrome/LocaleContext';
import { SiteFooter } from './chrome/SiteFooter';
import { StoryDetail } from './catalog/StoryDetail';
import { StoryList } from './catalog/StoryList';
import { ClimateImpactPage } from './catalog/ClimateImpactPage';
import { MediaSourceCredit } from './catalog/MediaSourceCredit';
import { RelatedLinks } from './catalog/RelatedLinks';
import { MapPane } from './map/MapPane';
import { GlobalStageMap } from './map/GlobalStageMap';
import type { ClimateHazardId } from '../content/climate-impact';

type Screen = 'about' | 'research' | 'stories' | 'climate-impact' | 'global-stage';

const catalogTypeFor = (screen: Screen): ContentType =>
  screen === 'research' ? 'research-story' : 'ice-story';

export default function App() {
  const [draft, setDraft] = useState<FilterCriteria>(defaultFilterCriteria);
  const [applied, setApplied] = useState<FilterCriteria>(defaultFilterCriteria);
  const [advancedOpen, setAdvancedOpen] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [impactHazard, setImpactHazard] = useState<ClimateHazardId | null>(null);
  const [screen, setScreen] = useState<Screen>('stories');
  const [locale, setLocale] = useState<Locale>('en');
  const copy = chromeCopy(locale);
  const about = localizeAbout(locale);
  const ukFlagSrc = flagIconUrl('United Kingdom');
  const soFlagSrc = flagIconUrl('Somalia');
  const saFlagSrc = flagIconUrl('Saudi Arabia');

  const localizedCatalog = useMemo(
    () => catalog.map((story) => localizeStory(story, locale)),
    [locale],
  );
  const scoped = useMemo(
    () => localizedCatalog.filter((story) => story.type === catalogTypeFor(screen)),
    [localizedCatalog, screen],
  );
  const matches = useMemo(() => filterCatalog(scoped, applied), [scoped, applied]);
  const view = useMemo(() => resolveMapView(applied, matches), [applied, matches]);
  const detail = selectedId ? localizedCatalog.find((story) => story.id === selectedId) : undefined;

  useLayoutEffect(() => {
    if (!selectedId) return;
    scrollPageToTop();
  }, [selectedId]);

  useLayoutEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);

  const openScreen = (next: Screen) => {
    setScreen(next);
    setSelectedId(null);
    setImpactHazard(null);
  };

  const relatedStoryTitle = (id: string) =>
    localizedCatalog.find((story) => story.id === id)?.title;

  const openRelated = (target: RelatedTarget) => {
    if (target.kind === 'hub') {
      setSelectedId(null);
      setScreen('climate-impact');
      setImpactHazard(null);
      return;
    }
    if (target.kind === 'hazard') {
      setSelectedId(null);
      setScreen('climate-impact');
      setImpactHazard(target.id);
      return;
    }
    const story = localizedCatalog.find((item) => item.id === target.id);
    if (!story) return;
    setImpactHazard(null);
    setSelectedId(story.id);
    setScreen(story.type === 'research-story' ? 'research' : 'stories');
  };

  const researchRelatedLinks = detail
    ? relatedTargetsForStory(detail.id).map((target) => ({
        target,
        label: labelForRelatedTarget(
          target,
          copy,
          target.kind === 'story' ? relatedStoryTitle(target.id) : undefined,
        ),
      }))
    : [];

  return (
    <LocaleProvider locale={locale} setLocale={setLocale}>
    <div>
      <header className="topbar">
        <img className="topbar-logo" src="/logos/simad.webp" alt="SIMAD University" />
        <div className="topbar-title">{copy.platform}</div>
        <img className="topbar-logo ice" src="/logos/ice-mark.png" alt="Institute of Climate and Environment" />
      </header>
      <nav className="nav" aria-label="Primary">
        <button
          type="button"
          className={screen === 'about' ? 'active' : ''}
          onClick={() => openScreen('about')}
        >
          {copy.about}
        </button>
        <button
          type="button"
          className={screen === 'research' ? 'active' : ''}
          onClick={() => openScreen('research')}
        >
          {copy.research}
        </button>
        <button
          type="button"
          className={screen === 'stories' ? 'active' : ''}
          onClick={() => openScreen('stories')}
        >
          {copy.stories}
        </button>
        <button
          type="button"
          className={screen === 'climate-impact' ? 'active' : ''}
          onClick={() => openScreen('climate-impact')}
        >
          {copy.climateImpact}
        </button>
        <button
          type="button"
          className={screen === 'global-stage' ? 'active' : ''}
          onClick={() => openScreen('global-stage')}
        >
          {copy.globalStage}
        </button>
        <div
          className={`nav-language is-${locale}`}
          role="group"
          aria-label={copy.languageToggleLabel}
        >
          <span className="nav-language-track" aria-hidden="true">
            <span className="nav-language-thumb" />
          </span>
          <button
            type="button"
            className="nav-language-option nav-language-en"
            aria-pressed={locale === 'en'}
            aria-label={copy.languageEnglish}
            onClick={() => setLocale('en')}
          >
            <span className="nav-language-label" aria-hidden="true">EN</span>
            {ukFlagSrc ? (
              <img
                className="nav-language-flag nav-language-flag-en"
                src={ukFlagSrc}
                alt=""
                width={32}
                height={22}
              />
            ) : null}
          </button>
          <button
            type="button"
            className="nav-language-option nav-language-so"
            aria-pressed={locale === 'so'}
            aria-label={copy.languageSomali}
            onClick={() => setLocale('so')}
          >
            <span className="nav-language-label" aria-hidden="true">SO</span>
            {soFlagSrc ? (
              <img
                className="nav-language-flag nav-language-flag-so"
                src={soFlagSrc}
                alt=""
                width={32}
                height={22}
              />
            ) : null}
          </button>
          <button
            type="button"
            className="nav-language-option nav-language-ar"
            aria-pressed={locale === 'ar'}
            aria-label={copy.languageArabic}
            onClick={() => setLocale('ar')}
          >
            <span className="nav-language-label" aria-hidden="true">AR</span>
            {saFlagSrc ? (
              <img
                className="nav-language-flag nav-language-flag-ar"
                src={saFlagSrc}
                alt=""
                width={32}
                height={22}
              />
            ) : null}
          </button>
          <span className="visually-hidden">{copy.languageToggle}</span>
        </div>
      </nav>

      {screen === 'about' ? (
        <article className="detail about-ice" aria-label={copy.about}>
          <h1>{copy.about}</h1>
          {about.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
          <p>
            <strong>{copy.moreInfo}</strong>{' '}
            <a href={about.website} target="_blank" rel="noreferrer">
              {about.website}
            </a>
          </p>
        </article>
      ) : screen === 'climate-impact' ? (
        <ClimateImpactPage
          selectedId={impactHazard}
          onSelect={setImpactHazard}
          onBack={() => setImpactHazard(null)}
          onOpenRelated={openRelated}
          relatedStoryTitle={relatedStoryTitle}
        />
      ) : screen === 'global-stage' ? (
        <GlobalStageMap stories={localizedCatalog} onClose={() => openScreen('stories')} />
      ) : detail && (detail.type === 'ice-story' || detail.chapters) ? (
        <StoryDetail
          story={detail}
          onBack={() => setSelectedId(null)}
          onOpenRelated={openRelated}
          relatedStoryTitle={relatedStoryTitle}
        />
      ) : detail ? (
        <article className="detail">
          <button className="back" type="button" onClick={() => setSelectedId(null)}>
            {copy.backCatalog}
          </button>
          <p className="story-type">{detail.type === 'research-story' ? copy.researchLabel : copy.story}</p>
          <h1>{detail.title}</h1>
          {detail.images[0] ? <img src={detail.images[0]} alt="" /> : null}
          <p className="story-meta">
            {formatLocaleDate(detail.date, locale)} · {detail.location.name} · SDG {detail.sdgs.join(', ')}
          </p>
          <p>{detail.body}</p>
          {detail.website ? (
            <p>
              <strong>{copy.moreInfo}</strong>{' '}
              <a href={detail.website} target="_blank" rel="noreferrer">
                {detail.website}
              </a>
            </p>
          ) : null}
          <RelatedLinks links={researchRelatedLinks} onOpen={openRelated} />
          <MediaSourceCredit credit={storyMediaCredit(detail)} />
        </article>
      ) : (
        <>
          <div className="search-wrap">
            <p className="kicker">{copy.search}</p>
            <input
              className="search-input"
              value={draft.query}
              placeholder={copy.searchPlaceholder}
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
              {advancedOpen ? '▼' : '►'} {copy.advanced}
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
              {screen === 'research' ? copy.research : copy.latestStories}
            </h2>
          </div>
          {screen === 'stories' ? (
            <StoryList
              stories={matches}
              selectedId={selectedId}
              onSelect={setSelectedId}
              typeLabel={copy.story}
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
                  typeLabel={copy.researchLabel}
                />
              </div>
            </div>
          )}
        </>
      )}
      {screen === 'global-stage' ? null : <SiteFooter />}
    </div>
    </LocaleProvider>
  );
}
