/* eslint-disable no-console */
import { sequelize, testConnection } from '../config/database';
import { MenuCategoryModel, MenuItemModel, RestaurantModel } from '../models';

/**
 * Sync database schema to match models
 * This will ALTER tables to add/remove columns as needed
 * WARNING: Use with caution in production - always backup first!
 */
const syncDatabase = async (): Promise<void> => {
  try {
    console.log('Starting database schema sync...');

    // Test database connection
    await testConnection();

    // Sync models with alter: true to add missing columns/modify existing ones
    // This will NOT drop tables or data, only alter them
    console.log('\nSyncing Restaurant model...');
    await RestaurantModel.sync({ alter: true });
    console.log('Restaurant model synced');

    console.log('\nSyncing MenuCategory model...');
    await MenuCategoryModel.sync({ alter: true });
    console.log('MenuCategory model synced');

    console.log('\nSyncing MenuItem model...');
    await MenuItemModel.sync({ alter: true });
    console.log('MenuItem model synced');

    console.log('\nDatabase schema sync completed successfully!');
  } catch (error) {
    console.error('\nError syncing database schema:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
};

// Run the sync
syncDatabase()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nFailed to sync database:', error);
    process.exit(1);
  });

