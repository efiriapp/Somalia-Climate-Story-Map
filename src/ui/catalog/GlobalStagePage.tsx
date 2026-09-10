import { countryLabel, formatLocaleDate } from '../../application/locale';
import { storyMediaCredit } from '../../application/media-source-credit';
import type { Story } from '../../domain/story';
import { useLocale } from '../chrome/LocaleContext';
import { MediaSourceCredit } from './MediaSourceCredit';

type Props = {
  stories: Story[];
};

export function GlobalStagePage({ stories }: Props) {
  const { copy, locale } = useLocale();
  const events = stories
    .filter((story) => story.type === 'global-stage')
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="global-stage-page">
      <header className="global-stage-page-intro">
        <p className="story-type">{copy.globalStage}</p>
        <h1>{copy.globalStageAroundWorld}</h1>
        <p>{copy.globalStageIntro}</p>
      </header>
      {events.map((story) => (
        <article className="global-stage-article" key={story.id}>
          <h2>{story.title}</h2>
          <p className="story-meta">
            {formatLocaleDate(story.date, locale)} · {story.location.name} · {countryLabel(story.country, locale)}
            {story.sdgs.length ? ` · ${copy.sdgPrefix} ${story.sdgs.join(', ')}` : ''}
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
              <strong>{copy.moreInfo}</strong>{' '}
              <a href={story.website} target="_blank" rel="noreferrer">
                {story.website}
              </a>
            </p>
          ) : null}
          <MediaSourceCredit credit={storyMediaCredit(story)} />
        </article>
      ))}
    </div>
  );
}
