import type { FeaturedKind, Story } from '../domain/story';

export function resolveFeaturedKind(story: Pick<Story, 'featuredKind' | 'type'>): FeaturedKind {
  if (story.featuredKind) {
    return story.featuredKind;
  }
  return story.type === 'research-story' ? 'institution' : 'person';
}

export function featuredEntityLabel(
  story: Pick<Story, 'featuredKind' | 'type'>,
  copy: { featuredPerson: string; featuredInstitution: string },
): string {
  return resolveFeaturedKind(story) === 'institution'
    ? copy.featuredInstitution
    : copy.featuredPerson;
}
