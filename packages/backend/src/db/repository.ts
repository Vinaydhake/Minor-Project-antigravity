import { db } from './connection.js';
import {
  City,
  Country,
  CountryDetail,
  CountryEmission,
  CountrySector,
  State,
  StateRecord,
} from '../types/index.js';

interface RepositoryStatements {
  selectAllCountriesStmt: any;
  selectCountryByCodeStmt: any;
  selectEmissionsByCountryStmt: any;
  selectSectorsByCountryStmt: any;
  selectStatesByCountryStmt: any;
  selectCitiesByStateStmt: any;
}

let statements: RepositoryStatements | null = null;

function ensureStatements() {
  if (statements) {
    return statements;
  }

  statements = {
    selectAllCountriesStmt: db.prepare(`
      SELECT code, name, lat, lng, totalEmissions, perCapita, population, gdp, forestCoverage, rank
      FROM countries
      ORDER BY rank ASC
    `),
    selectCountryByCodeStmt: db.prepare(`
      SELECT code, name, lat, lng, totalEmissions, perCapita, population, gdp, forestCoverage, rank
      FROM countries
      WHERE code = ?
    `),
    selectEmissionsByCountryStmt: db.prepare(`
      SELECT countryCode, year, emissions
      FROM country_emissions
      WHERE countryCode = ?
      ORDER BY year ASC
    `),
    selectSectorsByCountryStmt: db.prepare(`
      SELECT countryCode, sector, percentage
      FROM country_sectors
      WHERE countryCode = ?
    `),
    selectStatesByCountryStmt: db.prepare(`
      SELECT code, countryCode, name, emissions, population, lat, lng, topSectors
      FROM states
      WHERE countryCode = ?
      ORDER BY name ASC
    `),
    selectCitiesByStateStmt: db.prepare(`
      SELECT id, stateCode, name, lat, lng, estimatedEmissions, population
      FROM cities
      WHERE stateCode = ?
      ORDER BY estimatedEmissions DESC
    `),
  };

  return statements;
}

// 2. Export Repository API
export const repository = {
  getAllCountries(): Country[] {
    const { selectAllCountriesStmt } = ensureStatements();
    return selectAllCountriesStmt.all() as Country[];
  },

  getCountryByCode(code: string): CountryDetail | null {
    const {
      selectCountryByCodeStmt,
      selectEmissionsByCountryStmt,
      selectSectorsByCountryStmt,
    } = ensureStatements();

    const country = selectCountryByCodeStmt.get(code.toUpperCase()) as Country | undefined;
    if (!country) return null;

    const emissions = selectEmissionsByCountryStmt.all(country.code) as CountryEmission[];
    const sectorBreakdown = selectSectorsByCountryStmt.all(country.code) as CountrySector[];

    return {
      ...country,
      historicalData: emissions,
      sectorBreakdown,
    };
  },

  getHistoricalEmissions(code: string): CountryEmission[] {
    const { selectEmissionsByCountryStmt } = ensureStatements();
    return selectEmissionsByCountryStmt.all(code.toUpperCase()) as CountryEmission[];
  },

  getStatesByCountry(countryCode: string): State[] {
    const { selectStatesByCountryStmt } = ensureStatements();
    const states = selectStatesByCountryStmt.all(countryCode.toUpperCase()) as StateRecord[];

    return states.map((state) => ({
      ...state,
      topSectors: JSON.parse(state.topSectors),
    }));
  },

  getCitiesByState(stateCode: string): City[] {
    const { selectCitiesByStateStmt } = ensureStatements();
    return selectCitiesByStateStmt.all(stateCode.toUpperCase()) as City[];
  },
};
