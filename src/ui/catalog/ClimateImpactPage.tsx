import { Fragment, useLayoutEffect } from 'react';
import type { ClimateHazardId } from '../../content/climate-impact';
import { climateImpactHub, climateImpactPages, splitStoryImages } from '../../content/climate-impact';
import { scrollPageToTop } from '../../application/scroll-page-top';
import { youtubeEmbedSrc } from '../../application/youtube-embed';

type Props = {
  selectedId: ClimateHazardId | null;
  onSelect: (id: ClimateHazardId) => void;
  onBack: () => void;
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

export function ClimateImpactPage({ selectedId, onSelect, onBack }: Props) {
  const page = climateImpactPages.find((item) => item.id === selectedId);

  useLayoutEffect(() => {
    scrollPageToTop();
  }, [selectedId]);

  if (page) {
    const { first, middle, last } = splitStoryImages(page.images);
    const midChapterIndex = Math.floor((page.chapters.length - 1) / 2);
    return (
      <article className="detail climate-impact" aria-label={page.title}>
        <button className="back" type="button" onClick={onBack}>
          ← Back to Climate Impact
        </button>
        <p className="story-type">{page.kicker}</p>
        <h1>{page.title}</h1>
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
          <strong>More information:</strong>{' '}
          <a href={page.sourceUrl} target="_blank" rel="noreferrer">
            {page.sourceLabel}
          </a>
        </p>
        {page.videos.map((video) => {
          const embedSrc = youtubeEmbedSrc(video.url);
          return embedSrc ? (
            <div className="story-video" key={video.url}>
              <iframe title={video.title} src={embedSrc} allowFullScreen />
            </div>
          ) : null;
        })}
      </article>
    );
  }

  return (
    <article className="detail climate-impact" aria-label="Climate Impact">
      <p className="story-type">Climate Impact</p>
      <h1>{climateImpactHub.title}</h1>
      <p className="story-lede">{climateImpactHub.lede}</p>
      <div className="climate-impact-grid">
        {climateImpactPages.map((item) => (
          <button
            key={item.id}
            type="button"
            className="climate-impact-card"
            onClick={() => onSelect(item.id)}
          >
            {item.images[0] ? <img src={item.images[0]} alt="" /> : null}
            <p className="story-type">{item.kicker}</p>
            <h2>{item.title}</h2>
            <p>{item.lede}</p>
          </button>
        ))}
      </div>
    </article>
  );
}
