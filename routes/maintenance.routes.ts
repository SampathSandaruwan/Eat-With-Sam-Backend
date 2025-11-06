import { Router } from 'express';

import { triggerRatingCalculation } from '../controllers';
import { authenticate } from '../middlewares';

const router = Router();

// Manual trigger for restaurant rating calculation
router.post('/calculate-ratings', authenticate, triggerRatingCalculation);

export default router;

