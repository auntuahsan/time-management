import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { promptPassword } from './src/utils/passwordPrompt';
import { config } from 'dotenv';

// Load env vars
config({ path: '.env.local' });

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '4000', 10);

async function startServer() {
  console.log('\n🔐 Database Connection Setup');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Host: ${process.env.DB_HOST}`);
  console.log(`Database: ${process.env.DB_NAME}`);
  console.log(`User: ${process.env.DB_USER}\n`);

  // Prompt for password
  const dbPassword = await promptPassword('Enter database password: ');

  if (!dbPassword) {
    console.error('❌ Database password is required');
    process.exit(1);
  }

  // Set password in environment for the app to use
  process.env.DB_PASSWORD = dbPassword;

  // Test database connection before starting
  const { Sequelize } = await import('sequelize');
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: dbPassword,
    logging: false,
  });

  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully\n');
    await sequelize.close();
  } catch (error) {
    console.error('❌ Database connection failed:', (error as Error).message);
    process.exit(1);
  }

  // Start Next.js
  const app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();

  await app.prepare();

  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
}

startServer();
