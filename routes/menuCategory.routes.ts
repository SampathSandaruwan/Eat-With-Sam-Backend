import { Router } from 'express';

import {
  createMenuCategory,
  deleteMenuCategory,
  getAllCategories,
  getCategoryById,
  getMenuItemsByCategoryId,
  updateMenuCategory,
} from '../controllers';
import { validate } from '../middlewares';
import {
  createMenuCategorySchema,
  filterMenuItemsSchema,
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
  validate(filterMenuItemsSchema),
  getAllCategories,
);

router.get(
  '/:categoryId',
  validate(menuCategoryIdPathParamSchema),
  validate(filterMenuItemsSchema),
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
  '/:categoryId/menu-items',
  validate(menuCategoryIdPathParamSchema),
  validate(filterMenuItemsSchema),
  getMenuItemsByCategoryId,
);

export default router;

