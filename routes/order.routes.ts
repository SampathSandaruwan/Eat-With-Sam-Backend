import { Router } from 'express';

import {
  getOrder,
  getUserOrders,
  placeOrder,
  updateOrderStatus,
} from '../controllers';
import { authenticate, validate } from '../middlewares';
import {
  filterOrdersSchema,
  orderIdPathParamSchema,
  placeOrderSchema,
  updateOrderStatusSchema,
} from '../validations';

const router = Router();

// All order routes require authentication
router.post(
  '',
  authenticate,
  validate(placeOrderSchema),
  placeOrder,
);

router.get(
  '',
  authenticate,
  validate(filterOrdersSchema),
  getUserOrders,
);

router.get(
  '/:id',
  authenticate,
  validate(orderIdPathParamSchema),
  getOrder,
);

router.patch(
  '/:id/status',
  authenticate,
  validate(orderIdPathParamSchema),
  validate(updateOrderStatusSchema),
  updateOrderStatus,
);

export default router;

