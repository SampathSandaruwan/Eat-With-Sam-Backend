# Database Seeders

This directory contains database seeding scripts using Faker.js.

## Usage

### Run all seeders

```bash
npm run seed
```

NOTE: Modify `SEEDING_CONFIG` to customize the seeding behavior

## Adding New Seeders

1. Create a new seeder file in the `fixtures/` directory (e.g., `fixtures/users.ts`)
2. Import the new seeder function into `seeders/index.ts`
3. Call the seeder function in the `runSeeders` function

### Example Seeder

```typescript
// seeders/fixtures/users.ts
import { createSeeder, faker } from '../utils/helpers';
import { UserModel } from '../../models';
import { DATABASE_MODELS } from '../../constants';

export const seedUsers = createSeeder<User>(
  UserModel,
  DATABASE_MODELS.USERS.MODEL_NAME,
  {
    name: () => faker.person.fullName(),
    email: () => faker.internet.email(),
    age: () => faker.number.int({ min: 18, max: 80 }),
    createdAt: () => new Date(),
  },
);

// Then in seeders/index.ts:
import { seedUsers } from './fixtures/users';
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

