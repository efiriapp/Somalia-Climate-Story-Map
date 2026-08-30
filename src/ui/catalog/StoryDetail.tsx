import { formatTourDate } from '../../application/global-tour';
import type { Story } from '../../domain/story';
import { MapPane } from '../map/MapPane';
import { RegionMapTour } from '../map/RegionMapTour';

type Props = {
  story: Story;
  onBack: () => void;
};

const CITY_ZOOM = 12;

const canEmbedVideo = (url: string): boolean => url.includes('youtube.com/embed');

export function StoryDetail({ story, onBack }: Props) {
  const chapters = story.chapters?.length
    ? story.chapters
    : [{ heading: 'The story', paragraphs: [story.body] }];
  const videoHref = story.videoUrl ?? story.website;

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

      {story.videoTitle ? (
        <div className="story-video">
          {story.videoUrl && canEmbedVideo(story.videoUrl) ? (
            <iframe title={story.videoTitle} src={story.videoUrl} allowFullScreen />
          ) : (
            <a className="story-video-card" href={videoHref} target="_blank" rel="noreferrer">
              {story.images[0] ? <img src={story.images[0]} alt="" /> : null}
              <span>ICE video: {story.videoTitle}</span>
            </a>
          )}
        </div>
      ) : null}

      {chapters.map((chapter, index) => (
        <section className="story-chapter" key={chapter.heading}>
          <h2>{chapter.heading}</h2>
          {chapter.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
          {index === 0 && story.tourStops?.length ? (
            <section className="story-map story-map-bleed">
              <h2>SIMAD supported drought impact</h2>
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
