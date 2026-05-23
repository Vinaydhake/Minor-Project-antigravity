import { ForecastPoint, ForecastResult } from '../types/index.js';

export function linearRegression(points: { x: number; y: number }[]): {
  slope: number;
  intercept: number;
  rSquared: number;
  residualStdError: number;
  predict: (x: number) => number;
} {
  const n = points.length;
  if (n < 2) {
    return {
      slope: 0,
      intercept: 0,
      rSquared: 0,
      residualStdError: 0,
      predict: () => 0,
    };
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  let sumYY = 0;

  for (let i = 0; i < n; i++) {
    const { x, y } = points[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
    sumYY += y * y;
  }

  const denominator = n * sumXX - sumX * sumX;
  // If all X values are identical, slope is vertical/undefined. Treat as 0.
  const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  const predict = (x: number) => slope * x + intercept;

  // Calculate R-squared and Residual Standard Error
  const meanY = sumY / n;
  let ssTotal = 0;
  let ssResidual = 0;

  for (let i = 0; i < n; i++) {
    const { x, y } = points[i];
    const predictedY = predict(x);
    ssTotal += Math.pow(y - meanY, 2);
    ssResidual += Math.pow(y - predictedY, 2);
  }

  const rSquared = ssTotal === 0 ? 1 : 1 - ssResidual / ssTotal;

  // Residual Standard Error (degrees of freedom = n - 2)
  const residualStdError = n > 2 ? Math.sqrt(ssResidual / (n - 2)) : 0;

  return {
    slope,
    intercept,
    rSquared: parseFloat(rSquared.toFixed(4)),
    residualStdError,
    predict,
  };
}

export function generateForecast(
  historyPoints: { year: number; emissions: number }[]
): ForecastResult {
  const regressionPoints = historyPoints.map((p) => ({ x: p.year, y: p.emissions }));
  const { slope, intercept, rSquared, residualStdError, predict } = linearRegression(regressionPoints);

  const history: ForecastPoint[] = historyPoints.map((p) => ({
    year: p.year,
    emissions: p.emissions,
    isForecast: false,
  }));

  const forecast: ForecastPoint[] = [];
  const startYear = 2024;
  const endYear = 2030;

  // Standard multiplier for confidence band (spec requests: "95% confidence band (±1.5σ shaded)")
  const sigmaMultiplier = 1.5;

  for (let yr = startYear; yr <= endYear; yr++) {
    const predVal = parseFloat(predict(yr).toFixed(2));
    // Emissions cannot be negative
    const emissions = Math.max(0, predVal);
    
    // Confidence interval = predicted ± 1.5 * residual standard error
    const lower = Math.max(0, parseFloat((emissions - sigmaMultiplier * residualStdError).toFixed(2)));
    const upper = parseFloat((emissions + sigmaMultiplier * residualStdError).toFixed(2));

    forecast.push({
      year: yr,
      emissions,
      isForecast: true,
      confLower: lower,
      confUpper: upper,
    });
  }

  // Trend classification:
  // If slope magnitude is very small (< 0.5 MtCO2e/year), classify as stable.
  // Otherwise, increasing or decreasing.
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (slope > 0.5) {
    trend = 'increasing';
  } else if (slope < -0.5) {
    trend = 'decreasing';
  }

  return {
    slope: parseFloat(slope.toFixed(4)),
    intercept: parseFloat(intercept.toFixed(4)),
    rSquared,
    trend,
    rate: parseFloat(Math.abs(slope).toFixed(2)),
    history,
    forecast,
  };
}
