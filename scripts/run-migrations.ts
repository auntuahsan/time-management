import { Sequelize } from 'sequelize';
import * as readline from 'readline';

async function askPassword(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    // Hide password input
    process.stdout.write('Enter database password: ');

    let password = '';
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    const onData = (char: string) => {
      if (char === '\n' || char === '\r' || char === '\u0004') {
        process.stdin.setRawMode(false);
        process.stdin.removeListener('data', onData);
        process.stdout.write('\n');
        rl.close();
        resolve(password);
      } else if (char === '\u0003') {
        // Ctrl+C
        process.exit();
      } else if (char === '\u007F' || char === '\b') {
        // Backspace
        if (password.length > 0) {
          password = password.slice(0, -1);
        }
      } else {
        password += char;
      }
    };

    process.stdin.on('data', onData);
  });
}

async function runMigrations() {
  // Load env for other settings (except password)
  require('dotenv').config({ path: '.env.local' });

  const password = await askPassword();

  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'timemanagement',
    username: process.env.DB_USER || 'user',
    password: password,
    logging: false,
  });

  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Remove the unique_user_date constraint to allow multiple check-ins per day
    console.log('Running migration: remove-unique-user-date-constraint...');
    await sequelize.query('ALTER TABLE attendance DROP CONSTRAINT IF EXISTS unique_user_date;');

    // Also drop unique index if it exists (PostgreSQL creates index for unique constraints)
    console.log('Dropping unique index if exists...');
    await sequelize.query('DROP INDEX IF EXISTS unique_user_date;');

    console.log('Migration complete: Removed unique_user_date constraint and index.');

    await sequelize.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
