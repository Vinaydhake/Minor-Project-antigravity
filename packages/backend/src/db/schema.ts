import { db } from './connection.js';
import { logger } from '../logger.js';

export function initSchema() {
  logger.info('Initializing SQLite schema...');

  // 1. Countries table
  db.exec(`
    CREATE TABLE IF NOT EXISTS countries (
      code TEXT PRIMARY KEY CHECK(length(code) = 3),
      name TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      totalEmissions REAL NOT NULL,
      perCapita REAL NOT NULL,
      population REAL NOT NULL,
      gdp REAL NOT NULL,
      forestCoverage REAL NOT NULL,
      rank INTEGER NOT NULL
    )
  `);

  // 2. Country Emissions (historical time series)
  db.exec(`
    CREATE TABLE IF NOT EXISTS country_emissions (
      countryCode TEXT NOT NULL,
      year INTEGER NOT NULL,
      emissions REAL NOT NULL,
      PRIMARY KEY (countryCode, year),
      FOREIGN KEY (countryCode) REFERENCES countries(code) ON DELETE CASCADE
    )
  `);

  // 3. Country Sector breakdown
  db.exec(`
    CREATE TABLE IF NOT EXISTS country_sectors (
      countryCode TEXT NOT NULL,
      sector TEXT NOT NULL,
      percentage REAL NOT NULL,
      PRIMARY KEY (countryCode, sector),
      FOREIGN KEY (countryCode) REFERENCES countries(code) ON DELETE CASCADE
    )
  `);

  // 4. States table (e.g. for India state choropleth map)
  db.exec(`
    CREATE TABLE IF NOT EXISTS states (
      code TEXT PRIMARY KEY,
      countryCode TEXT NOT NULL,
      name TEXT NOT NULL,
      emissions REAL NOT NULL,
      population REAL NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      topSectors TEXT NOT NULL, -- JSON string
      FOREIGN KEY (countryCode) REFERENCES countries(code) ON DELETE CASCADE
    )
  `);

  // 5. Cities table
  db.exec(`
    CREATE TABLE IF NOT EXISTS cities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stateCode TEXT NOT NULL,
      name TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      estimatedEmissions REAL NOT NULL,
      population REAL NOT NULL,
      FOREIGN KEY (stateCode) REFERENCES states(code) ON DELETE CASCADE
    )
  `);

  // Create indexes for faster lookups
  db.exec(`CREATE INDEX IF NOT EXISTS idx_emissions_country ON country_emissions(countryCode)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_sectors_country ON country_sectors(countryCode)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_states_country ON states(countryCode)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_cities_state ON cities(stateCode)`);

  logger.info('SQLite schema initialized successfully.');
}
