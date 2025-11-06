import { Router } from 'express';

import {
  createMenuCategory,
  deleteMenuCategory,
  getAllCategories,
  getCategoryById,
  getDishesByCategoryId,
  updateMenuCategory,
} from '../controllers';
import { validate } from '../middlewares';
import {
  createMenuCategorySchema,
  filterDishesSchema,
  filterMenuCategoriesSchema,
  menuCategoryIdPathParamSchema,
  updateMenuCategorySchema,
} from '../validations';

const router = Router();

router.post(
  '',
  validate(createMenuCategorySchema),
  createMenuCategory,
);

router.get(
  '',
  validate(filterMenuCategoriesSchema),
  getAllCategories,
);

router.get(
  '/:categoryId',
  validate(menuCategoryIdPathParamSchema),
  validate(filterMenuCategoriesSchema),
  getCategoryById,
);

router.patch(
  '/:categoryId',
  validate(menuCategoryIdPathParamSchema),
  validate(updateMenuCategorySchema),
  updateMenuCategory,
);

router.delete(
  '/:categoryId',
  validate(menuCategoryIdPathParamSchema),
  deleteMenuCategory,
);

router.get(
  '/:categoryId/dishes',
  validate(menuCategoryIdPathParamSchema),
  validate(filterDishesSchema),
  getDishesByCategoryId,
);

export default router;

