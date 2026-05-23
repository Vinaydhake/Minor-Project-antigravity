import { db } from './connection.js';
import { logger } from '../logger.js';

// Main countries data template
const countryTemplates = [
  { code: 'CHN', name: 'China', lat: 35.8617, lng: 104.1954, baseEmissions: 11400, pop: 1412.0, gdp: 17960, forest: 23.0, trend: 1.02 },
  { code: 'USA', name: 'United States', lat: 37.0902, lng: -95.7129, baseEmissions: 5000, pop: 333.0, gdp: 25460, forest: 33.9, trend: 0.97 },
  { code: 'IND', name: 'India', lat: 20.5937, lng: 78.9629, baseEmissions: 3200, pop: 1408.0, gdp: 3390, forest: 24.3, trend: 1.04 },
  { code: 'RUS', name: 'Russia', lat: 61.5240, lng: 105.3188, baseEmissions: 1700, pop: 143.4, gdp: 2240, forest: 49.8, trend: 0.99 },
  { code: 'JPN', name: 'Japan', lat: 36.2048, lng: 138.2529, baseEmissions: 1100, pop: 125.1, gdp: 4230, forest: 68.4, trend: 0.96 },
  { code: 'DEU', name: 'Germany', lat: 51.1657, lng: 10.4515, baseEmissions: 670, pop: 83.2, gdp: 4070, forest: 32.7, trend: 0.95 },
  { code: 'CAN', name: 'Canada', lat: 56.1304, lng: -106.3468, baseEmissions: 650, pop: 38.9, gdp: 2140, forest: 38.2, trend: 0.98 },
  { code: 'BRA', name: 'Brazil', lat: -14.2350, lng: -51.9253, baseEmissions: 480, pop: 215.3, gdp: 1920, forest: 58.9, trend: 1.01 },
  { code: 'GBR', name: 'United Kingdom', lat: 55.3781, lng: -3.4360, baseEmissions: 340, pop: 67.3, gdp: 3070, forest: 13.1, trend: 0.93 },
  { code: 'FRA', name: 'France', lat: 46.2276, lng: 2.2137, baseEmissions: 310, pop: 67.9, gdp: 2780, forest: 31.0, trend: 0.94 },
  { code: 'AUS', name: 'Australia', lat: -25.2744, lng: 133.7751, baseEmissions: 390, pop: 26.0, gdp: 1680, forest: 16.0, trend: 0.98 },
  { code: 'IDN', name: 'Indonesia', lat: -0.7893, lng: 113.9213, baseEmissions: 600, pop: 275.5, gdp: 1320, forest: 49.1, trend: 1.03 },
  { code: 'SAU', name: 'Saudi Arabia', lat: 23.8859, lng: 45.0792, baseEmissions: 620, pop: 36.4, gdp: 1110, forest: 0.5, trend: 1.02 },
  { code: 'KOR', name: 'South Korea', lat: 35.9078, lng: 127.7669, baseEmissions: 610, pop: 51.7, gdp: 1670, forest: 63.0, trend: 0.97 },
  { code: 'MEX', name: 'Mexico', lat: 23.6345, lng: -102.5528, baseEmissions: 450, pop: 127.5, gdp: 1410, forest: 33.0, trend: 1.00 },
  { code: 'IRN', name: 'Iran', lat: 32.4279, lng: 53.6880, baseEmissions: 720, pop: 88.5, gdp: 390, forest: 6.8, trend: 1.02 },
  { code: 'ZAF', name: 'South Africa', lat: -30.5595, lng: 22.9375, baseEmissions: 440, pop: 59.9, gdp: 405, forest: 7.6, trend: 0.99 },
  { code: 'ITA', name: 'Italy', lat: 41.8719, lng: 12.5674, baseEmissions: 320, pop: 58.9, gdp: 2010, forest: 32.0, trend: 0.95 },
  { code: 'TUR', name: 'Turkey', lat: 38.9637, lng: 35.2433, baseEmissions: 430, pop: 85.3, gdp: 1030, forest: 29.0, trend: 1.01 },
  { code: 'ESP', name: 'Spain', lat: 40.4637, lng: -3.7492, baseEmissions: 240, pop: 47.6, gdp: 1400, forest: 37.0, trend: 0.94 },
  { code: 'POL', name: 'Poland', lat: 51.9194, lng: 19.1451, baseEmissions: 310, pop: 37.8, gdp: 688, forest: 31.0, trend: 0.97 },
  { code: 'UKR', name: 'Ukraine', lat: 48.3794, lng: 31.1656, baseEmissions: 180, pop: 38.0, gdp: 160, forest: 16.0, trend: 0.90 },
  { code: 'EGY', name: 'Egypt', lat: 26.8206, lng: 30.8025, baseEmissions: 250, pop: 110.9, gdp: 476, forest: 0.1, trend: 1.02 },
  { code: 'VNM', name: 'Vietnam', lat: 14.0583, lng: 108.2772, baseEmissions: 320, pop: 98.2, gdp: 408, forest: 47.0, trend: 1.04 },
  { code: 'PAK', name: 'Pakistan', lat: 30.3753, lng: 69.3451, baseEmissions: 240, pop: 235.8, gdp: 376, forest: 1.9, trend: 1.03 },
  { code: 'ARG', name: 'Argentina', lat: -38.4161, lng: -63.6167, baseEmissions: 190, pop: 46.2, gdp: 632, forest: 10.4, trend: 0.99 },
  { code: 'THA', name: 'Thailand', lat: 15.8700, lng: 100.9925, baseEmissions: 270, pop: 71.7, gdp: 495, forest: 38.9, trend: 1.01 },
  { code: 'NLD', name: 'Netherlands', lat: 52.1326, lng: 5.2913, baseEmissions: 140, pop: 17.7, gdp: 991, forest: 11.1, trend: 0.93 },
  { code: 'MYS', name: 'Malaysia', lat: 4.2105, lng: 101.9758, baseEmissions: 250, pop: 33.9, gdp: 406, forest: 58.0, trend: 1.02 },
  { code: 'PHL', name: 'Philippines', lat: 12.8797, lng: 121.7740, baseEmissions: 150, pop: 115.6, gdp: 404, forest: 23.0, trend: 1.03 },
  { code: 'COL', name: 'Colombia', lat: 4.5709, lng: -74.2973, baseEmissions: 100, pop: 51.8, gdp: 343, forest: 52.0, trend: 1.00 },
  { code: 'NGA', name: 'Nigeria', lat: 9.0820, lng: 8.6753, baseEmissions: 130, pop: 218.5, gdp: 477, forest: 22.0, trend: 1.02 },
  { code: 'DZA', name: 'Algeria', lat: 28.0339, lng: 1.6596, baseEmissions: 140, pop: 44.9, gdp: 191, forest: 0.8, trend: 1.01 },
  { code: 'KAZ', name: 'Kazakhstan', lat: 48.0196, lng: 66.9237, baseEmissions: 230, pop: 19.6, gdp: 220, forest: 1.2, trend: 1.01 },
  { code: 'ARE', name: 'United Arab Emirates', lat: 23.4241, lng: 53.8478, baseEmissions: 220, pop: 9.4, gdp: 507, forest: 4.5, trend: 1.01 },
  { code: 'IRQ', name: 'Iraq', lat: 33.2232, lng: 43.6793, baseEmissions: 150, pop: 44.5, gdp: 264, forest: 1.9, trend: 1.02 },
  { code: 'VEN', name: 'Venezuela', lat: 6.4238, lng: -66.5897, baseEmissions: 90, pop: 28.3, gdp: 90, forest: 52.0, trend: 0.96 },
  { code: 'BGD', name: 'Bangladesh', lat: 23.6850, lng: 90.3563, baseEmissions: 110, pop: 171.2, gdp: 460, forest: 11.0, trend: 1.04 },
  { code: 'BEL', name: 'Belgium', lat: 50.5039, lng: 4.4699, baseEmissions: 95, pop: 11.7, gdp: 582, forest: 22.0, trend: 0.94 },
  { code: 'SGP', name: 'Singapore', lat: 1.3521, lng: 103.8198, baseEmissions: 55, pop: 5.6, gdp: 466, forest: 23.0, trend: 1.00 },
  { code: 'CHL', name: 'Chile', lat: -35.6751, lng: -71.5430, baseEmissions: 85, pop: 19.6, gdp: 300, forest: 22.0, trend: 0.98 },
  { code: 'ROU', name: 'Romania', lat: 45.9432, lng: 24.9668, baseEmissions: 80, pop: 19.0, gdp: 301, forest: 28.7, trend: 0.96 },
  { code: 'GRC', name: 'Greece', lat: 39.0742, lng: 21.8243, baseEmissions: 65, pop: 10.4, gdp: 219, forest: 31.0, trend: 0.93 },
  { code: 'AUT', name: 'Austria', lat: 47.5162, lng: 14.5501, baseEmissions: 68, pop: 9.0, gdp: 471, forest: 47.0, trend: 0.95 },
  { code: 'CHE', name: 'Switzerland', lat: 46.8182, lng: 8.2275, baseEmissions: 42, pop: 8.8, gdp: 807, forest: 31.5, trend: 0.94 },
  { code: 'SWE', name: 'Sweden', lat: 60.1282, lng: 18.6435, baseEmissions: 45, pop: 10.5, gdp: 585, forest: 68.7, trend: 0.94 },
  { code: 'NOR', name: 'Norway', lat: 60.4720, lng: 8.4689, baseEmissions: 43, pop: 5.4, gdp: 579, forest: 33.0, trend: 0.95 },
  { code: 'NZL', name: 'New Zealand', lat: -40.9006, lng: 174.8860, baseEmissions: 78, pop: 5.1, gdp: 247, forest: 37.0, trend: 0.98 },
  { code: 'PER', name: 'Peru', lat: -9.1900, lng: -75.0152, baseEmissions: 65, pop: 34.0, gdp: 242, forest: 57.0, trend: 1.01 },
  { code: 'NPL', name: 'Nepal', lat: 28.3949, lng: 84.1240, baseEmissions: 22, pop: 30.5, gdp: 40, forest: 40.0, trend: 1.02 },
];

const sectorDistribution = {
  energy: 0.40,
  transport: 0.20,
  industry: 0.18,
  agriculture: 0.12,
  buildings: 0.06,
  waste: 0.04
};

// India states data
const indiaStates = [
  { name: 'Andhra Pradesh', code: 'AP', baseEmissions: 140, pop: 53.0, lat: 15.9129, lng: 79.7400 },
  { name: 'Arunachal Pradesh', code: 'AR', baseEmissions: 3, pop: 1.5, lat: 28.2180, lng: 94.7278 },
  { name: 'Assam', code: 'AS', baseEmissions: 45, pop: 35.6, lat: 26.2006, lng: 92.9376 },
  { name: 'Bihar', code: 'BR', baseEmissions: 110, pop: 125.0, lat: 25.0961, lng: 85.3131 },
  { name: 'Chhattisgarh', code: 'CT', baseEmissions: 180, pop: 29.4, lat: 21.2787, lng: 81.8661 },
  { name: 'Goa', code: 'GA', baseEmissions: 8, pop: 1.6, lat: 15.2993, lng: 74.1240 },
  { name: 'Gujarat', code: 'GJ', baseEmissions: 280, pop: 63.8, lat: 22.2587, lng: 71.1924 },
  { name: 'Haryana', code: 'HR', baseEmissions: 95, pop: 28.9, lat: 29.0588, lng: 76.0856 },
  { name: 'Himachal Pradesh', code: 'HP', baseEmissions: 12, pop: 7.4, lat: 31.1048, lng: 77.1734 },
  { name: 'Jharkhand', code: 'JH', baseEmissions: 170, pop: 38.5, lat: 23.6102, lng: 85.2799 },
  { name: 'Karnataka', code: 'KA', baseEmissions: 165, pop: 67.5, lat: 15.3173, lng: 75.7139 },
  { name: 'Kerala', code: 'KL', baseEmissions: 40, pop: 35.7, lat: 10.8505, lng: 76.2711 },
  { name: 'Madhya Pradesh', code: 'MP', baseEmissions: 210, pop: 85.4, lat: 22.9734, lng: 78.6569 },
  { name: 'Maharashtra', code: 'MH', baseEmissions: 340, pop: 123.1, lat: 19.7515, lng: 75.7139 },
  { name: 'Manipur', code: 'MN', baseEmissions: 2, pop: 3.1, lat: 24.6637, lng: 93.9063 },
  { name: 'Meghalaya', code: 'ML', baseEmissions: 4, pop: 3.3, lat: 25.4670, lng: 91.3662 },
  { name: 'Mizoram', code: 'MZ', baseEmissions: 1, pop: 1.2, lat: 23.1645, lng: 92.9376 },
  { name: 'Nagaland', code: 'NL', baseEmissions: 2, pop: 2.2, lat: 26.1584, lng: 94.5624 },
  { name: 'Odisha', code: 'OR', baseEmissions: 220, pop: 45.7, lat: 20.9517, lng: 85.0985 },
  { name: 'Punjab', code: 'PB', baseEmissions: 115, pop: 30.1, lat: 31.1471, lng: 75.3412 },
  { name: 'Rajasthan', code: 'RJ', baseEmissions: 195, pop: 81.0, lat: 27.0238, lng: 74.2179 },
  { name: 'Sikkim', code: 'SK', baseEmissions: 1, pop: 0.7, lat: 27.5330, lng: 88.5122 },
  { name: 'Tamil Nadu', code: 'TN', baseEmissions: 210, pop: 76.4, lat: 11.1271, lng: 78.6569 },
  { name: 'Telangana', code: 'TG', baseEmissions: 130, pop: 38.0, lat: 18.1124, lng: 79.0193 },
  { name: 'Tripura', code: 'TR', baseEmissions: 3, pop: 4.1, lat: 23.9408, lng: 91.9882 },
  { name: 'Uttar Pradesh', code: 'UP', baseEmissions: 320, pop: 237.9, lat: 26.8467, lng: 80.9462 },
  { name: 'Uttarakhand', code: 'UT', baseEmissions: 18, pop: 11.2, lat: 30.0668, lng: 79.0193 },
  { name: 'West Bengal', code: 'WB', baseEmissions: 185, pop: 99.0, lat: 22.9868, lng: 87.8550 },
  { name: 'Jammu & Kashmir', code: 'JK', baseEmissions: 15, pop: 13.6, lat: 33.7782, lng: 76.5762 },
  { name: 'Delhi', code: 'DL', baseEmissions: 48, pop: 20.0, lat: 28.7041, lng: 77.1025 },
];

const stateCityTemplates: { [stateCode: string]: { name: string; emissionsPercent: number; popPercent: number; lat: number; lng: number }[] } = {
  MH: [
    { name: 'Mumbai', emissionsPercent: 0.35, popPercent: 0.17, lat: 19.0760, lng: 72.8777 },
    { name: 'Pune', emissionsPercent: 0.18, popPercent: 0.08, lat: 18.5204, lng: 73.8567 },
    { name: 'Nagpur', emissionsPercent: 0.10, popPercent: 0.03, lat: 21.1458, lng: 79.0882 },
    { name: 'Nashik', emissionsPercent: 0.07, popPercent: 0.02, lat: 19.9975, lng: 73.7898 },
    { name: 'Thane', emissionsPercent: 0.12, popPercent: 0.07, lat: 19.2183, lng: 72.9781 }
  ],
  DL: [
    { name: 'New Delhi', emissionsPercent: 0.40, popPercent: 0.35, lat: 28.6139, lng: 77.2090 },
    { name: 'Dwarka', emissionsPercent: 0.15, popPercent: 0.15, lat: 28.5880, lng: 77.0583 },
    { name: 'Rohini', emissionsPercent: 0.18, popPercent: 0.20, lat: 28.7431, lng: 77.1181 },
    { name: 'South Delhi', emissionsPercent: 0.27, popPercent: 0.30, lat: 28.5244, lng: 77.2104 }
  ],
  GJ: [
    { name: 'Ahmedabad', emissionsPercent: 0.30, popPercent: 0.12, lat: 23.0225, lng: 72.5714 },
    { name: 'Surat', emissionsPercent: 0.25, popPercent: 0.10, lat: 21.1702, lng: 72.8311 },
    { name: 'Vadodara', emissionsPercent: 0.15, popPercent: 0.06, lat: 22.3072, lng: 73.1812 },
    { name: 'Rajkot', emissionsPercent: 0.10, popPercent: 0.04, lat: 22.3039, lng: 70.8022 },
    { name: 'Jamnagar', emissionsPercent: 0.12, popPercent: 0.02, lat: 22.4707, lng: 70.0577 }
  ],
  KA: [
    { name: 'Bengaluru', emissionsPercent: 0.45, popPercent: 0.18, lat: 12.9716, lng: 77.5946 },
    { name: 'Mysuru', emissionsPercent: 0.10, popPercent: 0.03, lat: 12.2958, lng: 76.6394 },
    { name: 'Hubballi-Dharwad', emissionsPercent: 0.08, popPercent: 0.02, lat: 15.3647, lng: 75.1240 },
    { name: 'Mangaluru', emissionsPercent: 0.12, popPercent: 0.02, lat: 12.9141, lng: 74.8560 },
    { name: 'Belagavi', emissionsPercent: 0.05, popPercent: 0.02, lat: 15.8497, lng: 74.4977 }
  ],
  TN: [
    { name: 'Chennai', emissionsPercent: 0.38, popPercent: 0.13, lat: 13.0827, lng: 80.2707 },
    { name: 'Coimbatore', emissionsPercent: 0.18, popPercent: 0.04, lat: 11.0168, lng: 76.9558 },
    { name: 'Madurai', emissionsPercent: 0.10, popPercent: 0.03, lat: 9.9252, lng: 78.1198 },
    { name: 'Tiruchirappalli', emissionsPercent: 0.08, popPercent: 0.02, lat: 10.7905, lng: 78.7047 },
    { name: 'Salem', emissionsPercent: 0.08, popPercent: 0.02, lat: 11.6643, lng: 78.1460 }
  ]
};

// Top sectors for state tooltip (JSON)
const defaultStateSectors = [
  { name: 'Energy', value: 45, color: '#22C55E' },
  { name: 'Industry', value: 20, color: '#F97316' },
  { name: 'Transport', value: 15, color: '#38BDF8' },
  { name: 'Agriculture', value: 12, color: '#EAB308' },
  { name: 'Waste', value: 5, color: '#A78BFA' },
  { name: 'Buildings', value: 3, color: '#EC4899' }
];

export function seedData() {
  const checkCount = db.prepare('SELECT count(*) as count FROM countries').get() as { count: number };
  if (checkCount && checkCount.count > 0) {
    logger.info('Database already seeded. Skipping seed process.');
    return;
  }

  logger.info('Database is empty. Seeding synthetic data...');

  const insertCountry = db.prepare(`
    INSERT INTO countries (code, name, lat, lng, totalEmissions, perCapita, population, gdp, forestCoverage, rank)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertEmission = db.prepare(`
    INSERT INTO country_emissions (countryCode, year, emissions)
    VALUES (?, ?, ?)
  `);

  const insertSector = db.prepare(`
    INSERT INTO country_sectors (countryCode, sector, percentage)
    VALUES (?, ?, ?)
  `);

  const insertState = db.prepare(`
    INSERT INTO states (code, countryCode, name, emissions, population, lat, lng, topSectors)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertCity = db.prepare(`
    INSERT INTO cities (stateCode, name, lat, lng, estimatedEmissions, population)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Wrap all inserts in a transaction for extreme speed
  const runSeedingTransaction = db.transaction(() => {
    // 1. Sort country templates by emissions to calculate rank
    const sortedCountries = [...countryTemplates].sort((a, b) => b.baseEmissions - a.baseEmissions);

    sortedCountries.forEach((tpl, index) => {
      const rank = index + 1;
      // Calculate latest emissions (year 2023)
      let emissionsYear = tpl.baseEmissions;
      const years = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023];
      
      const emissionsMap: { [year: number]: number } = {};
      
      years.forEach((yr) => {
        // Generate trend with slight random variance
        const yearDiff = yr - 2015;
        let scale = Math.pow(tpl.trend, yearDiff);
        
        // 2020 COVID dip (-6% to -10%)
        if (yr === 2020) {
          scale *= 0.92;
        }
        
        // Small random noise (±1.5%)
        const noise = 1 + (Math.random() * 0.03 - 0.015);
        let val = tpl.baseEmissions * scale * noise;
        
        // Clamp to positive values
        val = Math.max(0.1, parseFloat(val.toFixed(2)));
        emissionsMap[yr] = val;
      });

      const totalEmissions2023 = emissionsMap[2023];
      const perCapita2023 = parseFloat((totalEmissions2023 / tpl.pop).toFixed(3)); // Mt / millions = tCO2e per capita

      // Insert Country
      insertCountry.run(
        tpl.code,
        tpl.name,
        tpl.lat,
        tpl.lng,
        totalEmissions2023,
        perCapita2023,
        tpl.pop,
        tpl.gdp,
        tpl.forest,
        rank
      );

      // Insert Historical Emissions
      years.forEach((yr) => {
        insertEmission.run(tpl.code, yr, emissionsMap[yr]);
      });

      // Insert Sectors
      // Introduce slight randomness in sectors per country
      let remaining = 1.0;
      const sectorsList = Object.entries(sectorDistribution);
      sectorsList.forEach(([sec, val], idx) => {
        let percent = val;
        if (idx === sectorsList.length - 1) {
          percent = remaining;
        } else {
          // Add minor noise to sector distribution (±2%)
          const noise = Math.random() * 0.04 - 0.02;
          percent = Math.max(0.01, parseFloat((val + noise).toFixed(3)));
          remaining -= percent;
        }
        insertSector.run(tpl.code, sec, percent * 100);
      });
    });

    // 2. Seed Indian States
    indiaStates.forEach((state) => {
      // Create a slightly randomized sector breakdown for each state
      const stateSectors = defaultStateSectors.map(s => {
        const noise = Math.floor(Math.random() * 6) - 3; // ±3%
        return {
          ...s,
          value: Math.max(1, s.value + noise)
        };
      });
      // Normalize sum to 100
      const sum = stateSectors.reduce((a, b) => a + b.value, 0);
      stateSectors.forEach(s => {
        s.value = parseFloat(((s.value / sum) * 100).toFixed(1));
      });

      insertState.run(
        state.code,
        'IND',
        state.name,
        state.baseEmissions,
        state.pop,
        state.lat,
        state.lng,
        JSON.stringify(stateSectors)
      );

      // 3. Seed cities for this state
      const cities = stateCityTemplates[state.code] || [];
      if (cities.length > 0) {
        cities.forEach(city => {
          const cityEmissions = parseFloat((state.baseEmissions * city.emissionsPercent).toFixed(2));
          const cityPop = parseFloat((state.pop * city.popPercent).toFixed(2));
          insertCity.run(
            state.code,
            city.name,
            city.lat,
            city.lng,
            cityEmissions,
            cityPop
          );
        });
      } else {
        // Generate default cities if not specified
        const defaultCities = [
          { name: `${state.name} City Central`, latDiff: 0.1, lngDiff: 0.1, eP: 0.25, pP: 0.20 },
          { name: `${state.name} East`, latDiff: -0.15, lngDiff: 0.2, eP: 0.15, pP: 0.12 },
          { name: `${state.name} Metro North`, latDiff: 0.25, lngDiff: -0.05, eP: 0.20, pP: 0.15 }
        ];
        defaultCities.forEach(city => {
          const cityEmissions = parseFloat((state.baseEmissions * city.eP).toFixed(2));
          const cityPop = parseFloat((state.pop * city.pP).toFixed(2));
          insertCity.run(
            state.code,
            city.name,
            state.lat + city.latDiff,
            state.lng + city.lngDiff,
            cityEmissions,
            cityPop
          );
        });
      }
    });
  });

  runSeedingTransaction();
  logger.info('Database seeded successfully with all synthetic emissions data!');
}
