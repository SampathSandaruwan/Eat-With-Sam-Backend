/* eslint-disable no-console */
import { seedDishes } from './fixtures/dishes';
import { seedMenuCategories } from './fixtures/menuCategories';
import { seedOrders } from './fixtures/orders';
import { seedRestaurants } from './fixtures/restaurants';

import { sequelize, testConnection } from '../config/database';
import {
  DishModel,
  MenuCategoryModel,
  OrderItemModel,
  OrderModel,
  RestaurantModel,
} from '../models';

const SEEDING_CONFIG = {
  RESTAURANTS: {
    COUNT: 20,
    CLEAR_EXISTING: true,
  },
  MENU_CATEGORIES: {
    COUNT: 50,
    CLEAR_EXISTING: true,
  },
  DISHES: {
    COUNT: 500,
    CLEAR_EXISTING: true,
  },
  ORDERS: {
    COUNT: 10000,
    CLEAR_EXISTING: true,
  },
};

/**
 * Main seeder runner
 * Import and register your seeders here
 */
const runSeeders = async (): Promise<void> => {
  try {
    console.log('Starting database seeding...');

    // Test database connection
    await testConnection();

    // Sync database (create tables if they don't exist)
    console.log('\nSyncing database models...');
    await sequelize.sync({ alter: false, force: false });
    console.log('Database models synced');

    console.log('\nClearing existing data...');
    // Delete in reverse dependency order to respect foreign key constraints
    // OrderItems -> Orders -> Dishes -> MenuCategories -> Restaurants
    // Temporarily disable foreign key checks for MySQL
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    try {
      if (SEEDING_CONFIG.ORDERS.CLEAR_EXISTING) {
        await OrderItemModel.destroy({ where: {}, truncate: true });
        await OrderModel.destroy({ where: {}, truncate: true });
      }
      if (SEEDING_CONFIG.DISHES.CLEAR_EXISTING) {
        await DishModel.destroy({ where: {}, truncate: true });
      }
      if (SEEDING_CONFIG.MENU_CATEGORIES.CLEAR_EXISTING) {
        await MenuCategoryModel.destroy({ where: {}, truncate: true });
      }
      if (SEEDING_CONFIG.RESTAURANTS.CLEAR_EXISTING) {
        await RestaurantModel.destroy({ where: {}, truncate: true });
      }
    } finally {
      // Re-enable foreign key checks
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    }

    console.log('Existing data cleared');

    // Seed in order (respecting dependencies)
    console.log('\nSeeding Restaurants...');
    await seedRestaurants({ count: SEEDING_CONFIG.RESTAURANTS.COUNT });

    console.log('\nSeeding Menu Categories...');
    await seedMenuCategories({ count: SEEDING_CONFIG.MENU_CATEGORIES.COUNT });

    console.log('\nSeeding Dishes...');
    await seedDishes({ count: SEEDING_CONFIG.DISHES.COUNT });

    console.log('\nSeeding Orders...');
    await seedOrders({ count: SEEDING_CONFIG.ORDERS.COUNT });

    console.log('\nDatabase seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
};

// Run seeders if this file is executed directly
if (require.main === module) {
  runSeeders()
    .then(() => {
      console.log('Database seeding: Successful');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database seeding: Failed', error);
      process.exit(1);
    });
}

export default runSeeders;

