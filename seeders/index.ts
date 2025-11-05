/* eslint-disable no-console */
import { seedDishes } from './fixtures/dishes';
import { seedMenuCategories } from './fixtures/menuCategories';
import { seedRestaurants } from './fixtures/restaurants';

import { sequelize, testConnection } from '../config/database';
import { DishModel, MenuCategoryModel, RestaurantModel } from '../models';

const SEEDING_CONFIG = {
  RESTAURANTS: {
    COUNT: 0,
    CLEAR_EXISTING: false,
  },
  MENU_CATEGORIES: {
    COUNT: 0,
    CLEAR_EXISTING: false,
  },
  DISHES: {
    COUNT: 1000,
    CLEAR_EXISTING: false,
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
    if (SEEDING_CONFIG.DISHES.CLEAR_EXISTING) {
      await DishModel.destroy({ where: {}, force: true });
    }
    if (SEEDING_CONFIG.MENU_CATEGORIES.CLEAR_EXISTING) {
      await MenuCategoryModel.destroy({ where: {}, force: true });
    }
    if (SEEDING_CONFIG.RESTAURANTS.CLEAR_EXISTING) {
      await RestaurantModel.destroy({ where: {}, force: true });
    }
    console.log('Existing data cleared');

    // Seed in order (respecting dependencies)
    console.log('\nSeeding Restaurants...');
    await seedRestaurants({ count: SEEDING_CONFIG.RESTAURANTS.COUNT });

    console.log('\nSeeding Menu Categories...');
    await seedMenuCategories({ count: SEEDING_CONFIG.MENU_CATEGORIES.COUNT });

    console.log('\nSeeding Dishes...');
    await seedDishes({ count: SEEDING_CONFIG.DISHES.COUNT });

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

