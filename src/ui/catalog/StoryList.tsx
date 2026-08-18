import { formatTourDate } from '../../application/global-tour';
import type { Story } from '../../domain/story';

type Props = {
  stories: Story[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  typeLabel?: string;
  layout?: 'list' | 'grid';
};

export function StoryList({
  stories,
  selectedId,
  onSelect,
  typeLabel = 'Story',
  layout = 'list',
}: Props) {
  if (stories.length === 0) {
    return (
      <div className="empty">
        <p>No stories match these filters.</p>
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
            <img src={story.images[0]} alt="" />
          ) : (
            <div className="thumb" aria-hidden>
              {story.title.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <div className="story-type">{typeLabel}</div>
            <h3>{story.title}</h3>
            <div className="story-meta">
              {formatTourDate(story.date)} · {story.location.name}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
