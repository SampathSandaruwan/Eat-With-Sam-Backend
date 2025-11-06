import { Router } from 'express';

import {
  getAverageOrderValue,
  getSalesReport,
  getTopSellingItems,
} from '../controllers';
import { authenticate, validate } from '../middlewares';
import {
  averageOrderValueSchema,
  salesReportSchema,
  topSellingItemsSchema,
} from '../validations';

const router = Router();

// All reporting routes require authentication
router.get(
  '/sales',
  authenticate,
  validate(salesReportSchema),
  getSalesReport,
);

router.get(
  '/top-selling-items',
  authenticate,
  validate(topSellingItemsSchema),
  getTopSellingItems,
);

router.get(
  '/average-order-value',
  authenticate,
  validate(averageOrderValueSchema),
  getAverageOrderValue,
);

export default router;

