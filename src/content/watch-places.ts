import type { Locale } from '../application/locale';

/** Station and town names for the watch pages, in Somali and Arabic spelling. */
const NAMES: Record<string, { so: string; ar: string }> = {
  beledweyne: { so: 'Beledweyne', ar: 'بلدوين' },
  'bulo-burte': { so: 'Buulobarde', ar: 'بولو بورتي' },
  jowhar: { so: 'Jowhar', ar: 'جوهر' },
  afgooye: { so: 'Afgooye', ar: 'أفغوي' },
  luuq: { so: 'Luuq', ar: 'لوق' },
  bardheere: { so: 'Baardheere', ar: 'بارديري' },
  jamaame: { so: 'Jamaame', ar: 'جمامي' },
  hargeisa: { so: 'Hargeysa', ar: 'هرجيسا' },
  burao: { so: 'Burco', ar: 'برعو' },
  bosaso: { so: 'Boosaaso', ar: 'بوصاصو' },
  garowe: { so: 'Garoowe', ar: 'جاروي' },
  galkayo: { so: 'Gaalkacyo', ar: 'جالكعيو' },
  dhusamareb: { so: 'Dhuusamareeb', ar: 'طوسمريب' },
  baidoa: { so: 'Baydhabo', ar: 'بيدوا' },
  mogadishu: { so: 'Muqdisho', ar: 'مقديشو' },
  kismayo: { so: 'Kismaayo', ar: 'كسمايو' },
};

export const placeName = (id: string, englishName: string, locale: Locale): string =>
  locale === 'en' ? englishName : (NAMES[id]?.[locale] ?? englishName);
