import { Country, CountryCityMarker } from '../types/index.js';

interface CityTemplate {
  name: string;
  emissionsShare: number;
  populationShare: number;
  latOffset: number;
  lngOffset: number;
  topSector: string;
}

const explicitTemplates: Record<string, CityTemplate[]> = {
  USA: [
    { name: 'New York City', emissionsShare: 0.16, populationShare: 0.06, latOffset: 3.62, lngOffset: 21.7, topSector: 'Buildings' },
    { name: 'Los Angeles', emissionsShare: 0.15, populationShare: 0.04, latOffset: -3.04, lngOffset: -22.29, topSector: 'Transport' },
    { name: 'Houston', emissionsShare: 0.12, populationShare: 0.02, latOffset: -7.33, lngOffset: -0.66, topSector: 'Industry' },
    { name: 'Chicago', emissionsShare: 0.1, populationShare: 0.03, latOffset: 4.79, lngOffset: 7.58, topSector: 'Buildings' },
    { name: 'Seattle', emissionsShare: 0.06, populationShare: 0.01, latOffset: 10.51, lngOffset: -26.0, topSector: 'Energy' },
  ],
  CHN: [
    { name: 'Shanghai', emissionsShare: 0.14, populationShare: 0.02, latOffset: -4.63, lngOffset: 17.28, topSector: 'Industry' },
    { name: 'Beijing', emissionsShare: 0.12, populationShare: 0.02, latOffset: 4.04, lngOffset: 12.21, topSector: 'Buildings' },
    { name: 'Shenzhen', emissionsShare: 0.08, populationShare: 0.01, latOffset: -13.42, lngOffset: 10.54, topSector: 'Transport' },
    { name: 'Guangzhou', emissionsShare: 0.08, populationShare: 0.01, latOffset: -12.75, lngOffset: 9.08, topSector: 'Industry' },
    { name: 'Chengdu', emissionsShare: 0.07, populationShare: 0.01, latOffset: -5.2, lngOffset: 0.47, topSector: 'Energy' },
  ],
  JPN: [
    { name: 'Tokyo', emissionsShare: 0.18, populationShare: 0.11, latOffset: -0.53, lngOffset: 0.94, topSector: 'Buildings' },
    { name: 'Osaka', emissionsShare: 0.11, populationShare: 0.04, latOffset: -1.86, lngOffset: -2.75, topSector: 'Industry' },
    { name: 'Nagoya', emissionsShare: 0.09, populationShare: 0.02, latOffset: -1.14, lngOffset: -0.62, topSector: 'Transport' },
    { name: 'Sapporo', emissionsShare: 0.05, populationShare: 0.01, latOffset: 7.12, lngOffset: 2.42, topSector: 'Buildings' },
  ],
  DEU: [
    { name: 'Berlin', emissionsShare: 0.11, populationShare: 0.04, latOffset: 1.36, lngOffset: 2.95, topSector: 'Buildings' },
    { name: 'Hamburg', emissionsShare: 0.08, populationShare: 0.02, latOffset: 2.37, lngOffset: -0.54, topSector: 'Transport' },
    { name: 'Munich', emissionsShare: 0.08, populationShare: 0.02, latOffset: -2.68, lngOffset: 1.12, topSector: 'Buildings' },
    { name: 'Cologne', emissionsShare: 0.06, populationShare: 0.01, latOffset: 0.8, lngOffset: -3.49, topSector: 'Industry' },
  ],
  BRA: [
    { name: 'Sao Paulo', emissionsShare: 0.2, populationShare: 0.06, latOffset: -8.32, lngOffset: 5.42, topSector: 'Transport' },
    { name: 'Rio de Janeiro', emissionsShare: 0.12, populationShare: 0.03, latOffset: -8.53, lngOffset: 8.7, topSector: 'Buildings' },
    { name: 'Belo Horizonte', emissionsShare: 0.08, populationShare: 0.01, latOffset: -5.53, lngOffset: 8.89, topSector: 'Industry' },
    { name: 'Manaus', emissionsShare: 0.05, populationShare: 0.01, latOffset: 11.71, lngOffset: -9.12, topSector: 'Energy' },
  ],
  GBR: [
    { name: 'London', emissionsShare: 0.21, populationShare: 0.13, latOffset: -3.87, lngOffset: 3.56, topSector: 'Buildings' },
    { name: 'Manchester', emissionsShare: 0.07, populationShare: 0.03, latOffset: -1.9, lngOffset: 1.01, topSector: 'Transport' },
    { name: 'Birmingham', emissionsShare: 0.06, populationShare: 0.02, latOffset: -3.14, lngOffset: 1.47, topSector: 'Industry' },
    { name: 'Glasgow', emissionsShare: 0.04, populationShare: 0.01, latOffset: 0.53, lngOffset: -7.7, topSector: 'Energy' },
  ],
  FRA: [
    { name: 'Paris', emissionsShare: 0.18, populationShare: 0.16, latOffset: 2.63, lngOffset: 0.14, topSector: 'Buildings' },
    { name: 'Lyon', emissionsShare: 0.07, populationShare: 0.02, latOffset: -0.47, lngOffset: 2.62, topSector: 'Industry' },
    { name: 'Marseille', emissionsShare: 0.06, populationShare: 0.02, latOffset: -2.92, lngOffset: 3.17, topSector: 'Transport' },
    { name: 'Lille', emissionsShare: 0.04, populationShare: 0.01, latOffset: 4.35, lngOffset: 0.89, topSector: 'Buildings' },
  ],
  CAN: [
    { name: 'Toronto', emissionsShare: 0.13, populationShare: 0.08, latOffset: -12.48, lngOffset: 26.97, topSector: 'Transport' },
    { name: 'Montreal', emissionsShare: 0.09, populationShare: 0.04, latOffset: -10.63, lngOffset: 33.58, topSector: 'Buildings' },
    { name: 'Calgary', emissionsShare: 0.1, populationShare: 0.03, latOffset: -5.81, lngOffset: -7.14, topSector: 'Energy' },
    { name: 'Vancouver', emissionsShare: 0.07, populationShare: 0.03, latOffset: -7.88, lngOffset: -16.11, topSector: 'Buildings' },
  ],
  AUS: [
    { name: 'Sydney', emissionsShare: 0.16, populationShare: 0.2, latOffset: -8.59, lngOffset: 17.18, topSector: 'Transport' },
    { name: 'Melbourne', emissionsShare: 0.14, populationShare: 0.18, latOffset: -12.54, lngOffset: 11.19, topSector: 'Buildings' },
    { name: 'Brisbane', emissionsShare: 0.09, populationShare: 0.1, latOffset: -2.72, lngOffset: 19.35, topSector: 'Energy' },
    { name: 'Perth', emissionsShare: 0.08, populationShare: 0.08, latOffset: -6.72, lngOffset: -18.79, topSector: 'Industry' },
  ],
  RUS: [
    { name: 'Moscow', emissionsShare: 0.15, populationShare: 0.09, latOffset: -5.77, lngOffset: -68.04, topSector: 'Buildings' },
    { name: 'Saint Petersburg', emissionsShare: 0.08, populationShare: 0.04, latOffset: -1.68, lngOffset: -75.96, topSector: 'Transport' },
    { name: 'Yekaterinburg', emissionsShare: 0.06, populationShare: 0.01, latOffset: -4.95, lngOffset: -45.01, topSector: 'Industry' },
    { name: 'Novosibirsk', emissionsShare: 0.05, populationShare: 0.01, latOffset: -6.35, lngOffset: -22.06, topSector: 'Energy' },
  ],
};

const defaultSectors = ['Energy', 'Transport', 'Industry', 'Buildings', 'Agriculture'];

function clampLatitude(lat: number) {
  return Math.max(-60, Math.min(75, parseFloat(lat.toFixed(4))));
}

function wrapLongitude(lng: number) {
  let wrapped = lng;
  while (wrapped > 180) wrapped -= 360;
  while (wrapped < -180) wrapped += 360;
  return parseFloat(wrapped.toFixed(4));
}

function createFallbackTemplates(countryName: string): CityTemplate[] {
  return [
    {
      name: `${countryName} Metro Core`,
      emissionsShare: 0.12,
      populationShare: 0.08,
      latOffset: 1.2,
      lngOffset: 1.4,
      topSector: defaultSectors[0],
    },
    {
      name: `${countryName} Industrial Belt`,
      emissionsShare: 0.1,
      populationShare: 0.05,
      latOffset: -2.1,
      lngOffset: 3.3,
      topSector: defaultSectors[2],
    },
    {
      name: `${countryName} Coastal Hub`,
      emissionsShare: 0.08,
      populationShare: 0.04,
      latOffset: -3.4,
      lngOffset: -4.2,
      topSector: defaultSectors[1],
    },
    {
      name: `${countryName} Green Corridor`,
      emissionsShare: 0.05,
      populationShare: 0.03,
      latOffset: 4.1,
      lngOffset: -1.7,
      topSector: defaultSectors[3],
    },
  ];
}

export function buildCountryCityMarkers(country: Country): CountryCityMarker[] {
  const templates = explicitTemplates[country.code] ?? createFallbackTemplates(country.name);

  return templates.map((template, index) => ({
    code: `${country.code}-${index + 1}`,
    countryCode: country.code,
    name: template.name,
    lat: clampLatitude(country.lat + template.latOffset),
    lng: wrapLongitude(country.lng + template.lngOffset),
    estimatedEmissions: parseFloat((country.totalEmissions * template.emissionsShare).toFixed(2)),
    population: parseFloat((country.population * template.populationShare).toFixed(2)),
    topSector: template.topSector,
  }));
}
