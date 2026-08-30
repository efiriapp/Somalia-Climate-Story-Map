export type RegionCenter = { lat: number; lng: number };

const DISTRICTS: Record<string, RegionCenter> = {
  mudug: { lat: 5.3516, lng: 48.5256 },
  bay: { lat: 3.1138, lng: 43.6498 },
  hiraan: { lat: 4.7358, lng: 45.2036 },
  'lower-juba': { lat: -0.3566, lng: 42.5453 },
};

export const regionCenter = (slug: string): RegionCenter => {
  const center = DISTRICTS[slug];
  if (!center) {
    throw new Error(`Unknown region: ${slug}`);
  }
  return center;
};
