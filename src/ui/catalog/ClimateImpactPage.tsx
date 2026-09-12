import { Fragment, useLayoutEffect, useMemo } from 'react';
import type { ClimateHazardId } from '../../content/climate-impact';
import { climateImpactPages, splitStoryImages } from '../../content/climate-impact';
import { scrollPageToTop } from '../../application/scroll-page-top';
import {
  climateMediaCredit,
  formatMediaSourceCredit,
  videoEmbedCredit,
} from '../../application/media-source-credit';
import { hazardTitle } from '../../application/locale';
import { localizeClimateHub, localizeClimatePage } from '../../application/localize-content';
import {
  labelForRelatedTarget,
  relatedTargetsForClimateHub,
  relatedTargetsForHazard,
  type RelatedTarget,
} from '../../application/related-links';
import { videoEmbedSrc } from '../../application/youtube-embed';
import { AutoplayScroll } from '../chrome/AutoplayScroll';
import { useLocale } from '../chrome/LocaleContext';
import { MediaSourceCredit } from './MediaSourceCredit';
import { RelatedLinks } from './RelatedLinks';

type Props = {
  selectedId: ClimateHazardId | null;
  onSelect: (id: ClimateHazardId) => void;
  onBack: () => void;
  onOpenRelated?: (target: RelatedTarget) => void;
  relatedStoryTitle?: (id: string) => string | undefined;
};

function StorySpread({ images, className }: { images: string[]; className: string }) {
  if (images.length === 0) {
    return null;
  }
  return (
    <div className={`story-spread ${className}${images.length === 1 ? ' story-spread-single' : ''}`}>
      {images.map((src) => (
        <img key={src} src={src} alt="" />
      ))}
    </div>
  );
}

export function ClimateImpactPage({
  selectedId,
  onSelect,
  onBack,
  onOpenRelated,
  relatedStoryTitle,
}: Props) {
  const { copy, locale } = useLocale();
  const hub = localizeClimateHub(locale);
  const pages = climateImpactPages.map((item) => localizeClimatePage(item, locale));
  const page = pages.find((item) => item.id === selectedId);
  const hubLinks = useMemo(() => {
    if (!onOpenRelated) return [];
    return relatedTargetsForClimateHub().map((target) => ({
      target,
      label: labelForRelatedTarget(
        target,
        copy,
        target.kind === 'story' ? relatedStoryTitle?.(target.id) : undefined,
      ),
    }));
  }, [onOpenRelated, copy, relatedStoryTitle]);
  const pageLinks = useMemo(() => {
    if (!onOpenRelated || !page) return [];
    return relatedTargetsForHazard(page.id).map((target) => ({
      target,
      label: labelForRelatedTarget(
        target,
        copy,
        target.kind === 'story' ? relatedStoryTitle?.(target.id) : undefined,
      ),
    }));
  }, [onOpenRelated, page, copy, relatedStoryTitle]);

  useLayoutEffect(() => {
    scrollPageToTop();
  }, [selectedId]);

  if (page) {
    const { first, middle, last } = splitStoryImages(page.images);
    const midChapterIndex = Math.floor((page.chapters.length - 1) / 2);
    return (
      <article className="detail climate-impact" aria-label={hazardTitle(page.id, copy)}>
        <AutoplayScroll />
        <button className="back" type="button" onClick={onBack}>
          {copy.backClimate}
        </button>
        <p className="story-type">{copy.climateImpact}</p>
        <h1>{hazardTitle(page.id, copy)}</h1>
        <p className="story-lede">{page.lede}</p>
        <StorySpread images={first} className="story-spread-first" />
        {page.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 48)}>{paragraph}</p>
        ))}
        {page.chapters.map((chapter, index) => (
          <Fragment key={chapter.heading}>
            <section className="story-chapter">
              <h2>{chapter.heading}</h2>
              {chapter.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </section>
            {index === midChapterIndex ? (
              <StorySpread images={middle} className="story-spread-middle" />
            ) : null}
          </Fragment>
        ))}
        <StorySpread images={last} className="story-spread-end" />
        <p>
          <strong>{copy.moreInfo}</strong>{' '}
          <a href={page.sourceUrl} target="_blank" rel="noreferrer">
            {page.sourceLabel}
          </a>
        </p>
        {page.videos.map((video) => {
          const embedSrc = videoEmbedSrc(video.url);
          return embedSrc ? (
            <div key={video.url}>
              <div className="story-video">
                <iframe title={video.title} src={embedSrc} allowFullScreen />
              </div>
              <MediaSourceCredit credit={videoEmbedCredit(video.title, video.outlet)} />
            </div>
          ) : null;
        })}
        {onOpenRelated ? <RelatedLinks links={pageLinks} onOpen={onOpenRelated} /> : null}
        <MediaSourceCredit credit={climateMediaCredit(page)} />
      </article>
    );
  }

  return (
    <article className="detail climate-impact climate-impact-hub" aria-label={copy.climateImpact}>
      <p className="story-type">{copy.climateImpact}</p>
      <h1>{copy.climateImpact}</h1>
      <p className="story-lede">{hub.lede}</p>
      <div className="climate-impact-grid">
        {pages.map((item) => (
          <button
            key={item.id}
            type="button"
            className="climate-impact-card"
            onClick={() => onSelect(item.id)}
          >
            {item.images[0] ? <img src={item.images[0]} alt="" /> : null}
            <p className="story-type">{copy.climateImpact}</p>
            <h2>{hazardTitle(item.id, copy)}</h2>
            <p>{item.lede}</p>
          </button>
        ))}
      </div>
      {onOpenRelated ? <RelatedLinks links={hubLinks} onOpen={onOpenRelated} /> : null}
      <MediaSourceCredit credit={{ text: formatMediaSourceCredit('ICE Institute') }} />
    </article>
  );
}
