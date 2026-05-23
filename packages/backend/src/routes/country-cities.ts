import { Router } from 'express';
import { buildCountryCityMarkers } from '../data/country-city-markers.js';
import { repository } from '../db/repository.js';
import { logger } from '../logger.js';

const router = Router();

router.get('/:code/cities', (req, res, next) => {
  try {
    const { code } = req.params;
    logger.info(`Fetching synthetic city markers for country: ${code}`);

    const country = repository.getCountryByCode(code);
    if (!country) {
      res.status(404).json({ error: `Country with code '${code}' not found` });
      return;
    }

    res.json(buildCountryCityMarkers(country));
  } catch (error) {
    next(error);
  }
});

export default router;
