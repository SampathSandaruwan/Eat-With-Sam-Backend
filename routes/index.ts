import express, { Router } from 'express';

import authRoutes from './auth.routes';
import maintenanceRoutes from './maintenance.routes';
import menuCategoryRoutes from './menuCategory.routes';
import menuItemRoutes from './menuItem.routes';
import restaurantRoutes from './restaurant.routes';

const router: Router = express.Router();

// Authentication routes
router.use('/auth', authRoutes);

// Job routes (admin/manual triggers)
router.use('/maintenance', maintenanceRoutes);

// Restaurant routes
router.use('/restaurants', restaurantRoutes);

// Menu Category routes
router.use('/menu-categories', menuCategoryRoutes);

// Menu Item routes
router.use('/menu-items', menuItemRoutes);

export default router;

