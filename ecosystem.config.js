module.exports = {
  apps: [
    {
      name: 'time-management',
      script: 'npm',
      args: 'start',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 4000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000,
        DB_HOST: '47.128.72.37',
        DB_PORT: '5432',
        DB_NAME: 'time-management',
        DB_USER: 'sajid_dev',
        DB_PASSWORD: 'tQZZ1n03o7fA$98[',
        JWT_SECRET: 'time-management-production',
        QR_SECRET: 'time-management-secret',
        NEXT_PUBLIC_APP_URL: 'http://time.auntu.com',
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
    },
  ],
};
