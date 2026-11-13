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

/** Places ranked by one kind of charcoal area (e.g. potential export), largest first; places without it left out. */
export const charcoalRanking = (data: CharcoalByAdmin, level: AdminLevel, kind: CharcoalKind): UnitArea[] => {
  const { units, areas } = data.levels[level];
  return units
    .map((unit) => ({ id: unit.id, name: unit.name, ha: areas[unit.id]?.[kind] ?? 0 }))
    .filter((row) => row.ha > 0)
    .sort((x, y) => y.ha - x.ha);
};
