import { Fragment, useLayoutEffect, useMemo } from 'react';
import { featuredEntityLabel } from '../../application/featured-entity-label';
import { formatLocaleDate } from '../../application/locale';
import {
  labelForRelatedTarget,
  relatedTargetsForStory,
  type RelatedTarget,
} from '../../application/related-links';
import { scrollPageToTop } from '../../application/scroll-page-top';
import { storyMediaCredit } from '../../application/media-source-credit';
import { videoEmbedSrc } from '../../application/youtube-embed';
import { splitStoryImages } from '../../content/climate-impact';
import type { Story } from '../../domain/story';
import { MapPane } from '../map/MapPane';
import { RegionMapTour } from '../map/RegionMapTour';
import { AutoplayScroll } from '../chrome/AutoplayScroll';
import { useLocale } from '../chrome/LocaleContext';
import { MediaSourceCredit } from './MediaSourceCredit';
import { RelatedLinks } from './RelatedLinks';

type Props = {
  story: Story;
  onBack: () => void;
  onOpenRelated?: (target: RelatedTarget) => void;
  relatedStoryTitle?: (id: string) => string | undefined;
};

const CITY_ZOOM = 12;

function isStatementDocument(src: string) {
  return src.includes('-statement-');
}

export function StoryDetail({ story, onBack, onOpenRelated, relatedStoryTitle }: Props) {
  const { copy, locale } = useLocale();
  const relatedLinks = useMemo(() => {
    if (!onOpenRelated) return [];
    return relatedTargetsForStory(story.id).map((target) => ({
      target,
      label: labelForRelatedTarget(
        target,
        copy,
        target.kind === 'story' ? relatedStoryTitle?.(target.id) : undefined,
      ),
    }));
  }, [story.id, onOpenRelated, copy, relatedStoryTitle]);
  const chapters = story.chapters?.length
    ? story.chapters
    : [{ heading: copy.theStory, paragraphs: [story.body] }];
  const videos = [
    ...(story.videoTitle && story.videoUrl ? [{ title: story.videoTitle, url: story.videoUrl }] : []),
    ...(story.videos ?? []),
  ];
  const source = story.sourceCard;
  const hasChapterImages = chapters.some(
    (chapter) => (chapter.images?.length ?? 0) > 0 || (chapter.imagesAfter?.flat().length ?? 0) > 0,
  );
  const { first, middle, last } = hasChapterImages
    ? { first: [] as string[], middle: [] as string[], last: [] as string[] }
    : splitStoryImages(story.images);
  const midChapterIndex = Math.max(0, Math.floor((chapters.length - 1) / 2));

  useLayoutEffect(() => {
    scrollPageToTop();
  }, [story.id]);

  return (
    <article className="detail story-detail">
      <AutoplayScroll />
      <button className="back" type="button" onClick={onBack}>
        {copy.backCatalog}
      </button>
      <p className="story-type">{story.type === 'research-story' ? copy.researchLabel : copy.story}</p>
      <h1>{story.title}</h1>
      {story.featuredPerson ? <p className="story-person">{story.featuredPerson}</p> : null}
      <p className="story-meta">
        {formatLocaleDate(story.date, locale)} · {story.placeLabel ?? story.location.name} ·{' '}
        {copy.sdgPrefix} {story.sdgs.join(', ')}
      </p>
      <p className="story-lede">{story.summary}</p>
      {first.length > 0 ? (
        <div
          className={`story-spread story-spread-first${first.length === 1 ? ' story-spread-single' : ''}${
            first.some(isStatementDocument) ? ' story-spread-document' : ''
          }`}
        >
          {first.map((src) => (
            <img decoding="async"
              key={src}
              src={src}
              alt=""
              className={isStatementDocument(src) ? 'story-document' : undefined}
            />
          ))}
        </div>
      ) : null}

      {story.stats?.length ? (
        <dl className="story-stats">
          {story.stats.map((stat) => (
            <div className="story-stat" key={stat.label}>
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {chapters.map((chapter, index) => (
        <section className="story-chapter" key={chapter.heading}>
          <h2>{chapter.heading}</h2>
          {chapter.paragraphs.map((paragraph, paragraphIndex) => (
            <Fragment key={paragraph.slice(0, 48)}>
              <p>{paragraph}</p>
              {(chapter.imagesAfter?.[paragraphIndex] ?? []).map((src) => (
                <div
                  className={`story-spread story-spread-single${isStatementDocument(src) ? ' story-spread-document' : ''}`}
                  key={src}
                >
                  <img loading="lazy" decoding="async"
                    src={src}
                    alt=""
                    className={isStatementDocument(src) ? 'story-document' : undefined}
                  />
                </div>
              ))}
            </Fragment>
          ))}
          {(chapter.images ?? []).map((src) => (
            <div
              className={`story-spread story-spread-single${isStatementDocument(src) ? ' story-spread-document' : ''}`}
              key={src}
            >
              <img loading="lazy" decoding="async"
                src={src}
                alt=""
                className={isStatementDocument(src) ? 'story-document' : undefined}
              />
            </div>
          ))}
          {index === 0 && story.tourStops?.length ? (
            <section className="story-map story-map-bleed">
              <h2>{story.mapTitle ?? copy.onTheMap}</h2>
              <RegionMapTour story={story} />
            </section>
          ) : null}
          {index === midChapterIndex && middle.length > 0 ? (
            <div className="story-spread story-spread-middle">
              {middle.map((src) => (
                <img loading="lazy" decoding="async" key={src} src={src} alt="" />
              ))}
            </div>
          ) : null}
        </section>
      ))}
      {last.length > 0 ? (
        <div
          className={`story-spread story-spread-end${last.some(isStatementDocument) ? ' story-spread-document' : ''}`}
        >
          {last.map((src) => (
            <img loading="lazy" decoding="async"
              key={src}
              src={src}
              alt=""
              className={isStatementDocument(src) ? 'story-document' : undefined}
            />
          ))}
        </div>
      ) : null}

      {story.tourStops?.length ? null : (
        <section className="story-map">
          <h2>{copy.onTheMap}</h2>
          <p>{story.placeLabel ?? story.location.name}</p>
          <MapPane
            stories={[story]}
            view={{ center: { lat: story.location.lat, lng: story.location.lng }, zoom: CITY_ZOOM }}
            selectedId={story.id}
            onSelect={() => undefined}
          />
        </section>
      )}

      {videos.map((video) => {
        const embedSrc = videoEmbedSrc(video.url);
        return embedSrc ? (
          <div className="story-video" key={video.url}>
            <iframe
              title={video.title}
              src={embedSrc}
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : null;
      })}

      {source ? (
        <section className="story-source" aria-label={copy.storyMapLocation}>
          <h2>📍 {copy.storyMapLocation}</h2>
          <dl>
            <div>
              <dt>{copy.place}</dt>
              <dd>{source.place}</dd>
            </div>
            <div>
              <dt>{copy.city}</dt>
              <dd>{source.city}</dd>
            </div>
            <div>
              <dt>{copy.regionLabel}</dt>
              <dd>{source.regionLabel}</dd>
            </div>
            <div>
              <dt>{copy.country}</dt>
              <dd>{source.country}</dd>
            </div>
            <div>
              <dt>{copy.storyCategory}</dt>
              <dd>{source.category}</dd>
            </div>
            <div>
              <dt>{copy.impactAreas}</dt>
              <dd>{source.impactAreas.join(' • ')}</dd>
            </div>
            <div>
              <dt>{featuredEntityLabel(story, copy)}</dt>
              <dd>{source.featuredPerson}</dd>
            </div>
            <div>
              <dt>{copy.primarySource}</dt>
              <dd>{source.primarySource}</dd>
            </div>
            {source.extras?.map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd>
                  {/^https?:\/\//.test(row.value) ? (
                    <a href={row.value} target="_blank" rel="noreferrer">
                      {row.value}
                    </a>
                  ) : (
                    row.value
                  )}
                </dd>
              </div>
            ))}
            {story.videoTitle ? (
              <div>
                <dt>{copy.iceVideo}</dt>
                <dd>{story.videoTitle}</dd>
              </div>
            ) : null}
          </dl>
        </section>
      ) : null}

      {story.website ? (
        <p>
          <strong>{copy.moreInfo}</strong>{' '}
          <a href={story.website} target="_blank" rel="noreferrer">
            {story.website}
          </a>
        </p>
      ) : null}
      {onOpenRelated ? <RelatedLinks links={relatedLinks} onOpen={onOpenRelated} /> : null}
      <MediaSourceCredit credit={storyMediaCredit(story)} />
    </article>
  );
}
