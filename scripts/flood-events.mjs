/**
 * The FAO SWALIM flood maps used on Flood Watch, shared by
 * prepare-watch-data.mjs (map layers) and flood-areas.mjs (areas).
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const SRC = join(ROOT, 'Sources', 'Data', 'extracted');
export const FLOODS = 'floods/SOM_Flood Data';
export const RECENT = `${FLOODS}/recent`;

export const FLOOD_EVENTS = [
  { id: 'flood-deyr-2013', season: 'deyr', year: 2013, file: `${FLOODS}/16/SOM_Juba_Shabelle_River_Floods_Deyr_2013.shp`, layer: 'SOM_Juba_Shabelle_River_Floods_Deyr_2013' },
  { id: 'flood-gu-2015', season: 'gu', year: 2015, file: `${FLOODS}/13/SOM_Juba_Shabelle_River_Floods_Gu_2015.shp`, layer: 'SOM_Juba_Shabelle_River_Floods_Gu_2015' },
  { id: 'flood-gu-2016', season: 'gu', year: 2016, file: `${FLOODS}/10/SOM_Juba_Shabelle_River_Floods_Gu_2016.shp`, layer: 'SOM_Juba_Shabelle_River_Floods_Gu_2016' },
  { id: 'flood-gu-2018', season: 'gu', year: 2018, file: `${FLOODS}/19/SOM_Juba_Shabelle_River_Floods_Gu_20180.shp`, layer: 'SOM_Juba_Shabelle_River_Floods_Gu_20180' },
  { id: 'flood-deyr-2018', season: 'deyr', year: 2018, file: `${FLOODS}/7/SOM_Juba_Shabelle_River_Floods_Deyr_20180.shp`, layer: 'SOM_Juba_Shabelle_River_Floods_Deyr_20180' },
  { id: 'flood-gu-2019', season: 'gu', year: 2019, file: `${FLOODS}/18/SOM_Juba_Shabelle_River_Floods_Gu_2019.shp`, layer: 'SOM_Juba_Shabelle_River_Floods_Gu_2019' },
  { id: 'flood-shabelle-2019-10-30', season: 'deyr', year: 2019, date: '2019-10-30', river: 'shabelle', typeField: 'Floodtype', file: `${FLOODS}/17/Shabelle_River_Flooding_30th_Oct_2019.shp`, layer: 'Shabelle_River_Flooding_30th_Oct_2019' },
  { id: 'flood-juba-2019-11-10', season: 'deyr', year: 2019, date: '2019-11-10', river: 'juba', typeField: 'Flood_Type', file: `${FLOODS}/3/Som_Juba_River_Flooding_As_at_10th_Nov_2019.shp`, layer: 'Som_Juba_River_Flooding_As_at_10th_Nov_2019' },
  { id: 'flood-deyr-2019', season: 'deyr', year: 2019, file: `${FLOODS}/6/SOM_Juba_Shabelle_River_Floods_Deyr_2019.shp`, layer: 'SOM_Juba_Shabelle_River_Floods_Deyr_2019' },
  { id: 'flood-gu-2020', season: 'gu', year: 2020, file: `${FLOODS}/15/Som_Juba_Shabelle_Flooding_Gu_2020.shp`, layer: 'Som_Juba_Shabelle_Flooding_Gu_2020' },
  { id: 'flood-hagaa-2020', season: 'hagaa', year: 2020, date: '2020-09-11', river: 'shabelle', file: `${FLOODS}/1/Shabelle_Hagaa_Floods_11092020.shp`, layer: 'Shabelle_Hagaa_Floods_11092020' },
  { id: 'flood-gu-2021', season: 'gu', year: 2021, file: `${FLOODS}/8/Som_Juba_Shabelle_River_Floods_Gu_2021.shp`, layer: 'Som_Juba_Shabelle_River_Floods_Gu_2021' },
  { id: 'flood-gu-2023', season: 'gu', year: 2023, file: `${RECENT}/Juba Shabelle River Floods - Gu 2023/398602d8-53a3-4a5b-9064-6cfd40197323/juba_shabelle_river_floods_gu_2023.shp` },
  // 84,788 source shapes: coarser detail keeps the file small enough for phones.
  { id: 'flood-deyr-2023', season: 'deyr', year: 2023, note: 'El Niño', detail: 60, minArea: 20000, file: `${RECENT}/Juba Shabelle River Floods - Elnino - Deyr 2023/b75f5049-2a35-4976-8a0c-cbf6965aaee2/som_floods_elnino_deyr_2023.shp` },
  { id: 'flood-gu-2024', season: 'gu', year: 2024, file: `${RECENT}/Juba Shabelle River Floods - Gu 2024/fe1a04b2-0547-4c0d-b191-4e0de2ff1116/som_juba_shabelle_floods_gu_2024.shp` },
  { id: 'flood-gu-2025-jowhar', season: 'gu', year: 2025, river: 'shabelle', place: 'Jowhar', file: `${RECENT}/Data - Floods GU 2025 (Jowhar)/014336cb-5c4a-4a98-9af6-c365d96576cc/floods_gu_2025.shp` },
];
