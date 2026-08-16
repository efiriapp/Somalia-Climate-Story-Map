import { describe, expect, it } from 'vitest';
import { stories } from '../content/stories';
import { coordinatesMatchCountry } from './country-coordinates';

describe('global stage coordinates', () => {
  it('places every global-stage story inside its named country', () => {
    const events = stories.filter((story) => story.type === 'global-stage');
    expect(events.length).toBeGreaterThan(10);
    for (const story of events) {
      expect(
        coordinatesMatchCountry(story.country, story.location.lat, story.location.lng),
        `${story.id} (${story.country}) at ${story.location.lat},${story.location.lng}`,
      ).toBe(true);
    }
  });
});
