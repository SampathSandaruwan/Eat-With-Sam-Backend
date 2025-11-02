import { Router } from 'express';

import { getMenuItemById } from '../controllers';
import { validate } from '../middlewares';
import {
  filterMenuItemsSchema,
  getDataByMenuItemIdSchema,
} from '../validations/menu.validation';

const router = Router();

// GET /api/menu-items/:id - Get menu item by ID
router.get(
  '/:menuItemId',
  validate(getDataByMenuItemIdSchema),
  validate(filterMenuItemsSchema),
  getMenuItemById,
);

export default router;

