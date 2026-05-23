import { Router } from 'express';
import { repository } from '../db/repository.js';
import { logger } from '../logger.js';

const router = Router();

// GET /api/countries
router.get('/', (req, res, next) => {
  try {
    logger.info('Fetching list of all countries');
    const countries = repository.getAllCountries();
    res.json(countries);
  } catch (error) {
    next(error);
  }
});

// GET /api/countries/:code
router.get('/:code', (req, res, next) => {
  try {
    const { code } = req.params;
    logger.info(`Fetching details for country: ${code}`);
    
    const country = repository.getCountryByCode(code);
    if (!country) {
      logger.warn(`Country not found: ${code}`);
      res.status(404).json({ error: `Country with code '${code}' not found` });
      return;
    }
    
    res.json(country);
  } catch (error) {
    next(error);
  }
});

export default router;
