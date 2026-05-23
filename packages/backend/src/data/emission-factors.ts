// IPCC, DEFRA, and EPA carbon emission factors

export const gridFactors: { [country: string]: number } = {
  IND: 0.82,     // kg CO2e / kWh
  USA: 0.42,
  EU: 0.27,
  CHN: 0.58,
  GLOBAL: 0.50,
};

export const transportFactors = {
  car: 0.192,     // kg CO2e / km
  bus: 0.089,     // kg CO2e / km (public transport)
  flight: 0.255,  // kg CO2e / km
};

export const foodFactors: { [diet: string]: number } = {
  vegan: 1.5,
  vegetarian: 2.0,
  low_meat: 3.3,
  low_meat_hyphen: 3.3, // fallback helper
  medium_meat: 5.6,
  high_meat: 7.2,
};

// Allow both underscore and hyphenated keys to avoid any lookup issues
export const foodFactorsNormalized: { [diet: string]: number } = {
  vegan: 1.5,
  vegetarian: 2.0,
  'low-meat': 3.3,
  low_meat: 3.3,
  'medium-meat': 5.6,
  medium_meat: 5.6,
  'high-meat': 7.2,
  high_meat: 7.2,
};

export const wasteFactors = {
  base: 500, // kg CO2e / year per person baseline
  recycling: {
    none: 1.0,   // no discount
    some: 0.85,  // 15% discount
    heavy: 0.70, // 30% discount
  },
  composting: {
    true: 0.90,  // 10% discount
    false: 1.0,
  },
  plastic: {
    low: 0.85,   // 15% discount
    medium: 1.0,  // baseline
    high: 1.20,  // 20% penalty
  },
};

export const nationalAverages: { [country: string]: number } = {
  IND: 2.1,
  USA: 14.8,
  EU: 6.4,
  CHN: 8.1,
  GLOBAL: 4.7,
};
