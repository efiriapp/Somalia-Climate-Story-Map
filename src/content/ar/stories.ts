import { ICE_STORY_AR } from './ice-stories';
import { STAGE_RESEARCH_AR } from './stage-research';
import type { StoryAr } from './story-types';

export type { StoryAr } from './story-types';

export const STORY_AR: Record<string, StoryAr> = {
  ...ICE_STORY_AR,
  ...STAGE_RESEARCH_AR,
};
