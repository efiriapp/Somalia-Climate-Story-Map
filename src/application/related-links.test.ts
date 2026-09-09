import { describe, expect, it } from 'vitest';
import { climateImpactPages } from '../content/climate-impact';
import { stories } from '../content/stories';
import { chromeCopy } from './locale';
import {
  imageForRelatedTarget,
  labelForRelatedTarget,
  relatedTargetsForHazard,
  relatedTargetsForStory,
  type RelatedTarget,
} from './related-links';

describe('relatedTargetsForHazard', () => {
  it('links El Niño and Floods in both directions', () => {
    expect(relatedTargetsForHazard('el-nino')).toEqual([{ kind: 'hazard', id: 'floods' }]);
    expect(relatedTargetsForHazard('floods')).toContainEqual({ kind: 'hazard', id: 'el-nino' });
  });

  it('links La Niña, Droughts, and the SIMAD drought story', () => {
    expect(relatedTargetsForHazard('la-nina')).toEqual(
      expect.arrayContaining([
        { kind: 'hazard', id: 'droughts' },
        { kind: 'story', id: 'simad-drought' },
      ]),
    );
    expect(relatedTargetsForHazard('droughts')).toEqual(
      expect.arrayContaining([
        { kind: 'hazard', id: 'la-nina' },
        { kind: 'story', id: 'simad-drought' },
      ]),
    );
  });

  it('links Heat waves to urban greening and heatwave research', () => {
    expect(relatedTargetsForHazard('heat-waves')).toEqual(
      expect.arrayContaining([
        { kind: 'story', id: 'casuuro-plants' },
        {
          kind: 'story',
          id: 'the-thirsting-land-hydrological-exhaustion-and-the-heatwave-crisis',
        },
      ]),
    );
  });
});

describe('relatedTargetsForStory', () => {
  it('links Liido Beach Cleanup and Green Champions both ways', () => {
    expect(relatedTargetsForStory('liido-beach-cleanup')).toContainEqual({
      kind: 'story',
      id: 'green-champions',
    });
    expect(relatedTargetsForStory('green-champions')).toContainEqual({
      kind: 'story',
      id: 'liido-beach-cleanup',
    });
  });

  it('links Casuuro and Geed Soor as green enterprises, and Casuuro to heat waves', () => {
    expect(relatedTargetsForStory('casuuro-plants')).toEqual(
      expect.arrayContaining([
        { kind: 'story', id: 'geed-soor' },
        { kind: 'hazard', id: 'heat-waves' },
      ]),
    );
    expect(relatedTargetsForStory('geed-soor')).toContainEqual({
      kind: 'story',
      id: 'casuuro-plants',
    });
  });

  it('links ECOSOM to Droughts and 4C Art to the Climate Impact hub', () => {
    expect(relatedTargetsForStory('ecosom')).toContainEqual({ kind: 'hazard', id: 'droughts' });
    expect(relatedTargetsForStory('4c-art')).toContainEqual({ kind: 'hub' });
  });

  it('links SIMAD drought to Droughts, and climate research stories to Climate Impact', () => {
    expect(relatedTargetsForStory('simad-drought')).toContainEqual({
      kind: 'hazard',
      id: 'droughts',
    });
    expect(
      relatedTargetsForStory(
        'the-thirsting-land-hydrological-exhaustion-and-the-heatwave-crisis',
      ),
    ).toEqual(expect.arrayContaining([{ kind: 'hub' }, { kind: 'hazard', id: 'heat-waves' }]));
    expect(
      relatedTargetsForStory(
        'the-climate-seesaw-survival-between-the-drowning-surge-and-the-baking-he',
      ),
    ).toContainEqual({ kind: 'hub' });
  });
});

describe('labelForRelatedTarget', () => {
  it('builds Related labels in English and Somali for hazards, hub, and stories', () => {
    const en = chromeCopy('en');
    const so = chromeCopy('so');
    const floods: RelatedTarget = { kind: 'hazard', id: 'floods' };
    const hub: RelatedTarget = { kind: 'hub' };
    const story: RelatedTarget = { kind: 'story', id: 'green-champions' };

    expect(labelForRelatedTarget(floods, en)).toBe('Related: Floods');
    expect(labelForRelatedTarget(floods, so)).toMatch(/Daadad/);
    expect(labelForRelatedTarget(hub, en)).toBe('Explore Climate Impact');
    expect(labelForRelatedTarget(hub, so)).toMatch(/Saamaynta Cimilada/);
    expect(labelForRelatedTarget(story, en, 'Green Champions')).toBe('Related: Green Champions');
    expect(labelForRelatedTarget(story, so, 'Green Champions')).toMatch(/Green Champions/);
  });
});

describe('imageForRelatedTarget', () => {
  it('uses the first story image, or falls back to chapter or tour images', () => {
    const green = stories.find((story) => story.id === 'green-champions');
    const liido = stories.find((story) => story.id === 'liido-beach-cleanup');
    expect(green?.images[0]).toBeTruthy();
    expect(liido?.images[0]).toBeTruthy();
    expect(imageForRelatedTarget({ kind: 'story', id: 'green-champions' })).toBe(green?.images[0]);
    expect(imageForRelatedTarget({ kind: 'story', id: 'liido-beach-cleanup' })).toBe(liido?.images[0]);
  });

  it('uses the first climate hazard image and the hub visual from the first climate page', () => {
    const floods = climateImpactPages.find((page) => page.id === 'floods');
    const droughts = climateImpactPages.find((page) => page.id === 'droughts');
    expect(floods?.images[0]).toBeTruthy();
    expect(droughts?.images[0]).toBeTruthy();
    expect(imageForRelatedTarget({ kind: 'hazard', id: 'floods' })).toBe(floods?.images[0]);
    expect(imageForRelatedTarget({ kind: 'hazard', id: 'droughts' })).toBe(droughts?.images[0]);
    expect(imageForRelatedTarget({ kind: 'hub' })).toBe(climateImpactPages[0]?.images[0]);
  });
});
