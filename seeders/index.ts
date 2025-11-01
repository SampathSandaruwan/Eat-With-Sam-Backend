import { sequelize } from '../config/database';
import { testConnection } from '../config/database';

/**
 * Main seeder runner
 * Import and register your seeders here
 */
const runSeeders = async (): Promise<void> => {
  try {
    console.log('🌱 Starting database seeding...');

    // Test database connection
    await testConnection();

    // Import seeders here as you create them
    // Example:
    // await seedUsers();
    // await seedProducts();

    // Add your seeders here
    console.log('📝 No seeders registered yet. Add seeders to seeders/index.ts');

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
};

// Run seeders if this file is executed directly
if (require.main === module) {
  runSeeders()
    .then(() => {
      console.log('Database Seeding: Successful');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database Seeding: Failed', error);
      process.exit(1);
    });
}

export default runSeeders;

