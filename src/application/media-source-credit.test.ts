import { describe, expect, it } from 'vitest';
import { climateImpactPages } from '../content/climate-impact';
import { stories } from '../content/stories';
import {
  climateMediaCredit,
  formatMediaSourceCredit,
  storyMediaCredit,
  videoEmbedCredit,
} from './media-source-credit';

describe('formatMediaSourceCredit', () => {
  it('credits ICE Institute and a specific primary source', () => {
    expect(formatMediaSourceCredit('4C Art Studio — Biography & Portfolio')).toBe(
      'Source: ICE Institute — 4C Art Studio — Biography & Portfolio',
    );
  });

  it('does not repeat ICE Institute when the source already names it', () => {
    expect(formatMediaSourceCredit('ICE Institute — Green Champions programme')).toBe(
      'Source: ICE Institute — Green Champions programme',
    );
  });
});

describe('storyMediaCredit', () => {
  it('uses the ICE story primary source and website for copyright', () => {
    const story = stories.find((item) => item.id === '4c-art');
    expect(storyMediaCredit(story!)).toEqual({
      text: 'Source: ICE Institute — 4C Art Studio — Biography & Portfolio',
      url: 'https://ice.simad.edu.so/',
    });
  });

  it('credits ICE Institute and the article URL for Global Stage photos', () => {
    const story = stories.find((item) => item.id === 'cop29-baku');
    expect(storyMediaCredit(story!)).toEqual({
      text: 'Source: ICE Institute',
      url: story!.website,
    });
  });

  it('returns no credit when a page has no pictures or video', () => {
    expect(
      storyMediaCredit({
        images: [],
        website: 'https://ice.simad.edu.so/example/',
      }),
    ).toBeNull();
  });

  it('credits Wikimedia Commons photos for research stories without the ICE Institute prefix', () => {
    const research = stories.find(
      (item) => item.id === 'the-digital-smallholder-navigating-the-shabelle-crisis',
    );
    expect(storyMediaCredit(research!)).toEqual({
      text: 'Source: Wikimedia Commons / Somalia imagery',
      url: 'https://ice.simad.edu.so/',
    });
  });
});

describe('climateMediaCredit', () => {
  it('credits the climate page primary source for photos and video', () => {
    const page = climateImpactPages.find((item) => item.id === 'heat-waves');
    expect(climateMediaCredit(page!)).toEqual({
      text: 'Source: ICE Institute — Somalia Country Climate and Development Report',
      url: 'https://ice.simad.edu.so/2026/03/03/somalia-country-climate-and-development-report/',
    });
  });
});

describe('videoEmbedCredit', () => {
  it('credits a news film with the outlet name and title, not ICE Institute', () => {
    expect(videoEmbedCredit('Deadly floods continue to ravage Somalia', 'AP')).toEqual({
      text: 'Source: AP — Deadly floods continue to ravage Somalia',
    });
    expect(videoEmbedCredit("Somalia's drought leaves 6.5 million on brink of hunger crisis, says ICRC", 'Africanews')).toEqual({
      text: "Source: Africanews — Somalia's drought leaves 6.5 million on brink of hunger crisis, says ICRC",
    });
  });

  it('does not repeat the outlet when the title already names it', () => {
    expect(videoEmbedCredit("Reuters: Flood damage in Somalia's capital", 'Reuters')).toEqual({
      text: "Source: Reuters: Flood damage in Somalia's capital",
    });
  });
});
