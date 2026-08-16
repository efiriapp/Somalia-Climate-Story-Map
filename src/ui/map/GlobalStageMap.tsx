import { useEffect, useMemo, useRef, useState } from 'react';
import { Map, Marker, NavigationControl, Popup, type StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { buildGlobalTour, nextTourIndex, prevTourIndex, type TourStop } from '../../application/global-tour';
import type { Story } from '../../domain/story';

const cartoStyle: StyleSpecification = {
  version: 8,
  sources: {
    carto: {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
        'https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
      ],
      tileSize: 256,
      attribution: '© CARTO © OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'carto', type: 'raster', source: 'carto' }],
};

type Props = {
  stories: Story[];
  onClose: () => void;
};

export function GlobalStageMap({ stories, onClose }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const tour = useMemo(() => buildGlobalTour(stories), [stories]);
  const stop: TourStop | undefined = tour[index];

  useEffect(() => {
    if (!host.current) {
      return;
    }
    const map = new Map({
      container: host.current,
      style: cartoStyle,
      center: [45.3182, 2.0469],
      zoom: 11,
      pitch: 58,
      bearing: 20,
    });
    map.addControl(new NavigationControl({ visualizePitch: true }), 'top-right');
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
    if (!ready || !map || !stop) {
      return;
    }
    map.flyTo({
      center: [stop.lng, stop.lat],
      zoom: stop.zoom,
      pitch: stop.pitch,
      bearing: stop.bearing,
      duration: 2800,
      essential: true,
    });
    markerRef.current?.remove();
    markerRef.current = new Marker({ color: '#063D39' })
      .setLngLat([stop.lng, stop.lat])
      .setPopup(new Popup({ offset: 28 }).setText(`${stop.title} — ${stop.place}`))
      .addTo(map)
      .togglePopup();
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
    }, 4500);
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
      </header>
      <div className="global-stage-map" ref={host} />
      <article className="global-stage-card">
        <p className="story-type">{stop.kind === 'home' ? 'Home' : 'Global stage'}</p>
        <p className="global-stage-date">{stop.date}</p>
        <h3>{stop.title}</h3>
        <p>{stop.summary}</p>
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
