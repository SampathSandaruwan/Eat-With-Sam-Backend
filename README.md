# EatWithSam Backend

Node.js Express backend with TypeScript, MySQL database using Sequelize ORM.

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn
- TypeScript (installed as dev dependency)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory (use `.env.example` as a template):
```bash
cp .env.example .env
```

3. Update the `.env` file with your database credentials:
   - DB_HOST: MySQL host
   - DB_PORT: MySQL port
   - DB_NAME: Database name
   - DB_USER: MySQL username
   - DB_PASSWORD: MySQL password

4. Create the MySQL database:
```bash
mysql -u root -p
CREATE DATABASE <your-database-name>;
```

5. Build the TypeScript project (for production):
```bash
npm run build
```

6. Run the server:
```bash
# Development mode (with auto-reload and ts-node)
npm run dev

# Production mode (requires build first)
npm start
```

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
├── app.ts           # Express app setup
├── server.ts        # Server entry point
├── tsconfig.json    # TypeScript configuration
├── nodemon.json     # Nodemon configuration
├── dist/            # Compiled JavaScript (generated)
├── .env             # Environment variables (not in git)
└── package.json     # Dependencies

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

