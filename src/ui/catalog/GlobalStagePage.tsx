import { formatTourDate } from '../../application/global-tour';
import type { Story } from '../../domain/story';

type Props = {
  stories: Story[];
};

export function GlobalStagePage({ stories }: Props) {
  const events = stories
    .filter((story) => story.type === 'global-stage')
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="global-stage-page">
      <header className="global-stage-page-intro">
        <p className="story-type">ICE at Global Stage</p>
        <h1>ICE Institute around the world</h1>
        <p>
          Every ICE Institute global event is collected here as a full text page, with images,
          dates, places, and the complete story of how Somali climate work reached the world.
        </p>
      </header>
      {events.map((story) => (
        <article className="global-stage-article" key={story.id}>
          <h2>{story.title}</h2>
          <p className="story-meta">
            {formatTourDate(story.date)} · {story.location.name} · {story.country}
            {story.sdgs.length ? ` · SDG ${story.sdgs.join(', ')}` : ''}
          </p>
          {story.images.length > 0 ? (
            <div className="global-stage-gallery">
              {story.images.map((src) => (
                <img key={src} src={src} alt="" />
              ))}
            </div>
          ) : null}
          <p>{story.summary}</p>
          <p>{story.body}</p>
          {story.website ? (
            <p>
              <strong>More information:</strong>{' '}
              <a href={story.website} target="_blank" rel="noreferrer">
                {story.website}
              </a>
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
