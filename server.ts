/* eslint-disable no-console */
import app from './app';
import { testConnection } from './config/database';

const PORT = process.env.PORT || 3000;

// Test database connection before starting server
testConnection();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

