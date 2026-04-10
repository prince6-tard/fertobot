#!/bin/bash

# FertoBot Production Setup Script
# This script sets up the entire FertoBot system for production

set -e

echo "🚀 FertoBot Production Setup"
echo "============================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
  echo -e "${RED}❌ Docker is not installed${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Docker found${NC}"

if ! command -v docker-compose &> /dev/null; then
  echo -e "${RED}❌ Docker Compose is not installed${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Docker Compose found${NC}"

# Create .env if it doesn't exist
if [ ! -f .env ]; then
  echo -e "${YELLOW}Creating .env file from template...${NC}"
  cp .env.example .env
  echo -e "${GREEN}✓ .env created${NC}"
  echo -e "${YELLOW}⚠️  Please update .env with your settings${NC}"
  exit 0
fi

# Create required directories
echo "Creating required directories..."
mkdir -p data/mongodb
mkdir -p logs
mkdir -p server/logs
echo -e "${GREEN}✓ Directories created${NC}"

# Generate JWT Secret if not set
if ! grep -q "JWT_SECRET=your-" .env; then
  JWT_SECRET=$(openssl rand -base64 32)
  sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env
  echo -e "${GREEN}✓ Generated JWT_SECRET${NC}"
fi

# Build and start services
echo -e "${YELLOW}Building Docker images...${NC}"
docker-compose build --no-cache

echo -e "${YELLOW}Starting services...${NC}"
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 10

# Health checks
echo "Running health checks..."
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
  echo -e "${GREEN}✓ API is running${NC}"
else
  echo -e "${RED}❌ API is not responding${NC}"
  docker-compose logs api
  exit 1
fi

if curl -f http://localhost:80 > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Frontend is running${NC}"
else
  echo -e "${RED}❌ Frontend is not responding${NC}"
  docker-compose logs web
  exit 1
fi

# Check MongoDB
if docker exec fertobot-mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ MongoDB is running${NC}"
else
  echo -e "${RED}❌ MongoDB is not responding${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ FertoBot is ready!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Access your application:"
echo "  Frontend: http://localhost"
echo "  API: http://localhost:3001"
echo "  API Health: http://localhost:3001/api/health"
echo ""
echo "View logs:"
echo "  docker-compose logs -f"
echo ""
echo "Stop services:"
echo "  docker-compose down"
echo ""
