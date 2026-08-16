export const THEMES = [
  { slug: 'youth', label: 'Youth' },
  { slug: 'green-enterprise', label: 'Green enterprise' },
  { slug: 'waste-energy', label: 'Waste and energy' },
  { slug: 'oceans', label: 'Oceans and coasts' },
  { slug: 'drought-water', label: 'Drought and water' },
  { slug: 'art-communication', label: 'Art and communication' },
  { slug: 'education', label: 'Education' },
  { slug: 'policy-diplomacy', label: 'Policy and diplomacy' },
  { slug: 'climate-mobility', label: 'Climate mobility' },
  { slug: 'partnerships', label: 'Partnerships' },
] as const;

export type ThemeSlug = (typeof THEMES)[number]['slug'];
