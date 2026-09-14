import { describe, expect, it } from 'vitest';
import { stories } from '../content/stories';
import { chromeCopy } from './locale';
import { featuredEntityLabel, resolveFeaturedKind } from './featured-entity-label';

describe('featuredEntityLabel', () => {
  it('labels people and institutions with the matching chrome copy', () => {
    const copy = chromeCopy('en');
    expect(featuredEntityLabel({ type: 'ice-story', featuredKind: 'person' }, copy)).toBe(
      'Featured person',
    );
    expect(featuredEntityLabel({ type: 'ice-story', featuredKind: 'institution' }, copy)).toBe(
      'Featured institution/organization',
    );
  });

  it('defaults research stories to institution and uses explicit kinds on ICE stories', () => {
    expect(resolveFeaturedKind({ type: 'research-story' })).toBe('institution');
    expect(resolveFeaturedKind({ type: 'ice-story', featuredKind: 'person' })).toBe('person');
    expect(resolveFeaturedKind({ type: 'ice-story', featuredKind: 'institution' })).toBe(
      'institution',
    );

    const person = stories.find((story) => story.id === '4c-art');
    const org = stories.find((story) => story.id === 'simad-drought');
    const research = stories.find((story) => story.type === 'research-story');
    expect(resolveFeaturedKind(person!)).toBe('person');
    expect(resolveFeaturedKind(org!)).toBe('institution');
    expect(resolveFeaturedKind(research!)).toBe('institution');
  });
});
