# FertoBot - Quick Start Guide

## 5-Minute Setup

### 1. Prerequisites
```bash
# Ensure you have:
docker --version      # v20.10+
docker-compose --version  # v2.0+
git --version         # Any recent version
```

### 2. Clone & Setup
```bash
git clone <your-repo>
cd fert
chmod +x scripts/setup-production.sh
```

### 3. Run Setup
```bash
./scripts/setup-production.sh
```

**That's it!** The script will:
- Validate Docker installation
- Create `.env` with secured defaults
- Build Docker images (5-10 minutes)
- Start all services
- Run health checks

### 4. Access Your App
```
Frontend:    http://localhost
API:         http://localhost:3001
API Health:  http://localhost:3001/api/health
```

### 5. Create First User
```bash
# Use the API to register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@fertobot.com",
    "password": "SecurePassword123!",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

## Common Commands

```bash
# View status
docker-compose ps

# View logs (live)
docker-compose logs -f

# View specific service logs
docker-compose logs -f api
docker-compose logs -f mongodb

# Stop all services
docker-compose down

# Restart everything
docker-compose restart

# Full restart (nuclear option)
docker-compose down -v
docker-compose up -d

# Backup database
./scripts/backup-database.sh
```

## Troubleshooting

### Services won't start?
```bash
# Check what's wrong
docker-compose logs

# Full restart
docker-compose down -v
docker-compose up -d
```

### Port already in use?
```bash
# Edit .env
API_PORT=3002
WEB_PORT=8080

# Restart
docker-compose up -d
```

### Database issues?
```bash
# Reset database (CAUTION: deletes data)
docker-compose down -v
docker-compose up -d

# Check MongoDB
docker exec fertobot-mongodb mongosh -u fertobot -p
```

### API returns 500 error?
```bash
# Check API logs
docker-compose logs api

# Verify MongoDB is running
docker-compose logs mongodb
```

## Production Deployment

For production, see full guides:
- **Quick Setup**: This file
- **Detailed Guide**: `DEPLOYMENT.md`
- **Full Implementation**: `PRODUCTION_README.md`
- **Pre-Deployment**: `DEPLOYMENT_CHECKLIST.md`

## API Basics

### Login & Get Token
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fertobot.com","password":"SecurePassword123!"}'

# Response will include: {"token":"eyJhbGc..."}
```

### Use Token in Requests
```bash
# Set your token
TOKEN="eyJhbGc..."

# Make authenticated request
curl http://localhost:3001/api/probes \
  -H "Authorization: Bearer $TOKEN"
```

### Create a Probe
```bash
TOKEN="your-token-here"

curl -X POST http://localhost:3001/api/probes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "uuid": "probe-001",
    "name": "Field A - Sensor 1",
    "serialNumber": "SN12345",
    "location": {
      "fieldName": "North Field",
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  }'
```

## Key Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/health` | Health check |
| GET | `/api/probes` | List probes |
| POST | `/api/probes` | Create probe |
| GET | `/api/sensors/latest/:id` | Latest reading |
| POST | `/api/sensors/reading` | Record reading |
| GET | `/api/users/profile` | Get profile |
| PUT | `/api/users/profile` | Update profile |

## Monitoring

```bash
# Check container status
docker-compose ps

# View real-time stats
docker stats

# Check disk usage
docker system df

# View API health
curl http://localhost:3001/api/health

# View logs (last 100 lines)
docker-compose logs --tail=100
```

## Backup

```bash
# Automatic backup
./scripts/backup-database.sh

# Check backups folder
ls -lh backups/

# Restore from backup
# (See DEPLOYMENT.md for detailed steps)
```

## Next Steps

1. **Change Default Credentials**
   ```bash
   # Edit .env
   MONGODB_URI=mongodb://youruser:yourpass@mongodb:27017/fertobot
   JWT_SECRET=your-secure-random-key
   ```

2. **Setup SSL/HTTPS**
   ```bash
   # Use Let's Encrypt
   sudo certbot certonly --standalone -d yourdomain.com
   ```

3. **Configure Domain**
   ```bash
   # Update .env
   VITE_API_URL=https://api.yourdomain.com
   ```

4. **Enable External APIs**
   - Add Weather API key to `.env`
   - Add ElevenLabs API key to `.env`

5. **Import Agricultural Data**
   - Data located in `all_data/` (98 spreadsheets)
   - Use import script when ready

## Files Overview

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Multi-container orchestration |
| `Dockerfile` | Frontend container |
| `Dockerfile.server` | Backend container |
| `.env.example` | Environment template |
| `DEPLOYMENT.md` | Full deployment guide |
| `PRODUCTION_README.md` | Complete documentation |
| `scripts/setup-production.sh` | Automated setup |
| `scripts/backup-database.sh` | Database backup |

## Architecture

```
┌────────────────────────┐
│   Your Browser         │
│  (React PWA App)       │
└────────────┬───────────┘
             │ HTTP/REST
    ┌────────┴────────┐
    │                 │
┌───▼──────────┐  ┌──▼─────────┐
│ Express API  │  │  MongoDB    │
│ (Node.js)    │  │ (Database)  │
└──────────────┘  └─────────────┘
```

## Support

- 📖 Full docs: See `PRODUCTION_README.md`
- 🔧 Setup help: See `DEPLOYMENT.md`
- ✅ Checklist: See `DEPLOYMENT_CHECKLIST.md`
- 🐛 Troubleshooting: Run `docker-compose logs`

## Tips

- **Logs are your friend**: `docker-compose logs -f`
- **Clean slate**: `docker-compose down -v` removes everything
- **Check ports**: `lsof -i :3001` shows what's using port 3001
- **Monitor memory**: `docker stats` shows live resource usage

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: April 2026

**Never deployed before?** Follow the 5-minute setup above - it automates everything!
