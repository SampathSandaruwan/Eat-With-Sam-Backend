import { sequelize } from '../config/database';
import { Sequelize, DataTypes } from 'sequelize';

// Import models here as you create them
// Example:
// import User from './User';

const db = {
  sequelize,
  Sequelize,
  DataTypes,
  // Add models here
  // User,
};

// Initialize associations here if needed
// Example: User.associate(db);

export default db;

