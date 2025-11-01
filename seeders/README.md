# Database Seeders

This directory contains database seeding scripts using Faker.js.

## Usage

### Run all seeders

```bash
npm run seed
```

### Run seeders with TypeScript directly (development)

```bash
npm run seed:dev
```

## Adding New Seeders

1. Create a new seeder file in this directory (e.g., `users.ts`)
2. Import the seeder function in `seeders/index.ts`
3. Call the seeder function in the `runSeeders` function

### Example Seeder

```typescript
// seeders/users.ts
import { createSeeder, faker } from './types';
import User from '../models/User';

export const seedUsers = createSeeder<User>(User, 'User', {
  name: () => faker.person.fullName(),
  email: () => faker.internet.email(),
  age: () => faker.number.int({ min: 18, max: 80 }),
  createdAt: () => new Date(),
});

// Then in seeders/index.ts:
import { seedUsers } from './users';
// ...
await seedUsers({ count: 50, clearExisting: true });
```

## Seeder Options

- `count`: Number of records to create (default: 10)
- `clearExisting`: Whether to clear existing records before seeding (default: false)

## Performance Testing Requirements

**Orders Seeding**: For performance testing, the orders seeder must generate at least **10,000 orders** with associated order items. This requirement tests the database schema's ability to handle large datasets efficiently.

**Example**:
```typescript
await seedOrders({ count: 10000, clearExisting: true });
```

**Note**: The database schema has been optimized with indexes on foreign keys, status fields, and date fields to support efficient queries on large order datasets.

