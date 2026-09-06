import type { ClimateHazardId } from '../content/climate-impact';
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
    { kind: 'story', id: 'somalia-ccdr-2026' },
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
  'somalia-ccdr-2026': [{ kind: 'hub' }, { kind: 'hazard', id: 'heat-waves' }],
  'state-of-climate-2026': [{ kind: 'hub' }],
};

const HUB_RELATED: RelatedTarget[] = [
  { kind: 'story', id: 'state-of-climate-2026' },
  { kind: 'story', id: 'somalia-ccdr-2026' },
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
