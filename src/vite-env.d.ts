/// <reference types="vite/client" />

declare module 'maplibre-gl-equal-earth' {
  import type { Map } from 'maplibre-gl';

  export class EqualEarthCoordTransform {
    constructor(map: Map, zoomSwitch: number);
  }

  export function geogLonLat_to_eqmercLonLat(coords: [number, number]): [number, number];
  export function mercLonLat_to_eqmercLonLat(coords: [number, number]): [number, number];
}
