require('dotenv').config({ path: '.env.local' });

module.exports = {
  development: {
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'timemanagement',
    username: process.env.DB_USER || 'user',
    password: process.env.DB_PASSWORD || 'password',
  },
  production: {
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'timemanagement',
    username: process.env.DB_USER || 'user',
    password: process.env.DB_PASSWORD || 'password',
  },
};
