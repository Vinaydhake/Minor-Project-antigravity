import type {
  AnalyzerFactors,
  CityPoint,
  CountryDetail,
  CountrySummary,
  ForecastResult,
  GeoJsonCollection,
  StateSummary,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE ?? '';

async function getJson<T>(path: string): Promise<T> {
  const url = path.startsWith('http://') || path.startsWith('https://') ? path : `${API_BASE}${path}`;
  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

export function fetchCountries() {
  return getJson<CountrySummary[]>('/api/countries');
}

export function fetchCountry(code: string) {
  return getJson<CountryDetail>(`/api/countries/${code}`);
}

export function fetchForecast(code: string) {
  return getJson<ForecastResult>(`/api/countries/${code}/forecast`);
}

export function fetchStates(code: string) {
  return getJson<StateSummary[]>(`/api/countries/${code}/states`);
}

export function fetchStateCities(stateCode: string) {
  return getJson<CityPoint[]>(`/api/states/${stateCode}/cities`);
}

export function fetchCountryCities(code: string) {
  return getJson<CityPoint[]>(`/api/countries/${code}/cities`);
}

export function fetchAnalyzerFactors() {
  return getJson<AnalyzerFactors>('/api/analyzer/factors');
}

export function fetchIndiaGeoJson() {
  return getJson<GeoJsonCollection>(
    'https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson'
  );
}
