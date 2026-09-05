import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { climateImpactHub, climateImpactPages, splitStoryImages } from './climate-impact';

const publicDir = join(dirname(fileURLToPath(import.meta.url)), '../../public');

const pageById = (id: string) => climateImpactPages.find((page) => page.id === id);

describe('Climate Impact pages', () => {
  it('covers floods, droughts, heat waves, El Niño, and La Niña in Somalia', () => {
    expect(climateImpactHub.title).toBe('Climate Impact');
    expect(climateImpactPages.map((page) => page.id)).toEqual([
      'floods',
      'droughts',
      'heat-waves',
      'el-nino',
      'la-nina',
    ]);
    expect(climateImpactPages.map((page) => page.title)).toEqual([
      'Floods',
      'Droughts',
      'Heat waves',
      'El Niño',
      'La Niña',
    ]);
    const text = climateImpactPages.map((page) => `${page.lede} ${page.paragraphs.join(' ')}`).join(' ');
    expect(text).toMatch(/Somalia/);
    expect(text).toMatch(/Shabelle|Juba/i);
    expect(text).toMatch(/pastoral/i);
    expect(text).toMatch(/heat/i);
    expect(text).toMatch(/El Ni.o/);
    expect(text).toMatch(/La Ni.a/);
  });

  it('uses every matched flood, drought, and heat-wave source image', () => {
    const floods = pageById('floods');
    const droughts = pageById('droughts');
    const heat = pageById('heat-waves');
    expect(floods?.images).toEqual([
      '/images/climate-impact/flood.jpg',
      '/images/climate-impact/flood-1.jpg',
      '/images/climate-impact/flood-2.jpg',
      '/images/climate-impact/flood-3.jpg',
      '/images/climate-impact/flood-4.webp',
    ]);
    expect(droughts?.images).toEqual([
      '/images/climate-impact/drought-3.jpg',
      '/images/climate-impact/drought.jpg',
      '/images/climate-impact/drought-1.avif',
      '/images/climate-impact/drought-2.jpg',
      '/images/climate-impact/droughts.webp',
    ]);
    expect(heat?.images).toEqual([
      '/images/climate-impact/heat-wave.png',
      '/images/climate-impact/heat-wave-1.jpg',
      '/images/climate-impact/mogadishu-heat-wave.jpg',
      '/images/climate-impact/mogadishu-heat-waves.jpg',
      '/images/climate-impact/mogadishu-heat-wave-2.jpeg',
    ]);
    const elNino = pageById('el-nino');
    const laNina = pageById('la-nina');
    expect(elNino?.images).toEqual(['/images/climate-impact/el-nino.jpg']);
    expect(laNina?.images).toEqual([
      '/images/climate-impact/drought-2.jpg',
      '/images/climate-impact/drought-3.jpg',
    ]);
    for (const src of [
      ...(floods?.images ?? []),
      ...(droughts?.images ?? []),
      ...(heat?.images ?? []),
      ...(elNino?.images ?? []),
      ...(laNina?.images ?? []),
    ]) {
      expect(existsSync(join(publicDir, src.replace(/^\//, ''))), src).toBe(true);
    }
  });

  it('retells the source flood, drought, El Niño, La Niña, and Mogadishu heatwave documents', () => {
    const floods = pageById('floods');
    const droughts = pageById('droughts');
    const heat = pageById('heat-waves');
    const elNino = pageById('el-nino');
    const laNina = pageById('la-nina');
    const floodText = `${floods?.lede} ${floods?.paragraphs.join(' ')} ${floods?.chapters?.map((chapter) => chapter.paragraphs.join(' ')).join(' ')}`;
    const droughtText = `${droughts?.lede} ${droughts?.paragraphs.join(' ')} ${droughts?.chapters?.map((chapter) => chapter.paragraphs.join(' ')).join(' ')}`;
    const heatText = `${heat?.lede} ${heat?.paragraphs.join(' ')} ${heat?.chapters?.map((chapter) => chapter.paragraphs.join(' ')).join(' ')}`;
    const elNinoText = `${elNino?.lede} ${elNino?.paragraphs.join(' ')} ${elNino?.chapters?.map((chapter) => chapter.paragraphs.join(' ')).join(' ')}`;
    const laNinaText = `${laNina?.lede} ${laNina?.paragraphs.join(' ')} ${laNina?.chapters?.map((chapter) => chapter.paragraphs.join(' ')).join(' ')}`;
    expect(floodText).toMatch(/When the Rain Becomes a Flood|flash floods/i);
    expect(floodText).toMatch(/2\.4|2\.48|2\.5 million/);
    expect(elNinoText).toMatch(/When the Rain Returned as a Flood|Beledweyne/);
    expect(elNinoText).toMatch(/once-in-a-century|2\.48 million/);
    expect(droughtText).toMatch(/When the Rains Fail|jerrycans|Combined Drought Index/i);
    expect(droughtText).toMatch(/6\.5 million|71,100/);
    expect(laNinaText).toMatch(/La Ni.a/);
    expect(laNinaText).toMatch(/drier|Deyr|Indian Ocean Dipole/i);
    expect(heatText).toMatch(/Road Becomes a Furnace|bajaj|Banadir/i);
    expect(heatText).toMatch(/98\.6 percent|4\.5 percent/);
  });

  it('splits images into first, middle, and last groups instead of one gallery', () => {
    expect(splitStoryImages([])).toEqual({ first: [], middle: [], last: [] });
    expect(splitStoryImages(['a.jpg'])).toEqual({ first: ['a.jpg'], middle: [], last: [] });
    expect(splitStoryImages(['a.jpg', 'b.jpg'])).toEqual({
      first: ['a.jpg'],
      middle: [],
      last: ['b.jpg'],
    });
    expect(splitStoryImages(['a.jpg', 'b.jpg', 'c.jpg', 'd.jpg'])).toEqual({
      first: ['a.jpg'],
      middle: ['b.jpg', 'c.jpg'],
      last: ['d.jpg'],
    });
    expect(splitStoryImages(['a.jpg', 'b.jpg', 'c.jpg', 'd.jpg', 'e.jpg'])).toEqual({
      first: ['a.jpg'],
      middle: ['b.jpg', 'c.jpg', 'd.jpg'],
      last: ['e.jpg'],
    });
    expect(splitStoryImages(pageById('el-nino')?.images ?? [])).toEqual({
      first: ['/images/climate-impact/el-nino.jpg'],
      middle: [],
      last: [],
    });
    expect(splitStoryImages(pageById('la-nina')?.images ?? [])).toEqual({
      first: ['/images/climate-impact/drought-2.jpg'],
      middle: [],
      last: ['/images/climate-impact/drought-3.jpg'],
    });
  });

  it('keeps a video slot at the end of each page and embeds the heat-wave source films', () => {
    expect(pageById('floods')?.videos).toEqual([
      {
        title: 'Deadly floods continue to ravage Somalia',
        url: 'https://youtu.be/MjYZsu23LkE?si=BWEGsOJenPTaupxF',
      },
      {
        title: 'Somalia floods: Heavy rains force thousands from their homes',
        url: 'https://youtu.be/PrBU7HGTpuE?si=UqUn5gi2RCVo1QT0',
      },
      {
        title: "Flood damage in Somalia's capital",
        url: 'https://youtube.com/shorts/Pk0ZU1EsmWU?si=SYWrS1masvd1aVTX',
      },
    ]);
    expect(pageById('droughts')?.videos).toEqual([
      {
        title: "Somalia's drought leaves 6.5 million on brink of hunger crisis, says ICRC",
        url: 'https://youtu.be/dK7wk-8RtFs?si=U8lw5eBVH46MINiC',
      },
      {
        title: 'Somalia suffering worst drought in decades',
        url: 'https://youtu.be/8pk6KZQDSaw?si=gKX1eNaBOA1chxYJ',
      },
    ]);
    expect(pageById('el-nino')?.videos).toEqual([]);
    expect(pageById('la-nina')?.videos).toEqual([]);
    expect(pageById('heat-waves')?.videos).toEqual([
      {
        title: 'Heatwaves in Mogadishu',
        url: 'https://youtu.be/cwHvMhb_aZ0?si=V_fN6mdrNqnX7IfV',
      },
      {
        title: 'Isbedelka cimilada: kulul daran ee ka jira Muqdisho',
        url: 'https://youtu.be/hohCFuGV7Xs?si=rgM-ycmIB-C-mvR3',
      },
    ]);
  });
});
