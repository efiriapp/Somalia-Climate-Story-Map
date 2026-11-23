import { formatLocaleDate } from '../../application/locale';
import type { Story } from '../../domain/story';
import { useLocale } from '../chrome/LocaleContext';

type Props = {
  stories: Story[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** Card label: one string for all cards, or chosen per story. */
  typeLabel?: string | ((story: Story) => string);
  layout?: 'list' | 'grid';
};

export function StoryList({
  stories,
  selectedId,
  onSelect,
  typeLabel = 'Story',
  layout = 'list',
}: Props) {
  const { copy, locale } = useLocale();
  if (stories.length === 0) {
    return (
      <div className="empty">
        <p>{copy.noStories}</p>
      </div>
    );
  }

  return (
    <div className={layout === 'grid' ? 'story-grid' : undefined}>
      {stories.map((story) => (
        <button
          key={story.id}
          type="button"
          className={story.id === selectedId ? 'story-card active' : 'story-card'}
          onClick={() => onSelect(story.id)}
        >
          {story.images[0] ? (
            <img loading="lazy" decoding="async" src={story.images[0]} alt="" />
          ) : (
            <div className="thumb" aria-hidden>
              {story.title.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <div className="story-type">{typeof typeLabel === 'function' ? typeLabel(story) : typeLabel}</div>
            <h3>{story.title}</h3>
            <div className="story-meta">
              {formatLocaleDate(story.date, locale)} · {story.location.name}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
