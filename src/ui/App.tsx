import { Suspense, lazy, useLayoutEffect, useMemo, useState, type CSSProperties } from 'react';
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
import { scrollPageToTop } from '../application/scroll-page-top';
import { stories as catalog } from '../content/stories';
import { defaultFilterCriteria, type ContentType, type FilterCriteria } from '../domain/story';
import { FilterPanel } from './chrome/FilterPanel';
import { AutoplayScroll } from './chrome/AutoplayScroll';
import { LocaleProvider } from './chrome/LocaleContext';
import { AutoplayProvider } from './chrome/AutoplayContext';
import { SiteFooter } from './chrome/SiteFooter';
import { ErrorBoundary } from './chrome/ErrorBoundary';
import { StoryList } from './catalog/StoryList';
import { ClimateImpactPage } from './catalog/ClimateImpactPage';
import { MediaSourceCredit } from './catalog/MediaSourceCredit';
import { MediaSources } from './catalog/MediaSources';
import { mediaSourceList, storyImages } from '../application/citations';
import { RelatedLinks } from './catalog/RelatedLinks';
import type { ClimateHazardId } from '../content/climate-impact';
import { NavIcon } from './chrome/NavIcon';

// Map pages load on demand so MapLibre and Leaflet stay out of the first download.
const GlobalStageMap = lazy(() =>
  import('./map/GlobalStageMap').then((module) => ({ default: module.GlobalStageMap })),
);
const StoryDetail = lazy(() =>
  import('./catalog/StoryDetail').then((module) => ({ default: module.StoryDetail })),
);
const FloodWatchPage = lazy(() =>
  import('./watch/FloodWatchPage').then((module) => ({ default: module.FloodWatchPage })),
);
const DroughtWatchPage = lazy(() =>
  import('./watch/DroughtWatchPage').then((module) => ({ default: module.DroughtWatchPage })),
);
import type { Screen } from '../application/route';
import { useHashRoute } from './useHashRoute';
import { usePageMeta } from './usePageMeta';

/** Stories shows ICE stories and ICE at Global Stage events together. */
const catalogTypesFor = (screen: Screen): ContentType[] =>
  screen === 'research' ? ['research-story'] : ['ice-story', 'global-stage'];

type StoryKind = 'all' | 'ice-story' | 'global-stage';

export default function App() {
  const [draft, setDraft] = useState<FilterCriteria>(defaultFilterCriteria);
  const [applied, setApplied] = useState<FilterCriteria>(defaultFilterCriteria);
  const [advancedOpen, setAdvancedOpen] = useState(true);
  const [storyKind, setStoryKind] = useState<StoryKind>('all');
  const [route, navigate] = useHashRoute();
  const { screen, locale } = route;
  const selectedId = route.storyId;
  const impactHazard = route.hazard;
  const go = (patch: Partial<typeof route>) => navigate({ ...route, ...patch });
  const setLocale = (next: Locale) => go({ locale: next });
  const setSelectedId = (id: string | null) => go({ storyId: id });
  const setImpactHazard = (id: ClimateHazardId | null) => go({ hazard: id });
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
    () =>
      localizedCatalog.filter(
        (story) =>
          catalogTypesFor(screen).includes(story.type) &&
          (screen !== 'stories' || storyKind === 'all' || story.type === storyKind),
      ),
    [localizedCatalog, screen, storyKind],
  );
  const matches = useMemo(() => filterCatalog(scoped, applied), [scoped, applied]);
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
    go({ screen: next, storyId: null, hazard: null });
  };

  const relatedStoryTitle = (id: string) =>
    localizedCatalog.find((story) => story.id === id)?.title;

  const openRelated = (target: RelatedTarget) => {
    if (target.kind === 'hub') {
      go({ screen: 'climate-impact', storyId: null, hazard: null });
      return;
    }
    if (target.kind === 'hazard') {
      go({ screen: 'climate-impact', storyId: null, hazard: target.id });
      return;
    }
    const story = localizedCatalog.find((item) => item.id === target.id);
    if (!story) return;
    go({
      screen: story.type === 'research-story' ? 'research' : 'stories',
      storyId: story.id,
      hazard: null,
    });
  };

  const screenTitle: Record<Screen, string> = {
    about: copy.about,
    research: copy.research,
    stories: copy.stories,
    'climate-impact': copy.climateImpact,
    'flood-watch': copy.floodWatch,
    'drought-watch': copy.droughtWatch,
    'global-stage': copy.globalStage,
  };

  usePageMeta({
    platform: copy.platform,
    title: detail?.title ?? (screen === 'stories' ? undefined : screenTitle[screen]),
    description: detail?.summary,
    image: detail?.images[0],
  });

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
    <AutoplayProvider>
    <div>
      <header className="topbar">
        <img
          className="topbar-logo topbar-brand"
          src="/logos/simad-ice-web.webp"
          alt="SIMAD University · Institute of Climate and Environment"
          width={760}
          height={225}
        />
        <div className="topbar-title" role="heading" aria-level={1} aria-label={copy.platform}>
          <span
            className="topbar-title-text"
            aria-hidden="true"
            style={
              {
                '--title-chars': Math.max(...copy.platformLines.map((line) => line.length)),
              } as CSSProperties
            }
          >
            {copy.platformLines.map((line) => (
              <span className="topbar-title-line" key={line}>
                {line}
              </span>
            ))}
          </span>
        </div>
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
      </header>
      <nav className="nav" aria-label="Primary">
        <button
          type="button"
          className={screen === 'about' ? 'active' : ''}
          aria-current={screen === 'about' ? 'page' : undefined}
          onClick={() => openScreen('about')}
        >
          <NavIcon screen="about" />
          {copy.about}
        </button>
        <button
          type="button"
          className={screen === 'research' ? 'active' : ''}
          aria-current={screen === 'research' ? 'page' : undefined}
          onClick={() => openScreen('research')}
        >
          <NavIcon screen="research" />
          {copy.research}
        </button>
        <button
          type="button"
          className={screen === 'stories' ? 'active' : ''}
          aria-current={screen === 'stories' ? 'page' : undefined}
          onClick={() => openScreen('stories')}
        >
          <NavIcon screen="stories" />
          {copy.stories}
        </button>
        <button
          type="button"
          className={screen === 'climate-impact' ? 'active' : ''}
          aria-current={screen === 'climate-impact' ? 'page' : undefined}
          onClick={() => openScreen('climate-impact')}
        >
          <NavIcon screen="climate-impact" />
          {copy.climateImpact}
        </button>
        <button
          type="button"
          className={screen === 'flood-watch' ? 'active' : ''}
          aria-current={screen === 'flood-watch' ? 'page' : undefined}
          onClick={() => openScreen('flood-watch')}
        >
          <NavIcon screen="flood-watch" />
          {copy.floodWatch}
        </button>
        <button
          type="button"
          className={screen === 'drought-watch' ? 'active' : ''}
          aria-current={screen === 'drought-watch' ? 'page' : undefined}
          onClick={() => openScreen('drought-watch')}
        >
          <NavIcon screen="drought-watch" />
          {copy.droughtWatch}
        </button>
      </nav>

      <ErrorBoundary
        resetKey={`${screen}/${selectedId ?? ''}/${impactHazard ?? ''}`}
        title={copy.pageErrorTitle}
        message={copy.pageErrorMessage}
        retryLabel={copy.pageErrorRetry}
      >
      <Suspense fallback={<p className="page-loading" role="status">{copy.pageLoading}</p>}>
      {screen === 'about' ? (
        <article className="detail about-ice" aria-label={copy.about}>
          <AutoplayScroll />
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
      ) : screen === 'flood-watch' ? (
        <FloodWatchPage />
      ) : screen === 'drought-watch' ? (
        <DroughtWatchPage />
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
          <AutoplayScroll />
          <button className="back" type="button" onClick={() => setSelectedId(null)}>
            {copy.backCatalog}
          </button>
          <p className="story-type">
            {detail.type === 'research-story'
              ? copy.researchLabel
              : detail.type === 'global-stage'
                ? copy.globalStage
                : copy.story}
          </p>
          <h1>{detail.title}</h1>
          {detail.images[0] ? <img src={detail.images[0]} alt="" /> : null}
          <p className="story-meta">
            {formatLocaleDate(detail.date, locale)} · {detail.location.name} · {copy.sdgPrefix}{' '}
            {detail.sdgs.join(', ')}
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
          {detail.type === 'global-stage' ? (
            <p>
              <button className="globe-link" type="button" onClick={() => openScreen('global-stage')}>
                <NavIcon screen="global-stage" />
                {copy.globalStageOpen}
              </button>
            </p>
          ) : null}
          <RelatedLinks links={researchRelatedLinks} onOpen={openRelated} />
          <MediaSources entries={mediaSourceList(storyImages(detail), [], detail)} />
          <MediaSourceCredit credit={storyMediaCredit(detail)} />
        </article>
      ) : (
        <>
          <div className="search-wrap">
            {screen === 'stories' ? (
              <section className="globe-banner" aria-label={copy.globalStageTitle}>
                <NavIcon screen="global-stage" />
                <div>
                  <h2>{copy.globalStageTitle}</h2>
                  <p>{copy.globalStageBanner}</p>
                </div>
                <button type="button" onClick={() => openScreen('global-stage')}>
                  {copy.globalStageOpen} →
                </button>
              </section>
            ) : null}
            <p className="kicker">{copy.search}</p>
            <input
              className="search-input"
              value={draft.query}
              placeholder={copy.searchPlaceholder}
              onChange={(event) => {
                const next = { ...draft, query: event.target.value };
                setDraft(next);
                setApplied(next);
              }}
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
            {screen === 'stories' ? (
              <div className="story-kind" role="group" aria-label={copy.storiesKindLabel}>
                {(
                  [
                    ['all', copy.storiesAll],
                    ['ice-story', copy.storiesIce],
                    ['global-stage', copy.globalStage],
                  ] as const
                ).map(([kind, label]) => (
                  <button
                    key={kind}
                    type="button"
                    aria-pressed={storyKind === kind}
                    className={storyKind === kind ? 'active' : ''}
                    onClick={() => setStoryKind(kind)}
                  >
                    {kind === 'global-stage' ? <NavIcon screen="global-stage" /> : null}
                    {label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <StoryList
            stories={matches}
            selectedId={selectedId}
            onSelect={setSelectedId}
            typeLabel={
              screen === 'research'
                ? copy.researchLabel
                : (story) => (story.type === 'global-stage' ? copy.globalStage : copy.story)
            }
            layout="grid"
          />
        </>
      )}
      </Suspense>
      </ErrorBoundary>
      {screen === 'global-stage' ? null : <SiteFooter />}
    </div>
    </AutoplayProvider>
    </LocaleProvider>
  );
}
