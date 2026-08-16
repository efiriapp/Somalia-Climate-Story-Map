export type RegionSlug =
  | 'awdal'
  | 'woqooyi-galbeed'
  | 'togdheer'
  | 'sool'
  | 'sanaag'
  | 'bari'
  | 'nugaal'
  | 'mudug'
  | 'galgaduud'
  | 'hiraan'
  | 'middle-shabelle'
  | 'banaadir'
  | 'lower-shabelle'
  | 'bakool'
  | 'bay'
  | 'gedo'
  | 'middle-juba'
  | 'lower-juba';

export type Region = { slug: RegionSlug; label: string };
export type District = { slug: string; label: string; region: RegionSlug };

export const REGIONS: Region[] = [
  { slug: 'awdal', label: 'Awdal' },
  { slug: 'woqooyi-galbeed', label: 'Woqooyi Galbeed' },
  { slug: 'togdheer', label: 'Togdheer' },
  { slug: 'sool', label: 'Sool' },
  { slug: 'sanaag', label: 'Sanaag' },
  { slug: 'bari', label: 'Bari' },
  { slug: 'nugaal', label: 'Nugaal' },
  { slug: 'mudug', label: 'Mudug' },
  { slug: 'galgaduud', label: 'Galgaduud' },
  { slug: 'hiraan', label: 'Hiraan' },
  { slug: 'middle-shabelle', label: 'Middle Shabelle' },
  { slug: 'banaadir', label: 'Banaadir' },
  { slug: 'lower-shabelle', label: 'Lower Shabelle' },
  { slug: 'bakool', label: 'Bakool' },
  { slug: 'bay', label: 'Bay' },
  { slug: 'gedo', label: 'Gedo' },
  { slug: 'middle-juba', label: 'Middle Juba' },
  { slug: 'lower-juba', label: 'Lower Juba' },
];

const d = (region: RegionSlug, slug: string, label: string): District => ({
  region,
  slug,
  label,
});

export const DISTRICTS: District[] = [
  d('awdal', 'baki', 'Baki'),
  d('awdal', 'borama', 'Borama'),
  d('awdal', 'lughaya', 'Lughaya'),
  d('awdal', 'zeylac', 'Zeylac'),
  d('woqooyi-galbeed', 'berbera', 'Berbera'),
  d('woqooyi-galbeed', 'gebiley', 'Gebiley'),
  d('woqooyi-galbeed', 'hargeisa', 'Hargeisa'),
  d('togdheer', 'burao', 'Burao'),
  d('togdheer', 'buhoodle', 'Buhoodle'),
  d('togdheer', 'odweyne', 'Odweyne'),
  d('togdheer', 'sheikh', 'Sheikh'),
  d('sool', 'caynabo', 'Caynabo'),
  d('sool', 'laas-caanood', 'Laas Caanood'),
  d('sool', 'taleex', 'Taleex'),
  d('sool', 'xudun', 'Xudun'),
  d('sanaag', 'ceel-afweyn', 'Ceel Afweyn'),
  d('sanaag', 'ceerigaabo', 'Ceerigaabo'),
  d('sanaag', 'laasqoray', 'Laasqoray'),
  d('bari', 'bandarbayla', 'Bandarbayla'),
  d('bari', 'bossaso', 'Bossaso'),
  d('bari', 'caluula', 'Caluula'),
  d('bari', 'iskushuban', 'Iskushuban'),
  d('bari', 'qandala', 'Qandala'),
  d('bari', 'qardho', 'Qardho'),
  d('nugaal', 'burtinle', 'Burtinle'),
  d('nugaal', 'eyl', 'Eyl'),
  d('nugaal', 'garowe', 'Garowe'),
  d('mudug', 'gaalkacyo', 'Gaalkacyo'),
  d('mudug', 'galdogob', 'Galdogob'),
  d('mudug', 'hobyo', 'Hobyo'),
  d('mudug', 'jariiban', 'Jariiban'),
  d('mudug', 'xarardheere', 'Xarardheere'),
  d('galgaduud', 'cabudwaaq', 'Cabudwaaq'),
  d('galgaduud', 'cadaado', 'Cadaado'),
  d('galgaduud', 'ceel-buur', 'Ceel Buur'),
  d('galgaduud', 'ceel-dheer', 'Ceel Dheer'),
  d('galgaduud', 'dhuusamarreeb', 'Dhuusamarreeb'),
  d('hiraan', 'belet-weyne', 'Belet Weyne'),
  d('hiraan', 'bulo-burto', 'Bulo Burto'),
  d('hiraan', 'jalalaqsi', 'Jalalaqsi'),
  d('middle-shabelle', 'adan-yabaal', 'Adan Yabaal'),
  d('middle-shabelle', 'balcad', 'Balcad'),
  d('middle-shabelle', 'cadale', 'Cadale'),
  d('middle-shabelle', 'jowhar', 'Jowhar'),
  d('banaadir', 'abdiaziz', 'Abdiaziz'),
  d('banaadir', 'bondhere', 'Bondhere'),
  d('banaadir', 'daynile', 'Daynile'),
  d('banaadir', 'dharkenley', 'Dharkenley'),
  d('banaadir', 'hamar-jajab', 'Hamar Jajab'),
  d('banaadir', 'hamar-weyne', 'Hamar Weyne'),
  d('banaadir', 'hodan', 'Hodan'),
  d('banaadir', 'howlwadaag', 'Howlwadaag'),
  d('banaadir', 'huriwa', 'Huriwa'),
  d('banaadir', 'karan', 'Karan'),
  d('banaadir', 'shangani', 'Shangani'),
  d('banaadir', 'shibis', 'Shibis'),
  d('banaadir', 'waberi', 'Waberi'),
  d('banaadir', 'wadajir', 'Wadajir'),
  d('banaadir', 'warta-nabada', 'Warta Nabada'),
  d('banaadir', 'yaqshid', 'Yaqshid'),
  d('banaadir', 'kahda', 'Kahda'),
  d('banaadir', 'garasbaley', 'Garasbaley'),
  d('lower-shabelle', 'afgooye', 'Afgooye'),
  d('lower-shabelle', 'baraawe', 'Baraawe'),
  d('lower-shabelle', 'kurtunwaarey', 'Kurtunwaarey'),
  d('lower-shabelle', 'marka', 'Marka'),
  d('lower-shabelle', 'qoryooley', 'Qoryooley'),
  d('lower-shabelle', 'sablaale', 'Sablaale'),
  d('lower-shabelle', 'wanla-weyn', 'Wanla Weyn'),
  d('bakool', 'ceel-barde', 'Ceel Barde'),
  d('bakool', 'rab-dhuure', 'Rab Dhuure'),
  d('bakool', 'tayeeglow', 'Tayeeglow'),
  d('bakool', 'waajid', 'Waajid'),
  d('bakool', 'xudur', 'Xudur'),
  d('bay', 'baidoa', 'Baidoa'),
  d('bay', 'buur-hakaba', 'Buur Hakaba'),
  d('bay', 'diinsoor', 'Diinsoor'),
  d('bay', 'qansax-dheere', 'Qansax Dheere'),
  d('gedo', 'baardheere', 'Baardheere'),
  d('gedo', 'belet-xaawo', 'Belet Xaawo'),
  d('gedo', 'ceel-waaq', 'Ceel Waaq'),
  d('gedo', 'doolow', 'Doolow'),
  d('gedo', 'garbahaarey', 'Garbahaarey'),
  d('gedo', 'luuq', 'Luuq'),
  d('middle-juba', 'buaale', "Bu'aale"),
  d('middle-juba', 'jilib', 'Jilib'),
  d('middle-juba', 'saakow', 'Saakow'),
  d('lower-juba', 'afmadow', 'Afmadow'),
  d('lower-juba', 'badhaadhe', 'Badhaadhe'),
  d('lower-juba', 'jamaame', 'Jamaame'),
  d('lower-juba', 'kismaayo', 'Kismaayo'),
];

export const districtsForRegion = (region: RegionSlug | 'all'): District[] => {
  const list = region === 'all' ? DISTRICTS : DISTRICTS.filter((district) => district.region === region);
  return [...list].sort((a, b) => a.label.localeCompare(b.label));
};
