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
  'Turkey': ['Istanbul', 'Ankara', 'Antalya', 'Izmir', 'Bodrum', 'Cappadocia', 'Trabzon'],
  'UAE': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah'],
  'Saudi Arabia': ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar'],
  'Egypt': ['Cairo', 'Alexandria', 'Hurghada', 'Sharm El Sheikh', 'Luxor', 'Aswan'],
  'Tunisia': ['Tunis', 'Sousse', 'Sfax', 'Hammamet', 'Djerba', 'Monastir'],
  'Algeria': ['Algiers', 'Oran', 'Constantine', 'Annaba', 'Tlemcen'],
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
  'United States': ['New York', 'Los Angeles', 'Chicago', 'Miami', 'San Francisco', 'Las Vegas', 'Washington DC', 'Boston', 'Houston', 'Dallas', 'Atlanta', 'Seattle', 'Denver', 'Orlando'],
  'Canada': ['Toronto', 'Montreal', 'Vancouver', 'Ottawa', 'Calgary', 'Edmonton', 'Quebec City'],
  'Mexico': ['Mexico City', 'Cancún', 'Guadalajara', 'Monterrey', 'Playa del Carmen', 'Los Cabos'],
  'Brazil': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Recife'],
  'Argentina': ['Buenos Aires', 'Córdoba', 'Mendoza', 'Rosario', 'Bariloche'],
  'Japan': ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Nagoya', 'Sapporo', 'Fukuoka'],
  'South Korea': ['Seoul', 'Busan', 'Incheon', 'Jeju'],
  'China': ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Hangzhou', 'Xi\'an'],
  'India': ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Jaipur', 'Goa'],
  'Thailand': ['Bangkok', 'Phuket', 'Chiang Mai', 'Pattaya', 'Krabi'],
  'Singapore': ['Singapore'],
  'Malaysia': ['Kuala Lumpur', 'Penang', 'Langkawi', 'Johor Bahru'],
  'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast'],
  'New Zealand': ['Auckland', 'Wellington', 'Christchurch', 'Queenstown'],
  'South Africa': ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria'],
  'Kenya': ['Nairobi', 'Mombasa'],
  'Nigeria': ['Lagos', 'Abuja', 'Port Harcourt'],
  'Qatar': ['Doha'],
  'Bahrain': ['Manama'],
  'Kuwait': ['Kuwait City'],
  'Oman': ['Muscat', 'Salalah'],
  'Jordan': ['Amman', 'Aqaba', 'Petra'],
  'Lebanon': ['Beirut', 'Byblos', 'Tripoli'],
  'Israel': ['Tel Aviv', 'Jerusalem', 'Haifa', 'Eilat'],
  'Colombia': ['Bogotá', 'Medellín', 'Cartagena', 'Cali'],
  'Chile': ['Santiago', 'Valparaíso', 'Viña del Mar'],
  'Peru': ['Lima', 'Cusco', 'Arequipa'],
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
