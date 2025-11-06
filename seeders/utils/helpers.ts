import { Model, ModelStatic } from 'sequelize';

import { faker } from '@faker-js/faker';

/**
 * Type definitions for seeding utilities
 */

export interface SeederOptions {
  count?: number;
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
export function createSeeder<T extends object>(
  model: ModelStatic<Model>,
  modelName: string,
  fakerMap: { [K in keyof T]?: FakerFunction<T[K]> },
): SeederFunction {
  return async (options: SeederOptions = {}) => {
    const count = options.count || 10;

    const records: Partial<T>[] = [];

    for (let i = 0; i < count; i++) {
      const record: Partial<T> = {};

      for (const [key, fakerFn] of Object.entries(fakerMap)) {
        if (fakerFn && typeof fakerFn === 'function') {
          record[key as keyof T] = fakerFn();
        }
      }

      records.push(record);
    }

    await (model).bulkCreate(records);
    console.log(`Seeded ${count} ${modelName} records`);
  };
}

export { faker };

