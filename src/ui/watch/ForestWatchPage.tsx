import { useState } from 'react';
import { GeoJSON, Pane, TileLayer } from 'react-leaflet';
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
import { CHARCOAL_COLORS, charcoalByUnit, type CharcoalByAdmin, type CharcoalKind } from '../../application/charcoal';
import { PanelToggleButton } from '../map/PanelToggleButton';
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
  const [panelOpen, setPanelOpen] = useState(true);
  // The panel shows tree cover loss or charcoal areas; the charcoal layer is on with its topic.
  const [topic, setTopic] = useState<'loss' | 'charcoal'>('loss');
  const showCharcoal = topic === 'charcoal';
  const { data: charcoal } = useWatchFile<CharcoalByAdmin>('charcoal-by-admin.json');
  const { data: charcoalMap } = useWatchFile<FeatureCollection & { features: Feature[] }>(
    showCharcoal ? 'charcoal-areas.geojson' : null,
  );
  const charcoalName: Record<CharcoalKind, string> = {
    export: copy.charcoalExport,
    local: copy.charcoalLocal,
    studied: copy.charcoalStudied,
  };
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
  const topics = [
    { id: 'loss', label: copy.forestLoss },
    { id: 'charcoal', label: copy.charcoalLayer },
  ];
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
        tools={
          <PanelToggleButton on={panelOpen} onToggle={() => setPanelOpen((open) => !open)} label={copy.forestLoss} />
        }
        side={
          panelOpen && showCharcoal && charcoal ? (
            <AreaPanel
              title={copy.charcoalLayer}
              topics={topics}
              topic={topic}
              onTopic={(id) => setTopic(id as 'loss' | 'charcoal')}
              level={level}
              onLevel={pickLevel}
              rows={charcoalByUnit(charcoal, level)}
              subtitle="FAO SWALIM, 2018"
              compare={{ a: copy.charcoalExport, b: copy.charcoalLocal }}
              compareColors={{ a: CHARCOAL_COLORS.export, b: CHARCOAL_COLORS.local }}
              onClose={() => setPanelOpen(false)}
            />
          ) : lossData && panelOpen ? (
            <AreaPanel
              title={copy.forestLoss}
              topics={topics}
              topic={topic}
              onTopic={(id) => setTopic(id as 'loss' | 'charcoal')}
              color={FOREST_LAYERS[0]!.color}
              level={level}
              onLevel={pickLevel}
              rows={lossByUnit(lossData, level, from, to)}
              subtitle={`${Math.min(from, to)}–${Math.max(from, to)}`}
              onPick={(id) => setPlace((current) => (current === id ? null : id))}
              selectedId={place}
              onClose={() => setPanelOpen(false)}
            >
              <LossTrend data={lossData} level={level} place={place} />
            </AreaPanel>
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
            <label>
              <input type="checkbox" checked={showCharcoal} onChange={() => setTopic(showCharcoal ? 'loss' : 'charcoal')} />
              <span className="legend-key" style={{ background: CHARCOAL_COLORS.export }} aria-hidden="true" />
              {copy.charcoalLayer}
            </label>
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
        {showCharcoal && charcoalMap ? (
          <GeoJSON
            key="charcoal"
            data={charcoalMap}
            style={(feature) => {
              const kind = feature?.properties?.kind as CharcoalKind;
              return kind === 'studied'
                ? { color: CHARCOAL_COLORS.studied, weight: 1.5, dashArray: '5 4', fill: false }
                : { color: CHARCOAL_COLORS[kind], weight: 1, fillColor: CHARCOAL_COLORS[kind], fillOpacity: 0.5 };
            }}
            onEachFeature={(feature, layer) =>
              layer.bindTooltip(charcoalName[feature.properties?.kind as CharcoalKind] ?? '', { sticky: true })
            }
          />
        ) : null}
        {boundary && admin ? <AdminBoundaries key={boundary} level={boundary} data={admin} /> : null}
      </WatchMap>
      <WatchSources sources={SOURCES} />
    </article>
  );
}
