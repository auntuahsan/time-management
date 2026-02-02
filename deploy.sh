#!/bin/bash

echo "🚀 Deploying Time Management Application..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ Error: .env.production file not found!${NC}"
    echo -e "${YELLOW}💡 Create .env.production with your production database settings${NC}"
    exit 1
fi

# Pull latest code
echo -e "${YELLOW}📥 Pulling latest code from Git...${NC}"

# Fetch latest changes
git fetch origin

# Check if there are local changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  Local changes detected. Stashing them...${NC}"
    git stash
fi

# Get current branch name
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "${YELLOW}📌 Current branch: ${CURRENT_BRANCH}${NC}"

# Pull with merge strategy (handles divergent branches)
git pull origin $CURRENT_BRANCH --no-rebase

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Git pull failed!${NC}"
    echo -e "${YELLOW}💡 Try running: git pull origin main --rebase${NC}"
    exit 1
fi

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ npm install failed!${NC}"
    exit 1
fi

# Build the application
echo -e "${YELLOW}🔨 Building application...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

# Run database sync (Sequelize auto-sync)
echo -e "${YELLOW}🗄️  Syncing database...${NC}"
echo -e "${YELLOW}   Database will sync on first request${NC}"

# Reload PM2 (zero-downtime)
echo -e "${YELLOW}🔄 Reloading application with PM2...${NC}"

# Check if app is already running
if pm2 list | grep -q "time-management"; then
    echo -e "${YELLOW}♻️  App is running, reloading with updated environment...${NC}"
    pm2 reload time-management --update-env
else
    echo -e "${YELLOW}🚀 App not running, starting...${NC}"
    pm2 start ecosystem.config.js --env production
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ PM2 operation failed!${NC}"
    exit 1
fi

# Show PM2 status
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
pm2 status

# Show logs
echo ""
echo -e "${YELLOW}📋 Recent logs:${NC}"
pm2 logs time-management --lines 20 --nostream
