import { useEffect, useMemo, useRef, useState } from 'react';
import { AttributionControl, Map, Marker, NavigationControl, type GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  CITY_EASE_MS,
  CRUISE_ZOOM,
  PLACE_FLY_MS,
  greatCircle,
  pathCoordinates,
  pointAlong,
  slicePath,
  type LngLat,
} from '../../application/flight-path';
import { CITY_ZOOM, GLOBE_PADDING, nextTourIndex, prevTourIndex } from '../../application/global-tour';
import { styleForLayer } from '../../application/map-layers';
import { SOMALIA_VIEW } from '../../application/resolve-map-view';
import { buildStoryMapTour, type StoryMapStop } from '../../application/story-map-tour';
import type { Story } from '../../domain/story';

type Props = {
  story: Story;
  onBack: () => void;
};

const emptyLine: GeoJSON.Feature = {
  type: 'Feature',
  properties: {},
  geometry: { type: 'LineString', coordinates: [] },
};

const lineData = (path: LngLat[]): GeoJSON.Feature => ({
  type: 'Feature',
  properties: {},
  geometry: { type: 'LineString', coordinates: pathCoordinates(path) },
});

const flyAlong = (
  map: Map,
  path: LngLat[],
  endZoom: number,
  setRaf: (id: number) => void,
  onDone: () => void,
) => {
  const startZoom = map.getZoom();
  const started = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - started) / PLACE_FLY_MS);
    const point = pointAlong(path, t);
    const source = map.getSource('tour-path') as GeoJSONSource | undefined;
    source?.setData(lineData(slicePath(path, t)));
    map.jumpTo({
      center: [point.lng, point.lat],
      zoom: startZoom + (endZoom - startZoom) * t,
      pitch: 0,
      bearing: map.getBearing(),
    });
    if (t < 1) {
      setRaf(requestAnimationFrame(step));
    } else {
      onDone();
    }
  };
  setRaf(requestAnimationFrame(step));
};

const pinElement = (label: string, active: boolean): HTMLButtonElement => {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = active ? 'tour-pin-label active' : 'tour-pin-label';
  el.textContent = label;
  return el;
};

export function StoryMapTour({ story, onBack }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const rafRef = useRef(0);
  const holdRef = useRef(0);
  const tokenRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const stops = useMemo(() => buildStoryMapTour(story), [story]);
  const stopsRef = useRef(stops);
  stopsRef.current = stops;
  activeIndexRef.current = activeIndex;
  const activeStop = stops[activeIndex];

  const stopMotion = () => {
    cancelAnimationFrame(rafRef.current);
    window.clearTimeout(holdRef.current);
  };

  const drawPins = (map: Map, current: number) => {
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = stopsRef.current.map((stop, index) => {
      const marker = new Marker({ element: pinElement(stop.district, index === current) })
        .setLngLat([stop.lng, stop.lat])
        .addTo(map);
      marker.getElement().addEventListener('click', (event) => {
        event.stopPropagation();
        goTo(index);
      });
      return marker;
    });
  };

  const landOn = (map: Map, stop: StoryMapStop, index: number) => {
    drawPins(map, index);
    map.easeTo({
      center: [stop.lng, stop.lat],
      zoom: CITY_ZOOM,
      pitch: 0,
      bearing: 0,
      duration: CITY_EASE_MS,
    });
  };

  const goTo = (index: number) => {
    const map = mapRef.current;
    const next = stopsRef.current[index];
    const current = stopsRef.current[activeIndexRef.current];
    if (!map || !next) {
      return;
    }
    const token = tokenRef.current + 1;
    tokenRef.current = token;
    stopMotion();
    setActiveIndex(index);
    drawPins(map, index);
    if (!current || current.districtSlug === next.districtSlug) {
      landOn(map, next, index);
      return;
    }
    flyAlong(
      map,
      greatCircle({ lng: current.lng, lat: current.lat }, { lng: next.lng, lat: next.lat }),
      CRUISE_ZOOM,
      (id) => {
        rafRef.current = id;
      },
      () => {
        if (token !== tokenRef.current) {
          return;
        }
        landOn(map, next, index);
      },
    );
  };

  useEffect(() => {
    if (!host.current) {
      return;
    }
    const map = new Map({
      container: host.current,
      style: styleForLayer('osm'),
      center: [SOMALIA_VIEW.center.lng, SOMALIA_VIEW.center.lat],
      zoom: SOMALIA_VIEW.zoom,
      pitch: 0,
      bearing: 0,
      maxPitch: 0,
      fadeDuration: 0,
      attributionControl: false,
    });
    map.setPadding({ ...GLOBE_PADDING, right: 332 });
    map.addControl(new NavigationControl({ visualizePitch: false, showCompass: false }), 'top-right');
    map.addControl(new AttributionControl({ compact: true }), 'bottom-left');
    mapRef.current = map;
    const onLoad = () => {
      if (!map.getSource('tour-path')) {
        map.addSource('tour-path', { type: 'geojson', data: emptyLine });
        map.addLayer({
          id: 'tour-path',
          type: 'line',
          source: 'tour-path',
          paint: { 'line-color': '#4CAF7D', 'line-width': 3, 'line-opacity': 0.85 },
        });
      }
      const first = stopsRef.current[0];
      drawPins(map, 0);
      if (first) {
        map.easeTo({
          center: [first.lng, first.lat],
          zoom: CITY_ZOOM,
          duration: CITY_EASE_MS,
        });
      }
      map.resize();
    };
    map.on('load', onLoad);
    const fitScreen = () => map.resize();
    window.addEventListener('resize', fitScreen);
    return () => {
      window.removeEventListener('resize', fitScreen);
      tokenRef.current += 1;
      stopMotion();
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  if (!activeStop) {
    return null;
  }

  return (
    <section className="global-stage" aria-label={story.title}>
      <div className="global-stage-scene">
        <div className="global-stage-map" ref={host} />
        <h1 className="tour-title">SIMAD drought response</h1>
        <button type="button" className="tour-back simple" aria-label="Back to catalog" onClick={onBack}>
          Back to catalog
        </button>
        <div className="tour-event-nav">
          <button type="button" aria-label="Back" onClick={() => goTo(prevTourIndex(activeIndex))}>
            Back
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => goTo(nextTourIndex(activeIndex, stops.length))}
          >
            Next
          </button>
        </div>
        <div className="tour-right-stack">
          <aside className="event-slider">
            <article className="event-card active" aria-label={activeStop.title}>
              {activeStop.images[0] ? <img src={activeStop.images[0]} alt="" /> : null}
              <h3>{activeStop.title}</h3>
              <p>{activeStop.description}</p>
            </article>
          </aside>
        </div>
      </div>
    </section>
  );
}
