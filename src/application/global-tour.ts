import type { Story } from '../domain/story';

export const GLOBE_VIEW = {
  lng: 45.3182,
  lat: 6.5,
  zoom: 3.55,
  pitch: 0,
  bearing: 0,
  minZoom: 1.6,
  maxZoom: 12.5,
};

export const GLOBE_PADDING = { top: 72, bottom: 80, left: 64, right: 64 };

export const CITY_ZOOM = 11;
export const COUNTRY_ZOOM = 5.6;

export const MOGADISHU_HOME = {
  lat: 2.0469,
  lng: 45.3182,
  zoom: COUNTRY_ZOOM,
  pitch: GLOBE_VIEW.pitch,
  bearing: GLOBE_VIEW.bearing,
  title: 'Mogadishu, Somalia',
};

export type TourStop = {
  kind: 'home' | 'event';
  storyId: string | null;
  title: string;
  date: string;
  place: string;
  country: string;
  summary: string;
  website: string;
  images: string[];
  lat: number;
  lng: number;
  zoom: number;
  pitch: number;
  bearing: number;
};

const yearOf = (iso: string): number => Number.parseInt(iso.slice(0, 4), 10);

export const countryFromPlace = (place: string): string => {
  const parts = place.split(',').map((part) => part.trim()).filter(Boolean);
  return parts.at(-1) ?? place;
};

const homeStop = (date: string): TourStop => ({
  kind: 'home',
  storyId: null,
  title: MOGADISHU_HOME.title,
  date,
  place: MOGADISHU_HOME.title,
  country: 'Somalia',
  summary: 'ICE Institute, SIMAD University — home base in Mogadishu.',
  website: 'https://ice.simad.edu.so/',
  images: ['/logos/ice-lockup.png'],
  lat: MOGADISHU_HOME.lat,
  lng: MOGADISHU_HOME.lng,
  zoom: MOGADISHU_HOME.zoom,
  pitch: MOGADISHU_HOME.pitch,
  bearing: MOGADISHU_HOME.bearing,
});

const eventStop = (story: Story): TourStop => ({
  kind: 'event',
  storyId: story.id,
  title: story.title,
  date: story.date,
  place: story.location.name,
  country: story.country || countryFromPlace(story.location.name),
  summary: story.summary,
  website: story.website,
  images: story.images,
  lat: story.location.lat,
  lng: story.location.lng,
  zoom: COUNTRY_ZOOM,
  pitch: 0,
  bearing: 0,
});

export const buildGlobalTour = (stories: Story[]): TourStop[] => {
  const events = stories
    .filter((story) => story.type === 'global-stage')
    .filter((story) => {
      const year = yearOf(story.date);
      return year >= 2023 && year <= 2026;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const tour: TourStop[] = [];
  for (const event of events) {
    tour.push(homeStop(event.date));
    tour.push(eventStop(event));
  }
  if (events.length > 0) {
    tour.push(homeStop(events[events.length - 1].date));
  } else {
    tour.push(homeStop('2023-01-01'));
  }
  return tour;
};

export const nextTourIndex = (current: number, length: number): number =>
  Math.min(current + 1, Math.max(length - 1, 0));

export const prevTourIndex = (current: number): number => Math.max(current - 1, 0);

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

export const formatTourDate = (iso: string): string => {
  const date = new Date(`${iso}T00:00:00Z`);
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
};

export type TourDateParts = {
  iso: string;
  year: string;
  month: string;
  day: string;
  weekday: string;
};

export const tourDateParts = (iso: string): TourDateParts => {
  const date = new Date(`${iso}T00:00:00Z`);
  return {
    iso,
    year: String(date.getUTCFullYear()),
    month: date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase(),
    day: String(date.getUTCDate()).padStart(2, '0'),
    weekday: date.toLocaleString('en-US', { weekday: 'short', timeZone: 'UTC' }).toUpperCase(),
  };
};

export const tourPopupHtml = (stop: TourStop): string | null => {
  if (stop.kind === 'home') {
    return null;
  }
  const image = stop.images[0]
    ? `<img src="${escapeHtml(stop.images[0])}" alt="${escapeHtml(stop.title)}" />`
    : '';
  return `${image}
    <p><strong>Title:</strong> ${escapeHtml(stop.title)}</p>
    <p><strong>Date:</strong> ${escapeHtml(formatTourDate(stop.date))}</p>
    <p><strong>Country:</strong> ${escapeHtml(stop.country)}</p>
    <p class="tour-popup-description"><strong>Description:</strong> ${escapeHtml(stop.summary)}</p>
    <p><strong>More information:</strong> <a href="${escapeHtml(stop.website)}" target="_blank" rel="noreferrer">${escapeHtml(stop.website)}</a></p>`;
};

