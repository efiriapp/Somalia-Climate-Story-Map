// Flags are bundled from the MIT-licensed flag-icons package, so the site does
// not depend on an outside flag server.
import so from 'flag-icons/flags/4x3/so.svg';
import gb from 'flag-icons/flags/4x3/gb.svg';
import sa from 'flag-icons/flags/4x3/sa.svg';
import eg from 'flag-icons/flags/4x3/eg.svg';
import rw from 'flag-icons/flags/4x3/rw.svg';
import ke from 'flag-icons/flags/4x3/ke.svg';
import zm from 'flag-icons/flags/4x3/zm.svg';
import et from 'flag-icons/flags/4x3/et.svg';
import gh from 'flag-icons/flags/4x3/gh.svg';
import dj from 'flag-icons/flags/4x3/dj.svg';
import qa from 'flag-icons/flags/4x3/qa.svg';
import az from 'flag-icons/flags/4x3/az.svg';
import ae from 'flag-icons/flags/4x3/ae.svg';
import ch from 'flag-icons/flags/4x3/ch.svg';
import fr from 'flag-icons/flags/4x3/fr.svg';
import br from 'flag-icons/flags/4x3/br.svg';

const COUNTRY_FLAG: Record<string, string> = {
  Somalia: so,
  'United Kingdom': gb,
  'Saudi Arabia': sa,
  Egypt: eg,
  Rwanda: rw,
  Kenya: ke,
  Zambia: zm,
  Ethiopia: et,
  Ghana: gh,
  Djibouti: dj,
  Qatar: qa,
  Azerbaijan: az,
  'United Arab Emirates': ae,
  Switzerland: ch,
  France: fr,
  Brazil: br,
};

export const flagIconUrl = (country: string): string | null => COUNTRY_FLAG[country] ?? null;
