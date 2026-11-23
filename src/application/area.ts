/**
 * Areas on the site are shown in km². The data files keep hectares (the
 * unit the scripts measure in); these turn them into km² for display.
 */

/** 100 ha = 1 km². */
export const haToKm2 = (ha: number): number => ha / 100;

/** km² as text: whole numbers from 100, one decimal from 1, two below (so small areas never read 0). */
export const formatKm2 = (ha: number): string => {
  const km2 = haToKm2(ha);
  const digits = km2 >= 100 ? 0 : km2 >= 1 ? 1 : 2;
  return km2.toLocaleString('en', { maximumFractionDigits: digits });
};
