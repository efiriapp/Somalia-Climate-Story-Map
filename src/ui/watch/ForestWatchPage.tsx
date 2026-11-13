import { useState } from 'react';
import { Pane, TileLayer } from 'react-leaflet';
import type { Feature, FeatureCollection } from 'geojson';
import {
  FOREST_LAYERS,
  LOSS_YEARS,
  lossByUnit,
  type ForestLoss,
} from '../../application/forest-watch';
import type { AdminLevel } from '../../application/flood-history';
import { useLocale } from '../chrome/LocaleContext';
import { ADMIN_FILE, AdminBoundaries } from '../map/AdminBoundaries';
import { ClipToOutline } from '../map/ClipToOutline';
import { LossTrend } from './LossTrend';
import { AreaPanel } from './AreaPanel';
import { CHARCOAL_COLORS, charcoalByUnit, type CharcoalByAdmin } from '../../application/charcoal';
import { MapDialog, MapToggleButton } from '../map/MapToggleButton';
import { CharcoalLayer } from './CharcoalLayer';
import { ForestLayerList, ForestLegend, type ForestLayerState } from './ForestLayers';
import { useWatchFile } from '../useWatchData';
import { WatchMap } from './WatchMap';
import { WatchSources, type WatchSource } from './WatchSources';

const YEARS = Array.from({ length: LOSS_YEARS.last - LOSS_YEARS.first + 1 }, (_, i) => LOSS_YEARS.first + i);

const SOURCES: WatchSource[] = [
  ...FOREST_LAYERS.map((layer) => ({ text: `${layer.source} ${layer.licence}.`, url: layer.sourceUrl })),
  {
    text: 'Charcoal production areas (potential export, proposed local consumption, study area 2011–2017): FAO SWALIM, PROSCAL, 2018. Areas by place: ICE calculation (equal-area projection, UNOCHA boundaries).',
    url: 'https://spatial.faoswalim.org/layers/geonode:SOM_Proposed_Charcoal_Production_Areas',
  },
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
 * of years, tree cover in 2000 and gain, and charcoal production areas on a
 * Somalia map. The layers button lists every layer; the chart button opens
 * the side panel (loss or charcoal by state, region or district).
 */
export function ForestWatchPage() {
  const { copy } = useLocale();
  const [from, setFrom] = useState<number>(LOSS_YEARS.first);
  const [to, setTo] = useState<number>(LOSS_YEARS.last);
  const [on, setOn] = useState<ForestLayerState>({ loss: true, cover: true, gain: false, charcoal: false });
  const [boundary, setBoundary] = useState<AdminLevel | null>('state');
  // The panel's level follows the boundaries on the map (state when none).
  const [level, setLevel] = useState<AdminLevel>('state');
  const [place, setPlace] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [layersOpen, setLayersOpen] = useState(false);
  const [topic, setTopic] = useState<'loss' | 'charcoal'>('loss');

  const { data: lossData } = useWatchFile<ForestLoss>('forest-loss.json');
  const { data: charcoal } = useWatchFile<CharcoalByAdmin>('charcoal-by-admin.json');
  const { data: outline } = useWatchFile<FeatureCollection>('somalia-outline.geojson');
  const { data: admin } = useWatchFile<FeatureCollection & { features: Feature[] }>(
    boundary ? ADMIN_FILE[boundary] : null,
  );

  const years = `${Math.min(from, to)}–${Math.max(from, to)}`;
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
  // Turning charcoal on also shows its areas in the panel; off goes back to loss.
  const toggleLayer = (id: keyof ForestLayerState) => {
    const next = !on[id];
    setOn((current) => ({ ...current, [id]: next }));
    if (id === 'charcoal') setTopic(next ? 'charcoal' : 'loss');
  };
  const pickTopic = (id: string) => {
    setTopic(id as 'loss' | 'charcoal');
    if (id === 'charcoal') setOn((current) => ({ ...current, charcoal: true }));
  };
  const topics = [
    { id: 'loss', label: copy.forestLoss },
    { id: 'charcoal', label: copy.charcoalLayer },
  ];
  const panelCommon = { topics, topic, onTopic: pickTopic, level, onLevel: pickLevel, onClose: () => setPanelOpen(false) };
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
        tools={
          <>
            <MapToggleButton icon="chart" on={panelOpen} onToggle={() => setPanelOpen((open) => !open)} label={copy.forestLoss} />
            <MapToggleButton icon="layers" on={layersOpen} onToggle={() => setLayersOpen((open) => !open)} label={copy.mapLayers} />
          </>
        }
        overlay={
          layersOpen ? (
            <MapDialog title={copy.mapLayers} closeLabel={copy.mapClose} onClose={() => setLayersOpen(false)}>
              <ForestLayerList on={on} onToggle={toggleLayer} years={years} boundary={boundary} onBoundary={pickBoundary} />
            </MapDialog>
          ) : null
        }
        legend={<ForestLegend on={on} years={years} />}
        sideBeside
        side={
          !panelOpen ? null : topic === 'charcoal' && charcoal ? (
            <AreaPanel
              {...panelCommon}
              title={copy.charcoalLayer}
              rows={charcoalByUnit(charcoal, level)}
              subtitle="FAO SWALIM, 2018"
              compare={{ a: copy.charcoalExport, b: copy.charcoalLocal }}
              compareColors={{ a: CHARCOAL_COLORS.export, b: CHARCOAL_COLORS.local }}
            />
          ) : lossData ? (
            <AreaPanel
              {...panelCommon}
              title={copy.forestLoss}
              color={FOREST_LAYERS[0]!.color}
              rows={lossByUnit(lossData, level, from, to)}
              subtitle={years}
              onPick={(id) => setPlace((current) => (current === id ? null : id))}
              selectedId={place}
            >
              <LossTrend data={lossData} level={level} place={place} />
            </AreaPanel>
          ) : null
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
        {on.charcoal ? <CharcoalLayer /> : null}
        {boundary && admin ? <AdminBoundaries key={boundary} level={boundary} data={admin} /> : null}
      </WatchMap>
      <WatchSources sources={SOURCES} />
    </article>
  );
}
