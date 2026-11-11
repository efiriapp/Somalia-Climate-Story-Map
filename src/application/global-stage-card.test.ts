import { describe, expect, it } from 'vitest';
import type { Story } from '../domain/story';
import { GLOBAL_STAGE_CARD_ID, withGlobalStageCard } from './global-stage-card';

const story = (id: string, type: Story['type'], date: string): Story => ({
  id,
  title: id,
  type,
  date,
  themes: [],
  sdgs: [13],
  region: '',
  district: '',
  location: { name: '', lat: 0, lng: 0 },
  summary: '',
  body: '',
  images: [`${id}.jpg`],
  country: '',
  website: '',
});

const card = { title: 'ICE Institute at Global Stage', summary: 'Follow ICE.', image: '/images/global-stage/global-stage-map.jpg',
  place: (count: number) => `${count} events worldwide`,
};

describe('withGlobalStageCard', () => {
  it('leaves the list alone when no Global Stage entry matches the filters', () => {
    const list = [story('a', 'ice-story', '2024-01-01')];
    expect(withGlobalStageCard(list, card)).toEqual(list);
  });

  it('folds every Global Stage entry into one card where the first one was', () => {
    const list = [
      story('a', 'ice-story', '2024-05-01'),
      story('cop28', 'global-stage', '2023-12-01'),
      story('b', 'ice-story', '2024-03-01'),
      story('cop29', 'global-stage', '2024-11-11'),
    ];
    const out = withGlobalStageCard(list, card);
    expect(out.map((s) => s.id)).toEqual(['a', GLOBAL_STAGE_CARD_ID, 'b']);
    const folded = out[1]!;
    expect(folded.title).toBe(card.title);
    expect(folded.summary).toBe(card.summary);
    // The newest event gives the card its date; the picture is the globe map.
    expect(folded.date).toBe('2024-11-11');
    expect(folded.images).toEqual([card.image]);
    // The place line counts the events instead of naming the newest one's city.
    expect(folded.location.name).toBe('2 events worldwide');
  });
});
