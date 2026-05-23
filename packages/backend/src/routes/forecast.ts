import { Router } from 'express';
import { repository } from '../db/repository.js';
import { generateForecast } from '../services/forecast.js';
import { logger } from '../logger.js';
import { CountryEmission } from '../types/index.js';

const router = Router();

// GET /api/countries/:code/forecast
router.get('/:code/forecast', (req, res, next) => {
  try {
    const { code } = req.params;
    logger.info(`Running AI forecasting for country: ${code}`);

    const historical = repository.getHistoricalEmissions(code);
    if (!historical || historical.length === 0) {
      logger.warn(`No historical data found to run forecast for: ${code}`);
      res.status(404).json({ error: `Historical data for '${code}' not found` });
      return;
    }

    const points = historical.map((h: CountryEmission) => ({
      year: h.year,
      emissions: h.emissions,
    }));

    const result = generateForecast(points);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
