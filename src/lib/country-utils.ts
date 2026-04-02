/** Country display name → ISO 3166-1 alpha-2 code */
const COUNTRY_MAP: Record<string, string> = {
  'Afghanistan': 'af', 'Albania': 'al', 'Algeria': 'dz', 'Andorra': 'ad', 'Angola': 'ao',
  'Argentina': 'ar', 'Armenia': 'am', 'Australia': 'au', 'Austria': 'at', 'Azerbaijan': 'az',
  'Bahrain': 'bh', 'Bangladesh': 'bd', 'Belarus': 'by', 'Belgium': 'be', 'Benin': 'bj',
  'Bolivia': 'bo', 'Bosnia and Herzegovina': 'ba', 'Brazil': 'br', 'Brunei': 'bn', 'Bulgaria': 'bg',
  'Burkina Faso': 'bf', 'Cambodia': 'kh', 'Cameroon': 'cm', 'Canada': 'ca', 'Chad': 'td',
  'Chile': 'cl', 'China': 'cn', 'Colombia': 'co', 'Comoros': 'km', 'Congo': 'cg',
  'Costa Rica': 'cr', 'Croatia': 'hr', 'Cuba': 'cu', 'Cyprus': 'cy', 'Czech Republic': 'cz',
  'Denmark': 'dk', 'Djibouti': 'dj', 'Dominican Republic': 'do', 'DR Congo': 'cd',
  'Ecuador': 'ec', 'Egypt': 'eg', 'El Salvador': 'sv', 'Equatorial Guinea': 'gq',
  'Eritrea': 'er', 'Estonia': 'ee', 'Eswatini': 'sz', 'Ethiopia': 'et', 'Fiji': 'fj',
  'Finland': 'fi', 'France': 'fr', 'Gabon': 'ga', 'Gambia': 'gm', 'Georgia': 'ge',
  'Germany': 'de', 'Ghana': 'gh', 'Greece': 'gr', 'Guatemala': 'gt', 'Guinea': 'gn',
  'Haiti': 'ht', 'Honduras': 'hn', 'Hungary': 'hu', 'Iceland': 'is', 'India': 'in',
  'Indonesia': 'id', 'Iran': 'ir', 'Iraq': 'iq', 'Ireland': 'ie', 'Israel': 'il',
  'Italy': 'it', 'Ivory Coast': 'ci', 'Jamaica': 'jm', 'Japan': 'jp', 'Jordan': 'jo',
  'Kazakhstan': 'kz', 'Kenya': 'ke', 'Kosovo': 'xk', 'Kuwait': 'kw', 'Kyrgyzstan': 'kg',
  'Laos': 'la', 'Latvia': 'lv', 'Lebanon': 'lb', 'Lesotho': 'ls', 'Liberia': 'lr',
  'Libya': 'ly', 'Liechtenstein': 'li', 'Lithuania': 'lt', 'Luxembourg': 'lu',
  'Madagascar': 'mg', 'Malawi': 'mw', 'Malaysia': 'my', 'Maldives': 'mv', 'Mali': 'ml',
  'Malta': 'mt', 'Mauritania': 'mr', 'Mauritius': 'mu', 'Mexico': 'mx', 'Moldova': 'md',
  'Monaco': 'mc', 'Mongolia': 'mn', 'Montenegro': 'me', 'Morocco': 'ma', 'Mozambique': 'mz',
  'Myanmar': 'mm', 'Namibia': 'na', 'Nepal': 'np', 'Netherlands': 'nl', 'New Zealand': 'nz',
  'Nicaragua': 'ni', 'Niger': 'ne', 'Nigeria': 'ng', 'North Korea': 'kp',
  'North Macedonia': 'mk', 'Norway': 'no', 'Oman': 'om', 'Pakistan': 'pk', 'Palestine': 'ps',
  'Panama': 'pa', 'Paraguay': 'py', 'Peru': 'pe', 'Philippines': 'ph', 'Poland': 'pl',
  'Portugal': 'pt', 'Qatar': 'qa', 'Romania': 'ro', 'Russia': 'ru', 'Rwanda': 'rw',
  'Saudi Arabia': 'sa', 'Senegal': 'sn', 'Serbia': 'rs', 'Sierra Leone': 'sl',
  'Singapore': 'sg', 'Slovakia': 'sk', 'Slovenia': 'si', 'Somalia': 'so', 'South Africa': 'za',
  'South Korea': 'kr', 'South Sudan': 'ss', 'Spain': 'es', 'Sri Lanka': 'lk', 'Sudan': 'sd',
  'Suriname': 'sr', 'Sweden': 'se', 'Switzerland': 'ch', 'Syria': 'sy', 'Taiwan': 'tw',
  'Tajikistan': 'tj', 'Tanzania': 'tz', 'Thailand': 'th', 'Togo': 'tg',
  'Trinidad and Tobago': 'tt', 'Tunisia': 'tn', 'Turkey': 'tr', 'Turkmenistan': 'tm',
  'UAE': 'ae', 'Uganda': 'ug', 'Ukraine': 'ua', 'United Kingdom': 'gb',
  'United States': 'us', 'Uruguay': 'uy', 'Uzbekistan': 'uz', 'Vatican City': 'va',
  'Venezuela': 've', 'Vietnam': 'vn', 'Yemen': 'ye', 'Zambia': 'zm', 'Zimbabwe': 'zw',
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
