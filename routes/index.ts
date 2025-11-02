import express, { Router } from 'express';

import menuCategoryRoutes from './menuCategory.routes';
import menuItemRoutes from './menuItem.routes';
import restaurantRoutes from './restaurant.routes';

const router: Router = express.Router();

// Restaurant routes
router.use('/restaurants', restaurantRoutes);

// Menu Category routes
router.use('/menu-categories', menuCategoryRoutes);

// Menu Item routes
router.use('/menu-items', menuItemRoutes);

export default router;

