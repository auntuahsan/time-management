#!/bin/bash

# Build script for Time Management App
# This script prompts for the database password to avoid special character issues

echo "=== Time Management Build Script ==="
echo ""

# Prompt for database password
echo "Enter database password:"
read -s DB_PASSWORD
export DB_PASSWORD

echo ""
echo "Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "=== Build completed successfully! ==="
    echo ""
    echo "To restart the application, run:"
    echo "  pm2 restart time-management"
else
    echo ""
    echo "=== Build failed! ==="
    exit 1
fi
