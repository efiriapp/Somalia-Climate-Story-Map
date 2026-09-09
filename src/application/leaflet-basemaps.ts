export type LeafletBasemap = {
  id: 'streets' | 'satellite' | 'terrain';
  name: string;
  url: string;
  attribution: string;
};

/** Leaflet raster fallbacks; Streets is listed first as the default choice. */
export const leafletBasemaps: LeafletBasemap[] = [
  {
    id: 'streets',
    name: 'Streets',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  {
    id: 'satellite',
    name: 'Satellite',
    url: 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2021_3857/default/g/{z}/{y}/{x}.jpg',
    attribution:
      '<a href="https://s2maps.eu">Sentinel-2 cloudless</a> by EOX :: Copernicus open data',
  },
  {
    id: 'terrain',
    name: 'Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
  },
];
