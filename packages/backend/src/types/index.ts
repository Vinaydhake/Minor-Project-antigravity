export type TrendDirection = 'increasing' | 'decreasing' | 'stable';

export interface Country {
  code: string;
  name: string;
  lat: number;
  lng: number;
  totalEmissions: number;
  perCapita: number;
  population: number;
  gdp: number;
  forestCoverage: number;
  rank: number;
}

export interface CountryEmission {
  countryCode: string;
  year: number;
  emissions: number;
}

export interface CountrySector {
  countryCode: string;
  sector: string;
  percentage: number;
}

export interface CountryDetail extends Country {
  historicalData: CountryEmission[];
  sectorBreakdown: CountrySector[];
}

export interface StateSector {
  name: string;
  value: number;
  color: string;
}

export interface StateRecord {
  code: string;
  countryCode: string;
  name: string;
  emissions: number;
  population: number;
  lat: number;
  lng: number;
  topSectors: string;
}

export interface State {
  code: string;
  countryCode: string;
  name: string;
  emissions: number;
  population: number;
  lat: number;
  lng: number;
  topSectors: StateSector[];
}

export interface City {
  id: number;
  stateCode: string;
  name: string;
  lat: number;
  lng: number;
  estimatedEmissions: number;
  population: number;
}

export interface CountryCityMarker {
  code: string;
  countryCode: string;
  name: string;
  lat: number;
  lng: number;
  estimatedEmissions: number;
  population: number;
  topSector: string;
}

export interface ForecastPoint {
  year: number;
  emissions: number;
  isForecast: boolean;
  confLower?: number;
  confUpper?: number;
}

export interface ForecastResult {
  slope: number;
  intercept: number;
  rSquared: number;
  trend: TrendDirection;
  rate: number;
  history: ForecastPoint[];
  forecast: ForecastPoint[];
}

export type RecyclingHabit = 'none' | 'some' | 'heavy';
export type PlasticUsage = 'low' | 'medium' | 'high';

export interface AnalyzerFactors {
  gridFactors: Record<string, number>;
  transportFactors: {
    car: number;
    bus: number;
    flight: number;
  };
  foodFactors: Record<string, number>;
  wasteFactors: {
    base: number;
    recycling: Record<RecyclingHabit, number>;
    composting: {
      true: number;
      false: number;
    };
    plastic: Record<PlasticUsage, number>;
  };
  nationalAverages: Record<string, number>;
}
