import banadir from '../../assets/state-flags/banadir.svg';
import galmudug from '../../assets/state-flags/galmudug.svg';
import hirshabelle from '../../assets/state-flags/hirshabelle.svg';
import jubaland from '../../assets/state-flags/jubaland.svg';
import northEastern from '../../assets/state-flags/north-eastern.svg';
import puntland from '../../assets/state-flags/puntland.svg';
import somaliland from '../../assets/state-flags/somaliland.svg';
import southWest from '../../assets/state-flags/south-west.svg';
import type { WatchSource } from './WatchSources';

/** Flag of every state on the map (Banadir: the city and region's coat of arms). */
export const STATE_FLAGS: Record<string, string> = {
  banadir,
  galmudug,
  hirshabelle,
  jubaland,
  'north-eastern': northEastern,
  puntland,
  somaliland,
  'south-west': southWest,
};

const commons = (file: string) => `https://commons.wikimedia.org/wiki/File:${file}`;

/** Credits for the flags, for the Sources list of every page that shows them. */
export const STATE_FLAG_SOURCES: WatchSource[] = [
  { text: 'Flag of Jubaland, by Derkommander0916, Wikimedia Commons, CC BY-SA 4.0.', url: commons('Flag_of_Jubaland_(Somalia).svg') },
  { text: 'Flag of Galmudug, by Przemyslaw D. Gacia, Wikimedia Commons, CC BY-SA 3.0.', url: commons('Flag_of_Galmudug_State_of_Somalia_(2015).svg') },
  { text: 'Flag of South West State, by Himasaram, Wikimedia Commons, public domain.', url: commons('Flag_of_South_West_State_of_Somalia.svg') },
  { text: 'Flag of Hirshabelle, by Zabezt, Wikimedia Commons, public domain.', url: commons('Flag_of_Hirshabelle.svg') },
  { text: 'Flag of Puntland, Wikimedia Commons, public domain.', url: commons('Flag_of_Puntland.svg') },
  { text: 'Flag of Somaliland, Wikimedia Commons, public domain.', url: commons('Flag_of_Somaliland.svg') },
  { text: 'Flag of North Eastern State, by Wowzers122, Wikimedia Commons, CC0.', url: commons('Flag_of_North_Eastern_State_of_Somalia.svg') },
  {
    text: 'Coat of arms of Mogadishu City and Banaadir Region (Daauus Agency; vector by RVD3), Wikimedia Commons, public domain.',
    url: commons('Coat_of_Arms_of_Mogadishu_City_and_Banaadir_Region.svg'),
  },
];
