import type { ClimateHazardId } from '../content/climate-impact';
import { climateImpactPages } from '../content/climate-impact';
import { stories } from '../content/stories';
import type { Story } from '../domain/story';
import { chromeCopy, hazardTitle } from './locale';

export type RelatedTarget =
  | { kind: 'hazard'; id: ClimateHazardId }
  | { kind: 'hub' }
  | { kind: 'story'; id: string };

const RELATED_LIMIT = 4;

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

/** Curated related targets; auto-fill supplements these from the whole platform. */
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

/** Soft bridges so Research ↔ ICE ↔ Climate Impact can cross-link thematically. */
const THEME_BRIDGES: Record<string, string[]> = {
  'agriculture-resilience': ['drought-water', 'green-enterprise', 'oceans'],
  'human-tide': ['climate-mobility', 'youth', 'education'],
  'green-frontier': ['green-enterprise', 'waste-energy', 'art-communication'],
  'governance-finance': ['policy-diplomacy', 'partnerships', 'education'],
  'climate-hazards': ['drought-water', 'climate-mobility', 'oceans'],
  'drought-water': ['agriculture-resilience', 'climate-hazards', 'green-enterprise'],
  'green-enterprise': ['agriculture-resilience', 'green-frontier', 'waste-energy'],
  'waste-energy': ['green-frontier', 'green-enterprise'],
  oceans: ['agriculture-resilience', 'climate-hazards', 'youth'],
  youth: ['human-tide', 'oceans', 'education'],
  education: ['human-tide', 'governance-finance', 'policy-diplomacy'],
  'climate-mobility': ['human-tide', 'climate-hazards'],
  'policy-diplomacy': ['governance-finance', 'partnerships'],
  partnerships: ['governance-finance', 'policy-diplomacy', 'education'],
  'art-communication': ['green-frontier', 'youth'],
};

const THEME_HAZARDS: Record<string, ClimateHazardId[]> = {
  'climate-hazards': ['floods', 'droughts', 'heat-waves'],
  'drought-water': ['droughts', 'la-nina'],
  'agriculture-resilience': ['droughts'],
  oceans: ['floods', 'el-nino'],
  'green-enterprise': ['heat-waves'],
  'climate-mobility': ['droughts', 'floods'],
};

const targetKey = (target: RelatedTarget): string => {
  if (target.kind === 'hub') return 'hub';
  return `${target.kind}:${target.id}`;
};

const scoreRelatedStory = (from: Story, other: Story): number => {
  let score = 0;
  const fromThemes = new Set(from.themes);
  const bridges = new Set(from.themes.flatMap((theme) => THEME_BRIDGES[theme] ?? []));
  for (const theme of other.themes) {
    if (fromThemes.has(theme)) score += 10;
    else if (bridges.has(theme)) score += 6;
  }
  const sharedSdgs = other.sdgs.filter((sdg) => from.sdgs.includes(sdg)).length;
  score += Math.min(sharedSdgs, 3) * 2;
  if (other.type !== from.type) score += 3;
  if (other.region && other.region === from.region) score += 1;
  return score;
};

const fillRelatedFromPlatform = (story: Story, seed: RelatedTarget[]): RelatedTarget[] => {
  const selected: RelatedTarget[] = [];
  const seen = new Set<string>();

  const push = (target: RelatedTarget) => {
    if (selected.length >= RELATED_LIMIT) return;
    const key = targetKey(target);
    if (seen.has(key)) return;
    if (target.kind === 'story' && target.id === story.id) return;
    seen.add(key);
    selected.push(target);
  };

  for (const target of seed) push(target);

  for (const theme of story.themes) {
    for (const hazardId of THEME_HAZARDS[theme] ?? []) {
      push({ kind: 'hazard', id: hazardId });
    }
  }

  const ranked = stories
    .filter((other) => other.id !== story.id)
    .map((other) => ({ other, score: scoreRelatedStory(story, other) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.other.title.localeCompare(b.other.title));

  // Prefer at least one cross-catalog story when possible.
  const otherType = ranked.find((entry) => entry.other.type !== story.type);
  if (otherType) push({ kind: 'story', id: otherType.other.id });

  for (const entry of ranked) {
    push({ kind: 'story', id: entry.other.id });
  }

  if (selected.length === 0 && story.type === 'research-story') {
    push({ kind: 'hub' });
  }

  return selected.slice(0, RELATED_LIMIT);
};

export const relatedTargetsForHazard = (id: ClimateHazardId): RelatedTarget[] =>
  HAZARD_RELATED[id] ?? [];

export const relatedTargetsForStory = (id: string): RelatedTarget[] => {
  const curated = STORY_RELATED[id] ?? [];
  const story = stories.find((item) => item.id === id);
  if (!story) return curated;
  return fillRelatedFromPlatform(story, curated);
};

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
