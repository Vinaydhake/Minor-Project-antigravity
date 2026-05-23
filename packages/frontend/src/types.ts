export interface CountrySummary {
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

export interface CountryDetail extends CountrySummary {
  historicalData: CountryEmission[];
  sectorBreakdown: CountrySector[];
}

export interface StateSector {
  name: string;
  value: number;
  color: string;
}

export interface StateSummary {
  code: string;
  countryCode: string;
  name: string;
  emissions: number;
  population: number;
  lat: number;
  lng: number;
  topSectors: StateSector[];
}

export interface CityPoint {
  id?: number;
  code?: string;
  stateCode?: string;
  countryCode?: string;
  name: string;
  lat: number;
  lng: number;
  estimatedEmissions: number;
  population: number;
  topSector?: string;
}

export type ForecastTrend = 'increasing' | 'decreasing' | 'stable';

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
  trend: ForecastTrend;
  rate: number;
  history: ForecastPoint[];
  forecast: ForecastPoint[];
}

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
    recycling: Record<'none' | 'some' | 'heavy', number>;
    composting: {
      true: number;
      false: number;
    };
    plastic: Record<'low' | 'medium' | 'high', number>;
  };
  nationalAverages: Record<string, number>;
}

export type DietType = 'vegan' | 'vegetarian' | 'low-meat' | 'medium-meat' | 'high-meat';
export type RecyclingHabit = 'none' | 'some' | 'heavy';
export type PlasticUsage = 'low' | 'medium' | 'high';

export interface AnalyzerInput {
  familyMembers: number;
  country: 'IND' | 'USA' | 'EU' | 'CHN' | 'GLOBAL';
  electricityKwh: number;
  acHoursPerDay: number;
  carKmPerWeek: number;
  bikeKmPerWeek: number;
  publicTransportKmPerWeek: number;
  flightsPerYear: number;
  avgFlightDistance: number;
  dietType: DietType;
  recyclingHabit: RecyclingHabit;
  composting: boolean;
  plasticUsage: PlasticUsage;
  reductionGoal: number;
}

export interface AnalyzerCategory {
  id: 'electricity' | 'groundTransport' | 'flights' | 'food' | 'waste';
  label: string;
  kg: number;
  color: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  savingsKg: number;
  difficulty: 'low' | 'medium' | 'high';
}

export interface AnalyzerResult {
  totalKg: number;
  totalTonnes: number;
  nationalAverageKg: number;
  targetKg: number;
  ratioToAverage: number;
  reductionGoal: number;
  breakdown: AnalyzerCategory[];
  recommendations: Recommendation[];
}

export interface GeoJsonFeature {
  type: string;
  geometry: unknown;
  properties: Record<string, unknown>;
}

export interface GeoJsonCollection {
  type: string;
  features: GeoJsonFeature[];
}
