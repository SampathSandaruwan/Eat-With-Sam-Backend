import { Router } from 'express';

import { getAllCategories, getMenuItemsByCategoryId } from '../controllers';
import { validate } from '../middlewares';
import { filterMenuItemsSchema, getDataByMenuCategoryIdSchema } from '../validations';

const router = Router();

router.get(
  '',
  getAllCategories,
);

router.get(
  '/:categoryId/menu-items',
  validate(getDataByMenuCategoryIdSchema),
  validate(filterMenuItemsSchema),
  getMenuItemsByCategoryId,
);

export default router;

