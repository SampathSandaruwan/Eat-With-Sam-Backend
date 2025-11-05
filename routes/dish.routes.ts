import { Router } from 'express';

import {
  createDish,
  deleteDish,
  getAllDishes,
  getDishById,
  updateDish,
} from '../controllers';
import { validate } from '../middlewares';
import {
  createDishSchema,
  dishIdPathParamSchema,
  filterDishesSchema,
  updateDishSchema,
} from '../validations/menu.validation';

const router = Router();

router.post(
  '',
  validate(createDishSchema),
  createDish,
);

router.get(
  '',
  validate(filterDishesSchema),
  getAllDishes,
);

router.get(
  '/:dishId',
  validate(dishIdPathParamSchema),
  validate(filterDishesSchema),
  getDishById,
);

router.patch(
  '/:dishId',
  validate(dishIdPathParamSchema),
  validate(updateDishSchema),
  updateDish,
);

router.delete(
  '/:dishId',
  validate(dishIdPathParamSchema),
  deleteDish,
);

export default router;

