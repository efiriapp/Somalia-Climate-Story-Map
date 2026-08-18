import type { Story } from '../../domain/story';

type Props = {
  stories: Story[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  typeLabel?: string;
};

export function StoryList({ stories, selectedId, onSelect, typeLabel = 'Story' }: Props) {
  if (stories.length === 0) {
    return (
      <div className="empty">
        <p>No stories match these filters.</p>
      </div>
    );
  }

  return (
    <div>
      {stories.map((story) => (
        <button
          key={story.id}
          type="button"
          className={story.id === selectedId ? 'story-card active' : 'story-card'}
          onClick={() => onSelect(story.id)}
        >
          <div className="thumb" aria-hidden>
            {story.title.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="story-type">{typeLabel}</div>
            <h3>{story.title}</h3>
            <div className="story-meta">
              {story.date} · {story.location.name}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
