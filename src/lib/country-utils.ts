/** Country display name → ISO 3166-1 alpha-2 code (Europe + Morocco/Turkey) */
const COUNTRY_MAP: Record<string, string> = {
  'Albania': 'al', 'Andorra': 'ad', 'Austria': 'at', 'Belgium': 'be',
  'Bosnia and Herzegovina': 'ba', 'Bulgaria': 'bg', 'Croatia': 'hr', 'Cyprus': 'cy',
  'Czech Republic': 'cz', 'Denmark': 'dk', 'Estonia': 'ee', 'Finland': 'fi',
  'France': 'fr', 'Germany': 'de', 'Greece': 'gr', 'Hungary': 'hu',
  'Iceland': 'is', 'Ireland': 'ie', 'Italy': 'it', 'Kosovo': 'xk',
  'Latvia': 'lv', 'Liechtenstein': 'li', 'Lithuania': 'lt', 'Luxembourg': 'lu',
  'Malta': 'mt', 'Moldova': 'md', 'Monaco': 'mc', 'Montenegro': 'me',
  'Morocco': 'ma', 'Netherlands': 'nl', 'North Macedonia': 'mk', 'Norway': 'no',
  'Poland': 'pl', 'Portugal': 'pt', 'Romania': 'ro', 'Serbia': 'rs',
  'Slovakia': 'sk', 'Slovenia': 'si', 'Spain': 'es', 'Sweden': 'se',
  'Switzerland': 'ch', 'Turkey': 'tr', 'Ukraine': 'ua', 'United Kingdom': 'gb',
};

/** Sorted list of country names for dropdowns */
export const COUNTRY_LIST = Object.keys(COUNTRY_MAP).sort();

/** Convert a country name to ISO 3166-1 alpha-2 code */
export function countryToISO(country: string): string | null {
  if (!country) return null;
  // Try exact match first, then case-insensitive
  if (COUNTRY_MAP[country]) return COUNTRY_MAP[country];
  const lower = country.trim().toLowerCase();
  const entry = Object.entries(COUNTRY_MAP).find(([k]) => k.toLowerCase() === lower);
  return entry ? entry[1] : null;
}
