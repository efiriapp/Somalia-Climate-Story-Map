/**
 * Hand-kept source records for media that cannot be looked up automatically.
 * Wikimedia research photos and YouTube videos are generated instead:
 *   research-image-credits.ts  (npm run credits:fetch)
 *   video-sources.ts           (npm run videos:fetch)
 *
 * Only record what is known: facts here come from the photo's embedded
 * metadata (EXIF/IPTC/XMP), the publishing page, or ICE's own files.
 * Never guess a photographer or licence. Use `rights` to flag what still
 * needs checking before launch.
 */

/**
 * - open-licence: a free licence or public domain, credited as required.
 * - ice: ICE's own or ICE-supplied media, published by ICE.
 * - platform-embed: shown through the platform's official player (YouTube,
 *   Facebook), which the platform's terms allow; the owner keeps all rights.
 * - permission-needed: owned by a news or stock agency; needs a licence or
 *   permission from the owner, or replacing.
 * - unconfirmed: supplied without a recorded source; ICE must confirm it.
 */
export type RightsStatus = 'open-licence' | 'ice' | 'platform-embed' | 'permission-needed' | 'unconfirmed';

export type ImageSource = {
  /** Caption or title of the photo, when known. */
  title?: string;
  /** Photographer or artist. */
  creator?: string;
  /** Organisation that published or holds the photo. */
  publisher: string;
  /** ISO date (YYYY-MM-DD) the photo was taken or published, when known. */
  date?: string;
  /** Licence or rights statement. */
  license: string;
  /** Page where the photo or its source can be checked. */
  url?: string;
  rights: RightsStatus;
};

const ICE = 'ICE Institute, SIMAD University';
const UNCONFIRMED: ImageSource = {
  publisher: `Supplied by ${ICE}`,
  license: 'Original source not recorded',
  rights: 'unconfirmed',
};

/** Climate Impact photos (public/images/climate-impact), supplied in ICE's Sources/Images folder. */
export const CLIMATE_IMAGE_SOURCES: Record<string, ImageSource> = {
  '/images/climate-impact/flood-4.webp': {
    title: 'Vehicles try to maneuver through flood water caused by heavy rain, in Mogadishu',
    creator: 'Farah Abdi Warsameh',
    publisher: 'AP Photo (The Associated Press)',
    date: '2023-11-11',
    license: '© The Associated Press. All rights reserved',
    rights: 'permission-needed',
  },
  '/images/climate-impact/heat-wave-1.jpg': {
    title: 'Young woman drinking fresh water from a plastic bottle under the hot summer sun',
    creator: 'ugurhan',
    publisher: 'Getty Images / iStock',
    license: '© Getty Images. Royalty-free stock licence required',
    rights: 'permission-needed',
  },
  '/images/climate-impact/mogadishu-heat-wave.jpg': {
    title: 'The remains of what was once a hotel in Mogadishu',
    creator: 'Frank Langfitt',
    publisher: 'NPR',
    license: '© NPR. All rights reserved',
    rights: 'permission-needed',
  },
  '/images/climate-impact/flood-1.jpg': { ...UNCONFIRMED, date: '2023-05-25' },
  '/images/climate-impact/flood.jpg': UNCONFIRMED,
  '/images/climate-impact/flood-2.jpg': UNCONFIRMED,
  '/images/climate-impact/flood-3.jpg': UNCONFIRMED,
  '/images/climate-impact/drought.jpg': UNCONFIRMED,
  '/images/climate-impact/drought-1.avif': UNCONFIRMED,
  '/images/climate-impact/drought-2.jpg': UNCONFIRMED,
  '/images/climate-impact/drought-3.jpg': UNCONFIRMED,
  '/images/climate-impact/droughts.webp': UNCONFIRMED,
  '/images/climate-impact/el-nino.jpg': UNCONFIRMED,
  '/images/climate-impact/heat-wave.png': UNCONFIRMED,
  '/images/climate-impact/mogadishu-heat-waves.jpg': UNCONFIRMED,
  '/images/climate-impact/mogadishu-heat-wave-2.jpeg': UNCONFIRMED,
};

/** Photographers named in the embedded metadata of Global Stage photos. */
export const GLOBAL_STAGE_PHOTOGRAPHERS: Record<string, string> = {
  '/images/global-stage/decoding-cop27.jpeg': 'Johann Olivier',
  '/images/global-stage/changemakerxchange-2023.jpg': 'Rixel',
};

export type FacebookVideoSource = {
  title: string;
  /** Page or account that posted the video; omit when not known. */
  publisher?: string;
  published: string | null;
  url: string;
  platform: 'Facebook';
  rights: RightsStatus;
};

/**
 * Facebook videos. Facebook does not allow automated lookups, so titles are
 * as listed in ICE's content and the publisher is taken from the link where
 * it shows one.
 */
export const FACEBOOK_SOURCES: Record<string, FacebookVideoSource> = {
  'https://www.facebook.com/ICESomalia/videos/1459612665336518/': {
    title: 'School outreach',
    publisher: 'ICE Institute (facebook.com/ICESomalia)',
    published: null,
    url: 'https://www.facebook.com/ICESomalia/videos/1459612665336518/',
    platform: 'Facebook',
    rights: 'ice',
  },
  'https://www.facebook.com/reel/1412656927441281/': {
    title: 'Liido Beach Cleanup',
    published: null,
    url: 'https://www.facebook.com/reel/1412656927441281/',
    platform: 'Facebook',
    rights: 'unconfirmed',
  },
  'https://www.facebook.com/share/v/1PpWwLxGGf/': {
    title: 'El Niño impacts in Somalia',
    published: null,
    url: 'https://www.facebook.com/share/v/1PpWwLxGGf/',
    platform: 'Facebook',
    rights: 'unconfirmed',
  },
  'https://www.facebook.com/share/r/1PXwb4Yd2U/': {
    title: 'El Niño climate impacts',
    published: null,
    url: 'https://www.facebook.com/share/r/1PXwb4Yd2U/',
    platform: 'Facebook',
    rights: 'unconfirmed',
  },
};

export const ICE_PUBLISHER = ICE;
