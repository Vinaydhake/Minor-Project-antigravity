import { Router } from 'express';
import {
  foodFactorsNormalized,
  gridFactors,
  nationalAverages,
  transportFactors,
  wasteFactors,
} from '../data/emission-factors.js';
import { AnalyzerFactors } from '../types/index.js';

const router = Router();

router.get('/factors', (req, res) => {
  const payload: AnalyzerFactors = {
    gridFactors,
    transportFactors,
    foodFactors: foodFactorsNormalized,
    wasteFactors,
    nationalAverages,
  };

  res.json(payload);
});

export default router;
