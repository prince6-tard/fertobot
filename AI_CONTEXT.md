# FertoBot — Complete Codebase Context

## Project Overview
FertoBot is a **Smart Agriculture Monitoring System** that uses ESP32 microcontrollers with soil sensors (NPK, moisture, temperature, pH, water level, motion) connected over WiFi to a backend API + MQTT + MongoDB stack. Users can monitor sensor data on a dashboard and control irrigation (water pump) remotely via a web app.

The project has **two firmware variants**:
- `final_merge.ino` — reference/baseline firmware, no WiFi, no MQTT, no remote control
- `esp-32-code/src/main.cpp` — production firmware with FreeRTOS, WiFi, HTTP (REST API) telemetry upload, and command polling via long-poll HTTP

---

## Repository Structure

```
C:\Users\priya\Downloads\fert-master\
├── README.md                          # Project README (binary, brief)
├── railway.toml                       # Railway deployment config
├── vercel.json                        # Vercel deployment config (in fert-master/)
├── .gitignore
│
├── fert-master/                       # Main project directory
│   ├── package.json                   # Frontend deps (React, MUI, Recharts, etc.)
│   ├── vite.config.ts                 # Vite build config with PWA support
│   ├── tsconfig.json                  # TypeScript config
│   ├── tsconfig.node.json             # Node TS config
│   ├── index.html                     # HTML entry point
│   ├── vercel.json                    # Vercel deployment
│   ├── docker-compose.yml             # Docker stack: MongoDB, API, Web, MQTT, Redis
│   ├── Dockerfile                     # Frontend Dockerfile
│   ├── Dockerfile.server              # Backend Dockerfile
│   ├── mosquitto.conf                 # MQTT broker config
│   ├── final_merge.ino                # Reference firmware (no WiFi)
│   ├── "Master Knowledge Source (MSC).md"  # Comprehensive implementation guide
│   ├── "Local Implementation Guide.md"     # Step-by-step deployment guide
│   │
│   ├── src/                           # FRONTEND (React + TypeScript + Vite)
│   │   ├── main.tsx                   # App entry point
│   │   ├── App.tsx                    # Router + PWA + layout
│   │   ├── types/index.ts             # TypeScript interfaces
│   │   ├── utils/theme.ts             # MUI theme colors
│   │   ├── utils/pwa.ts               # PWA utilities
│   │   ├── services/
│   │   │   ├── dashboardService.ts    # Dashboard API data normalization
│   │   │   ├── elevenLabsService.ts   # ElevenLabs voice AI integration
│   │   │   └── motionNotificationService.ts
│   │   ├── pages/
│   │   │   ├── Dashboard/Dashboard.tsx        # Main dashboard (dark theme, stat pills, alerts, NPK dials, charts)
│   │   │   ├── SprinklerControl/SprinklerControl.tsx  # Pump ON/OFF UI
│   │   │   ├── ProbeManagement/ProbeManagement.tsx
│   │   │   ├── ProbeDetail/ProbeDetail.tsx
│   │   │   ├── Login/Login.tsx
│   │   │   ├── Profile/Profile.tsx
│   │   │   ├── Reports/Reports.tsx
│   │   │   ├── SecurityCamera/SecurityCamera.tsx
│   │   │   └── VoiceChatbot/VoiceChatbot.tsx
│   │   ├── components/
│   │   │   ├── Layout/Layout.tsx
│   │   │   ├── Dashboard/ (SummaryCards, LiveCharts, AlertsPanel, RecommendationsPanel, ConnectivityStatus, WeatherWidget)
│   │   │   ├── ProbeManagement/ (ProbeGrid, ProbeDetailModal, GroupManagement)
│   │   │   ├── PWA/ (PWAInstallButton, PWAUpdatePrompt)
│   │   │   └── ErrorBoundary.tsx
│   │   └── styles/mobile.css
│   │
│   ├── server/                        # BACKEND (Node.js + Express + TypeScript + Mongoose)
│   │   ├── package.json               # Backend deps
│   │   ├── src/
│   │   │   ├── index.ts               # Server bootstrap, routes, middleware, MQTT lifecycle
│   │   │   ├── devStart.ts            # Dev entry point
│   │   │   ├── config/
│   │   │   │   ├── database.ts        # MongoDB connection
│   │   │   │   └── logger.ts          # Winston logger
│   │   │   ├── models/
│   │   │   │   ├── User.ts            # Mongoose User model
│   │   │   │   ├── Probe.ts           # Mongoose Probe model (uuid, status, battery, wifi, location)
│   │   │   │   ├── SensorReading.ts   # Mongoose SensorReading model (time-series, TTL index 1yr)
│   │   │   │   └── Alert.ts           # Mongoose Alert model
│   │   │   ├── routes/
│   │   │   │   ├── auth.routes.ts     # JWT authentication
│   │   │   │   ├── dashboard.routes.ts # GET /api/dashboard/overview
│   │   │   │   ├── irrigation.routes.ts # POST /api/irrigation/control (pump ON/OFF)
│   │   │   │   ├── device.routes.ts   # ESP32 endpoints: POST reading, GET command, long-poll, motion
│   │   │   │   ├── sensor.routes.ts
│   │   │   │   ├── probe.routes.ts
│   │   │   │   ├── weather.routes.ts
│   │   │   │   ├── alert.routes.ts
│   │   │   │   ├── report.routes.ts
│   │   │   │   ├── cropData.routes.ts
│   │   │   │   ├── user.routes.ts
│   │   │   │   └── assistant.routes.ts
│   │   │   ├── services/
│   │   │   │   ├── mqtt.service.ts    # MQTT subscribe/persist/publish bridge
│   │   │   │   └── commandQueue.ts    # In-memory command queue (long-poll + piggyback)
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts            # JWT authentication middleware
│   │   │   │   ├── validate.ts       # Zod request validation
│   │   │   │   └── errorHandler.ts   # Error handling middleware
│   │   │   ├── schemas/
│   │   │   │   ├── device.schemas.ts  # Zod schemas for device endpoints
│   │   │   │   ├── irrigation.schemas.ts # Zod schemas for irrigation control
│   │   │   │   └── assistant.schemas.ts
│   │   │   └── tests/
│   │   │       ├── setup.ts
│   │   │       ├── device.routes.test.ts
│   │   │       └── commandQueue.test.ts
│   │   └── ... (config files)
│   │
│   └── esp-32-code/                   # ESP32 PRODUCTION FIRMWARE (FreeRTOS + HTTP/REST)
│       ├── platformio.ini             # PlatformIO build config (build flags for WiFi/MQTT/device-id)
│       └── src/main.cpp               # Production firmware (FreeRTOS tasks)
```

---

## Architecture

### Data Flow (Sensor → Dashboard)
1. ESP32 reads RS485 Modbus NPK sensor (temperature, moisture, pH, conductivity, N, P, K) + analog water level + PIR motion
2. ESP32 uploads telemetry via HTTP POST to `/api/device/reading` every 30 seconds
3. Backend API persists to MongoDB SensorReading collection, updates Probe status to "online"
4. Frontend fetches `/api/dashboard/overview` every 10 seconds and renders live cards/charts

### Control Flow (Web → Pump)
1. User clicks Start/Stop Pump in SprinklerControl UI
2. Frontend sends `POST /api/irrigation/control` with `{ probeUuid, pump: bool, relay: "on"/"off", durationMs }`
3. Backend irrigation route inverts relay commands (active-low relay), then calls `deliverCommand()` in the in-memory queue
4. ESP32 picks up the command via one of three mechanisms:
   - **Long-poll**: `GET /api/device/command/wait` — connection held open for 25s, instant delivery
   - **Piggyback**: Command attached to next `POST /api/device/reading` success response
   - **Short-poll fallback**: `GET /api/device/command` polled every 10s
5. ESP32's `applyCommand()` toggles relay GPIO pin 27

### Additional MQTT Data Flow
The MQTT bridge (`mqtt.service.ts`) provides an alternative telemetry ingestion path:
- ESP32 can alternatively publish to MQTT topic `fertobot/probes/<uuid>/sensor-data`
- Backend subscribes, parses probe UUID from topic, writes SensorReading to MongoDB
- MQTT is optional / used for cloud deployments (disabled when broker is localhost)

---

## Key Technical Details

### ESP32 Production Firmware (`esp-32-code/src/main.cpp`)
- **Framework**: Arduino + FreeRTOS
- **Build**: PlatformIO (`platformio.ini`)
- **Communication**: HTTP REST (NOT MQTT in this version)
- **GPIO Pins**: Relay=27, RS485 RX=16, TX=17, EN=23, PIR=13 (+ PIR 14), Buzzer=25, Water=32
- **FreeRTOS Tasks** (pinned to core 1):
  - `taskNPK`: Reads Modbus sensor every 3s (RS485 with semaphore locking, CRC check)
  - `taskWater`: Reads analog water level every 1s
  - `taskMotionBuzzer`: Polls PIR every 25ms, triggers buzzer on motion
  - `taskConnectivity`: WiFi reconnect every 10s, updates RSSI
  - `taskTelemetry`: HTTP upload every 30s + command long-poll every 10s
  - `taskActuatorSafety`: Auto-off relay timer guard (every 50ms)
- **Command parsing**: `applyCommand()` handles `pump` (bool), `relay` ("on"/"off"), `durationMs`, `buzzerMs`
- **Relay is active-LOW** — backend inverts commands before sending

### ESP32 Reference Firmware (`final_merge.ino`)
- Single-loop no-WiFi firmware for hardware validation
- Reads NPK, water level, motion/buzzer
- Pump control manually only (auto-toggle removed)
- No MQTT, no HTTP, no remote control

### Backend API (`server/src/index.ts`)
- Express.js on port 3001, MongoDB via Mongoose
- **Rate limiting**: 100 req/15min for auth, 2000 req/15min for device endpoints
- **Route structure**:
  - Public: `/api/health`, `/api/auth/*`, `/api/dashboard/overview`, `/api/assistant/*`
  - Device (API key auth): `/api/device/*` (reading, command, command/wait, motion, ping, status)
  - Authenticated (JWT): `/api/sensors`, `/api/probes`, `/api/weather`, `/api/alerts`, etc.
  - Irrigation (no auth required in current config): `/api/irrigation/control`
- **Security**: Helmet, CORS, Mongo sanitize, compression, rate limiting

### In-Memory Command Queue (`commandQueue.ts`)
- **No MongoDB involved** — purely in-memory Maps
- `pendingCommands` Map<probeUuid, Command[]> for queued commands
- `waitingClients` Map<probeUuid, Response> for active long-poll connections
- `deliverCommand()`: If device is long-polling → instant response; else → queue for next poll/piggyback
- `consumeCommand()`: Used by telemetry upload piggyback (returns and removes queue head)
- `getPendingCommand()`: Peek at queue head without removing

### Irrigation Route (`irrigation.routes.ts`)
- `POST /api/irrigation/control`
- Validated by Zod schema: `{ probeId?, probeUuid?, relay?, pump?, durationMs?, buzzerMs? }`
- **Auto-provisions probe** if it doesn't exist (creates Probe document owned by first active user)
- **Relay inversion**: Web sends "on" → server sends "off" (because relay is active-LOW wired)
- Calls `deliverCommand()` for instant delivery
- Returns command echo in response data

### Dashboard Route (`dashboard.routes.ts`)
- `GET /api/dashboard/overview`
- Aggregates: all active probes (with populated lastReading), unresolved alerts, recent 200 readings (7 days)
- Returns summary stats: total/online/offline/maintenance probes, active/critical alerts, average battery/moisture/temperature/humidity

### Frontend Dashboard (`Dashboard.tsx`)
- Dark theme with phosphorescent green accent (#A8FF3E)
- **Dark theme color tokens**: BG=#060C08, CARD=#0A1410, ACCENT=#A8FF3E, TEAL=#00E5C6, AMBER=#FFB830, RED=#FF4565, BLUE=#4DA8FF, PURPLE=#B06EFF
- Layout: 2-column grid (main content + sidebar)
- Components: StatPills (moisture, temp, pH, conductivity), intelligence feed (alerts with severity filtering), farm health score (with sparkline), automation controls (irrigation + fertilisation toggles), NPK circular gauges, spatial monitoring map, active resource load bars, live camera preview, recent alerts sidebar
- AI crop advisory CTA linking to voice chatbot
- Auto-refreshes every 10 seconds

### Frontend Sprinkler Control (`SprinklerControl.tsx`)
- Loads live probes from `/api/dashboard/overview` every 10s, merges with local state
- ZoneCard component per probe: shows status, moisture level, flow rate, Start/Stop buttons
- Sends `POST /api/irrigation/control` with `{ probeId, probeUuid, pump, relay, durationMs }`
- Optimistic UI update (zone status set to 'active' immediately)
- Has tabs: zones, schedules, usage history
- Add schedule dialog (UI only, not wired to backend)

### Frontend Types (`types/index.ts`)
- `SensorReading`: timestamp, soilMoisture, temperature, humidity, pH, conductivity, N/P/K, waterTankLevel, batteryLevel, signalStrength, microNutrients, macroNutrients
- `Probe`: id, uuid, name, status (online/offline/maintenance), batteryLevel, wifiStrength, lastActive, location, currentReading
- `Alert`: id, type, severity (info/warning/error/critical), title, message, timestamp, acknowledged, probeId
- `IrrigationSchedule`, `WaterUsageLog`, `SecurityCamera`, `SecurityEvent`, etc.
- `DashboardSummary`, `DashboardOverview` interfaces

### Frontend Dashboard Service (`dashboardService.ts`)
- `fetchDashboardOverview()`: Calls `/api/dashboard/overview`, normalizes probes, alerts, readings
- Normalizes battery/wifi/location sub-objects, creates default reading when no lastReading exists
- Handles both `_id` and `id` fields for compatibility

### Docker Stack (`docker-compose.yml`)
- **5 services**:
  1. `mongodb`: MongoDB 7.0 with healthcheck
  2. `api`: Backend Express.js (Dockerfile.server)
  3. `web`: Frontend Nginx (Dockerfile)
  4. `mqtt`: Eclipse Mosquitto (ports 1883, 9001)
  5. `redis`: Redis 7-alpine
- Network: `fertobot-network` (bridge)
- Persistent volumes for all services
- Healthchecks on mongodb, api, web, redis

### MQTT Broker Config (`mosquitto.conf`)
- Default Mosquitto config (anonymous access, port 1883 + WebSocket 9001)
- Persistence enabled

### Environment Variables
**Backend**: `NODE_ENV`, `PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `MQTT_BROKER_URL`, `MQTT_USERNAME`, `MQTT_PASSWORD`, `ELEVENLABS_API_KEY`, `WEATHER_API_KEY`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `DEVICE_API_KEY`
**Frontend**: `VITE_API_URL`
**Firmware** (platformio.ini build flags): `FW_DEVICE_ID`, `WIFI_SSID`, `WIFI_PASSWORD`, `MQTT_HOST`, `MQTT_PORT`, `MQTT_USER`, `MQTT_PASSWORD`

### Device Routes (`device.routes.ts`)
- `POST /api/device/reading` — ESP32 telemetry upload (API key auth + Zod validation)
  - Parses RSSI to 0-100 signal strength
  - Auto-provisions probe via `findOrCreateProbe()`
  - Records motion events (debounced 10s per device)
  - Piggybacks pending commands in response
- `GET /api/device/command/wait` — Long-poll for commands (25s timeout)
- `GET /api/device/command` — Short-poll fallback
- `GET /api/device/motion` — Motion event polling from frontend
- `GET /api/device/ping` — Connectivity check
- `GET /api/device/status` — Probe status + pending command check (no API key required)

### Hardware Pin Mapping
| Function | ESP32 Pin |
|----------|-----------|
| Relay/Pump | 27 (production) / 26 (reference) |
| RS485 RX | 16 |
| RS485 TX | 17 |
| RS485 DE/RE | 23 |
| PIR Motion | 13 (and 14 in production) |
| Buzzer | 25 |
| Water Level Analog | 32 |

### Modbus Protocol (NPK Sensor)
- Slave ID: 2
- Baud: 9600, 8N1
- Function: 0x03 (read holding registers)
- Starting register: 0x0000, quantity: 7
- Register map: 0x0000=temperature/10, 0x0001=moisture/10, 0x0002=conductivity, 0x0003=pH/100, 0x0004=nitrogen, 0x0005=phosphorus, 0x0006=potassium
- CRC16-Modbus verification
- RS485 DE/RE pin toggling for TX/RX direction control

### MQTT Topic Contract
- Base: `fertobot/probes/<probeUuid>`
- ESP32 publishes: `sensor-data`, `motion`, `status`
- ESP32 subscribes: `control`
- Backend subscribes: `+/sensor-data`, `+/status`, `+/motion`

### ESP32 Commands
- ESP32 version uses HTTP/REST, NOT MQTT
- Commands delivered via: long-poll HTTP, piggyback on telemetry POST response, or short-poll HTTP

### Key Differences Between Firmware Versions
| Feature | `final_merge.ino` | `esp-32-code` production |
|---------|------------------|--------------------------|
| NPK sensor | Yes | Yes |
| Water level | Yes | Yes |
| Motion + Buzzer | Yes | Yes |
| WiFi | No | Yes |
| MQTT | No | No (uses HTTP/REST) |
| Remote control | No | Yes (long-poll HTTP) |
| FreeRTOS | No | Yes (6 tasks) |
| Dual PIR | No | Yes (pins 13 + 14) |

### Relay Logic
- **Active-LOW**: Relay pin goes LOW to activate (energize/ON), HIGH to deactivate (OFF)
- Backend irrigation route inverts: user click "START" with `pump: true, relay: "on"` → ESP32 receives `pump: false, relay: "off"` → relay pin goes LOW → pump turns ON
- `taskActuatorSafety` auto-off timer for safety (if `durationMs` was set)

### Frontend Pages & Routes
- `/login` — Login page
- `/dashboard` — Main dashboard (default redirect)
- `/probes` — Probe management
- `/probes/:probeId` — Probe detail
- `/irrigation` — Sprinkler/pump control
- `/security` — Security cameras
- `/voice-chatbot` or `/assistant` — AI voice assistant
- `/profile` — User profile

### PWA Support
- Service worker registration with auto-update
- `vite-plugin-pwa` with workbox runtime caching for API
- PWA install banner + update prompt
- Manifest with standalone display, icons

---

## Dependencies

### Frontend
React 18, MUI 5, Recharts, Framer Motion, react-router-dom, date-fns, react-query, react-grid-layout, react-webcam, html2canvas, jspdf, xlsx, @elevenlabs/client

### Backend
express, mongoose, cors, helmet, morgan, compression, dotenv, jsonwebtoken, bcryptjs, express-rate-limit, express-mongo-sanitize, zod, mqtt, winston

### ESP32
Arduino framework, ArduinoJson 7.x, PubSubClient (in lib_deps but not used in production firmware), WiFi.h, HTTPClient.h

---

## Deployment

### Docker Stack
```bash
docker-compose up -d --build
```
Starts: mongodb (27017), api (3001), web (80), mqtt (1883), redis (6379)

### ESP32 Flashing
```bash
cd esp-32-code
pio run -t upload
pio device monitor -b 115200
```

### Critical Configuration
- `FW_DEVICE_ID` in platformio.ini must match `Probe.uuid` in MongoDB
- `MQTT_HOST` must be the machine's LAN IP (not localhost) for ESP32 to reach
- WiFi SSID/password must match local network
- Device API key must match between firmware (`DEVICE_API_KEY`) and server env

---

This document contains the complete context of the FertoBot codebase including all key files: ESP32 firmware (both production and reference), backend (Express API routes, Mongoose models, MQTT service, command queue), frontend (React dashboard, sprinkler control, types, services), Docker stack, and configuration.
