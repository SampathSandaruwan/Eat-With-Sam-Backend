# EatWithSam Backend

Node.js Express backend with TypeScript, MySQL database using Sequelize ORM.

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v5.7 or higher) - [Download](https://dev.mysql.com/downloads/)
- **npm** or **yarn** (comes with Node.js)
- **Git** (for cloning the repository)

## Setup

Follow these steps to set up the project on your local machine:

### 1. Clone the Repository

```bash
git clone <repository-url>
cd EatWithSamBackend
```

### 2. Install Dependencies

```bash
npm install
```

This will install all project dependencies including TypeScript and other development tools.

### 3. Configure Environment Variables

Create a `.env` file in the root directory. If a `.env.example` file exists, you can use it as a template:

```bash
cp .env.example .env
```

Edit the `.env` file and configure the following required variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=eatwithsam
DB_USER=your_username
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_refresh_token_secret_key_here

# Optional: Token Expiry Settings
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
REFRESH_TOKEN_CLEANUP_RETENTION_DAYS=7

# Server Configuration
PORT=3000
NODE_ENV=development
```

**Important**: Generate strong, random secrets for `JWT_SECRET` and `JWT_REFRESH_SECRET` in production environments.

### 4. Set Up MySQL Database

Create a MySQL database for the project:

```bash
mysql -u root -p
```

Then in the MySQL prompt:

```sql
CREATE DATABASE eatwithsam CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

Replace `eatwithsam` with your preferred database name (must match `DB_NAME` in your `.env` file).

### 5. Initialize Database Schema

Sync the database schema to create all required tables:

```bash
npm run sync-db
```

This command will:
- Test the database connection
- Create all tables defined in the Sequelize models
- Alter existing tables if the schema has changed (safe for development)

**Note**: The `sync-db` script uses `alter: true`, which modifies existing tables without dropping data. Always backup your database before running this in production.

### 6. (Optional) Seed Database with Test Data

For development and testing, you can populate the database with sample data:

```bash
npm run seed
```

This will generate fake data for restaurants, menu items, orders, and other entities using Faker.js. See the [seeders documentation](./seeders/README.md) for more details.

### 7. Start the Development Server

Run the server in development mode (with auto-reload):

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

### Production Build

For production deployment:

1. Build the TypeScript project:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

The compiled JavaScript will be in the `dist/` directory.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with auto-reload |
| `npm start` | Start production server (requires build) |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run sync-db` | Sync database schema with models |
| `npm run seed` | Populate database with test data |
| `npm run lint` | Run ESLint to check code quality |
| `npm run lint:fix` | Fix ESLint issues automatically |

For more details on database seeding, see the [seeders documentation](./seeders/README.md).

## Documentation

For comprehensive documentation including database schema, API testing, and more, see the [documentation](./documentation/README.md) directory.

## Project Structure

```
.
├── config/          # Configuration files
│   └── database.ts  # Sequelize database configuration
├── models/          # Sequelize models
│   └── index.ts     # Models index
├── routes/          # Express routes
│   └── index.ts     # Routes index
├── controllers/     # Route controllers
├── middlewares/     # Custom middlewares
├── scripts/         # Utility scripts
│   └── sync-database.ts  # Database schema synchronization script
├── seeders/         # Database seeders with Faker.js
│   ├── index.ts     # Main seeder runner
│   ├── fixtures/    # Seeder fixtures (restaurants, menuItems, etc.)
│   ├── utils/       # Seeder utilities (helpers, constants)
│   └── README.md    # Seeder documentation
├── documentation/   # Project documentation
│   └── README.md    # Documentation index
├── app.ts           # Express app setup
├── server.ts        # Server entry point
├── tsconfig.json    # TypeScript configuration
├── nodemon.json     # Nodemon configuration
├── dist/            # Compiled JavaScript (generated)
├── .env             # Environment variables (not in git)
└── package.json     # Dependencies and scripts

```

## API Endpoints

- `GET /health` - Health check endpoint

## Environment Variables

| Name | Description | Required | Default Value |
|------|-------------|----------|---------------|
| `PORT` | Server port | No | `3000` |
| `NODE_ENV` | Environment mode (development/production) | No | `development` |
| `DB_HOST` | MySQL host | No | `localhost` |
| `DB_PORT` | MySQL port | No | `3306` |
| `DB_NAME` | Database name | Yes | - |
| `DB_USER` | MySQL username | Yes | - |
| `DB_PASSWORD` | MySQL password | Yes | - |
| `JWT_SECRET` | Secret key for signing JWT tokens | Yes | - |
| `JWT_REFRESH_SECRET` | Secret key for signing refresh tokens | Yes | - |
| `ACCESS_TOKEN_EXPIRY` | Access token expiration time (e.g., "15m", "1h") | No | `15m` |
| `REFRESH_TOKEN_EXPIRY` | Refresh token expiration time (e.g., "7d", "30d") | No | `7d` |
| `REFRESH_TOKEN_CLEANUP_RETENTION_DAYS` | Days to keep expired refresh tokens before deletion (for stolen token detection) | No | `7` |

