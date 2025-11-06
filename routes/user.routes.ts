import { Router } from 'express';

import { getUserOrdersById } from '../controllers';
import { authenticate, validate } from '../middlewares';
import { filterOrdersSchema, userIdPathParamSchema } from '../validations';

const router = Router();

router.get(
  '/:id/orders',
  authenticate,
  validate(userIdPathParamSchema),
  validate(filterOrdersSchema),
  getUserOrdersById,
);

export default router;

