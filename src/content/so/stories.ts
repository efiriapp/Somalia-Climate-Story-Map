import { ICE_STORY_SO } from './ice-stories';
import { RESEARCH_STORY_SO } from './research-stories';
import { STAGE_RESEARCH_SO } from './stage-research';
import type { StorySo } from './story-types';

export type { StorySo } from './story-types';

export const STORY_SO: Record<string, StorySo> = {
  ...ICE_STORY_SO,
  ...STAGE_RESEARCH_SO,
  ...RESEARCH_STORY_SO,
};
