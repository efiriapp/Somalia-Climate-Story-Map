import type { AdminLevel, UnitArea } from './flood-history';

export type CharcoalKind = 'export' | 'local' | 'studied';

/** Charcoal production areas by place, from scripts/charcoal-areas.mjs. */
export type CharcoalByAdmin = {
  generated: string;
  method: string;
  kinds: CharcoalKind[];
  levels: Record<
    AdminLevel,
    { units: { id: string; name: string }[]; areas: Record<string, Record<CharcoalKind, number>> }
  >;
};

/** Map colours: red areas, export darker, local lighter; the study area as an outline. */
export const CHARCOAL_COLORS: Record<CharcoalKind, string> = {
  export: '#b3261e',
  local: '#f07a6a',
  studied: '#3d3d3a',
};

/**
 * Rows for the side panel: export hectares in `ha`, local in `b`, most
 * charcoal area first. Places with only the studied area are left out.
 */
export const charcoalByUnit = (data: CharcoalByAdmin, level: AdminLevel): UnitArea[] => {
  const { units, areas } = data.levels[level];
  return units
    .map((unit) => ({ id: unit.id, name: unit.name, ha: areas[unit.id]?.export ?? 0, b: areas[unit.id]?.local ?? 0 }))
    .filter((row) => row.ha + row.b > 0)
    .sort((x, y) => y.ha + y.b - (x.ha + x.b));
};
