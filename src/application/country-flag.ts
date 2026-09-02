const COUNTRY_FLAG_CODE: Record<string, string> = {
  Somalia: 'so',
  Egypt: 'eg',
  Rwanda: 'rw',
  Kenya: 'ke',
  Zambia: 'zm',
  Ethiopia: 'et',
  Ghana: 'gh',
  Djibouti: 'dj',
  Qatar: 'qa',
  Azerbaijan: 'az',
  'United Arab Emirates': 'ae',
  Switzerland: 'ch',
  France: 'fr',
  Brazil: 'br',
};

export const flagIconUrl = (country: string): string | null => {
  const code = COUNTRY_FLAG_CODE[country];
  return code ? `https://flagcdn.com/w40/${code}.png` : null;
};
