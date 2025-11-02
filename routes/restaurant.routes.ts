import { Router } from 'express';

import {
  getAllRestaurants,
  getCategoriesByRestaurantId,
  getRestaurantById,
} from '../controllers';
import { validate } from '../middlewares';
import { filterMenuCategoriesSchema, filterRestaurantsSchema, getDataByRestaurantIdSchema } from '../validations';

const router = Router();

// Restaurant routes
router.get(
  '',
  validate(filterRestaurantsSchema),
  getAllRestaurants,
);

router.get(
  '/:restaurantId',
  validate(getDataByRestaurantIdSchema),
  validate(filterRestaurantsSchema),
  getRestaurantById,
);

router.get(
  '/:restaurantId/menu-categories',
  validate(getDataByRestaurantIdSchema),
  validate(filterMenuCategoriesSchema),
  getCategoriesByRestaurantId,
);

export default router;

