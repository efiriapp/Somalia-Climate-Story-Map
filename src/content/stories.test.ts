import { describe, expect, it } from 'vitest';
import { stories } from './stories';

const globalStage = stories.filter((story) => story.type === 'global-stage');

describe('global-stage source pages', () => {
  it('places Decoding COP27 in Egypt with the ICE article link', () => {
    const story = stories.find((item) => item.id === 'decoding-cop27');
    expect(story).toMatchObject({
      title: 'Decoding COP27 Comes at a Critical Moment',
      country: 'Egypt',
      location: { name: 'Sharm El Sheikh, Egypt' },
      summary: 'ICE unpacks COP27 for Somali students, policymakers, and partners.',
      website: 'https://ice.simad.edu.so/2023/03/03/decoding-the-cop27/',
    });
    expect(story?.region).toBe('');
    expect(story?.district).toBe('');
  });

  it('includes COP28 in Dubai in 2023', () => {
    const story = stories.find((item) => item.id === 'cop28-dubai');
    expect(story).toMatchObject({
      title: 'ICE Institute at COP28 in Dubai',
      type: 'global-stage',
      date: '2023-12-13',
      country: 'United Arab Emirates',
      location: { name: 'Dubai, United Arab Emirates' },
      website: 'https://ice.simad.edu.so/2024/01/10/ice-annual-report-2023/',
    });
  });

  it('gives every global-stage event its actual ICE article URL', () => {
    expect(globalStage.length).toBeGreaterThan(10);
    for (const story of globalStage) {
      expect(story.website, story.id).toMatch(/^https:\/\/ice\.simad\.edu\.so\/\d{4}\/\d{2}\/\d{2}\/.+/);
      expect(story.website, story.id).not.toBe('https://ice.simad.edu.so/');
    }
  });
});
