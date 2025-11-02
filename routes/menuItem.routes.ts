import { Router } from 'express';

import {
  createMenuItem,
  deleteMenuItem,
  getAllMenuItems,
  getMenuItemById,
  updateMenuItem,
} from '../controllers';
import { validate } from '../middlewares';
import {
  createMenuItemSchema,
  filterMenuItemsSchema,
  menuItemIdPathParamSchema,
  updateMenuItemSchema,
} from '../validations/menu.validation';

const router = Router();

router.post(
  '',
  validate(createMenuItemSchema),
  createMenuItem,
);

router.get(
  '',
  validate(filterMenuItemsSchema),
  getAllMenuItems,
);

router.get(
  '/:menuItemId',
  validate(menuItemIdPathParamSchema),
  validate(filterMenuItemsSchema),
  getMenuItemById,
);

router.patch(
  '/:menuItemId',
  validate(menuItemIdPathParamSchema),
  validate(updateMenuItemSchema),
  updateMenuItem,
);

router.delete(
  '/:menuItemId',
  validate(menuItemIdPathParamSchema),
  deleteMenuItem,
);

export default router;

