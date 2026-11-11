import type { Story } from '../domain/story';

/** Id of the single Stories card that opens the ICE at Global Stage globe. */
export const GLOBAL_STAGE_CARD_ID = 'global-stage';

/**
 * On the Stories page, ICE at Global Stage is one normal card, not one card
 * per conference. The filters still apply: the card shows only when at least
 * one Global Stage event matches them. It sits where the first matching event
 * was, takes the newest event's date, shows a picture of the globe map, and
 * counts the events in place of a city name.
 */
export function withGlobalStageCard(stories: Story[], card: { title: string; summary: string; image: string; place: (count: number) => string }): Story[] {
  const events = stories.filter((story) => story.type === 'global-stage');
  if (!events.length) return stories;
  const newest = events.reduce((a, b) => (b.date > a.date ? b : a));
  const folded: Story = { ...newest, id: GLOBAL_STAGE_CARD_ID, title: card.title, summary: card.summary, images: [card.image], location: { ...newest.location, name: card.place(events.length) } };
  const at = stories.indexOf(events[0]!);
  const rest = stories.filter((story) => story.type !== 'global-stage');
  return [...rest.slice(0, at), folded, ...rest.slice(at)];
}
