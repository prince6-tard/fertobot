# FertoBot - Production Deployment Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (React + PWA)                │
│                    Running on Nginx                      │
└──────────────────────────┬──────────────────────────────┘
                          │
                    API Calls (HTTP/REST)
                          │
    ┌─────────────────────┼─────────────────────┐
    │                     │                     │
┌───▼────────┐  ┌────────▼─────┐  ┌────────────▼───┐
│  Express   │  │   MongoDB    │  │     MQTT      │
│    API     │  │   Database   │  │     Broker    │
│  (Node.js) │  │  (Mongoose)  │  │ (Mosquitto)   │
└────────────┘  └──────────────┘  └───────────────┘
                        │
                        │
        ┌───────────────┴───────────────┐
        │                               │
   ┌────▼────┐                   ┌─────▼──────┐
   │  Redis  │                   │  ESP32/IoT │
   │  Cache  │                   │  Devices   │
   └─────────┘                   └────────────┘
```

## Prerequisites

- **Docker & Docker Compose**: v20.10+
- **MongoDB**: v5.0+ (included in docker-compose)
- **Node.js**: v18+ (for development)
- **MQTT Broker**: Eclipse Mosquitto (included in docker-compose)

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd fert
cp .env.example .env
```

### 2. Configure Environment

Edit `.env` file with your settings:

```bash
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://fertobot:fertobot123@mongodb:27017/fertobot
JWT_SECRET=generate-a-strong-random-key-here
ELEVENLABS_API_KEY=your-api-key
WEATHER_API_KEY=your-weather-api-key
```

### 3. Start Services

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 4. Verify Installation

```bash
# Check API health
curl http://localhost:3001/api/health

# Frontend should be available
open http://localhost:80
```

## Development Setup

### Local Development (Without Docker)

```bash
# Terminal 1: MongoDB
mongod --dbpath ./data/mongodb

# Terminal 2: Backend
cd server
npm install
npm run dev

# Terminal 3: Frontend
npm install
npm run dev
```

### API Endpoints

#### Authentication
```
POST   /api/auth/register      - Register new user
POST   /api/auth/login         - Login user
POST   /api/auth/verify        - Verify token
```

#### Sensors
```
GET    /api/sensors/latest/:probeId        - Get latest reading
GET    /api/sensors/range/:probeId         - Get readings in date range
POST   /api/sensors/reading                - Record new reading
GET    /api/sensors/statistics/:probeId    - Get statistics
```

#### Probes
```
GET    /api/probes/                     - List all probes
GET    /api/probes/:probeId             - Get single probe
POST   /api/probes/                     - Create probe
PUT    /api/probes/:probeId             - Update probe
DELETE /api/probes/:probeId             - Delete probe
```

#### Other Resources
```
GET    /api/farmers/profile             - User profile
PUT    /api/farmers/profile             - Update profile
GET    /api/alerts/                     - Get alerts
GET    /api/weather/forecast            - Weather forecast
POST   /api/irrigation/control          - Control irrigation
GET    /api/reports/                    - Get reports
GET    /api/crop-data/recommendations   - Crop recommendations
```

## Production Deployment

### Option 1: Docker Compose (Recommended for small to medium)

```bash
# On your server
docker-compose -f docker-compose.yml up -d

# Enable auto-restart
docker-compose up -d --restart-policy always
```

### Option 2: Kubernetes Deployment

```bash
# Create namespace
kubectl create namespace fertobot

# Deploy using helm chart (create helm/values.yaml)
helm install fertobot ./helm-chart -n fertobot -f helm/values.yaml
```

### Option 3: AWS/GCP/Azure Deployment

**With Vercel/Netlify (Frontend only):**
- Frontend can be deployed to Vercel
- Backend should run on AWS Lambda, Google Cloud Run, or Azure Functions

**With Traditional VPS:**
- Use docker-compose on EC2/Droplet/VM
- Set up reverse proxy (Nginx/HAProxy)
- Configure SSL with Let's Encrypt

## Security Checklist

- [ ] Change all default credentials in `.env`
- [ ] Generate strong JWT_SECRET
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up rate limiting (enabled by default)
- [ ] Regular database backups
- [ ] Monitor logs for anomalies
- [ ] Keep dependencies updated
- [ ] Enable API authentication
- [ ] Use environment variables for sensitive data

## Monitoring & Logging

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f mongodb

# Backend logs
docker exec fertobot-api tail -f logs/combined.log
```

### Health Checks

```bash
# API health
curl http://localhost:3001/api/health

# MongoDB
docker exec fertobot-mongodb mongosh -u fertobot -p --eval "db.adminCommand('ping')"

# MQTT
docker exec fertobot-mqtt mosquitto_sub -h localhost -t '$SYS/#'
```

## Database Management

### Backup MongoDB

```bash
# Dump database
docker exec fertobot-mongodb mongodump \
  -u fertobot -p fertobot123 \
  --out /backup/mongodb_backup_$(date +%Y%m%d)

# Restore from backup
docker exec fertobot-mongodb mongorestore \
  -u fertobot -p fertobot123 \
  /backup/mongodb_backup_20240101
```

### Data Import

```bash
# Import crop data from Excel files
docker exec fertobot-api node scripts/import-crop-data.js

# Import weather data
docker exec fertobot-api node scripts/import-weather-baseline.js
```

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx, HAProxy)
- Multiple API instances
- Shared MongoDB cluster
- Redis for session management

### Vertical Scaling
- Increase container resource limits
- Database indexing optimization
- Caching strategies
- Query optimization

## Troubleshooting

### Common Issues

**1. MongoDB Connection Failed**
```bash
# Check MongoDB service
docker-compose logs mongodb

# Rebuild containers
docker-compose down
docker-compose up -d
```

**2. API Port Already in Use**
```bash
# Change port in .env
API_PORT=3002

# Restart
docker-compose down
docker-compose up -d
```

**3. Permission Denied Errors**
```bash
# Fix ownership
sudo chown -R $USER:$USER ./data ./logs

# Restart containers
docker-compose restart
```

## Maintenance

### Regular Tasks

- **Weekly**: Check logs for errors, verify backups
- **Monthly**: Update dependencies, security patches
- **Quarterly**: Database optimization, performance review
- **Annually**: Architecture review, capacity planning

### Update Dependencies

```bash
# Frontend
npm outdated
npm update

# Backend
cd server
npm outdated
npm update
```

## Performance Tuning

### Database Optimization
```javascript
// Recommended indexes created automatically by models
SensorReading.index({ probeId: 1, timestamp: -1 });
Probe.index({ userId: 1, isActive: 1 });
User.index({ email: 1 });
```

### Caching Strategy
- Redis cache for weather data
- Session storage in Redis
- API response caching

### Load Testing

```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:3001/api/health

# Using curl loop
for i in {1..100}; do curl http://localhost:3001/api/health; done
```

## Support

For issues and questions:
1. Check logs: `docker-compose logs -f [service]`
2. Review API documentation
3. Submit issues on GitHub
4. Contact support team

## License

MIT - See LICENSE file for details

---

**Last Updated**: April 2026
**Version**: 1.0.0
