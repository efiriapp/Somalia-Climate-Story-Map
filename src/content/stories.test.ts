import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { regionCenter } from '../application/region-coordinates';
import { splitStoryImages } from './climate-impact';
import { stories } from './stories';

const publicDir = join(dirname(fileURLToPath(import.meta.url)), '../../public');
const globalStage = stories.filter((story) => story.type === 'global-stage');

describe('global-stage source pages', () => {
  it('places Decoding COP27 in Egypt with the ICE article link', () => {
    const story = stories.find((item) => item.id === 'decoding-cop27');
    expect(story).toMatchObject({
      title: 'Decoding COP27 Comes at a Critical Moment',
      country: 'Egypt',
      location: { name: 'Sharm El Sheikh, Egypt' },
      summary: expect.stringMatching(/COP27/),
      website: 'https://ice.simad.edu.so/2023/03/03/decoding-the-cop27/',
    });
    expect(story?.region).toBe('');
    expect(story?.district).toBe('');
  });

  it('merges LDC5 Doha into one March 2023 Qatar event with photos', () => {
    const story = stories.find((item) => item.id === 'ldc5-doha');
    expect(story).toMatchObject({
      title: 'ICE Institute at LDC5 in Doha',
      type: 'global-stage',
      date: '2023-03-20',
      country: 'Qatar',
      location: { name: 'Doha, Qatar' },
      website: 'https://ice.simad.edu.so/2023/03/20/ice-institute-concludes-successful-week-at-ldc5-in-doha/',
    });
    expect(story?.summary).toMatch(/LDC5/);
    expect(story?.images).toEqual([
      '/images/global-stage/ldc5-doha.png',
      '/images/global-stage/un-ldcs-2023.jpg',
    ]);
    expect(stories.some((item) => item.id === 'un-ldcs-2023')).toBe(false);
    expect(stories.some((item) => item.id === 'cop28-dubai')).toBe(false);
  });

  it('includes the 2026 UNEP meeting at the UN Office in Nairobi', () => {
    const story = stories.find((item) => item.id === 'unep-unon-2026');
    expect(story).toMatchObject({
      title: 'ICE Institute Meets UNEP Somalia Programme in Nairobi',
      type: 'global-stage',
      date: '2026-04-14',
      country: 'Kenya',
      location: { name: 'United Nations Office at Nairobi, Kenya' },
      website:
        'https://ice.simad.edu.so/2025/06/17/ice-institute-gains-unep-accreditation-somalias-climate-voice-reaches-the-global-stage/',
    });
    expect(story?.images[0]).toBe('/images/global-stage/unep-unon-2026.jpg');
    expect(existsSync(join(publicDir, 'images/global-stage/unep-unon-2026.jpg'))).toBe(true);
  });

  it('includes ICAF 2026 in Djibouti', () => {
    const story = stories.find((item) => item.id === 'icaf-2026');
    expect(story).toMatchObject({
      title: 'ICE Institute at the International Climate Adaptation Forum 2026',
      type: 'global-stage',
      date: '2026-01-12',
      country: 'Djibouti',
      location: { name: 'Djibouti City, Djibouti' },
      website: 'https://ice.simad.edu.so/2026/01/24/ice-institute-at-the-international-climate-adaptation-forum-2026/',
    });
  });

  it('gives every story a 3-to-5 sentence summary of the full document', () => {
    for (const story of stories) {
      const sentences = (story.summary.match(/[.!?](?:\s|$)/g) ?? []).length;
      expect(sentences, story.id).toBeGreaterThanOrEqual(3);
      expect(sentences, story.id).toBeLessThanOrEqual(5);
    }
  });

  it('gives every global-stage event its actual ICE article URL', () => {
    expect(globalStage.length).toBeGreaterThan(10);
    for (const story of globalStage) {
      expect(story.website, story.id).toMatch(/^https:\/\/ice\.simad\.edu\.so\/\d{4}\/\d{2}\/\d{2}\/.+/);
      expect(story.website, story.id).not.toBe('https://ice.simad.edu.so/');
    }
  });

  it('lists ICE Institute research stories separately from community stories', () => {
    const research = stories.filter((story) => story.type === 'research-story');
    expect(research.length).toBeGreaterThan(20);
    for (const story of research) {
      expect(story.country).toBe('Somalia');
      expect(story.images.length, story.id).toBeGreaterThan(0);
      expect(story.themes.length, story.id).toBeGreaterThan(0);
      expect(story.chapters?.length, story.id).toBeGreaterThan(0);
    }
    expect(
      research.some((story) => story.id === 'the-digital-smallholder-navigating-the-shabelle-crisis'),
    ).toBe(true);
    expect(
      research.some((story) => story.themes.includes('agriculture-resilience')),
    ).toBe(true);
    expect(research.some((story) => story.themes.includes('climate-hazards'))).toBe(true);
  });

  it('gives every research story a distinct card image file', async () => {
    const { createHash } = await import('node:crypto');
    const { readFileSync: read } = await import('node:fs');
    const research = stories.filter((story) => story.type === 'research-story');
    const paths = research.map((story) => story.images[0]);
    expect(new Set(paths).size).toBe(paths.length);
    const hashes = new Set<string>();
    for (const imagePath of paths) {
      const absolute = join(publicDir, imagePath.replace(/^\//, ''));
      expect(existsSync(absolute), imagePath).toBe(true);
      const digest = createHash('sha256').update(read(absolute)).digest('hex');
      expect(hashes.has(digest), `duplicate bytes for ${imagePath}`).toBe(false);
      hashes.add(digest);
    }
  });

  it('gives every ICE community story a source date and its own image', () => {
    const ice = stories.filter((story) => story.type === 'ice-story');
    expect(ice).toHaveLength(7);
    expect(ice.find((story) => story.id === 'green-champions')?.date).toBe('2026-07-29');
    expect(ice.find((story) => story.id === '4c-art')?.date).toBe('2024-01-01');
    expect(ice.find((story) => story.id === 'ecosom')?.date).toBe('2019-01-01');
    expect(ice.find((story) => story.id === 'geed-soor')?.date).toBe('2024-09-19');
    expect(ice.find((story) => story.id === 'liido-beach-cleanup')?.date).toBe('2024-01-01');
    expect(ice.find((story) => story.id === 'simad-drought')?.date).toBe('2026-03-01');
    for (const story of ice) {
      expect(story.images.length, story.id).toBeGreaterThan(0);
      expect(existsSync(join(publicDir, story.images[0].replace(/^\//, ''))), story.images[0]).toBe(true);
      expect(story.sourceCard?.place, story.id).toBeTruthy();
      expect(story.sourceCard?.city, story.id).toBe('Mogadishu');
      expect(story.sourceCard?.regionLabel, story.id).toBe('Banaadir');
      expect(story.sourceCard?.country, story.id).toBe('Somalia');
      expect(story.sourceCard?.category, story.id).toBeTruthy();
      expect(story.sourceCard?.impactAreas.length, story.id).toBeGreaterThan(0);
      expect(story.sourceCard?.featuredPerson, story.id).toBe(story.featuredPerson);
      expect(story.sourceCard?.primarySource, story.id).toBeTruthy();
    }
  });

  it('gives 4C Art a full source-backed detail page', () => {
    const story = stories.find((item) => item.id === '4c-art');
    expect(story?.featuredPerson).toBe('Abdinasir Abdikadir Mohamed (4C)');
    expect(story?.videoTitle).toMatch(/Arts and Climate Action/);
    expect(story?.videoUrl).toContain('osuiqTcIEeM');
    expect(story?.sourceCard?.place).toBe('4C Art Studio / Mogadishu');
    expect(story?.sourceCard?.category).toBe('Arts & Climate Action');
    expect(story?.sourceCard?.extras?.some((row) => /UNSOS/i.test(row.value))).toBe(true);
    expect(story?.stats?.length).toBeGreaterThanOrEqual(4);
    expect(story?.chapters?.length).toBeGreaterThanOrEqual(4);
    expect(story?.images).toHaveLength(3);
    expect(story?.chapters?.some((chapter) => /UNSOS/i.test(chapter.paragraphs.join(' ')))).toBe(true);
  });

  it('gives Liido Beach Cleanup a full source-backed detail page', () => {
    const story = stories.find((item) => item.id === 'liido-beach-cleanup');
    expect(story?.featuredPerson).toBe('Abdisatar Arabow');
    expect(story?.videoTitle).toMatch(/Beach Cleaning Campaign/);
    expect(story?.videoUrl).toContain('gi083zfLVC4');
    expect(story?.placeLabel).toMatch(/Liido Beach/);
    expect(story?.mapTitle).toBe('Liido Beach');
    expect(story?.tourStops?.map((stop) => stop.place)).toEqual(['liido-beach']);
    expect(story?.stats?.some((stat) => /119,873/.test(`${stat.label} ${stat.value}`))).toBe(true);
    expect(story?.stats?.some((stat) => /89\.47/.test(`${stat.label} ${stat.value}`))).toBe(true);
    expect(story?.stats?.some((stat) => /147/.test(`${stat.label} ${stat.value}`))).toBe(true);
    expect(story?.chapters?.length).toBeGreaterThanOrEqual(4);
    expect(story?.images).toHaveLength(2);
    expect(story?.location.name).toMatch(/Liido Beach/);
    expect(story?.location).toMatchObject(regionCenter('liido-beach'));
    expect(story?.videos).toEqual([
      {
        title: 'Liido Beach Cleanup | Green Champions',
        url: 'https://www.facebook.com/reel/1412656927441281/',
      },
    ]);
    expect(story?.videos?.some((video) => video.url.includes('1459612665336518'))).toBe(false);
  });

  it('gives ECOSOM a full source-backed detail page', () => {
    const story = stories.find((item) => item.id === 'ecosom');
    expect(story?.videoTitle).toMatch(/Clean and Affordable Charcoal/);
    expect(story?.videoUrl).toContain('fkwwMTtuqDM');
    expect(story?.stats?.some((stat) => /2019/.test(`${stat.label} ${stat.value}`))).toBe(true);
    expect(story?.stats?.some((stat) => /20,000/.test(`${stat.label} ${stat.value}`))).toBe(true);
    expect(story?.stats?.some((stat) => /185/.test(`${stat.label} ${stat.value}`))).toBe(true);
    expect(story?.stats?.some((stat) => /1\.3/.test(`${stat.label} ${stat.value}`))).toBe(true);
    expect(story?.chapters?.some((chapter) => /Prosopis/i.test(chapter.paragraphs.join(' ')))).toBe(true);
    expect(story?.images).toHaveLength(4);
  });

  it('gives Geed Soor a full source-backed detail page', () => {
    const story = stories.find((item) => item.id === 'geed-soor');
    expect(story?.featuredPerson).toBe('Mohamed Omar');
    expect(story?.date).toBe('2024-09-19');
    expect(story?.stats?.some((stat) => /19 September 2024/.test(`${stat.label} ${stat.value}`))).toBe(true);
    expect(story?.chapters?.some((chapter) => /Hotel Jazeera/i.test(chapter.paragraphs.join(' ')))).toBe(true);
    expect(story?.images).toHaveLength(3);
  });

  it('gives Casuuro Plants a full source-backed detail page', () => {
    const story = stories.find((item) => item.id === 'casuuro-plants');
    expect(story?.videoTitle).toMatch(/Casuuro Plants/);
    expect(story?.videoUrl).toContain('WcUbn9Oo0A8');
    expect(story?.stats?.some((stat) => /Dalbile/i.test(`${stat.label} ${stat.value}`))).toBe(true);
    expect(story?.chapters?.length).toBeGreaterThanOrEqual(4);
    expect(story?.images).toHaveLength(2);
  });

  it('gives Green Champions a full source-backed detail page', () => {
    const story = stories.find((item) => item.id === 'green-champions');
    expect(story).toMatchObject({
      title: 'Green Champions: A Year of Youth-Led Climate Action',
      type: 'ice-story',
      date: '2026-07-29',
      featuredPerson: 'Green Champions',
      country: 'Somalia',
      website: 'https://ice.simad.edu.so/',
      mapTitle: 'Green Champions Actions',
    });
    expect(story?.summary).toContain('flagship student leadership programme at SIMAD University');
    expect(story?.summary).toContain('Class of 2025 brought ten students');
    expect(story?.stats?.some((stat) => /2,000\+/.test(`${stat.label} ${stat.value}`))).toBe(true);
    expect(story?.stats?.some((stat) => /474/.test(`${stat.label} ${stat.value}`))).toBe(true);
    expect(story?.videoTitle).toBe('Liido Beach Cleanup | Green Champions');
    expect(story?.videoUrl).toBe('https://www.facebook.com/reel/1412656927441281/');
    expect(story?.videos).toEqual([
      {
        title: 'School outreach | Green Champions',
        url: 'https://www.facebook.com/ICESomalia/videos/1459612665336518/',
      },
    ]);
    expect(story?.chapters?.some((chapter) => /Liido Beach/i.test(chapter.paragraphs.join(' ')))).toBe(true);
    expect(story?.chapters?.some((chapter) => /Mogadishu Primary and Secondary School/i.test(chapter.paragraphs.join(' ')))).toBe(true);
    expect(story?.chapters?.some((chapter) => /Boondheere Orphan Girls Centre/i.test(chapter.paragraphs.join(' ')))).toBe(true);
    expect(story?.chapters?.find((chapter) => chapter.heading === 'Green Friday')?.imagesAfter).toEqual([
      [],
      [],
      [
        '/images/ice-stories/green-champions-1.jpg',
        '/images/ice-stories/green-champions-2.jpg',
        '/images/ice-stories/green-champions-3.jpg',
        '/images/ice-stories/green-champions-4.jpg',
      ],
    ]);
    expect(story?.chapters?.find((chapter) => chapter.heading === 'School outreach')?.imagesAfter).toEqual([
      [],
      ['/images/ice-stories/mogadishu-outreach-1.jpg', '/images/ice-stories/mogadishu-outreach-2.jpg'],
      [
        '/images/ice-stories/school-outreach-1.jpg',
        '/images/ice-stories/school-outreach-2.jpg',
        '/images/ice-stories/school-outreach-3.jpg',
        '/images/ice-stories/school-outreach-4.jpg',
        '/images/ice-stories/school-outreach-5.jpg',
      ],
    ]);
    expect(story?.images).toEqual([
      '/images/ice-stories/green-champions-1.jpg',
      '/images/ice-stories/green-champions-2.jpg',
      '/images/ice-stories/green-champions-3.jpg',
      '/images/ice-stories/green-champions-4.jpg',
      '/images/ice-stories/mogadishu-outreach-1.jpg',
      '/images/ice-stories/mogadishu-outreach-2.jpg',
      '/images/ice-stories/school-outreach-1.jpg',
      '/images/ice-stories/school-outreach-2.jpg',
      '/images/ice-stories/school-outreach-3.jpg',
      '/images/ice-stories/school-outreach-4.jpg',
      '/images/ice-stories/school-outreach-5.jpg',
    ]);
    expect(story?.tourStops?.map((stop) => stop.place)).toEqual([
      'liido-beach',
      'mogadishu-primary-school',
      'boondheere-orphan-girls',
    ]);
    expect(story?.tourStops?.map((stop) => stop.images)).toEqual([
      ['/images/ice-stories/green-champions-1.jpg'],
      ['/images/ice-stories/mogadishu-outreach-1.jpg'],
      ['/images/ice-stories/school-outreach-1.jpg'],
    ]);
  });

  it('gives the SIMAD drought response a full source-backed detail page', () => {
    const story = stories.find((item) => item.id === 'simad-drought');
    expect(story?.featuredPerson).toBe('SIMAD University');
    expect(story?.stats?.some((stat) => /35/.test(`${stat.label} ${stat.value}`))).toBe(true);
    expect(story?.stats?.some((stat) => /180/.test(`${stat.label} ${stat.value}`))).toBe(true);
    expect(story?.stats?.some((stat) => /340/.test(`${stat.label} ${stat.value}`))).toBe(true);
    expect(story?.tourStops?.some((stop) => /Ceelgula/i.test(stop.description))).toBe(true);
    expect(story?.tourStops?.some((stop) => /Far-libaax/i.test(stop.description))).toBe(true);
    expect(story?.chapters?.some((chapter) => chapter.heading.startsWith('Mudug'))).toBe(false);
    expect(story?.images).toEqual([
      '/images/ice-stories/simad-drought-hero.jpg',
      '/images/ice-stories/mudug.jpg',
      '/images/ice-stories/mudug-2.jpg',
      '/images/ice-stories/baay.jpg',
      '/images/ice-stories/baay-food-1.jpg',
      '/images/ice-stories/baay-food-2.jpg',
      '/images/ice-stories/hiiraan.jpg',
      '/images/ice-stories/hiiraan-2.jpg',
      '/images/ice-stories/hiiraan-3.jpg',
      '/images/ice-stories/hiiraan-4.jpg',
      '/images/ice-stories/lower-juba.jpg',
      '/images/ice-stories/lower-juba-2.jpg',
      '/images/ice-stories/lower-juba-3.jpg',
    ]);
    expect(story?.images.some((src) => src.includes('statement'))).toBe(false);
    expect(splitStoryImages(story?.images ?? [])).toEqual({
      first: ['/images/ice-stories/simad-drought-hero.jpg'],
      middle: [
        '/images/ice-stories/mudug.jpg',
        '/images/ice-stories/mudug-2.jpg',
        '/images/ice-stories/baay.jpg',
        '/images/ice-stories/baay-food-1.jpg',
        '/images/ice-stories/baay-food-2.jpg',
        '/images/ice-stories/hiiraan.jpg',
        '/images/ice-stories/hiiraan-2.jpg',
        '/images/ice-stories/hiiraan-3.jpg',
        '/images/ice-stories/hiiraan-4.jpg',
        '/images/ice-stories/lower-juba.jpg',
        '/images/ice-stories/lower-juba-2.jpg',
      ],
      last: ['/images/ice-stories/lower-juba-3.jpg'],
    });
    expect(story?.tourStops?.map((stop) => stop.place)).toEqual([
      'wadajir',
      'ceelgula',
      'baydhaba',
      'xuduley',
      'far-libaax',
      'lower-juba',
    ]);
    expect(story?.tourStops?.map((stop) => stop.images)).toEqual([
      ['/images/ice-stories/simad-drought-hero.jpg'],
      ['/images/ice-stories/mudug.jpg', '/images/ice-stories/mudug-2.jpg'],
      [
        '/images/ice-stories/baay.jpg',
        '/images/ice-stories/baay-food-1.jpg',
        '/images/ice-stories/baay-food-2.jpg',
      ],
      ['/images/ice-stories/hiiraan.jpg', '/images/ice-stories/hiiraan-2.jpg'],
      ['/images/ice-stories/hiiraan-3.jpg', '/images/ice-stories/hiiraan-4.jpg'],
      [
        '/images/ice-stories/lower-juba.jpg',
        '/images/ice-stories/lower-juba-2.jpg',
        '/images/ice-stories/lower-juba-3.jpg',
      ],
    ]);
  });
});
