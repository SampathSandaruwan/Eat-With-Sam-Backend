import express, { Router } from 'express';

import authRoutes from './auth.routes';
import dishRoutes from './dish.routes';
import maintenanceRoutes from './maintenance.routes';
import menuCategoryRoutes from './menuCategory.routes';
import orderRoutes from './order.routes';
import restaurantRoutes from './restaurant.routes';
import userRoutes from './user.routes';

const router: Router = express.Router();

// Authentication routes
router.use('/auth', authRoutes);

// Job routes (admin/manual triggers)
router.use('/maintenance', maintenanceRoutes);

// Restaurant routes
router.use('/restaurants', restaurantRoutes);

// Menu Category routes
router.use('/menu-categories', menuCategoryRoutes);

// Dish routes
router.use('/dishes', dishRoutes);

// Order routes
router.use('/orders', orderRoutes);

// User routes
router.use('/users', userRoutes);

export default router;

