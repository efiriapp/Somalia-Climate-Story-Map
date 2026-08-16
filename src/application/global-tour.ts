import type { Story } from '../domain/story';

export const MOGADISHU_HOME = {
  lat: 2.0469,
  lng: 45.3182,
  zoom: 11,
  pitch: 58,
  bearing: 20,
  title: 'Mogadishu, Somalia',
};

export type TourStop = {
  kind: 'home' | 'event';
  storyId: string | null;
  title: string;
  date: string;
  place: string;
  summary: string;
  lat: number;
  lng: number;
  zoom: number;
  pitch: number;
  bearing: number;
};

const yearOf = (iso: string): number => Number.parseInt(iso.slice(0, 4), 10);

const homeStop = (date: string): TourStop => ({
  kind: 'home',
  storyId: null,
  title: MOGADISHU_HOME.title,
  date,
  place: MOGADISHU_HOME.title,
  summary: 'ICE Institute, SIMAD University — home base in Mogadishu.',
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
  summary: story.summary,
  lat: story.location.lat,
  lng: story.location.lng,
  zoom: 6.2,
  pitch: 52,
  bearing: 12,
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
