import { useState } from 'react';
import { Pane, TileLayer } from 'react-leaflet';
import type { Feature, FeatureCollection } from 'geojson';
import {
  FOREST_LAYERS,
  LOSS_YEARS,
  lossByUnit,
  type ForestLayerId,
  type ForestLoss,
} from '../../application/forest-watch';
import type { AdminLevel } from '../../application/flood-history';
import { useLocale } from '../chrome/LocaleContext';
import { ADMIN_FILE, AdminBoundaries } from '../map/AdminBoundaries';
import { ClipToOutline } from '../map/ClipToOutline';
import { LossTrend } from './LossTrend';
import { AreaPanel } from './AreaPanel';
import { useWatchFile } from '../useWatchData';
import { WatchMap } from './WatchMap';
import { WatchSources, type WatchSource } from './WatchSources';

const YEARS = Array.from({ length: LOSS_YEARS.last - LOSS_YEARS.first + 1 }, (_, i) => LOSS_YEARS.first + i);

const SOURCES: WatchSource[] = [
  ...FOREST_LAYERS.map((layer) => ({ text: `${layer.source} ${layer.licence}.`, url: layer.sourceUrl })),
  {
    text: 'Map tiles: Global Forest Watch, World Resources Institute.',
    url: 'https://www.globalforestwatch.org/',
  },
  {
    text: 'Administrative boundaries (states, regions, districts): UNOCHA Somalia, via FAO SWALIM. Loss by place and year: ICE calculation from Hansen/UMD v1.13 (tree cover in 2000 above 30%), inside Somalia only.',
    url: 'https://spatial.faoswalim.org/',
  },
];

/**
 * Forest Watch, after Global Forest Watch: tree cover loss for a chosen range
 * of years, tree cover in 2000 and tree cover gain on a Somalia map, with
 * state, region or district boundaries.
 */
export function ForestWatchPage() {
  const { copy } = useLocale();
  const [from, setFrom] = useState<number>(LOSS_YEARS.first);
  const [to, setTo] = useState<number>(LOSS_YEARS.last);
  const [on, setOn] = useState<Record<ForestLayerId, boolean>>({ loss: true, cover: true, gain: false });
  const [boundary, setBoundary] = useState<AdminLevel | null>('state');
  // The chart's level follows the boundaries on the map (state when none).
  const [level, setLevel] = useState<AdminLevel>('state');
  const [place, setPlace] = useState<string | null>(null);
  const pickLevel = (next: AdminLevel) => {
    setLevel(next);
    setBoundary(next);
    setPlace(null);
  };
  const pickBoundary = (next: AdminLevel | null) => {
    setBoundary(next);
    if (next) {
      setLevel(next);
      setPlace(null);
    }
  };
  const { data: lossData } = useWatchFile<ForestLoss>('forest-loss.json');
  const { data: outline } = useWatchFile<FeatureCollection>('somalia-outline.geojson');
  const { data: admin } = useWatchFile<FeatureCollection & { features: Feature[] }>(
    boundary ? ADMIN_FILE[boundary] : null,
  );
  const names: Record<ForestLayerId, string> = {
    loss: copy.forestLoss,
    cover: copy.forestCover,
    gain: copy.forestGain,
  };
  const year = (value: number, set: (next: number) => void, text: string) => (
    <label>
      <span>{text}</span>
      <select value={value} onChange={(event) => set(Number(event.target.value))}>
        {YEARS.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <article className="detail watch-page" aria-label={copy.forestWatch}>
      <h1>{copy.forestWatch}</h1>
      <p className="watch-intro">{copy.forestWatchIntro}</p>
      <WatchMap
        points={[]}
        label={copy.forestWatch}
        controls={
          <div className="station-selects station-selects-overlay">
            {year(from, setFrom, copy.forestFrom)}
            {year(to, setTo, copy.forestTo)}
          </div>
        }
        sideBeside
        side={
          lossData ? (
            <AreaPanel
              title={copy.forestLoss}
              color={FOREST_LAYERS[0]!.color}
              level={level}
              onLevel={pickLevel}
              rows={lossByUnit(lossData, level, from, to)}
              subtitle={`${Math.min(from, to)}–${Math.max(from, to)}`}
              onPick={(id) => setPlace((current) => (current === id ? null : id))}
              selectedId={place}
            />
          ) : null
        }
        legend={
          <div className="forest-side">
            {FOREST_LAYERS.map((layer) => (
              <label key={layer.id} className="forest-layer">
                <input
                  type="checkbox"
                  checked={on[layer.id]}
                  onChange={() => setOn((current) => ({ ...current, [layer.id]: !current[layer.id] }))}
                />
                <span className="legend-key" style={{ background: layer.color }} aria-hidden="true" />
                {names[layer.id]}
                {layer.id === 'loss' ? ` ${Math.min(from, to)}–${Math.max(from, to)}` : ''}
              </label>
            ))}
            <label className="forest-boundary">
              <span>{copy.layerBoundaries}</span>
              <select
                value={boundary ?? ''}
                onChange={(event) => pickBoundary((event.target.value || null) as AdminLevel | null)}
              >
                <option value="">{copy.boundaryNone}</option>
                <option value="state">{copy.layerStates}</option>
                <option value="region">{copy.layerRegions}</option>
                <option value="district">{copy.layerDistricts}</option>
              </select>
            </label>
          </div>
        }
      >
        {/* Forest layers only inside Somalia: their pane is clipped to its outline. */}
        <Pane name="forest" style={{ zIndex: 250 }}>
          {[...FOREST_LAYERS].reverse().map((layer) =>
            on[layer.id] ? (
              <TileLayer
                key={`${layer.id}-${layer.url(from, to)}`}
                pane="forest"
                url={layer.url(from, to)}
                attribution='<a href="https://www.globalforestwatch.org/">Global Forest Watch</a>'
                opacity={layer.id === 'cover' ? 0.7 : 1}
                zIndex={layer.id === 'loss' ? 30 : 20}
              />
            ) : null,
          )}
        </Pane>
        {outline ? <ClipToOutline pane="forest" outline={outline} /> : null}
        {boundary && admin ? <AdminBoundaries key={boundary} level={boundary} data={admin} /> : null}
      </WatchMap>
      {lossData ? (
        <LossTrend data={lossData} level={level} place={place} onPlace={setPlace} />
      ) : null}
      <WatchSources sources={SOURCES} />
    </article>
  );
}
