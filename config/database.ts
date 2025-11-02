/* eslint-disable no-console */
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

if (!dbName || !dbUser || !dbPassword) {
  throw new Error('Database credentials are not set');
}

const sequelize = new Sequelize(
  dbName,
  dbUser,
  dbPassword,
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
);

// Test the connection
export const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Database connection: successful');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

export { sequelize };

