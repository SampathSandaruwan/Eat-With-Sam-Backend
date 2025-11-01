/**
 * Example seeder file - Remove or modify this when you have actual models
 * 
 * This demonstrates how to create a seeder using the createSeeder utility
 */

import { createSeeder, faker } from './types';

// Example: How to create a seeder for a User model
// Uncomment and modify when you have a User model:

/*
import User from '../models/User';

export const seedUsers = createSeeder<User>(User, 'User', {
  name: () => faker.person.fullName(),
  email: () => faker.internet.email(),
  password: () => faker.internet.password({ length: 12 }),
  phone: () => faker.phone.number(),
  createdAt: () => new Date(),
  updatedAt: () => new Date(),
});
*/

// Example usage in seeders/index.ts:
// await seedUsers({ count: 50, clearExisting: true });

