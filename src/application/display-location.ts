import type { Story } from '../domain/story';

const keyFor = (story: Story): string =>
  `${story.location.lat.toFixed(3)},${story.location.lng.toFixed(3)}`;

export const displayLocation = (story: Story, group: Story[]): { lat: number; lng: number } => {
  const index = group.findIndex((item) => item.id === story.id);
  const groupSize = group.length;
  if (groupSize <= 1 || index < 0) {
    return story.location;
  }
  const offsetLng = (index - (groupSize - 1) / 2) * 0.012;
  const offsetLat = ((index % 2) * 2 - 1) * 0.006;
  return {
    lat: story.location.lat + offsetLat,
    lng: story.location.lng + offsetLng,
  };
};

export const groupedPins = (stories: Story[]): Map<string, Story[]> => {
  const groups = new Map<string, Story[]>();
  for (const story of stories) {
    const key = keyFor(story);
    const current = groups.get(key) ?? [];
    current.push(story);
    groups.set(key, current);
  }
  return groups;
};
