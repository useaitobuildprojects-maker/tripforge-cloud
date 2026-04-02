/** Country name → ISO 3166-1 alpha-2 mapping for Mapbox country filtering */
const COUNTRY_TO_ISO: Record<string, string> = {
  'afghanistan': 'af', 'albania': 'al', 'algeria': 'dz', 'andorra': 'ad', 'angola': 'ao',
  'argentina': 'ar', 'armenia': 'am', 'australia': 'au', 'austria': 'at', 'azerbaijan': 'az',
  'bahrain': 'bh', 'bangladesh': 'bd', 'belarus': 'by', 'belgium': 'be', 'benin': 'bj',
  'bolivia': 'bo', 'bosnia and herzegovina': 'ba', 'brazil': 'br', 'brunei': 'bn', 'bulgaria': 'bg',
  'burkina faso': 'bf', 'cambodia': 'kh', 'cameroon': 'cm', 'canada': 'ca', 'chad': 'td',
  'chile': 'cl', 'china': 'cn', 'colombia': 'co', 'comoros': 'km', 'congo': 'cg',
  'costa rica': 'cr', 'croatia': 'hr', 'cuba': 'cu', 'cyprus': 'cy', 'czech republic': 'cz',
  'denmark': 'dk', 'djibouti': 'dj', 'dominican republic': 'do', 'dr congo': 'cd',
  'ecuador': 'ec', 'egypt': 'eg', 'el salvador': 'sv', 'equatorial guinea': 'gq',
  'eritrea': 'er', 'estonia': 'ee', 'eswatini': 'sz', 'ethiopia': 'et', 'fiji': 'fj',
  'finland': 'fi', 'france': 'fr', 'gabon': 'ga', 'gambia': 'gm', 'georgia': 'ge',
  'germany': 'de', 'ghana': 'gh', 'greece': 'gr', 'guatemala': 'gt', 'guinea': 'gn',
  'haiti': 'ht', 'honduras': 'hn', 'hungary': 'hu', 'iceland': 'is', 'india': 'in',
  'indonesia': 'id', 'iran': 'ir', 'iraq': 'iq', 'ireland': 'ie', 'israel': 'il',
  'italy': 'it', 'ivory coast': 'ci', 'jamaica': 'jm', 'japan': 'jp', 'jordan': 'jo',
  'kazakhstan': 'kz', 'kenya': 'ke', 'kosovo': 'xk', 'kuwait': 'kw', 'kyrgyzstan': 'kg',
  'laos': 'la', 'latvia': 'lv', 'lebanon': 'lb', 'lesotho': 'ls', 'liberia': 'lr',
  'libya': 'ly', 'liechtenstein': 'li', 'lithuania': 'lt', 'luxembourg': 'lu',
  'madagascar': 'mg', 'malawi': 'mw', 'malaysia': 'my', 'maldives': 'mv', 'mali': 'ml',
  'malta': 'mt', 'mauritania': 'mr', 'mauritius': 'mu', 'mexico': 'mx', 'moldova': 'md',
  'monaco': 'mc', 'mongolia': 'mn', 'montenegro': 'me', 'morocco': 'ma', 'mozambique': 'mz',
  'myanmar': 'mm', 'namibia': 'na', 'nepal': 'np', 'netherlands': 'nl', 'new zealand': 'nz',
  'nicaragua': 'ni', 'niger': 'ne', 'nigeria': 'ng', 'north korea': 'kp',
  'north macedonia': 'mk', 'norway': 'no', 'oman': 'om', 'pakistan': 'pk', 'palestine': 'ps',
  'panama': 'pa', 'paraguay': 'py', 'peru': 'pe', 'philippines': 'ph', 'poland': 'pl',
  'portugal': 'pt', 'qatar': 'qa', 'romania': 'ro', 'russia': 'ru', 'rwanda': 'rw',
  'saudi arabia': 'sa', 'senegal': 'sn', 'serbia': 'rs', 'sierra leone': 'sl',
  'singapore': 'sg', 'slovakia': 'sk', 'slovenia': 'si', 'somalia': 'so', 'south africa': 'za',
  'south korea': 'kr', 'south sudan': 'ss', 'spain': 'es', 'sri lanka': 'lk', 'sudan': 'sd',
  'suriname': 'sr', 'sweden': 'se', 'switzerland': 'ch', 'syria': 'sy', 'taiwan': 'tw',
  'tajikistan': 'tj', 'tanzania': 'tz', 'thailand': 'th', 'togo': 'tg',
  'trinidad and tobago': 'tt', 'tunisia': 'tn', 'turkey': 'tr', 'turkmenistan': 'tm',
  'uae': 'ae', 'uganda': 'ug', 'ukraine': 'ua', 'united kingdom': 'gb',
  'united states': 'us', 'uruguay': 'uy', 'uzbekistan': 'uz', 'vatican city': 'va',
  'venezuela': 've', 'vietnam': 'vn', 'yemen': 'ye', 'zambia': 'zm', 'zimbabwe': 'zw',
};

/** Convert a country name to ISO 3166-1 alpha-2 code */
export function countryToISO(country: string): string | null {
  if (!country) return null;
  const code = COUNTRY_TO_ISO[country.trim().toLowerCase()];
  return code || null;
}
