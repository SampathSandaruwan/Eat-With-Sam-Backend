import { Router } from 'express';

import { triggerRatingCalculation } from '../controllers';

const router = Router();

// Manual trigger for restaurant rating calculation
router.post('/calculate-ratings', triggerRatingCalculation);

export default router;

