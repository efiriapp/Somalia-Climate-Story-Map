import { formatTourDate, type TourStop } from '../../application/global-tour';

type Props = {
  stops: TourStop[];
  activeStoryId: string | null;
  onSelect: (storyId: string) => void;
};

export function EventSlider({ stops, activeStoryId, onSelect }: Props) {
  const events = stops.filter((stop) => stop.kind === 'event' && stop.storyId);
  const activeIndex = events.findIndex((stop) => stop.storyId === activeStoryId);

  return (
    <aside
      className="event-slider"
      aria-label="ICE global events"
      onWheel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (events.length === 0) {
          return;
        }
        const delta = event.deltaY > 0 ? 1 : -1;
        const next = Math.min(events.length - 1, Math.max(0, (activeIndex < 0 ? 0 : activeIndex) + delta));
        const storyId = events[next]?.storyId;
        if (storyId) {
          onSelect(storyId);
        }
      }}
    >
      {events.map((stop) => (
        <article
          key={stop.storyId}
          className={stop.storyId === activeStoryId ? 'event-card active' : 'event-card'}
        >
          <button type="button" onClick={() => stop.storyId && onSelect(stop.storyId)}>
            {stop.images[0] ? <img src={stop.images[0]} alt="" /> : null}
            <p className="event-card-date">{formatTourDate(stop.date)}</p>
            <h3>{stop.title}</h3>
            <p className="event-card-place">
              {stop.place} · {stop.country}
            </p>
            <p>{stop.summary}</p>
          </button>
          {stop.website ? (
            <p className="event-card-more">
              <strong>More information:</strong>{' '}
              <a href={stop.website} target="_blank" rel="noreferrer">
                {stop.website}
              </a>
            </p>
          ) : null}
        </article>
      ))}
    </aside>
  );
}
