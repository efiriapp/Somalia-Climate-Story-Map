import type { ClimateHazardId } from '../content/climate-impact';
import { climateImpactPages } from '../content/climate-impact';
import { stories } from '../content/stories';
import type { Story } from '../domain/story';
import { chromeCopy, hazardTitle } from './locale';

export type RelatedTarget =
  | { kind: 'hazard'; id: ClimateHazardId }
  | { kind: 'hub' }
  | { kind: 'story'; id: string };

const HAZARD_RELATED: Record<ClimateHazardId, RelatedTarget[]> = {
  floods: [{ kind: 'hazard', id: 'el-nino' }],
  'el-nino': [{ kind: 'hazard', id: 'floods' }],
  droughts: [
    { kind: 'hazard', id: 'la-nina' },
    { kind: 'story', id: 'simad-drought' },
  ],
  'la-nina': [
    { kind: 'hazard', id: 'droughts' },
    { kind: 'story', id: 'simad-drought' },
  ],
  'heat-waves': [
    { kind: 'story', id: 'casuuro-plants' },
    { kind: 'story', id: 'the-thirsting-land-hydrological-exhaustion-and-the-heatwave-crisis' },
  ],
};

const STORY_RELATED: Record<string, RelatedTarget[]> = {
  'simad-drought': [{ kind: 'hazard', id: 'droughts' }],
  'liido-beach-cleanup': [{ kind: 'story', id: 'green-champions' }],
  'green-champions': [{ kind: 'story', id: 'liido-beach-cleanup' }],
  'casuuro-plants': [
    { kind: 'story', id: 'geed-soor' },
    { kind: 'hazard', id: 'heat-waves' },
  ],
  'geed-soor': [{ kind: 'story', id: 'casuuro-plants' }],
  ecosom: [{ kind: 'hazard', id: 'droughts' }],
  '4c-art': [{ kind: 'hub' }],
  'the-thirsting-land-hydrological-exhaustion-and-the-heatwave-crisis': [
    { kind: 'hub' },
    { kind: 'hazard', id: 'heat-waves' },
  ],
  'the-climate-seesaw-survival-between-the-drowning-surge-and-the-baking-he': [
    { kind: 'hub' },
  ],
};

const HUB_RELATED: RelatedTarget[] = [
  { kind: 'story', id: 'the-climate-seesaw-survival-between-the-drowning-surge-and-the-baking-he' },
  { kind: 'story', id: 'the-thirsting-land-hydrological-exhaustion-and-the-heatwave-crisis' },
];

export const relatedTargetsForHazard = (id: ClimateHazardId): RelatedTarget[] =>
  HAZARD_RELATED[id] ?? [];

export const relatedTargetsForStory = (id: string): RelatedTarget[] => STORY_RELATED[id] ?? [];

export const relatedTargetsForClimateHub = (): RelatedTarget[] => HUB_RELATED;

export const labelForRelatedTarget = (
  target: RelatedTarget,
  copy: ReturnType<typeof chromeCopy>,
  storyTitle?: string,
): string => {
  if (target.kind === 'hub') return copy.exploreClimateImpact;
  if (target.kind === 'hazard') return `${copy.relatedPrefix}${hazardTitle(target.id, copy)}`;
  return `${copy.relatedPrefix}${storyTitle ?? target.id}`;
};

const firstStoryImage = (story: Story): string | undefined => {
  if (story.images[0]) return story.images[0];
  for (const chapter of story.chapters ?? []) {
    if (chapter.images?.[0]) return chapter.images[0];
    for (const after of chapter.imagesAfter ?? []) {
      if (after[0]) return after[0];
    }
  }
  for (const stop of story.tourStops ?? []) {
    if (stop.images[0]) return stop.images[0];
  }
  return undefined;
};

export const imageForRelatedTarget = (target: RelatedTarget): string | undefined => {
  if (target.kind === 'hub') {
    return climateImpactPages.find((page) => page.images[0])?.images[0];
  }
  if (target.kind === 'hazard') {
    return climateImpactPages.find((page) => page.id === target.id)?.images[0];
  }
  const story = stories.find((item) => item.id === target.id);
  return story ? firstStoryImage(story) : undefined;
};
