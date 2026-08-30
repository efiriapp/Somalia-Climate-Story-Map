export type RegionCenter = { lat: number; lng: number };

const PLACES: Record<string, RegionCenter> = {
  ceelgula: { lat: 6.01175, lng: 47.85248 },
  baydhaba: { lat: 3.119951, lng: 43.644462 },
  xuduley: { lat: 3.31305, lng: 45.66508 },
  'far-libaax': { lat: 4.87458, lng: 44.86873 },
  'lower-juba': { lat: 0.07222, lng: 42.75056 },
};

export const regionCenter = (slug: string): RegionCenter => {
  const center = PLACES[slug];
  if (!center) {
    throw new Error(`Unknown region: ${slug}`);
  }
  return center;
};
