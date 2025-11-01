import { faker } from '@faker-js/faker';

/**
 * Type definitions for seeding utilities
 */

export interface SeederOptions {
  count?: number;
  clearExisting?: boolean;
}

export interface SeederFunction {
  (options?: SeederOptions): Promise<void>;
}

/**
 * Helper type for creating seed data with Faker
 */
export type FakerFunction<T> = () => T;

/**
 * Utility function to create seed data using Faker
 * 
 * @example
 * const userSeeder = createSeeder<User>(User, 'User', {
 *   name: () => faker.person.fullName(),
 *   email: () => faker.internet.email(),
 *   createdAt: () => new Date(),
 * });
 */
export function createSeeder<T extends { [key: string]: any }>(
  model: any,
  modelName: string,
  fakerMap: { [K in keyof T]?: FakerFunction<T[K]> }
): SeederFunction {
  return async (options: SeederOptions = {}) => {
    const count = options.count || 10;
    const clearExisting = options.clearExisting ?? false;

    if (clearExisting) {
      await model.destroy({ truncate: true, cascade: true });
      console.log(`🗑️  Cleared existing ${modelName} records`);
    }

    const records: T[] = [];

    for (let i = 0; i < count; i++) {
      const record: Partial<T> = {};
      
      for (const [key, fakerFn] of Object.entries(fakerMap)) {
        if (fakerFn) {
          record[key as keyof T] = fakerFn();
        }
      }

      records.push(record as T);
    }

    await model.bulkCreate(records);
    console.log(`✅ Seeded ${count} ${modelName} records`);
  };
}

export { faker };

