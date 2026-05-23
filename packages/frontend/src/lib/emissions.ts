import type {
  AnalyzerCategory,
  AnalyzerFactors,
  AnalyzerInput,
  AnalyzerResult,
  CityPoint,
  CountrySummary,
  DietType,
  Recommendation,
  StateSummary,
} from '../types';

const COUNTRY_LABELS: Record<AnalyzerInput['country'], string> = {
  IND: 'India',
  USA: 'United States',
  EU: 'European Union',
  CHN: 'China',
  GLOBAL: 'Global',
};

const CATEGORY_COLORS: Record<AnalyzerCategory['id'], string> = {
  electricity: '#38BDF8',
  groundTransport: '#F97316',
  flights: '#A78BFA',
  food: '#22C55E',
  waste: '#EAB308',
};

const DIET_STEPS: DietType[] = ['vegan', 'vegetarian', 'low-meat', 'medium-meat', 'high-meat'];

export function getCountryLabel(code: AnalyzerInput['country']) {
  return COUNTRY_LABELS[code];
}

export function getEmissionIntensityColor(value: number) {
  if (value < 50) return '#22C55E';
  if (value < 200) return '#EAB308';
  if (value < 1000) return '#F97316';
  return '#EF4444';
}

export function getCityEmissionColor(value: number) {
  if (value < 8) return '#22C55E';
  if (value <= 15) return '#EAB308';
  if (value <= 30) return '#F97316';
  return '#EF4444';
}

export function getBubbleSize(value: number) {
  return Math.max(6, Math.min(24, Math.sqrt(value) * 1.2));
}

export function sortCountriesByRank(countries: CountrySummary[]) {
  return [...countries].sort((a, b) => a.rank - b.rank);
}

export function sortStatesByEmission(states: StateSummary[]) {
  return [...states].sort((a, b) => b.emissions - a.emissions);
}

export function sortCitiesByEmission(cities: CityPoint[]) {
  return [...cities].sort((a, b) => b.estimatedEmissions - a.estimatedEmissions);
}

function round(value: number) {
  return parseFloat(value.toFixed(2));
}

function normalizeDietKey(dietType: DietType) {
  return dietType.replace(/-/g, '_');
}

function buildBreakdown(
  electricityKg: number,
  groundTransportKg: number,
  flightsKg: number,
  foodKg: number,
  wasteKg: number
) {
  const breakdown: AnalyzerCategory[] = [
    { id: 'electricity', label: 'Electricity + Cooling', kg: round(electricityKg), color: CATEGORY_COLORS.electricity },
    { id: 'groundTransport', label: 'Ground Transport', kg: round(groundTransportKg), color: CATEGORY_COLORS.groundTransport },
    { id: 'flights', label: 'Flights', kg: round(flightsKg), color: CATEGORY_COLORS.flights },
    { id: 'food', label: 'Food', kg: round(foodKg), color: CATEGORY_COLORS.food },
    { id: 'waste', label: 'Waste', kg: round(wasteKg), color: CATEGORY_COLORS.waste },
  ];

  return breakdown.filter((item) => item.kg > 0);
}

function pushRecommendation(recommendations: Recommendation[], recommendation: Recommendation) {
  if (recommendation.savingsKg > 1) {
    recommendations.push({
      ...recommendation,
      savingsKg: round(recommendation.savingsKg),
    });
  }
}

export function calculateAnalyzerResult(
  input: AnalyzerInput,
  factors: AnalyzerFactors
): AnalyzerResult {
  const gridFactor = factors.gridFactors[input.country] ?? factors.gridFactors.GLOBAL;
  const normalizedDietKey = normalizeDietKey(input.dietType);
  const dietFactor = factors.foodFactors[normalizedDietKey] ?? factors.foodFactors.vegan;

  const annualBaseElectricityKwh = input.electricityKwh * 12;
  const annualAcKwh = input.acHoursPerDay * 30 * 12 * 1.2;
  const electricityKg = (annualBaseElectricityKwh + annualAcKwh) * gridFactor;

  const annualCarKm = input.carKmPerWeek * 52;
  const annualBusKm = input.publicTransportKmPerWeek * 52;
  const annualFlightKm = input.flightsPerYear * input.avgFlightDistance;

  const groundTransportKg =
    annualCarKm * factors.transportFactors.car +
    annualBusKm * factors.transportFactors.bus;
  const flightsKg = annualFlightKm * factors.transportFactors.flight;
  const foodKg = dietFactor * 365 * input.familyMembers;

  const recyclingFactor = factors.wasteFactors.recycling[input.recyclingHabit];
  const compostingFactor = input.composting
    ? factors.wasteFactors.composting.true
    : factors.wasteFactors.composting.false;
  const plasticFactor = factors.wasteFactors.plastic[input.plasticUsage];
  const wasteKg =
    factors.wasteFactors.base *
    input.familyMembers *
    recyclingFactor *
    compostingFactor *
    plasticFactor;

  const breakdown = buildBreakdown(
    electricityKg,
    groundTransportKg,
    flightsKg,
    foodKg,
    wasteKg
  );
  const totalKg = round(breakdown.reduce((sum, item) => sum + item.kg, 0));
  const nationalAverageKg =
    (factors.nationalAverages[input.country] ?? factors.nationalAverages.GLOBAL) *
    input.familyMembers *
    1000;
  const ratioToAverage = nationalAverageKg === 0 ? 0 : round((totalKg / nationalAverageKg) * 100);
  const targetKg = round(totalKg * (1 - input.reductionGoal / 100));

  const recommendations = buildRecommendations(input, factors, {
    electricityKg,
    annualAcKwh,
    annualCarKm,
    annualBusKm,
    flightsKg,
    annualFlightKm,
    foodKg,
    wasteKg,
  });

  return {
    totalKg,
    totalTonnes: round(totalKg / 1000),
    nationalAverageKg: round(nationalAverageKg),
    targetKg,
    ratioToAverage,
    reductionGoal: input.reductionGoal,
    breakdown,
    recommendations,
  };
}

function buildRecommendations(
  input: AnalyzerInput,
  factors: AnalyzerFactors,
  metrics: {
    electricityKg: number;
    annualAcKwh: number;
    annualCarKm: number;
    annualBusKm: number;
    flightsKg: number;
    annualFlightKm: number;
    foodKg: number;
    wasteKg: number;
  }
) {
  const recommendations: Recommendation[] = [];

  if (metrics.electricityKg > 1200) {
    pushRecommendation(recommendations, {
      id: 'electricity',
      title: 'Trim household electricity by 12%',
      description: 'Shift appliance use off peak and tighten standby loads to cut a steady slice from the grid footprint.',
      savingsKg: metrics.electricityKg * 0.12,
      difficulty: 'medium',
    });
  }

  if (input.acHoursPerDay >= 4) {
    const reducedAcKwh = metrics.annualAcKwh * 0.22;
    pushRecommendation(recommendations, {
      id: 'ac',
      title: 'Reduce AC runtime by 2 hours per day',
      description: 'Raising the thermostat slightly and using fans first can meaningfully reduce cooling demand.',
      savingsKg: reducedAcKwh * (factors.gridFactors[input.country] ?? factors.gridFactors.GLOBAL),
      difficulty: 'low',
    });
  }

  if (input.carKmPerWeek >= 60) {
    const switchedKm = metrics.annualCarKm * 0.25;
    pushRecommendation(recommendations, {
      id: 'car',
      title: 'Move 25% of car travel to transit or biking',
      description: 'Even one or two swapped commutes each week compounds into a meaningful annual reduction.',
      savingsKg:
        switchedKm *
        (factors.transportFactors.car - Math.min(factors.transportFactors.bus, 0.02)),
      difficulty: 'medium',
    });
  }

  if (input.flightsPerYear > 0) {
    pushRecommendation(recommendations, {
      id: 'flights',
      title: 'Skip one medium-haul flight this year',
      description: 'Flights are a concentrated source of emissions, so removing even one trip creates an outsized gain.',
      savingsKg: input.avgFlightDistance * factors.transportFactors.flight,
      difficulty: 'high',
    });
  }

  const currentDietIndex = DIET_STEPS.indexOf(input.dietType);
  if (currentDietIndex > 0) {
    const currentKey = normalizeDietKey(input.dietType);
    const lighterKey = normalizeDietKey(DIET_STEPS[currentDietIndex - 1]);
    const currentFactor = factors.foodFactors[currentKey] ?? 0;
    const lighterFactor = factors.foodFactors[lighterKey] ?? currentFactor;
    pushRecommendation(recommendations, {
      id: 'diet',
      title: 'Shift one step lighter on your diet profile',
      description: 'Moving down a single diet tier is often one of the strongest recurring reductions for households.',
      savingsKg: (currentFactor - lighterFactor) * 365 * input.familyMembers,
      difficulty: 'medium',
    });
  }

  if (input.recyclingHabit === 'none') {
    const improvedWaste =
      factors.wasteFactors.base *
      input.familyMembers *
      factors.wasteFactors.recycling.some *
      (input.composting ? factors.wasteFactors.composting.true : factors.wasteFactors.composting.false) *
      factors.wasteFactors.plastic[input.plasticUsage];
    pushRecommendation(recommendations, {
      id: 'recycling',
      title: 'Start a basic recycling habit',
      description: 'Capturing the high-volume household waste streams is a low-friction way to cut landfill impact.',
      savingsKg: metrics.wasteKg - improvedWaste,
      difficulty: 'low',
    });
  }

  if (!input.composting) {
    pushRecommendation(recommendations, {
      id: 'composting',
      title: 'Compost food scraps and wet waste',
      description: 'Organic waste diversion helps reduce methane-heavy disposal emissions over the year.',
      savingsKg: metrics.wasteKg * 0.1,
      difficulty: 'medium',
    });
  }

  if (input.plasticUsage === 'high') {
    pushRecommendation(recommendations, {
      id: 'plastic',
      title: 'Bring plastic usage down to medium',
      description: 'Reducing single-use packaging trims both waste generation and upstream production emissions.',
      savingsKg: metrics.wasteKg * (1 - 1 / factors.wasteFactors.plastic.high),
      difficulty: 'low',
    });
  }

  return recommendations.sort((a, b) => b.savingsKg - a.savingsKg).slice(0, 5);
}
