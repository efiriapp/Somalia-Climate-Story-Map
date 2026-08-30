export type DistrictCenter = { lat: number; lng: number };

const DISTRICTS: Record<string, DistrictCenter> = {
  hobyo: { lat: 5.3516, lng: 48.5256 },
  baidoa: { lat: 3.1138, lng: 43.6498 },
  jalalaqsi: { lat: 3.3769, lng: 45.5994 },
  'belet-weyne': { lat: 4.7358, lng: 45.2036 },
  kismaayo: { lat: -0.3566, lng: 42.5453 },
};

export const districtCenter = (slug: string): DistrictCenter => {
  const center = DISTRICTS[slug];
  if (!center) {
    throw new Error(`Unknown district: ${slug}`);
  }
  return center;
};
