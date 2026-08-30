export type RegionCenter = { lat: number; lng: number };

const REGIONS: Record<string, RegionCenter> = {
  mudug: { lat: 6.1128, lng: 47.9881 },
  bay: { lat: 3.05, lng: 43.75 },
  hiraan: { lat: 4.783, lng: 45.45 },
  'lower-juba': { lat: -0.15, lng: 42.6 },
};

export const regionCenter = (slug: string): RegionCenter => {
  const center = REGIONS[slug];
  if (!center) {
    throw new Error(`Unknown region: ${slug}`);
  }
  return center;
};
