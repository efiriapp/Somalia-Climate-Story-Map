export type Locale = 'en' | 'so';

export const CHROME = {
  en: {
    platform: 'Somali Climate Data Storytelling Platform',
    about: 'About ICE Institute',
    research: 'ICE Institute Research Stories',
    stories: 'Stories',
    climateImpact: 'Climate Impact',
    globalStage: 'ICE at Global Stage',
    languageToggle: 'Af-Soomaali',
    languageToggleLabel: 'Switch to Somali',
    search: 'Search',
    searchPlaceholder: 'Search by keywords',
    advanced: 'Advanced options',
    latestStories: 'Latest stories',
    backCatalog: '← Back to catalog',
    backClimate: '← Back to Climate Impact',
    moreInfo: 'More information:',
    story: 'Story',
    researchLabel: 'Research',
    floods: 'Floods',
    droughts: 'Droughts',
    heatWaves: 'Heat waves',
    elNino: 'El Niño',
    laNina: 'La Niña',
  },
  so: {
    platform: 'Barnaamijka Sheekaynta Xogta Cimilada Soomaaliyeed',
    about: 'Ku saabsan Machadka ICE',
    research: 'Sheekooyinka Cilmi-baarista Machadka ICE',
    stories: 'Sheekooyin',
    climateImpact: 'Saamaynta Cimilada',
    globalStage: 'ICE ee Marxaladda Caalamiga',
    languageToggle: 'English',
    languageToggleLabel: 'U beddel Ingiriisiga',
    search: 'Raadso',
    searchPlaceholder: 'Ku raadso erayada',
    advanced: 'Doorashooyin dheeraad ah',
    latestStories: 'Sheekooyinka ugu dambeeyay',
    backCatalog: '← Ku noqo liiska',
    backClimate: '← Ku noqo Saamaynta Cimilada',
    moreInfo: 'Macluumaad dheeraad ah:',
    story: 'Sheeko',
    researchLabel: 'Cilmi-baaris',
    floods: 'Daadad',
    droughts: 'Abaaraha',
    heatWaves: 'Hirarka kulaylka',
    elNino: 'El Niño',
    laNina: 'La Niña',
  },
} as const;

export const chromeCopy = (locale: Locale) => CHROME[locale];

export const hazardTitle = (
  id: 'floods' | 'droughts' | 'heat-waves' | 'el-nino' | 'la-nina',
  copy: ReturnType<typeof chromeCopy>,
): string => {
  if (id === 'floods') return copy.floods;
  if (id === 'droughts') return copy.droughts;
  if (id === 'heat-waves') return copy.heatWaves;
  if (id === 'el-nino') return copy.elNino;
  return copy.laNina;
};
