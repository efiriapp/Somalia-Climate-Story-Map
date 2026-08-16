type Bounds = { minLat: number; maxLat: number; minLng: number; maxLng: number };

const COUNTRY_BOUNDS: Record<string, Bounds> = {
  Somalia: { minLat: -2.0, maxLat: 12.2, minLng: 40.8, maxLng: 51.6 },
  Egypt: { minLat: 22.0, maxLat: 31.7, minLng: 24.6, maxLng: 37.0 },
  Qatar: { minLat: 24.4, maxLat: 26.3, minLng: 50.6, maxLng: 51.8 },
  Rwanda: { minLat: -2.9, maxLat: -1.0, minLng: 28.8, maxLng: 31.0 },
  Azerbaijan: { minLat: 38.3, maxLat: 42.0, minLng: 44.7, maxLng: 50.6 },
  Switzerland: { minLat: 45.7, maxLat: 47.9, minLng: 5.8, maxLng: 10.6 },
  Kenya: { minLat: -4.8, maxLat: 4.7, minLng: 33.8, maxLng: 42.0 },
  Zambia: { minLat: -18.2, maxLat: -8.1, minLng: 21.8, maxLng: 33.8 },
  Ethiopia: { minLat: 3.3, maxLat: 15.0, minLng: 32.9, maxLng: 48.1 },
  'United Arab Emirates': { minLat: 22.5, maxLat: 26.2, minLng: 51.4, maxLng: 56.6 },
  Brazil: { minLat: -34.0, maxLat: 5.4, minLng: -74.1, maxLng: -32.3 },
  France: { minLat: 41.2, maxLat: 51.2, minLng: -5.3, maxLng: 9.7 },
  Ghana: { minLat: 4.6, maxLat: 11.3, minLng: -3.4, maxLng: 1.3 },
};

export const coordinatesMatchCountry = (country: string, lat: number, lng: number): boolean => {
  const bounds = COUNTRY_BOUNDS[country];
  if (!bounds) {
    return false;
  }
  return lat >= bounds.minLat && lat <= bounds.maxLat && lng >= bounds.minLng && lng <= bounds.maxLng;
};
