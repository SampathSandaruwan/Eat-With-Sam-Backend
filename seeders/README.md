# Database Seeders

This directory contains database seeding scripts using Faker.js.

## Usage

### Run all seeders

```bash
npm run seed
```

### Configuring Seeding Behavior

The seeding behavior is controlled by the `SEEDING_CONFIG` constant at the top of `seeders/index.ts`. This makes it easy to customize the seeding pattern without modifying individual seeder calls.

```typescript
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
```

**Configuration Options:**
- `COUNT`: Number of records to create for each entity type
- `CLEAR_EXISTING`: Whether to clear existing records before seeding (set to `true` to truncate tables, `false` to keep existing data)

Simply edit the values in `SEEDING_CONFIG` to adjust the seeding pattern for your needs.

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

Individual seeder functions accept these options:
- `count`: Number of records to create (default: 10)
- `clearExisting`: Whether to clear existing records before seeding (default: false)

**Note**: When using the main seeding script (`npm run seed`), these options are controlled via the `SEEDING_CONFIG` constant in `seeders/index.ts` rather than passing them directly to seeder functions.

## Performance Testing Requirements

**Orders Seeding**: For performance testing, the orders seeder must generate at least **10,000 orders** with associated order items. This requirement tests the database schema's ability to handle large datasets efficiently.

**Example**:
```typescript
await seedOrders({ count: 10000, clearExisting: true });
```

**Note**: The database schema has been optimized with indexes on foreign keys, status fields, and date fields to support efficient queries on large order datasets.

