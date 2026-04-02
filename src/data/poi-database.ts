/**
 * Built-in POI database for instant, accurate autocomplete results.
 * Organized by country — the autocomplete filters by the agency's operating countries.
 * This mimics how Sixt uses their own station database for reliable search.
 */

export interface POI {
  name: string;
  type: 'airport' | 'station' | 'city' | 'hotel_zone';
  address: string;
  country: string;
  /** Optional IATA code for airports */
  iata?: string;
}

const DB: POI[] = [
  // ─── Morocco ───────────────────────────────────────────────
  { name: 'Marrakech Menara Airport', type: 'airport', address: 'Marrakech, Morocco', country: 'Morocco', iata: 'RAK' },
  { name: 'Mohammed V International Airport', type: 'airport', address: 'Casablanca, Morocco', country: 'Morocco', iata: 'CMN' },
  { name: 'Fes-Saiss Airport', type: 'airport', address: 'Fes, Morocco', country: 'Morocco', iata: 'FEZ' },
  { name: 'Agadir Al Massira Airport', type: 'airport', address: 'Agadir, Morocco', country: 'Morocco', iata: 'AGA' },
  { name: 'Tangier Ibn Battouta Airport', type: 'airport', address: 'Tangier, Morocco', country: 'Morocco', iata: 'TNG' },
  { name: 'Rabat-Salé Airport', type: 'airport', address: 'Rabat, Morocco', country: 'Morocco', iata: 'RBA' },
  { name: 'Nador International Airport', type: 'airport', address: 'Nador, Morocco', country: 'Morocco', iata: 'NDR' },
  { name: 'Oujda Angads Airport', type: 'airport', address: 'Oujda, Morocco', country: 'Morocco', iata: 'OUD' },
  { name: 'Essaouira Mogador Airport', type: 'airport', address: 'Essaouira, Morocco', country: 'Morocco', iata: 'ESU' },
  { name: 'Ouarzazate Airport', type: 'airport', address: 'Ouarzazate, Morocco', country: 'Morocco', iata: 'OZZ' },
  { name: 'Marrakech', type: 'city', address: 'Morocco', country: 'Morocco' },
  { name: 'Casablanca', type: 'city', address: 'Morocco', country: 'Morocco' },
  { name: 'Fes', type: 'city', address: 'Morocco', country: 'Morocco' },
  { name: 'Agadir', type: 'city', address: 'Morocco', country: 'Morocco' },
  { name: 'Tangier', type: 'city', address: 'Morocco', country: 'Morocco' },
  { name: 'Rabat', type: 'city', address: 'Morocco', country: 'Morocco' },
  { name: 'Essaouira', type: 'city', address: 'Morocco', country: 'Morocco' },
  { name: 'Ouarzazate', type: 'city', address: 'Morocco', country: 'Morocco' },
  { name: 'Chefchaouen', type: 'city', address: 'Morocco', country: 'Morocco' },
  { name: 'Merzouga', type: 'city', address: 'Morocco', country: 'Morocco' },
  { name: 'Marrakech Train Station', type: 'station', address: 'Marrakech, Morocco', country: 'Morocco' },
  { name: 'Casa Voyageurs Station', type: 'station', address: 'Casablanca, Morocco', country: 'Morocco' },
  { name: 'Rabat Ville Station', type: 'station', address: 'Rabat, Morocco', country: 'Morocco' },
  { name: 'Fes Train Station', type: 'station', address: 'Fes, Morocco', country: 'Morocco' },
  { name: 'Tangier Ville Station', type: 'station', address: 'Tangier, Morocco', country: 'Morocco' },

  // ─── France ────────────────────────────────────────────────
  { name: 'Paris Charles de Gaulle Airport', type: 'airport', address: 'Paris, France', country: 'France', iata: 'CDG' },
  { name: 'Paris Orly Airport', type: 'airport', address: 'Paris, France', country: 'France', iata: 'ORY' },
  { name: 'Nice Côte d\'Azur Airport', type: 'airport', address: 'Nice, France', country: 'France', iata: 'NCE' },
  { name: 'Lyon-Saint Exupéry Airport', type: 'airport', address: 'Lyon, France', country: 'France', iata: 'LYS' },
  { name: 'Marseille Provence Airport', type: 'airport', address: 'Marseille, France', country: 'France', iata: 'MRS' },
  { name: 'Toulouse-Blagnac Airport', type: 'airport', address: 'Toulouse, France', country: 'France', iata: 'TLS' },
  { name: 'Bordeaux-Mérignac Airport', type: 'airport', address: 'Bordeaux, France', country: 'France', iata: 'BOD' },
  { name: 'Paris', type: 'city', address: 'France', country: 'France' },
  { name: 'Nice', type: 'city', address: 'France', country: 'France' },
  { name: 'Lyon', type: 'city', address: 'France', country: 'France' },
  { name: 'Marseille', type: 'city', address: 'France', country: 'France' },
  { name: 'Bordeaux', type: 'city', address: 'France', country: 'France' },
  { name: 'Toulouse', type: 'city', address: 'France', country: 'France' },
  { name: 'Strasbourg', type: 'city', address: 'France', country: 'France' },
  { name: 'Gare du Nord', type: 'station', address: 'Paris, France', country: 'France' },
  { name: 'Gare de Lyon', type: 'station', address: 'Paris, France', country: 'France' },
  { name: 'Gare Montparnasse', type: 'station', address: 'Paris, France', country: 'France' },
  { name: 'Nice Ville Station', type: 'station', address: 'Nice, France', country: 'France' },

  // ─── Spain ─────────────────────────────────────────────────
  { name: 'Madrid Barajas Airport', type: 'airport', address: 'Madrid, Spain', country: 'Spain', iata: 'MAD' },
  { name: 'Barcelona El Prat Airport', type: 'airport', address: 'Barcelona, Spain', country: 'Spain', iata: 'BCN' },
  { name: 'Malaga Airport', type: 'airport', address: 'Malaga, Spain', country: 'Spain', iata: 'AGP' },
  { name: 'Palma de Mallorca Airport', type: 'airport', address: 'Palma, Spain', country: 'Spain', iata: 'PMI' },
  { name: 'Alicante Airport', type: 'airport', address: 'Alicante, Spain', country: 'Spain', iata: 'ALC' },
  { name: 'Ibiza Airport', type: 'airport', address: 'Ibiza, Spain', country: 'Spain', iata: 'IBZ' },
  { name: 'Seville Airport', type: 'airport', address: 'Seville, Spain', country: 'Spain', iata: 'SVQ' },
  { name: 'Madrid', type: 'city', address: 'Spain', country: 'Spain' },
  { name: 'Barcelona', type: 'city', address: 'Spain', country: 'Spain' },
  { name: 'Malaga', type: 'city', address: 'Spain', country: 'Spain' },
  { name: 'Seville', type: 'city', address: 'Spain', country: 'Spain' },
  { name: 'Valencia', type: 'city', address: 'Spain', country: 'Spain' },
  { name: 'Madrid Atocha Station', type: 'station', address: 'Madrid, Spain', country: 'Spain' },
  { name: 'Barcelona Sants Station', type: 'station', address: 'Barcelona, Spain', country: 'Spain' },

  // ─── Germany ───────────────────────────────────────────────
  { name: 'Frankfurt Airport', type: 'airport', address: 'Frankfurt, Germany', country: 'Germany', iata: 'FRA' },
  { name: 'Munich Airport', type: 'airport', address: 'Munich, Germany', country: 'Germany', iata: 'MUC' },
  { name: 'Berlin Brandenburg Airport', type: 'airport', address: 'Berlin, Germany', country: 'Germany', iata: 'BER' },
  { name: 'Düsseldorf Airport', type: 'airport', address: 'Düsseldorf, Germany', country: 'Germany', iata: 'DUS' },
  { name: 'Hamburg Airport', type: 'airport', address: 'Hamburg, Germany', country: 'Germany', iata: 'HAM' },
  { name: 'Cologne Bonn Airport', type: 'airport', address: 'Cologne, Germany', country: 'Germany', iata: 'CGN' },
  { name: 'Stuttgart Airport', type: 'airport', address: 'Stuttgart, Germany', country: 'Germany', iata: 'STR' },
  { name: 'Berlin', type: 'city', address: 'Germany', country: 'Germany' },
  { name: 'Munich', type: 'city', address: 'Germany', country: 'Germany' },
  { name: 'Frankfurt', type: 'city', address: 'Germany', country: 'Germany' },
  { name: 'Hamburg', type: 'city', address: 'Germany', country: 'Germany' },
  { name: 'Cologne', type: 'city', address: 'Germany', country: 'Germany' },
  { name: 'Düsseldorf', type: 'city', address: 'Germany', country: 'Germany' },
  { name: 'Stuttgart', type: 'city', address: 'Germany', country: 'Germany' },
  { name: 'Berlin Hauptbahnhof', type: 'station', address: 'Berlin, Germany', country: 'Germany' },
  { name: 'Munich Hauptbahnhof', type: 'station', address: 'Munich, Germany', country: 'Germany' },
  { name: 'Frankfurt Hauptbahnhof', type: 'station', address: 'Frankfurt, Germany', country: 'Germany' },

  // ─── Italy ─────────────────────────────────────────────────
  { name: 'Rome Fiumicino Airport', type: 'airport', address: 'Rome, Italy', country: 'Italy', iata: 'FCO' },
  { name: 'Milan Malpensa Airport', type: 'airport', address: 'Milan, Italy', country: 'Italy', iata: 'MXP' },
  { name: 'Venice Marco Polo Airport', type: 'airport', address: 'Venice, Italy', country: 'Italy', iata: 'VCE' },
  { name: 'Naples Airport', type: 'airport', address: 'Naples, Italy', country: 'Italy', iata: 'NAP' },
  { name: 'Florence Airport', type: 'airport', address: 'Florence, Italy', country: 'Italy', iata: 'FLR' },
  { name: 'Catania Airport', type: 'airport', address: 'Catania, Italy', country: 'Italy', iata: 'CTA' },
  { name: 'Rome', type: 'city', address: 'Italy', country: 'Italy' },
  { name: 'Milan', type: 'city', address: 'Italy', country: 'Italy' },
  { name: 'Venice', type: 'city', address: 'Italy', country: 'Italy' },
  { name: 'Florence', type: 'city', address: 'Italy', country: 'Italy' },
  { name: 'Naples', type: 'city', address: 'Italy', country: 'Italy' },
  { name: 'Roma Termini Station', type: 'station', address: 'Rome, Italy', country: 'Italy' },
  { name: 'Milano Centrale Station', type: 'station', address: 'Milan, Italy', country: 'Italy' },
  { name: 'Venezia Santa Lucia Station', type: 'station', address: 'Venice, Italy', country: 'Italy' },

  // ─── United Kingdom ────────────────────────────────────────
  { name: 'London Heathrow Airport', type: 'airport', address: 'London, UK', country: 'United Kingdom', iata: 'LHR' },
  { name: 'London Gatwick Airport', type: 'airport', address: 'London, UK', country: 'United Kingdom', iata: 'LGW' },
  { name: 'London Stansted Airport', type: 'airport', address: 'London, UK', country: 'United Kingdom', iata: 'STN' },
  { name: 'London Luton Airport', type: 'airport', address: 'London, UK', country: 'United Kingdom', iata: 'LTN' },
  { name: 'Manchester Airport', type: 'airport', address: 'Manchester, UK', country: 'United Kingdom', iata: 'MAN' },
  { name: 'Edinburgh Airport', type: 'airport', address: 'Edinburgh, UK', country: 'United Kingdom', iata: 'EDI' },
  { name: 'Birmingham Airport', type: 'airport', address: 'Birmingham, UK', country: 'United Kingdom', iata: 'BHX' },
  { name: 'London', type: 'city', address: 'United Kingdom', country: 'United Kingdom' },
  { name: 'Manchester', type: 'city', address: 'United Kingdom', country: 'United Kingdom' },
  { name: 'Edinburgh', type: 'city', address: 'United Kingdom', country: 'United Kingdom' },
  { name: 'Birmingham', type: 'city', address: 'United Kingdom', country: 'United Kingdom' },
  { name: 'London King\'s Cross Station', type: 'station', address: 'London, UK', country: 'United Kingdom' },
  { name: 'London Paddington Station', type: 'station', address: 'London, UK', country: 'United Kingdom' },

  // ─── Turkey ────────────────────────────────────────────────
  { name: 'Istanbul Airport', type: 'airport', address: 'Istanbul, Turkey', country: 'Turkey', iata: 'IST' },
  { name: 'Istanbul Sabiha Gökçen Airport', type: 'airport', address: 'Istanbul, Turkey', country: 'Turkey', iata: 'SAW' },
  { name: 'Antalya Airport', type: 'airport', address: 'Antalya, Turkey', country: 'Turkey', iata: 'AYT' },
  { name: 'Ankara Esenboğa Airport', type: 'airport', address: 'Ankara, Turkey', country: 'Turkey', iata: 'ESB' },
  { name: 'Izmir Adnan Menderes Airport', type: 'airport', address: 'Izmir, Turkey', country: 'Turkey', iata: 'ADB' },
  { name: 'Bodrum Milas Airport', type: 'airport', address: 'Bodrum, Turkey', country: 'Turkey', iata: 'BJV' },
  { name: 'Dalaman Airport', type: 'airport', address: 'Dalaman, Turkey', country: 'Turkey', iata: 'DLM' },
  { name: 'Istanbul', type: 'city', address: 'Turkey', country: 'Turkey' },
  { name: 'Antalya', type: 'city', address: 'Turkey', country: 'Turkey' },
  { name: 'Ankara', type: 'city', address: 'Turkey', country: 'Turkey' },
  { name: 'Izmir', type: 'city', address: 'Turkey', country: 'Turkey' },
  { name: 'Bodrum', type: 'city', address: 'Turkey', country: 'Turkey' },

  // ─── UAE ───────────────────────────────────────────────────
  { name: 'Dubai International Airport', type: 'airport', address: 'Dubai, UAE', country: 'UAE', iata: 'DXB' },
  { name: 'Abu Dhabi International Airport', type: 'airport', address: 'Abu Dhabi, UAE', country: 'UAE', iata: 'AUH' },
  { name: 'Sharjah Airport', type: 'airport', address: 'Sharjah, UAE', country: 'UAE', iata: 'SHJ' },
  { name: 'Dubai', type: 'city', address: 'UAE', country: 'UAE' },
  { name: 'Abu Dhabi', type: 'city', address: 'UAE', country: 'UAE' },
  { name: 'Sharjah', type: 'city', address: 'UAE', country: 'UAE' },
  { name: 'Dubai Marina', type: 'station', address: 'Dubai, UAE', country: 'UAE' },
  { name: 'Burj Khalifa / Dubai Mall', type: 'station', address: 'Dubai, UAE', country: 'UAE' },

  // ─── Egypt ─────────────────────────────────────────────────
  { name: 'Cairo International Airport', type: 'airport', address: 'Cairo, Egypt', country: 'Egypt', iata: 'CAI' },
  { name: 'Hurghada International Airport', type: 'airport', address: 'Hurghada, Egypt', country: 'Egypt', iata: 'HRG' },
  { name: 'Sharm El Sheikh Airport', type: 'airport', address: 'Sharm El Sheikh, Egypt', country: 'Egypt', iata: 'SSH' },
  { name: 'Luxor Airport', type: 'airport', address: 'Luxor, Egypt', country: 'Egypt', iata: 'LXR' },
  { name: 'Cairo', type: 'city', address: 'Egypt', country: 'Egypt' },
  { name: 'Hurghada', type: 'city', address: 'Egypt', country: 'Egypt' },
  { name: 'Sharm El Sheikh', type: 'city', address: 'Egypt', country: 'Egypt' },
  { name: 'Luxor', type: 'city', address: 'Egypt', country: 'Egypt' },
  { name: 'Cairo Ramses Station', type: 'station', address: 'Cairo, Egypt', country: 'Egypt' },

  // ─── Portugal ──────────────────────────────────────────────
  { name: 'Lisbon Humberto Delgado Airport', type: 'airport', address: 'Lisbon, Portugal', country: 'Portugal', iata: 'LIS' },
  { name: 'Porto Airport', type: 'airport', address: 'Porto, Portugal', country: 'Portugal', iata: 'OPO' },
  { name: 'Faro Airport', type: 'airport', address: 'Faro, Portugal', country: 'Portugal', iata: 'FAO' },
  { name: 'Lisbon', type: 'city', address: 'Portugal', country: 'Portugal' },
  { name: 'Porto', type: 'city', address: 'Portugal', country: 'Portugal' },
  { name: 'Faro', type: 'city', address: 'Portugal', country: 'Portugal' },
  { name: 'Lisbon Santa Apolónia Station', type: 'station', address: 'Lisbon, Portugal', country: 'Portugal' },
  { name: 'Porto São Bento Station', type: 'station', address: 'Porto, Portugal', country: 'Portugal' },

  // ─── Greece ────────────────────────────────────────────────
  { name: 'Athens International Airport', type: 'airport', address: 'Athens, Greece', country: 'Greece', iata: 'ATH' },
  { name: 'Thessaloniki Airport', type: 'airport', address: 'Thessaloniki, Greece', country: 'Greece', iata: 'SKG' },
  { name: 'Heraklion Airport', type: 'airport', address: 'Heraklion, Crete, Greece', country: 'Greece', iata: 'HER' },
  { name: 'Corfu Airport', type: 'airport', address: 'Corfu, Greece', country: 'Greece', iata: 'CFU' },
  { name: 'Rhodes Airport', type: 'airport', address: 'Rhodes, Greece', country: 'Greece', iata: 'RHO' },
  { name: 'Athens', type: 'city', address: 'Greece', country: 'Greece' },
  { name: 'Thessaloniki', type: 'city', address: 'Greece', country: 'Greece' },
  { name: 'Santorini', type: 'city', address: 'Greece', country: 'Greece' },
  { name: 'Mykonos', type: 'city', address: 'Greece', country: 'Greece' },

  // ─── Netherlands ───────────────────────────────────────────
  { name: 'Amsterdam Schiphol Airport', type: 'airport', address: 'Amsterdam, Netherlands', country: 'Netherlands', iata: 'AMS' },
  { name: 'Eindhoven Airport', type: 'airport', address: 'Eindhoven, Netherlands', country: 'Netherlands', iata: 'EIN' },
  { name: 'Amsterdam', type: 'city', address: 'Netherlands', country: 'Netherlands' },
  { name: 'Rotterdam', type: 'city', address: 'Netherlands', country: 'Netherlands' },
  { name: 'Amsterdam Centraal Station', type: 'station', address: 'Amsterdam, Netherlands', country: 'Netherlands' },

  // ─── Austria ───────────────────────────────────────────────
  { name: 'Vienna-Schwechat International Airport', type: 'airport', address: 'Vienna, Austria', country: 'Austria', iata: 'VIE' },
  { name: 'Salzburg Airport', type: 'airport', address: 'Salzburg, Austria', country: 'Austria', iata: 'SZG' },
  { name: 'Innsbruck Airport', type: 'airport', address: 'Innsbruck, Austria', country: 'Austria', iata: 'INN' },
  { name: 'Vienna', type: 'city', address: 'Austria', country: 'Austria' },
  { name: 'Salzburg', type: 'city', address: 'Austria', country: 'Austria' },
  { name: 'Innsbruck', type: 'city', address: 'Austria', country: 'Austria' },
  { name: 'Wien Hauptbahnhof', type: 'station', address: 'Vienna, Austria', country: 'Austria' },

  // ─── Switzerland ───────────────────────────────────────────
  { name: 'Zurich Airport', type: 'airport', address: 'Zurich, Switzerland', country: 'Switzerland', iata: 'ZRH' },
  { name: 'Geneva Airport', type: 'airport', address: 'Geneva, Switzerland', country: 'Switzerland', iata: 'GVA' },
  { name: 'Zurich', type: 'city', address: 'Switzerland', country: 'Switzerland' },
  { name: 'Geneva', type: 'city', address: 'Switzerland', country: 'Switzerland' },
  { name: 'Bern', type: 'city', address: 'Switzerland', country: 'Switzerland' },
  { name: 'Zurich Hauptbahnhof', type: 'station', address: 'Zurich, Switzerland', country: 'Switzerland' },

  // ─── Belgium ───────────────────────────────────────────────
  { name: 'Brussels Airport', type: 'airport', address: 'Brussels, Belgium', country: 'Belgium', iata: 'BRU' },
  { name: 'Brussels', type: 'city', address: 'Belgium', country: 'Belgium' },
  { name: 'Antwerp', type: 'city', address: 'Belgium', country: 'Belgium' },
  { name: 'Brussels-Midi Station', type: 'station', address: 'Brussels, Belgium', country: 'Belgium' },

  // ─── Tunisia ───────────────────────────────────────────────
  { name: 'Tunis-Carthage Airport', type: 'airport', address: 'Tunis, Tunisia', country: 'Tunisia', iata: 'TUN' },
  { name: 'Enfidha-Hammamet Airport', type: 'airport', address: 'Hammamet, Tunisia', country: 'Tunisia', iata: 'NBE' },
  { name: 'Djerba-Zarzis Airport', type: 'airport', address: 'Djerba, Tunisia', country: 'Tunisia', iata: 'DJE' },
  { name: 'Monastir Airport', type: 'airport', address: 'Monastir, Tunisia', country: 'Tunisia', iata: 'MIR' },
  { name: 'Tunis', type: 'city', address: 'Tunisia', country: 'Tunisia' },
  { name: 'Hammamet', type: 'city', address: 'Tunisia', country: 'Tunisia' },
  { name: 'Sousse', type: 'city', address: 'Tunisia', country: 'Tunisia' },
  { name: 'Djerba', type: 'city', address: 'Tunisia', country: 'Tunisia' },

  // ─── Saudi Arabia ──────────────────────────────────────────
  { name: 'King Khalid International Airport', type: 'airport', address: 'Riyadh, Saudi Arabia', country: 'Saudi Arabia', iata: 'RUH' },
  { name: 'King Abdulaziz International Airport', type: 'airport', address: 'Jeddah, Saudi Arabia', country: 'Saudi Arabia', iata: 'JED' },
  { name: 'Prince Mohammad bin Abdulaziz Airport', type: 'airport', address: 'Medina, Saudi Arabia', country: 'Saudi Arabia', iata: 'MED' },
  { name: 'King Fahd International Airport', type: 'airport', address: 'Dammam, Saudi Arabia', country: 'Saudi Arabia', iata: 'DMM' },
  { name: 'Riyadh', type: 'city', address: 'Saudi Arabia', country: 'Saudi Arabia' },
  { name: 'Jeddah', type: 'city', address: 'Saudi Arabia', country: 'Saudi Arabia' },
  { name: 'Medina', type: 'city', address: 'Saudi Arabia', country: 'Saudi Arabia' },
  { name: 'Mecca', type: 'city', address: 'Saudi Arabia', country: 'Saudi Arabia' },

  // ─── USA (major hubs) ─────────────────────────────────────
  { name: 'JFK International Airport', type: 'airport', address: 'New York, USA', country: 'United States', iata: 'JFK' },
  { name: 'Los Angeles International Airport', type: 'airport', address: 'Los Angeles, USA', country: 'United States', iata: 'LAX' },
  { name: 'O\'Hare International Airport', type: 'airport', address: 'Chicago, USA', country: 'United States', iata: 'ORD' },
  { name: 'Miami International Airport', type: 'airport', address: 'Miami, USA', country: 'United States', iata: 'MIA' },
  { name: 'San Francisco International Airport', type: 'airport', address: 'San Francisco, USA', country: 'United States', iata: 'SFO' },
  { name: 'Newark Liberty International Airport', type: 'airport', address: 'Newark, USA', country: 'United States', iata: 'EWR' },
  { name: 'Hartsfield-Jackson Atlanta Airport', type: 'airport', address: 'Atlanta, USA', country: 'United States', iata: 'ATL' },
  { name: 'New York', type: 'city', address: 'United States', country: 'United States' },
  { name: 'Los Angeles', type: 'city', address: 'United States', country: 'United States' },
  { name: 'Miami', type: 'city', address: 'United States', country: 'United States' },
  { name: 'Chicago', type: 'city', address: 'United States', country: 'United States' },
  { name: 'San Francisco', type: 'city', address: 'United States', country: 'United States' },

  // ─── Thailand ──────────────────────────────────────────────
  { name: 'Suvarnabhumi Airport', type: 'airport', address: 'Bangkok, Thailand', country: 'Thailand', iata: 'BKK' },
  { name: 'Don Mueang Airport', type: 'airport', address: 'Bangkok, Thailand', country: 'Thailand', iata: 'DMK' },
  { name: 'Phuket Airport', type: 'airport', address: 'Phuket, Thailand', country: 'Thailand', iata: 'HKT' },
  { name: 'Chiang Mai Airport', type: 'airport', address: 'Chiang Mai, Thailand', country: 'Thailand', iata: 'CNX' },
  { name: 'Bangkok', type: 'city', address: 'Thailand', country: 'Thailand' },
  { name: 'Phuket', type: 'city', address: 'Thailand', country: 'Thailand' },
  { name: 'Chiang Mai', type: 'city', address: 'Thailand', country: 'Thailand' },
  { name: 'Pattaya', type: 'city', address: 'Thailand', country: 'Thailand' },

  // ─── Mexico ────────────────────────────────────────────────
  { name: 'Mexico City International Airport', type: 'airport', address: 'Mexico City, Mexico', country: 'Mexico', iata: 'MEX' },
  { name: 'Cancún International Airport', type: 'airport', address: 'Cancún, Mexico', country: 'Mexico', iata: 'CUN' },
  { name: 'Guadalajara Airport', type: 'airport', address: 'Guadalajara, Mexico', country: 'Mexico', iata: 'GDL' },
  { name: 'Los Cabos Airport', type: 'airport', address: 'San José del Cabo, Mexico', country: 'Mexico', iata: 'SJD' },
  { name: 'Mexico City', type: 'city', address: 'Mexico', country: 'Mexico' },
  { name: 'Cancún', type: 'city', address: 'Mexico', country: 'Mexico' },
  { name: 'Playa del Carmen', type: 'city', address: 'Mexico', country: 'Mexico' },
  { name: 'Tulum', type: 'city', address: 'Mexico', country: 'Mexico' },

  // ─── Croatia ───────────────────────────────────────────────
  { name: 'Zagreb Airport', type: 'airport', address: 'Zagreb, Croatia', country: 'Croatia', iata: 'ZAG' },
  { name: 'Split Airport', type: 'airport', address: 'Split, Croatia', country: 'Croatia', iata: 'SPU' },
  { name: 'Dubrovnik Airport', type: 'airport', address: 'Dubrovnik, Croatia', country: 'Croatia', iata: 'DBV' },
  { name: 'Zagreb', type: 'city', address: 'Croatia', country: 'Croatia' },
  { name: 'Split', type: 'city', address: 'Croatia', country: 'Croatia' },
  { name: 'Dubrovnik', type: 'city', address: 'Croatia', country: 'Croatia' },

  // ─── Czech Republic ────────────────────────────────────────
  { name: 'Prague Václav Havel Airport', type: 'airport', address: 'Prague, Czech Republic', country: 'Czech Republic', iata: 'PRG' },
  { name: 'Prague', type: 'city', address: 'Czech Republic', country: 'Czech Republic' },
  { name: 'Brno', type: 'city', address: 'Czech Republic', country: 'Czech Republic' },
  { name: 'Praha hlavní nádraží', type: 'station', address: 'Prague, Czech Republic', country: 'Czech Republic' },

  // ─── Poland ────────────────────────────────────────────────
  { name: 'Warsaw Chopin Airport', type: 'airport', address: 'Warsaw, Poland', country: 'Poland', iata: 'WAW' },
  { name: 'Kraków Airport', type: 'airport', address: 'Kraków, Poland', country: 'Poland', iata: 'KRK' },
  { name: 'Gdańsk Airport', type: 'airport', address: 'Gdańsk, Poland', country: 'Poland', iata: 'GDN' },
  { name: 'Warsaw', type: 'city', address: 'Poland', country: 'Poland' },
  { name: 'Kraków', type: 'city', address: 'Poland', country: 'Poland' },
  { name: 'Gdańsk', type: 'city', address: 'Poland', country: 'Poland' },
  { name: 'Wrocław', type: 'city', address: 'Poland', country: 'Poland' },

  // ─── Jordan ────────────────────────────────────────────────
  { name: 'Queen Alia International Airport', type: 'airport', address: 'Amman, Jordan', country: 'Jordan', iata: 'AMM' },
  { name: 'Amman', type: 'city', address: 'Jordan', country: 'Jordan' },
  { name: 'Aqaba', type: 'city', address: 'Jordan', country: 'Jordan' },
  { name: 'Dead Sea', type: 'station', address: 'Jordan', country: 'Jordan' },
  { name: 'Petra', type: 'station', address: 'Ma\'an, Jordan', country: 'Jordan' },

  // ─── Algeria ───────────────────────────────────────────────
  { name: 'Algiers Houari Boumediene Airport', type: 'airport', address: 'Algiers, Algeria', country: 'Algeria', iata: 'ALG' },
  { name: 'Oran Ahmed Ben Bella Airport', type: 'airport', address: 'Oran, Algeria', country: 'Algeria', iata: 'ORN' },
  { name: 'Constantine Airport', type: 'airport', address: 'Constantine, Algeria', country: 'Algeria', iata: 'CZL' },
  { name: 'Algiers', type: 'city', address: 'Algeria', country: 'Algeria' },
  { name: 'Oran', type: 'city', address: 'Algeria', country: 'Algeria' },
  { name: 'Constantine', type: 'city', address: 'Algeria', country: 'Algeria' },

  // ─── Libya ─────────────────────────────────────────────────
  { name: 'Tripoli International Airport', type: 'airport', address: 'Tripoli, Libya', country: 'Libya', iata: 'TIP' },
  { name: 'Benina International Airport', type: 'airport', address: 'Benghazi, Libya', country: 'Libya', iata: 'BEN' },
  { name: 'Tripoli', type: 'city', address: 'Libya', country: 'Libya' },
  { name: 'Benghazi', type: 'city', address: 'Libya', country: 'Libya' },
  { name: 'Misrata', type: 'city', address: 'Libya', country: 'Libya' },

  // ─── Senegal ───────────────────────────────────────────────
  { name: 'Blaise Diagne International Airport', type: 'airport', address: 'Dakar, Senegal', country: 'Senegal', iata: 'DSS' },
  { name: 'Dakar', type: 'city', address: 'Senegal', country: 'Senegal' },
  { name: 'Saint-Louis', type: 'city', address: 'Senegal', country: 'Senegal' },

  // ─── South Africa ─────────────────────────────────────────
  { name: 'O.R. Tambo International Airport', type: 'airport', address: 'Johannesburg, South Africa', country: 'South Africa', iata: 'JNB' },
  { name: 'Cape Town International Airport', type: 'airport', address: 'Cape Town, South Africa', country: 'South Africa', iata: 'CPT' },
  { name: 'King Shaka International Airport', type: 'airport', address: 'Durban, South Africa', country: 'South Africa', iata: 'DUR' },
  { name: 'Johannesburg', type: 'city', address: 'South Africa', country: 'South Africa' },
  { name: 'Cape Town', type: 'city', address: 'South Africa', country: 'South Africa' },
  { name: 'Durban', type: 'city', address: 'South Africa', country: 'South Africa' },

  // ─── India ─────────────────────────────────────────────────
  { name: 'Indira Gandhi International Airport', type: 'airport', address: 'New Delhi, India', country: 'India', iata: 'DEL' },
  { name: 'Chhatrapati Shivaji Airport', type: 'airport', address: 'Mumbai, India', country: 'India', iata: 'BOM' },
  { name: 'Kempegowda International Airport', type: 'airport', address: 'Bangalore, India', country: 'India', iata: 'BLR' },
  { name: 'Rajiv Gandhi International Airport', type: 'airport', address: 'Hyderabad, India', country: 'India', iata: 'HYD' },
  { name: 'New Delhi', type: 'city', address: 'India', country: 'India' },
  { name: 'Mumbai', type: 'city', address: 'India', country: 'India' },
  { name: 'Bangalore', type: 'city', address: 'India', country: 'India' },
  { name: 'Goa', type: 'city', address: 'India', country: 'India' },
  { name: 'Jaipur', type: 'city', address: 'India', country: 'India' },
  { name: 'New Delhi Railway Station', type: 'station', address: 'New Delhi, India', country: 'India' },
];

/**
 * Get POIs for a specified country. If empty, returns all POIs.
 * @param country The country name the agency operates in
 */
export function getPOIsForCountries(country: string): POI[] {
  const trimmed = country.trim().toLowerCase();
  if (!trimmed) return DB;
  return DB.filter((poi) => poi.country.toLowerCase() === trimmed);
}

/**
 * Search POIs by query string. Returns matched POIs sorted by relevance.
 */
export function searchPOIs(query: string, countries: string): POI[] {
  if (!query || query.trim().length < 1) return [];

  // Search ALL POIs, but boost agency countries
  const countryList = new Set(
    countries.split(',').map((c) => c.trim().toLowerCase()).filter(Boolean)
  );
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);

  const scored = DB
    .map((poi) => {
      const haystack = `${poi.name} ${poi.address} ${poi.iata || ''}`.toLowerCase();
      let score = 0;

      // Count matching tokens — require at least half to match
      const matchCount = tokens.filter((t) => haystack.includes(t)).length;
      if (matchCount === 0) return null;
      if (tokens.length > 1 && matchCount < Math.ceil(tokens.length * 0.5)) return null;

      // Bonus for all tokens matching
      if (matchCount === tokens.length) score += 100;

      // Partial match bonus
      score += matchCount * 15;

      // Full query match
      if (haystack.includes(query.toLowerCase())) score += 80;

      // Exact IATA match
      if (poi.iata && tokens.some((t) => t === poi.iata!.toLowerCase())) score += 200;

      // Name starts with first token
      if (poi.name.toLowerCase().startsWith(tokens[0])) score += 50;

      // Per-token score
      for (const t of tokens) {
        if (poi.name.toLowerCase().includes(t)) score += 20;
        if (t.includes('airport') && poi.type === 'airport') score += 15;
      }

      // Type bonus for airports (most common transfer)
      if (poi.type === 'airport') score += 5;

      // Boost agency's own countries
      if (countryList.size > 0 && countryList.has(poi.country.toLowerCase())) score += 30;

      return { ...poi, score };
    })
    .filter((r): r is POI & { score: number } => r !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 15);

  return scored.map(({ score: _, ...rest }) => rest);
}

export default DB;
