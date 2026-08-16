import { useEffect, useMemo, useRef, useState } from 'react';
import { Map, Marker, NavigationControl, type StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { buildGlobalTour, nextTourIndex, prevTourIndex, type TourStop } from '../../application/global-tour';
import { MAP_LAYERS, styleForLayer, type MapLayerId } from '../../application/map-layers';
import type { Story } from '../../domain/story';

type Props = {
  stories: Story[];
  onClose: () => void;
};

const applyGlobe = (map: Map) => {
  const globeMap = map as Map & { setProjection?: (projection: { type: string }) => void };
  globeMap.setProjection?.({ type: 'globe' });
};

const createMap = (container: HTMLDivElement, style: StyleSpecification): Map => {
  const map = new Map({
    container,
    style,
    center: [45.3182, 2.0469],
    zoom: 3.2,
    pitch: 52,
    bearing: 20,
  });
  map.addControl(new NavigationControl({ visualizePitch: true }), 'top-right');
  map.on('load', () => applyGlobe(map));
  return map;
};

export function GlobalStageMap({ stories, onClose }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [layer, setLayer] = useState<MapLayerId>('carto-voyager');
  const tour = useMemo(() => buildGlobalTour(stories), [stories]);
  const stop: TourStop | undefined = tour[index];

  useEffect(() => {
    if (!host.current) {
      return;
    }
    const map = createMap(host.current, styleForLayer(layer));
    mapRef.current = map;
    map.on('load', () => setReady(true));
    return () => {
      markerRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) {
      return;
    }
    setReady(false);
    map.setStyle(styleForLayer(layer));
    map.once('style.load', () => {
      applyGlobe(map);
      setReady(true);
    });
  }, [layer]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || !stop) {
      return;
    }
    map.flyTo({
      center: [stop.lng, stop.lat],
      zoom: stop.kind === 'home' ? 11 : stop.zoom,
      pitch: stop.pitch,
      bearing: stop.bearing,
      duration: 2800,
      essential: true,
    });
    markerRef.current?.remove();
    markerRef.current = new Marker({ color: '#063D39' }).setLngLat([stop.lng, stop.lat]).addTo(map);
  }, [index, ready, stop]);

  useEffect(() => {
    if (!playing) {
      return;
    }
    const timer = window.setInterval(() => {
      setIndex((current) => {
        const next = nextTourIndex(current, tour.length);
        if (next === current) {
          setPlaying(false);
        }
        return next;
      });
    }, 5000);
    return () => window.clearInterval(timer);
  }, [playing, tour.length]);

  if (!stop) {
    return null;
  }

  return (
    <section className="global-stage" aria-label="ICE Institute at Global Stage">
      <header className="global-stage-bar">
        <button type="button" className="global-stage-back" onClick={onClose}>
          ← Back
        </button>
        <div>
          <p className="kicker">ICE Institute at Global Stage</p>
          <h2>2023 – 2026</h2>
        </div>
        <label className="layer-switch">
          3D map layers
          <select value={layer} onChange={(event) => setLayer(event.target.value as MapLayerId)}>
            {MAP_LAYERS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </header>
      <div className="global-stage-map" ref={host} />
      <article className="global-stage-popup">
        {stop.images[0] ? <img src={stop.images[0]} alt={stop.title} /> : null}
        <p>
          <strong>Title:</strong> {stop.title}
        </p>
        <p>
          <strong>Country:</strong> {stop.country}
        </p>
        <p>
          <strong>Description:</strong> {stop.summary}
        </p>
        <p>
          <strong>More information:</strong>{' '}
          <a href={stop.website} target="_blank" rel="noreferrer">
            {stop.website}
          </a>
        </p>
      </article>
      <div className="global-stage-controls">
        <button
          type="button"
          aria-label="Previous stop"
          onClick={() => {
            setPlaying(false);
            setIndex((current) => prevTourIndex(current));
          }}
        >
          ←
        </button>
        <button
          type="button"
          className="play"
          aria-label={playing ? 'Pause tour' : 'Play tour'}
          onClick={() => setPlaying((current) => !current)}
        >
          {playing ? '❚❚' : '▶'}
        </button>
        <button
          type="button"
          aria-label="Next stop"
          onClick={() => {
            setPlaying(false);
            setIndex((current) => nextTourIndex(current, tour.length));
          }}
        >
          →
        </button>
      </div>
    </section>
  );
}
