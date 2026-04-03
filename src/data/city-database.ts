/** Country → major cities mapping for dropdowns */
const CITY_DATABASE: Record<string, string[]> = {
  'Morocco': ['Casablanca', 'Marrakech', 'Rabat', 'Fes', 'Tangier', 'Agadir', 'Meknes', 'Oujda', 'Kenitra', 'Tetouan', 'Nador', 'Essaouira', 'El Jadida', 'Ouarzazate', 'Errachidia'],
  'France': ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Toulon', 'Grenoble', 'Dijon', 'Cannes'],
  'Germany': ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig', 'Bremen', 'Dresden', 'Hanover', 'Nuremberg'],
  'Spain': ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Malaga', 'Bilbao', 'Alicante', 'Zaragoza', 'Palma de Mallorca', 'Granada', 'Marbella', 'Ibiza'],
  'Italy': ['Rome', 'Milan', 'Naples', 'Turin', 'Florence', 'Venice', 'Bologna', 'Genoa', 'Palermo', 'Catania', 'Verona', 'Bari'],
  'United Kingdom': ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Liverpool', 'Edinburgh', 'Bristol', 'Cardiff', 'Belfast', 'Oxford', 'Cambridge'],
  'Netherlands': ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Groningen', 'Maastricht'],
  'Belgium': ['Brussels', 'Antwerp', 'Ghent', 'Bruges', 'Liège', 'Namur', 'Charleroi'],
  'Switzerland': ['Zurich', 'Geneva', 'Basel', 'Bern', 'Lausanne', 'Lucerne', 'Lugano', 'Interlaken'],
  'Austria': ['Vienna', 'Salzburg', 'Innsbruck', 'Graz', 'Linz'],
  'Portugal': ['Lisbon', 'Porto', 'Faro', 'Funchal', 'Braga', 'Coimbra'],
  'Greece': ['Athens', 'Thessaloniki', 'Heraklion', 'Mykonos', 'Santorini', 'Rhodes', 'Corfu'],
  'Czech Republic': ['Prague', 'Brno', 'Ostrava', 'Plzen', 'Karlovy Vary'],
  'Poland': ['Warsaw', 'Krakow', 'Gdansk', 'Wroclaw', 'Poznan', 'Lodz'],
  'Hungary': ['Budapest', 'Debrecen', 'Szeged', 'Pecs'],
  'Croatia': ['Zagreb', 'Split', 'Dubrovnik', 'Rijeka', 'Zadar'],
  'Romania': ['Bucharest', 'Cluj-Napoca', 'Timisoara', 'Brasov', 'Constanta'],
  'Sweden': ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala'],
  'Denmark': ['Copenhagen', 'Aarhus', 'Odense'],
  'Norway': ['Oslo', 'Bergen', 'Trondheim', 'Stavanger'],
  'Finland': ['Helsinki', 'Tampere', 'Turku', 'Oulu'],
  'Ireland': ['Dublin', 'Cork', 'Galway', 'Limerick'],
  'Iceland': ['Reykjavik', 'Akureyri'],
  'Luxembourg': ['Luxembourg City', 'Esch-sur-Alzette'],
  'Monaco': ['Monaco'],
  'Liechtenstein': ['Vaduz'],
  'Andorra': ['Andorra la Vella'],
  'Malta': ['Valletta', 'Sliema', 'St. Julian\'s'],
  'Cyprus': ['Nicosia', 'Limassol', 'Larnaca', 'Paphos'],
  'Estonia': ['Tallinn', 'Tartu'],
  'Latvia': ['Riga', 'Jurmala'],
  'Lithuania': ['Vilnius', 'Kaunas'],
  'Slovakia': ['Bratislava', 'Kosice'],
  'Slovenia': ['Ljubljana', 'Maribor', 'Bled'],
  'Bulgaria': ['Sofia', 'Plovdiv', 'Varna', 'Burgas'],
  'Serbia': ['Belgrade', 'Novi Sad', 'Nis'],
  'Montenegro': ['Podgorica', 'Budva', 'Kotor'],
  'Bosnia and Herzegovina': ['Sarajevo', 'Mostar', 'Banja Luka'],
  'North Macedonia': ['Skopje', 'Ohrid'],
  'Albania': ['Tirana', 'Durrës', 'Saranda'],
  'Kosovo': ['Pristina', 'Prizren'],
  'Moldova': ['Chisinau'],
  'Ukraine': ['Kyiv', 'Lviv', 'Odesa', 'Kharkiv'],
  'Turkey': ['Istanbul', 'Ankara', 'Antalya', 'Izmir', 'Bodrum', 'Cappadocia', 'Trabzon'],
};

/** Get sorted list of countries that have cities defined */
export const CITY_COUNTRIES = Object.keys(CITY_DATABASE).sort();

/** Get cities for a given country */
export function getCitiesForCountry(country: string): string[] {
  if (!country) return [];
  const cities = CITY_DATABASE[country];
  if (cities) return cities;
  // Case-insensitive fallback
  const key = Object.keys(CITY_DATABASE).find(k => k.toLowerCase() === country.toLowerCase());
  return key ? CITY_DATABASE[key] : [];
}

export default CITY_DATABASE;
