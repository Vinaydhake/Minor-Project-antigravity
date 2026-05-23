import { Router } from 'express';
import { repository } from '../db/repository.js';
import { logger } from '../logger.js';

const router = Router();

// GET /api/states/:stateCode/cities
router.get('/:stateCode/cities', (req, res, next) => {
  try {
    const { stateCode } = req.params;
    logger.info(`Fetching cities for state: ${stateCode}`);

    const cities = repository.getCitiesByState(stateCode);
    res.json(cities);
  } catch (error) {
    next(error);
  }
});

export default router;
