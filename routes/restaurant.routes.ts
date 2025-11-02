import { Router } from 'express';

import {
  createRestaurant,
  deleteRestaurant,
  getAllRestaurants,
  getCategoriesByRestaurantId,
  getRestaurantById,
  updateRestaurant,
} from '../controllers';
import { validate } from '../middlewares';
import {
  createRestaurantSchema,
  filterMenuCategoriesSchema,
  filterRestaurantsSchema,
  restaurantIdPathParamSchema,
  updateRestaurantSchema,
} from '../validations';

const router = Router();

router.post(
  '',
  validate(createRestaurantSchema),
  createRestaurant,
);

router.get(
  '',
  validate(filterRestaurantsSchema),
  getAllRestaurants,
);

router.get(
  '/:restaurantId',
  validate(restaurantIdPathParamSchema),
  validate(filterRestaurantsSchema),
  getRestaurantById,
);

router.patch(
  '/:restaurantId',
  validate(restaurantIdPathParamSchema),
  validate(updateRestaurantSchema),
  updateRestaurant,
);

router.delete(
  '/:restaurantId',
  validate(restaurantIdPathParamSchema),
  deleteRestaurant,
);

router.get(
  '/:restaurantId/menu-categories',
  validate(restaurantIdPathParamSchema),
  validate(filterMenuCategoriesSchema),
  getCategoriesByRestaurantId,
);

export default router;

