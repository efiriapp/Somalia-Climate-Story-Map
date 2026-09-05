import { useLayoutEffect } from 'react';
import { formatTourDate } from '../../application/global-tour';
import { scrollPageToTop } from '../../application/scroll-page-top';
import { youtubeEmbedSrc } from '../../application/youtube-embed';
import type { Story } from '../../domain/story';
import { MapPane } from '../map/MapPane';
import { RegionMapTour } from '../map/RegionMapTour';

type Props = {
  story: Story;
  onBack: () => void;
};

const CITY_ZOOM = 12;

export function StoryDetail({ story, onBack }: Props) {
  const chapters = story.chapters?.length
    ? story.chapters
    : [{ heading: 'The story', paragraphs: [story.body] }];
  const embedSrc = story.videoUrl ? youtubeEmbedSrc(story.videoUrl) : null;
  const source = story.sourceCard;

  useLayoutEffect(() => {
    scrollPageToTop();
  }, [story.id]);

  return (
    <article className="detail story-detail">
      <button className="back" type="button" onClick={onBack}>
        ← Back to catalog
      </button>
      <p className="story-type">{story.type === 'research-story' ? 'Research' : 'Story'}</p>
      <h1>{story.title}</h1>
      {story.featuredPerson ? <p className="story-person">{story.featuredPerson}</p> : null}
      <p className="story-meta">
        {formatTourDate(story.date)} · {story.placeLabel ?? story.location.name} · SDG {story.sdgs.join(', ')}
      </p>
      <p className="story-lede">{story.summary}</p>

      {story.images.length > 0 ? (
        <div className="story-gallery">
          {story.images.map((src) => (
            <img key={src} src={src} alt="" />
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
          {chapter.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
          {index === 0 && story.tourStops?.length ? (
            <section className="story-map story-map-bleed">
              <h2>{story.mapTitle ?? 'On the map'}</h2>
              <RegionMapTour story={story} />
            </section>
          ) : null}
        </section>
      ))}

      {story.tourStops?.length ? null : (
        <section className="story-map">
          <h2>On the map</h2>
          <p>{story.placeLabel ?? story.location.name}</p>
          <MapPane
            stories={[story]}
            view={{ center: { lat: story.location.lat, lng: story.location.lng }, zoom: CITY_ZOOM }}
            selectedId={story.id}
            onSelect={() => undefined}
          />
        </section>
      )}

      {embedSrc && story.videoTitle ? (
        <div className="story-video">
          <iframe title={story.videoTitle} src={embedSrc} allowFullScreen />
        </div>
      ) : null}

      {source ? (
        <section className="story-source" aria-label="Story Map Location">
          <h2>📍 Story Map Location</h2>
          <dl>
            <div>
              <dt>Place</dt>
              <dd>{source.place}</dd>
            </div>
            <div>
              <dt>City</dt>
              <dd>{source.city}</dd>
            </div>
            <div>
              <dt>Region</dt>
              <dd>{source.regionLabel}</dd>
            </div>
            <div>
              <dt>Country</dt>
              <dd>{source.country}</dd>
            </div>
            <div>
              <dt>Story category</dt>
              <dd>{source.category}</dd>
            </div>
            <div>
              <dt>Impact areas</dt>
              <dd>{source.impactAreas.join(' • ')}</dd>
            </div>
            <div>
              <dt>Featured person</dt>
              <dd>{source.featuredPerson}</dd>
            </div>
            <div>
              <dt>Primary source</dt>
              <dd>{source.primarySource}</dd>
            </div>
            {source.extras?.map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
            {story.videoTitle ? (
              <div>
                <dt>ICE video</dt>
                <dd>{story.videoTitle}</dd>
              </div>
            ) : null}
          </dl>
        </section>
      ) : null}

      {story.website ? (
        <p>
          <strong>More information:</strong>{' '}
          <a href={story.website} target="_blank" rel="noreferrer">
            {story.website}
          </a>
        </p>
      ) : null}
    </article>
  );
}
