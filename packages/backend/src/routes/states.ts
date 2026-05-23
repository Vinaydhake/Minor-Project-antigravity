import { Router } from 'express';
import { repository } from '../db/repository.js';
import { logger } from '../logger.js';

const router = Router();

// GET /api/countries/:code/states
router.get('/:code/states', (req, res, next) => {
  try {
    const { code } = req.params;
    logger.info(`Fetching states for country: ${code}`);

    const states = repository.getStatesByCountry(code);
    res.json(states);
  } catch (error) {
    next(error);
  }
});

export default router;
