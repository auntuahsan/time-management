import { config } from 'dotenv';
import { resolve } from 'path';
import * as readline from 'readline';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

function promptPassword(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const stdin = process.stdin;
    if (stdin.isTTY) {
      stdin.setRawMode(true);
    }

    process.stdout.write(prompt);

    let password = '';

    stdin.on('data', (char) => {
      const c = char.toString();

      if (c === '\n' || c === '\r' || c === '\u0004') {
        if (stdin.isTTY) {
          stdin.setRawMode(false);
        }
        process.stdout.write('\n');
        rl.close();
        resolve(password);
      } else if (c === '\u0003') {
        process.exit();
      } else if (c === '\u007F' || c === '\b') {
        if (password.length > 0) {
          password = password.slice(0, -1);
          process.stdout.write('\b \b');
        }
      } else {
        password += c;
        process.stdout.write('*');
      }
    });
  });
}

async function seed() {
  console.log('\n🔐 Database Connection Setup');
  console.log(`Host: ${process.env.DB_HOST}`);
  console.log(`Database: ${process.env.DB_NAME}`);
  console.log(`User: ${process.env.DB_USER}\n`);

  const dbPassword = await promptPassword('Enter database password: ');

  if (!dbPassword) {
    console.error('❌ Database password is required');
    process.exit(1);
  }

  // Set password in env
  process.env.DB_PASSWORD = dbPassword;

  // Now import models (after password is set)
  const { User, syncDatabase } = await import('../src/lib/models');

  try {
    console.log('Connecting to database...');
    await syncDatabase();

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      where: { email: 'admin@timetrack.com' },
    });

    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create default admin user
    await User.create({
      username: 'admin',
      email: 'admin@timetrack.com',
      password: 'admin123',
      role: 'admin',
    });

    console.log('\n✅ Default admin user created successfully!');
    console.log('----------------------------------------');
    console.log('Email:    admin@timetrack.com');
    console.log('Password: admin123');
    console.log('----------------------------------------');
    console.log('Please change the password after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
