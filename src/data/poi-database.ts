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
  /** Optional coordinates [lng, lat] — skips geocoding entirely when present */
  coords?: [number, number];
}

const DB: POI[] = [
  // ─── Morocco ───────────────────────────────────────────────
  { name: 'Marrakech Menara Airport', type: 'airport', address: 'Marrakech, Morocco', country: 'Morocco', iata: 'RAK', coords: [-8.0363, 31.6069] },
  { name: 'Mohammed V International Airport', type: 'airport', address: 'Casablanca, Morocco', country: 'Morocco', iata: 'CMN', coords: [-7.5898, 33.3675] },
  { name: 'Fes-Saiss Airport', type: 'airport', address: 'Fes, Morocco', country: 'Morocco', iata: 'FEZ', coords: [-4.9778, 33.9273] },
  { name: 'Agadir Al Massira Airport', type: 'airport', address: 'Agadir, Morocco', country: 'Morocco', iata: 'AGA', coords: [-9.4131, 30.3250] },
  { name: 'Tangier Ibn Battouta Airport', type: 'airport', address: 'Tangier, Morocco', country: 'Morocco', iata: 'TNG', coords: [-5.7168, 35.7269] },
  { name: 'Rabat-Salé Airport', type: 'airport', address: 'Rabat, Morocco', country: 'Morocco', iata: 'RBA', coords: [-6.7516, 34.0515] },
  { name: 'Nador International Airport', type: 'airport', address: 'Nador, Morocco', country: 'Morocco', iata: 'NDR', coords: [-3.0282, 34.9888] },
  { name: 'Oujda Angads Airport', type: 'airport', address: 'Oujda, Morocco', country: 'Morocco', iata: 'OUD', coords: [-1.9240, 34.7872] },
  { name: 'Essaouira Mogador Airport', type: 'airport', address: 'Essaouira, Morocco', country: 'Morocco', iata: 'ESU', coords: [-9.6817, 31.3975] },
  { name: 'Ouarzazate Airport', type: 'airport', address: 'Ouarzazate, Morocco', country: 'Morocco', iata: 'OZZ', coords: [-6.9094, 30.9391] },
  { name: 'Marrakech', type: 'city', address: 'Morocco', country: 'Morocco', coords: [-7.9811, 31.6295] },
  { name: 'Casablanca', type: 'city', address: 'Morocco', country: 'Morocco', coords: [-7.5898, 33.5731] },
  { name: 'Fes', type: 'city', address: 'Morocco', country: 'Morocco', coords: [-5.0078, 34.0181] },
  { name: 'Agadir', type: 'city', address: 'Morocco', country: 'Morocco', coords: [-9.5981, 30.4278] },
  { name: 'Tangier', type: 'city', address: 'Morocco', country: 'Morocco', coords: [-5.8134, 35.7595] },
  { name: 'Rabat', type: 'city', address: 'Morocco', country: 'Morocco', coords: [-6.8498, 34.0209] },
  { name: 'Essaouira', type: 'city', address: 'Morocco', country: 'Morocco', coords: [-9.7690, 31.5085] },
  { name: 'Ouarzazate', type: 'city', address: 'Morocco', country: 'Morocco', coords: [-6.8936, 30.9200] },
  { name: 'Chefchaouen', type: 'city', address: 'Morocco', country: 'Morocco', coords: [-5.2636, 35.1688] },
  { name: 'Merzouga', type: 'city', address: 'Morocco', country: 'Morocco', coords: [-4.0133, 31.0801] },
  { name: 'Marrakech Train Station', type: 'station', address: 'Marrakech, Morocco', country: 'Morocco', coords: [-8.0137, 31.6340] },
  { name: 'Casa Voyageurs Station', type: 'station', address: 'Casablanca, Morocco', country: 'Morocco', coords: [-7.5828, 33.5886] },
  { name: 'Rabat Ville Station', type: 'station', address: 'Rabat, Morocco', country: 'Morocco', coords: [-6.8352, 34.0177] },
  { name: 'Fes Train Station', type: 'station', address: 'Fes, Morocco', country: 'Morocco', coords: [-4.9994, 34.0360] },
  { name: 'Tangier Ville Station', type: 'station', address: 'Tangier, Morocco', country: 'Morocco', coords: [-5.8036, 35.7693] },

  // ─── France ────────────────────────────────────────────────
  { name: 'Paris Charles de Gaulle Airport', type: 'airport', address: 'Paris, France', country: 'France', iata: 'CDG', coords: [2.5479, 49.0097] },
  { name: 'Paris Orly Airport', type: 'airport', address: 'Paris, France', country: 'France', iata: 'ORY', coords: [2.3794, 48.7262] },
  { name: 'Nice Côte d\'Azur Airport', type: 'airport', address: 'Nice, France', country: 'France', iata: 'NCE', coords: [7.2156, 43.6584] },
  { name: 'Lyon-Saint Exupéry Airport', type: 'airport', address: 'Lyon, France', country: 'France', iata: 'LYS', coords: [5.0887, 45.7256] },
  { name: 'Marseille Provence Airport', type: 'airport', address: 'Marseille, France', country: 'France', iata: 'MRS', coords: [5.2148, 43.4393] },
  { name: 'Toulouse-Blagnac Airport', type: 'airport', address: 'Toulouse, France', country: 'France', iata: 'TLS', coords: [1.3679, 43.6291] },
  { name: 'Bordeaux-Mérignac Airport', type: 'airport', address: 'Bordeaux, France', country: 'France', iata: 'BOD', coords: [-0.7156, 44.8283] },
  { name: 'Paris', type: 'city', address: 'France', country: 'France', coords: [2.3522, 48.8566] },
  { name: 'Nice', type: 'city', address: 'France', country: 'France', coords: [7.2620, 43.7102] },
  { name: 'Lyon', type: 'city', address: 'France', country: 'France', coords: [4.8357, 45.7640] },
  { name: 'Marseille', type: 'city', address: 'France', country: 'France', coords: [5.3698, 43.2965] },
  { name: 'Bordeaux', type: 'city', address: 'France', country: 'France', coords: [-0.5792, 44.8378] },
  { name: 'Toulouse', type: 'city', address: 'France', country: 'France', coords: [1.4442, 43.6047] },
  { name: 'Strasbourg', type: 'city', address: 'France', country: 'France', coords: [7.7521, 48.5734] },
  { name: 'Gare du Nord', type: 'station', address: 'Paris, France', country: 'France', coords: [2.3553, 48.8809] },
  { name: 'Gare de Lyon', type: 'station', address: 'Paris, France', country: 'France', coords: [2.3735, 48.8443] },
  { name: 'Gare Montparnasse', type: 'station', address: 'Paris, France', country: 'France', coords: [2.3191, 48.8408] },
  { name: 'Nice Ville Station', type: 'station', address: 'Nice, France', country: 'France', coords: [7.2619, 43.7046] },

  // ─── Spain ─────────────────────────────────────────────────
  { name: 'Madrid Barajas Airport', type: 'airport', address: 'Madrid, Spain', country: 'Spain', iata: 'MAD', coords: [-3.5674, 40.4936] },
  { name: 'Barcelona El Prat Airport', type: 'airport', address: 'Barcelona, Spain', country: 'Spain', iata: 'BCN', coords: [2.0785, 41.2971] },
  { name: 'Malaga Airport', type: 'airport', address: 'Malaga, Spain', country: 'Spain', iata: 'AGP', coords: [-4.4991, 36.6749] },
  { name: 'Palma de Mallorca Airport', type: 'airport', address: 'Palma, Spain', country: 'Spain', iata: 'PMI', coords: [2.7388, 39.5517] },
  { name: 'Alicante Airport', type: 'airport', address: 'Alicante, Spain', country: 'Spain', iata: 'ALC', coords: [-0.5582, 38.2822] },
  { name: 'Ibiza Airport', type: 'airport', address: 'Ibiza, Spain', country: 'Spain', iata: 'IBZ', coords: [1.3731, 38.8729] },
  { name: 'Seville Airport', type: 'airport', address: 'Seville, Spain', country: 'Spain', iata: 'SVQ', coords: [-5.8931, 37.4180] },
  { name: 'Madrid', type: 'city', address: 'Spain', country: 'Spain', coords: [-3.7038, 40.4168] },
  { name: 'Barcelona', type: 'city', address: 'Spain', country: 'Spain', coords: [2.1734, 41.3851] },
  { name: 'Malaga', type: 'city', address: 'Spain', country: 'Spain', coords: [-4.4214, 36.7213] },
  { name: 'Seville', type: 'city', address: 'Spain', country: 'Spain', coords: [-5.9845, 37.3891] },
  { name: 'Valencia', type: 'city', address: 'Spain', country: 'Spain', coords: [-0.3763, 39.4699] },
  { name: 'Madrid Atocha Station', type: 'station', address: 'Madrid, Spain', country: 'Spain', coords: [-3.6908, 40.4065] },
  { name: 'Barcelona Sants Station', type: 'station', address: 'Barcelona, Spain', country: 'Spain', coords: [2.1404, 41.3793] },

  // ─── Germany ───────────────────────────────────────────────
  { name: 'Frankfurt Airport', type: 'airport', address: 'Frankfurt, Germany', country: 'Germany', iata: 'FRA', coords: [8.5622, 50.0379] },
  { name: 'Munich Airport', type: 'airport', address: 'Munich, Germany', country: 'Germany', iata: 'MUC', coords: [11.7861, 48.3537] },
  { name: 'Berlin Brandenburg Airport', type: 'airport', address: 'Berlin, Germany', country: 'Germany', iata: 'BER', coords: [13.5033, 52.3667] },
  { name: 'Düsseldorf Airport', type: 'airport', address: 'Düsseldorf, Germany', country: 'Germany', iata: 'DUS', coords: [6.7668, 51.2895] },
  { name: 'Hamburg Airport', type: 'airport', address: 'Hamburg, Germany', country: 'Germany', iata: 'HAM', coords: [9.9882, 53.6304] },
  { name: 'Cologne Bonn Airport', type: 'airport', address: 'Cologne, Germany', country: 'Germany', iata: 'CGN', coords: [7.1427, 50.8659] },
  { name: 'Stuttgart Airport', type: 'airport', address: 'Stuttgart, Germany', country: 'Germany', iata: 'STR', coords: [9.2216, 48.6899] },
  { name: 'Berlin', type: 'city', address: 'Germany', country: 'Germany', coords: [13.4050, 52.5200] },
  { name: 'Munich', type: 'city', address: 'Germany', country: 'Germany', coords: [11.5820, 48.1351] },
  { name: 'Frankfurt', type: 'city', address: 'Germany', country: 'Germany', coords: [8.6821, 50.1109] },
  { name: 'Hamburg', type: 'city', address: 'Germany', country: 'Germany', coords: [9.9937, 53.5511] },
  { name: 'Cologne', type: 'city', address: 'Germany', country: 'Germany', coords: [6.9603, 50.9375] },
  { name: 'Düsseldorf', type: 'city', address: 'Germany', country: 'Germany', coords: [6.7735, 51.2277] },
  { name: 'Stuttgart', type: 'city', address: 'Germany', country: 'Germany', coords: [9.1829, 48.7758] },
  { name: 'Berlin Hauptbahnhof', type: 'station', address: 'Berlin, Germany', country: 'Germany', coords: [13.3694, 52.5251] },
  { name: 'Munich Hauptbahnhof', type: 'station', address: 'Munich, Germany', country: 'Germany', coords: [11.5597, 48.1402] },
  { name: 'Frankfurt Hauptbahnhof', type: 'station', address: 'Frankfurt, Germany', country: 'Germany', coords: [8.6632, 50.1071] },

  // ─── Italy ─────────────────────────────────────────────────
  { name: 'Rome Fiumicino Airport', type: 'airport', address: 'Rome, Italy', country: 'Italy', iata: 'FCO', coords: [12.2389, 41.8003] },
  { name: 'Milan Malpensa Airport', type: 'airport', address: 'Milan, Italy', country: 'Italy', iata: 'MXP', coords: [8.7231, 45.6306] },
  { name: 'Venice Marco Polo Airport', type: 'airport', address: 'Venice, Italy', country: 'Italy', iata: 'VCE', coords: [12.3519, 45.5053] },
  { name: 'Naples Airport', type: 'airport', address: 'Naples, Italy', country: 'Italy', iata: 'NAP', coords: [14.2908, 40.8860] },
  { name: 'Florence Airport', type: 'airport', address: 'Florence, Italy', country: 'Italy', iata: 'FLR', coords: [11.2051, 43.8100] },
  { name: 'Catania Airport', type: 'airport', address: 'Catania, Italy', country: 'Italy', iata: 'CTA', coords: [15.0664, 37.4668] },
  { name: 'Rome', type: 'city', address: 'Italy', country: 'Italy', coords: [12.4964, 41.9028] },
  { name: 'Milan', type: 'city', address: 'Italy', country: 'Italy', coords: [9.1900, 45.4642] },
  { name: 'Venice', type: 'city', address: 'Italy', country: 'Italy', coords: [12.3155, 45.4408] },
  { name: 'Florence', type: 'city', address: 'Italy', country: 'Italy', coords: [11.2558, 43.7696] },
  { name: 'Naples', type: 'city', address: 'Italy', country: 'Italy', coords: [14.2681, 40.8518] },
  { name: 'Roma Termini Station', type: 'station', address: 'Rome, Italy', country: 'Italy', coords: [12.5024, 41.9009] },
  { name: 'Milano Centrale Station', type: 'station', address: 'Milan, Italy', country: 'Italy', coords: [9.2043, 45.4867] },
  { name: 'Venezia Santa Lucia Station', type: 'station', address: 'Venice, Italy', country: 'Italy', coords: [12.3207, 45.4410] },

  // ─── United Kingdom ────────────────────────────────────────
  { name: 'London Heathrow Airport', type: 'airport', address: 'London, UK', country: 'United Kingdom', iata: 'LHR', coords: [-0.4614, 51.4700] },
  { name: 'London Gatwick Airport', type: 'airport', address: 'London, UK', country: 'United Kingdom', iata: 'LGW', coords: [-0.1903, 51.1537] },
  { name: 'London Stansted Airport', type: 'airport', address: 'London, UK', country: 'United Kingdom', iata: 'STN', coords: [0.2350, 51.8850] },
  { name: 'London Luton Airport', type: 'airport', address: 'London, UK', country: 'United Kingdom', iata: 'LTN', coords: [-0.3684, 51.8747] },
  { name: 'Manchester Airport', type: 'airport', address: 'Manchester, UK', country: 'United Kingdom', iata: 'MAN', coords: [-2.2750, 53.3537] },
  { name: 'Edinburgh Airport', type: 'airport', address: 'Edinburgh, UK', country: 'United Kingdom', iata: 'EDI', coords: [-3.3725, 55.9500] },
  { name: 'Birmingham Airport', type: 'airport', address: 'Birmingham, UK', country: 'United Kingdom', iata: 'BHX', coords: [-1.7480, 52.4539] },
  { name: 'London', type: 'city', address: 'United Kingdom', country: 'United Kingdom', coords: [-0.1278, 51.5074] },
  { name: 'Manchester', type: 'city', address: 'United Kingdom', country: 'United Kingdom', coords: [-2.2426, 53.4808] },
  { name: 'Edinburgh', type: 'city', address: 'United Kingdom', country: 'United Kingdom', coords: [-3.1883, 55.9533] },
  { name: 'Birmingham', type: 'city', address: 'United Kingdom', country: 'United Kingdom', coords: [-1.8904, 52.4862] },
  { name: 'London King\'s Cross Station', type: 'station', address: 'London, UK', country: 'United Kingdom', coords: [-0.1246, 51.5320] },
  { name: 'London Paddington Station', type: 'station', address: 'London, UK', country: 'United Kingdom', coords: [-0.1756, 51.5154] },

  // ─── Turkey ────────────────────────────────────────────────
  { name: 'Istanbul Airport', type: 'airport', address: 'Istanbul, Turkey', country: 'Turkey', iata: 'IST', coords: [28.7519, 41.2753] },
  { name: 'Istanbul Sabiha Gökçen Airport', type: 'airport', address: 'Istanbul, Turkey', country: 'Turkey', iata: 'SAW', coords: [29.3092, 40.8986] },
  { name: 'Antalya Airport', type: 'airport', address: 'Antalya, Turkey', country: 'Turkey', iata: 'AYT', coords: [30.8005, 36.8987] },
  { name: 'Ankara Esenboğa Airport', type: 'airport', address: 'Ankara, Turkey', country: 'Turkey', iata: 'ESB', coords: [32.9951, 40.1281] },
  { name: 'Izmir Adnan Menderes Airport', type: 'airport', address: 'Izmir, Turkey', country: 'Turkey', iata: 'ADB', coords: [27.1560, 38.2924] },
  { name: 'Bodrum Milas Airport', type: 'airport', address: 'Bodrum, Turkey', country: 'Turkey', iata: 'BJV', coords: [27.6643, 37.2506] },
  { name: 'Dalaman Airport', type: 'airport', address: 'Dalaman, Turkey', country: 'Turkey', iata: 'DLM', coords: [28.7925, 36.7131] },
  { name: 'Istanbul', type: 'city', address: 'Turkey', country: 'Turkey', coords: [28.9784, 41.0082] },
  { name: 'Antalya', type: 'city', address: 'Turkey', country: 'Turkey', coords: [30.7133, 36.8969] },
  { name: 'Ankara', type: 'city', address: 'Turkey', country: 'Turkey', coords: [32.8597, 39.9334] },
  { name: 'Izmir', type: 'city', address: 'Turkey', country: 'Turkey', coords: [27.1428, 38.4237] },
  { name: 'Bodrum', type: 'city', address: 'Turkey', country: 'Turkey', coords: [27.4305, 37.0344] },

  // ─── UAE ───────────────────────────────────────────────────
  { name: 'Dubai International Airport', type: 'airport', address: 'Dubai, UAE', country: 'UAE', iata: 'DXB', coords: [55.3644, 25.2532] },
  { name: 'Abu Dhabi International Airport', type: 'airport', address: 'Abu Dhabi, UAE', country: 'UAE', iata: 'AUH', coords: [54.6511, 24.4330] },
  { name: 'Sharjah Airport', type: 'airport', address: 'Sharjah, UAE', country: 'UAE', iata: 'SHJ', coords: [55.5172, 25.3286] },
  { name: 'Dubai', type: 'city', address: 'UAE', country: 'UAE', coords: [55.2708, 25.2048] },
  { name: 'Abu Dhabi', type: 'city', address: 'UAE', country: 'UAE', coords: [54.3773, 24.4539] },
  { name: 'Sharjah', type: 'city', address: 'UAE', country: 'UAE', coords: [55.4033, 25.3463] },
  { name: 'Dubai Marina', type: 'station', address: 'Dubai, UAE', country: 'UAE', coords: [55.1413, 25.0805] },
  { name: 'Burj Khalifa / Dubai Mall', type: 'station', address: 'Dubai, UAE', country: 'UAE', coords: [55.2744, 25.1972] },

  // ─── Egypt ─────────────────────────────────────────────────
  { name: 'Cairo International Airport', type: 'airport', address: 'Cairo, Egypt', country: 'Egypt', iata: 'CAI', coords: [31.4056, 30.1219] },
  { name: 'Hurghada International Airport', type: 'airport', address: 'Hurghada, Egypt', country: 'Egypt', iata: 'HRG', coords: [33.7994, 27.1783] },
  { name: 'Sharm El Sheikh Airport', type: 'airport', address: 'Sharm El Sheikh, Egypt', country: 'Egypt', iata: 'SSH', coords: [34.3950, 27.9773] },
  { name: 'Luxor Airport', type: 'airport', address: 'Luxor, Egypt', country: 'Egypt', iata: 'LXR', coords: [32.7066, 25.6741] },
  { name: 'Cairo', type: 'city', address: 'Egypt', country: 'Egypt', coords: [31.2357, 30.0444] },
  { name: 'Hurghada', type: 'city', address: 'Egypt', country: 'Egypt', coords: [33.8116, 27.2579] },
  { name: 'Sharm El Sheikh', type: 'city', address: 'Egypt', country: 'Egypt', coords: [34.3299, 27.9158] },
  { name: 'Luxor', type: 'city', address: 'Egypt', country: 'Egypt', coords: [32.6396, 25.6872] },
  { name: 'Cairo Ramses Station', type: 'station', address: 'Cairo, Egypt', country: 'Egypt', coords: [31.2467, 30.0626] },

  // ─── Portugal ──────────────────────────────────────────────
  { name: 'Lisbon Humberto Delgado Airport', type: 'airport', address: 'Lisbon, Portugal', country: 'Portugal', iata: 'LIS', coords: [-9.1359, 38.7756] },
  { name: 'Porto Airport', type: 'airport', address: 'Porto, Portugal', country: 'Portugal', iata: 'OPO', coords: [-8.6814, 41.2481] },
  { name: 'Faro Airport', type: 'airport', address: 'Faro, Portugal', country: 'Portugal', iata: 'FAO', coords: [-7.9659, 37.0144] },
  { name: 'Lisbon', type: 'city', address: 'Portugal', country: 'Portugal', coords: [-9.1393, 38.7223] },
  { name: 'Porto', type: 'city', address: 'Portugal', country: 'Portugal', coords: [-8.6291, 41.1579] },
  { name: 'Faro', type: 'city', address: 'Portugal', country: 'Portugal', coords: [-7.9304, 37.0194] },
  { name: 'Lisbon Santa Apolónia Station', type: 'station', address: 'Lisbon, Portugal', country: 'Portugal', coords: [-9.1237, 38.7145] },
  { name: 'Porto São Bento Station', type: 'station', address: 'Porto, Portugal', country: 'Portugal', coords: [-8.6108, 41.1455] },

  // ─── Greece ────────────────────────────────────────────────
  { name: 'Athens International Airport', type: 'airport', address: 'Athens, Greece', country: 'Greece', iata: 'ATH', coords: [23.9445, 37.9364] },
  { name: 'Thessaloniki Airport', type: 'airport', address: 'Thessaloniki, Greece', country: 'Greece', iata: 'SKG', coords: [22.9709, 40.5197] },
  { name: 'Heraklion Airport', type: 'airport', address: 'Heraklion, Crete, Greece', country: 'Greece', iata: 'HER', coords: [25.1809, 35.3397] },
  { name: 'Corfu Airport', type: 'airport', address: 'Corfu, Greece', country: 'Greece', iata: 'CFU', coords: [19.9117, 39.6019] },
  { name: 'Rhodes Airport', type: 'airport', address: 'Rhodes, Greece', country: 'Greece', iata: 'RHO', coords: [28.0862, 36.4054] },
  { name: 'Athens', type: 'city', address: 'Greece', country: 'Greece', coords: [23.7275, 37.9838] },
  { name: 'Thessaloniki', type: 'city', address: 'Greece', country: 'Greece', coords: [22.9444, 40.6401] },
  { name: 'Santorini', type: 'city', address: 'Greece', country: 'Greece', coords: [25.4615, 36.3932] },
  { name: 'Mykonos', type: 'city', address: 'Greece', country: 'Greece', coords: [25.3289, 37.4467] },

  // ─── Netherlands ───────────────────────────────────────────
  { name: 'Amsterdam Schiphol Airport', type: 'airport', address: 'Amsterdam, Netherlands', country: 'Netherlands', iata: 'AMS', coords: [4.7638, 52.3105] },
  { name: 'Eindhoven Airport', type: 'airport', address: 'Eindhoven, Netherlands', country: 'Netherlands', iata: 'EIN', coords: [5.3743, 51.4501] },
  { name: 'Amsterdam', type: 'city', address: 'Netherlands', country: 'Netherlands', coords: [4.9041, 52.3676] },
  { name: 'Rotterdam', type: 'city', address: 'Netherlands', country: 'Netherlands', coords: [4.4777, 51.9244] },
  { name: 'Amsterdam Centraal Station', type: 'station', address: 'Amsterdam, Netherlands', country: 'Netherlands', coords: [4.9003, 52.3791] },

  // ─── Austria ───────────────────────────────────────────────
  { name: 'Vienna-Schwechat International Airport', type: 'airport', address: 'Vienna, Austria', country: 'Austria', iata: 'VIE', coords: [16.5697, 48.1103] },
  { name: 'Salzburg Airport', type: 'airport', address: 'Salzburg, Austria', country: 'Austria', iata: 'SZG', coords: [13.0043, 47.7933] },
  { name: 'Innsbruck Airport', type: 'airport', address: 'Innsbruck, Austria', country: 'Austria', iata: 'INN', coords: [11.3440, 47.2602] },
  { name: 'Vienna', type: 'city', address: 'Austria', country: 'Austria', coords: [16.3738, 48.2082] },
  { name: 'Salzburg', type: 'city', address: 'Austria', country: 'Austria', coords: [13.0550, 47.8095] },
  { name: 'Innsbruck', type: 'city', address: 'Austria', country: 'Austria', coords: [11.3928, 47.2692] },
  { name: 'Wien Hauptbahnhof', type: 'station', address: 'Vienna, Austria', country: 'Austria', coords: [16.3756, 48.1863] },

  // ─── Switzerland ───────────────────────────────────────────
  { name: 'Zurich Airport', type: 'airport', address: 'Zurich, Switzerland', country: 'Switzerland', iata: 'ZRH', coords: [8.5617, 47.4647] },
  { name: 'Geneva Airport', type: 'airport', address: 'Geneva, Switzerland', country: 'Switzerland', iata: 'GVA', coords: [6.1092, 46.2370] },
  { name: 'Zurich', type: 'city', address: 'Switzerland', country: 'Switzerland', coords: [8.5417, 47.3769] },
  { name: 'Geneva', type: 'city', address: 'Switzerland', country: 'Switzerland', coords: [6.1432, 46.2044] },
  { name: 'Bern', type: 'city', address: 'Switzerland', country: 'Switzerland', coords: [7.4474, 46.9480] },
  { name: 'Zurich Hauptbahnhof', type: 'station', address: 'Zurich, Switzerland', country: 'Switzerland', coords: [8.5402, 47.3783] },

  // ─── Belgium ───────────────────────────────────────────────
  { name: 'Brussels Airport', type: 'airport', address: 'Brussels, Belgium', country: 'Belgium', iata: 'BRU', coords: [4.4844, 50.9014] },
  { name: 'Brussels', type: 'city', address: 'Belgium', country: 'Belgium', coords: [4.3517, 50.8503] },
  { name: 'Antwerp', type: 'city', address: 'Belgium', country: 'Belgium', coords: [4.4025, 51.2194] },
  { name: 'Brussels-Midi Station', type: 'station', address: 'Brussels, Belgium', country: 'Belgium', coords: [4.3362, 50.8360] },

  // ─── Tunisia ───────────────────────────────────────────────
  { name: 'Tunis-Carthage Airport', type: 'airport', address: 'Tunis, Tunisia', country: 'Tunisia', iata: 'TUN', coords: [10.2272, 36.8510] },
  { name: 'Enfidha-Hammamet Airport', type: 'airport', address: 'Hammamet, Tunisia', country: 'Tunisia', iata: 'NBE', coords: [10.4386, 36.0758] },
  { name: 'Djerba-Zarzis Airport', type: 'airport', address: 'Djerba, Tunisia', country: 'Tunisia', iata: 'DJE', coords: [10.7755, 33.8750] },
  { name: 'Monastir Airport', type: 'airport', address: 'Monastir, Tunisia', country: 'Tunisia', iata: 'MIR', coords: [10.7547, 35.7581] },
  { name: 'Tunis', type: 'city', address: 'Tunisia', country: 'Tunisia', coords: [10.1658, 36.8065] },
  { name: 'Hammamet', type: 'city', address: 'Tunisia', country: 'Tunisia', coords: [10.6225, 36.4006] },
  { name: 'Sousse', type: 'city', address: 'Tunisia', country: 'Tunisia', coords: [10.6346, 35.8256] },
  { name: 'Djerba', type: 'city', address: 'Tunisia', country: 'Tunisia', coords: [10.8578, 33.8076] },

  // ─── Saudi Arabia ──────────────────────────────────────────
  { name: 'King Khalid International Airport', type: 'airport', address: 'Riyadh, Saudi Arabia', country: 'Saudi Arabia', iata: 'RUH', coords: [46.6988, 24.9578] },
  { name: 'King Abdulaziz International Airport', type: 'airport', address: 'Jeddah, Saudi Arabia', country: 'Saudi Arabia', iata: 'JED', coords: [39.1565, 21.6796] },
  { name: 'Prince Mohammad bin Abdulaziz Airport', type: 'airport', address: 'Medina, Saudi Arabia', country: 'Saudi Arabia', iata: 'MED', coords: [39.7051, 24.5534] },
  { name: 'King Fahd International Airport', type: 'airport', address: 'Dammam, Saudi Arabia', country: 'Saudi Arabia', iata: 'DMM', coords: [49.7979, 26.4712] },
  { name: 'Riyadh', type: 'city', address: 'Saudi Arabia', country: 'Saudi Arabia', coords: [46.6753, 24.7136] },
  { name: 'Jeddah', type: 'city', address: 'Saudi Arabia', country: 'Saudi Arabia', coords: [39.1925, 21.4858] },
  { name: 'Medina', type: 'city', address: 'Saudi Arabia', country: 'Saudi Arabia', coords: [39.6142, 24.4539] },
  { name: 'Mecca', type: 'city', address: 'Saudi Arabia', country: 'Saudi Arabia', coords: [39.8579, 21.3891] },

  // ─── USA (major hubs) ─────────────────────────────────────
  { name: 'JFK International Airport', type: 'airport', address: 'New York, USA', country: 'United States', iata: 'JFK', coords: [-73.7781, 40.6413] },
  { name: 'Los Angeles International Airport', type: 'airport', address: 'Los Angeles, USA', country: 'United States', iata: 'LAX', coords: [-118.4085, 33.9416] },
  { name: 'O\'Hare International Airport', type: 'airport', address: 'Chicago, USA', country: 'United States', iata: 'ORD', coords: [-87.9073, 41.9742] },
  { name: 'Miami International Airport', type: 'airport', address: 'Miami, USA', country: 'United States', iata: 'MIA', coords: [-80.2870, 25.7959] },
  { name: 'San Francisco International Airport', type: 'airport', address: 'San Francisco, USA', country: 'United States', iata: 'SFO', coords: [-122.3790, 37.6213] },
  { name: 'Newark Liberty International Airport', type: 'airport', address: 'Newark, USA', country: 'United States', iata: 'EWR', coords: [-74.1745, 40.6895] },
  { name: 'Hartsfield-Jackson Atlanta Airport', type: 'airport', address: 'Atlanta, USA', country: 'United States', iata: 'ATL', coords: [-84.4281, 33.6407] },
  { name: 'New York', type: 'city', address: 'United States', country: 'United States', coords: [-74.0060, 40.7128] },
  { name: 'Los Angeles', type: 'city', address: 'United States', country: 'United States', coords: [-118.2437, 34.0522] },
  { name: 'Miami', type: 'city', address: 'United States', country: 'United States', coords: [-80.1918, 25.7617] },
  { name: 'Chicago', type: 'city', address: 'United States', country: 'United States', coords: [-87.6298, 41.8781] },
  { name: 'San Francisco', type: 'city', address: 'United States', country: 'United States', coords: [-122.4194, 37.7749] },

  // ─── Thailand ──────────────────────────────────────────────
  { name: 'Suvarnabhumi Airport', type: 'airport', address: 'Bangkok, Thailand', country: 'Thailand', iata: 'BKK', coords: [100.7501, 13.6900] },
  { name: 'Don Mueang Airport', type: 'airport', address: 'Bangkok, Thailand', country: 'Thailand', iata: 'DMK', coords: [100.6072, 13.9126] },
  { name: 'Phuket Airport', type: 'airport', address: 'Phuket, Thailand', country: 'Thailand', iata: 'HKT', coords: [98.3169, 8.1132] },
  { name: 'Chiang Mai Airport', type: 'airport', address: 'Chiang Mai, Thailand', country: 'Thailand', iata: 'CNX', coords: [98.9628, 18.7669] },
  { name: 'Bangkok', type: 'city', address: 'Thailand', country: 'Thailand', coords: [100.5018, 13.7563] },
  { name: 'Phuket', type: 'city', address: 'Thailand', country: 'Thailand', coords: [98.3381, 7.8804] },
  { name: 'Chiang Mai', type: 'city', address: 'Thailand', country: 'Thailand', coords: [98.9853, 18.7883] },
  { name: 'Pattaya', type: 'city', address: 'Thailand', country: 'Thailand', coords: [100.8773, 12.9236] },

  // ─── Mexico ────────────────────────────────────────────────
  { name: 'Mexico City International Airport', type: 'airport', address: 'Mexico City, Mexico', country: 'Mexico', iata: 'MEX', coords: [-99.0721, 19.4363] },
  { name: 'Cancún International Airport', type: 'airport', address: 'Cancún, Mexico', country: 'Mexico', iata: 'CUN', coords: [-86.8770, 21.0365] },
  { name: 'Guadalajara Airport', type: 'airport', address: 'Guadalajara, Mexico', country: 'Mexico', iata: 'GDL', coords: [-103.3110, 20.5218] },
  { name: 'Los Cabos Airport', type: 'airport', address: 'San José del Cabo, Mexico', country: 'Mexico', iata: 'SJD', coords: [-109.7215, 23.1518] },
  { name: 'Mexico City', type: 'city', address: 'Mexico', country: 'Mexico', coords: [-99.1332, 19.4326] },
  { name: 'Cancún', type: 'city', address: 'Mexico', country: 'Mexico', coords: [-86.8515, 21.1619] },
  { name: 'Playa del Carmen', type: 'city', address: 'Mexico', country: 'Mexico', coords: [-87.0739, 20.6296] },
  { name: 'Tulum', type: 'city', address: 'Mexico', country: 'Mexico', coords: [-87.4654, 20.2115] },

  // ─── Croatia ───────────────────────────────────────────────
  { name: 'Zagreb Airport', type: 'airport', address: 'Zagreb, Croatia', country: 'Croatia', iata: 'ZAG', coords: [16.0688, 45.7429] },
  { name: 'Split Airport', type: 'airport', address: 'Split, Croatia', country: 'Croatia', iata: 'SPU', coords: [16.2980, 43.5389] },
  { name: 'Dubrovnik Airport', type: 'airport', address: 'Dubrovnik, Croatia', country: 'Croatia', iata: 'DBV', coords: [18.2682, 42.5614] },
  { name: 'Zagreb', type: 'city', address: 'Croatia', country: 'Croatia', coords: [15.9819, 45.8150] },
  { name: 'Split', type: 'city', address: 'Croatia', country: 'Croatia', coords: [16.4402, 43.5081] },
  { name: 'Dubrovnik', type: 'city', address: 'Croatia', country: 'Croatia', coords: [18.0944, 42.6507] },

  // ─── Czech Republic ────────────────────────────────────────
  { name: 'Prague Václav Havel Airport', type: 'airport', address: 'Prague, Czech Republic', country: 'Czech Republic', iata: 'PRG', coords: [14.2600, 50.1008] },
  { name: 'Prague', type: 'city', address: 'Czech Republic', country: 'Czech Republic', coords: [14.4378, 50.0755] },
  { name: 'Brno', type: 'city', address: 'Czech Republic', country: 'Czech Republic', coords: [16.6068, 49.1951] },
  { name: 'Praha hlavní nádraží', type: 'station', address: 'Prague, Czech Republic', country: 'Czech Republic', coords: [14.4346, 50.0833] },

  // ─── Poland ────────────────────────────────────────────────
  { name: 'Warsaw Chopin Airport', type: 'airport', address: 'Warsaw, Poland', country: 'Poland', iata: 'WAW', coords: [20.9679, 52.1657] },
  { name: 'Kraków Airport', type: 'airport', address: 'Kraków, Poland', country: 'Poland', iata: 'KRK', coords: [19.7847, 50.0777] },
  { name: 'Gdańsk Airport', type: 'airport', address: 'Gdańsk, Poland', country: 'Poland', iata: 'GDN', coords: [18.4662, 54.3776] },
  { name: 'Warsaw', type: 'city', address: 'Poland', country: 'Poland', coords: [21.0122, 52.2297] },
  { name: 'Kraków', type: 'city', address: 'Poland', country: 'Poland', coords: [19.9450, 50.0647] },
  { name: 'Gdańsk', type: 'city', address: 'Poland', country: 'Poland', coords: [18.6466, 54.3520] },
  { name: 'Wrocław', type: 'city', address: 'Poland', country: 'Poland', coords: [17.0385, 51.1079] },

  // ─── Jordan ────────────────────────────────────────────────
  { name: 'Queen Alia International Airport', type: 'airport', address: 'Amman, Jordan', country: 'Jordan', iata: 'AMM', coords: [35.9932, 31.7226] },
  { name: 'Amman', type: 'city', address: 'Jordan', country: 'Jordan', coords: [35.9456, 31.9454] },
  { name: 'Aqaba', type: 'city', address: 'Jordan', country: 'Jordan', coords: [35.0063, 29.5321] },
  { name: 'Dead Sea', type: 'station', address: 'Jordan', country: 'Jordan', coords: [35.4732, 31.5069] },
  { name: 'Petra', type: 'station', address: 'Ma\'an, Jordan', country: 'Jordan', coords: [35.4444, 30.3285] },

  // ─── Algeria ───────────────────────────────────────────────
  { name: 'Algiers Houari Boumediene Airport', type: 'airport', address: 'Algiers, Algeria', country: 'Algeria', iata: 'ALG', coords: [3.2151, 36.6910] },
  { name: 'Oran Ahmed Ben Bella Airport', type: 'airport', address: 'Oran, Algeria', country: 'Algeria', iata: 'ORN', coords: [-0.6214, 35.6240] },
  { name: 'Constantine Airport', type: 'airport', address: 'Constantine, Algeria', country: 'Algeria', iata: 'CZL', coords: [6.6199, 36.2760] },
  { name: 'Algiers', type: 'city', address: 'Algeria', country: 'Algeria', coords: [3.0588, 36.7538] },
  { name: 'Oran', type: 'city', address: 'Algeria', country: 'Algeria', coords: [-0.6426, 35.6969] },
  { name: 'Constantine', type: 'city', address: 'Algeria', country: 'Algeria', coords: [6.6147, 36.3650] },

  // ─── Libya ─────────────────────────────────────────────────
  { name: 'Tripoli International Airport', type: 'airport', address: 'Tripoli, Libya', country: 'Libya', iata: 'TIP', coords: [13.1600, 32.6635] },
  { name: 'Benina International Airport', type: 'airport', address: 'Benghazi, Libya', country: 'Libya', iata: 'BEN', coords: [20.2695, 32.0968] },
  { name: 'Tripoli', type: 'city', address: 'Libya', country: 'Libya', coords: [13.1913, 32.8872] },
  { name: 'Benghazi', type: 'city', address: 'Libya', country: 'Libya', coords: [20.0686, 32.1194] },
  { name: 'Misrata', type: 'city', address: 'Libya', country: 'Libya', coords: [15.0900, 32.3754] },

  // ─── Senegal ───────────────────────────────────────────────
  { name: 'Blaise Diagne International Airport', type: 'airport', address: 'Dakar, Senegal', country: 'Senegal', iata: 'DSS', coords: [-17.0731, 14.6708] },
  { name: 'Dakar', type: 'city', address: 'Senegal', country: 'Senegal', coords: [-17.4677, 14.7167] },
  { name: 'Saint-Louis', type: 'city', address: 'Senegal', country: 'Senegal', coords: [-16.4818, 16.0326] },

  // ─── South Africa ─────────────────────────────────────────
  { name: 'O.R. Tambo International Airport', type: 'airport', address: 'Johannesburg, South Africa', country: 'South Africa', iata: 'JNB', coords: [28.2314, -26.1367] },
  { name: 'Cape Town International Airport', type: 'airport', address: 'Cape Town, South Africa', country: 'South Africa', iata: 'CPT', coords: [18.6017, -33.9715] },
  { name: 'King Shaka International Airport', type: 'airport', address: 'Durban, South Africa', country: 'South Africa', iata: 'DUR', coords: [31.1194, -29.6144] },
  { name: 'Johannesburg', type: 'city', address: 'South Africa', country: 'South Africa', coords: [28.0473, -26.2041] },
  { name: 'Cape Town', type: 'city', address: 'South Africa', country: 'South Africa', coords: [18.4241, -33.9249] },
  { name: 'Durban', type: 'city', address: 'South Africa', country: 'South Africa', coords: [31.0218, -29.8587] },

  // ─── India ─────────────────────────────────────────────────
  { name: 'Indira Gandhi International Airport', type: 'airport', address: 'New Delhi, India', country: 'India', iata: 'DEL', coords: [77.1025, 28.5562] },
  { name: 'Chhatrapati Shivaji Airport', type: 'airport', address: 'Mumbai, India', country: 'India', iata: 'BOM', coords: [72.8679, 19.0896] },
  { name: 'Kempegowda International Airport', type: 'airport', address: 'Bangalore, India', country: 'India', iata: 'BLR', coords: [77.7068, 13.1986] },
  { name: 'Rajiv Gandhi International Airport', type: 'airport', address: 'Hyderabad, India', country: 'India', iata: 'HYD', coords: [78.4298, 17.2403] },
  { name: 'New Delhi', type: 'city', address: 'India', country: 'India', coords: [77.2090, 28.6139] },
  { name: 'Mumbai', type: 'city', address: 'India', country: 'India', coords: [72.8777, 19.0760] },
  { name: 'Bangalore', type: 'city', address: 'India', country: 'India', coords: [77.5946, 12.9716] },
  { name: 'Goa', type: 'city', address: 'India', country: 'India', coords: [74.1240, 15.2993] },
  { name: 'Jaipur', type: 'city', address: 'India', country: 'India', coords: [75.7873, 26.9124] },
  { name: 'New Delhi Railway Station', type: 'station', address: 'New Delhi, India', country: 'India', coords: [77.2273, 28.6424] },
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
const EUROPEAN_COUNTRIES = new Set([
  'albania', 'andorra', 'austria', 'belgium', 'bosnia and herzegovina', 'bulgaria',
  'croatia', 'cyprus', 'czech republic', 'denmark', 'estonia', 'finland', 'france',
  'germany', 'greece', 'hungary', 'iceland', 'ireland', 'italy', 'kosovo', 'latvia',
  'liechtenstein', 'lithuania', 'luxembourg', 'malta', 'moldova', 'monaco', 'montenegro',
  'netherlands', 'north macedonia', 'norway', 'poland', 'portugal', 'romania', 'serbia',
  'slovakia', 'slovenia', 'spain', 'sweden', 'switzerland', 'turkey', 'ukraine',
  'united kingdom',
]);

/**
 * Search POIs by query string. Returns matched POIs sorted by relevance.
 * Only returns results from European countries.
 */
export function searchPOIs(query: string, country: string): POI[] {
  if (!query || query.trim().length < 1) return [];

  const agencyCountry = country.trim().toLowerCase();
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

      // Boost agency's own country
      if (agencyCountry && poi.country.toLowerCase() === agencyCountry) score += 30;

      return { ...poi, score };
    })
    .filter((r): r is POI & { score: number } => r !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 15);

  return scored.map(({ score: _, ...rest }) => rest);
}

export default DB;
