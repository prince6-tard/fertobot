# FertoBot End-to-End Implementation Guide

This document is the single source of truth for the complete implementation of:

- ESP32 reference firmware in `final_merge.ino`
- ESP32 production firmware in `esp-32-code`
- Dockerized web + API + MQTT + DB stack
- End-to-end data flow (sensor to dashboard) and control flow (web to pump)

---

## Table of Contents

1. [Document Purpose](#document-purpose)
2. [Current System Status](#current-system-status)
3. [Architecture Overview](#architecture-overview)
4. [Repository Components](#repository-components)
5. [Firmware A: `final_merge.ino` (Reference Logic)](#firmware-a-final_mergeino-reference-logic)
6. [Firmware B: `esp-32-code` (FreeRTOS + MQTT)](#firmware-b-esp-32-code-freertos--mqtt)
7. [Critical Difference Between the Two Firmwares](#critical-difference-between-the-two-firmwares)
8. [Pin Map and Hardware Mapping](#pin-map-and-hardware-mapping)
9. [MQTT Topic Contract](#mqtt-topic-contract)
10. [Telemetry Payload Contract](#telemetry-payload-contract)
11. [Control Payload Contract (Pump ON/OFF)](#control-payload-contract-pump-onoff)
12. [Backend MQTT Bridge Implementation](#backend-mqtt-bridge-implementation)
13. [Irrigation API Implementation](#irrigation-api-implementation)
14. [Frontend Irrigation Control Implementation](#frontend-irrigation-control-implementation)
15. [Docker Compose Stack](#docker-compose-stack)
16. [Environment Configuration](#environment-configuration)
17. [Step-by-Step Local WiFi Bring-Up](#step-by-step-local-wifi-bring-up)
18. [Verification Checklist](#verification-checklist)
19. [Demo Script (What to Show)](#demo-script-what-to-show)
20. [Troubleshooting](#troubleshooting)
21. [Known Constraints](#known-constraints)
22. [Production Hardening Checklist](#production-hardening-checklist)
23. [Implementation File Index](#implementation-file-index)
24. [Acceptance Criteria](#acceptance-criteria)

---

## Document Purpose

You requested proper documentation for ESP32 firmware, `final_merge.ino`, and the Dockerized application in one place. This guide provides:

- Technical implementation details
- Operational runbook for local WiFi usage
- Verification and demo steps
- Constraints and hardening tasks

---

## Current System Status

Implemented and working in codebase:

1. Live dashboard rendering from backend API aggregation
2. MQTT telemetry ingest in backend and MongoDB persistence
3. Web irrigation control API publishes pump commands over MQTT
4. ESP32 FreeRTOS firmware receives command and toggles relay

Important status clarification:

- `final_merge.ino` now has automatic pump toggling disabled (manual-only behavior), but it does not include WiFi/MQTT control listener.
- Web app pump control requires flashing `esp-32-code/src/main.cpp`.

---

## Architecture Overview

### Data Path (Sensor to Dashboard)

1. ESP32 reads RS485 NPK + water + motion
2. ESP32 publishes telemetry to MQTT topic `fertobot/probes/<uuid>/sensor-data`
3. API MQTT service subscribes and stores readings into MongoDB
4. Dashboard endpoint aggregates probes, readings, alerts
5. Frontend fetches and displays live cards/charts/recommendations

### Control Path (Web to Pump)

1. User clicks Start Pump / Stop Pump in irrigation UI
2. Frontend sends `POST /api/irrigation/control`
3. API validates target probe and publishes MQTT control command
4. ESP32 receives command on `fertobot/probes/<uuid>/control`
5. ESP32 toggles relay pin 26

---

## Repository Components

### Firmware

- `final_merge.ino`: stable non-network baseline firmware
- `esp-32-code/src/main.cpp`: production FreeRTOS + MQTT firmware
- `esp-32-code/platformio.ini`: firmware build and compile-time parameters

### Backend

- `server/src/services/mqtt.service.ts`: MQTT subscribe/persist/publish bridge
- `server/src/routes/irrigation.routes.ts`: web command to MQTT control route
- `server/src/index.ts`: API bootstrap + MQTT service lifecycle

### Frontend

- `src/pages/SprinklerControl/SprinklerControl.tsx`: pump ON/OFF UI actions
- `src/pages/Dashboard/Dashboard.tsx`: live overview and recommendations
- `src/services/dashboardService.ts`: dashboard API normalization

### Infrastructure

- `docker-compose.yml`: MongoDB + API + web + MQTT + Redis

---

## Firmware A: `final_merge.ino` (Reference Logic)

Purpose:

- Hardware validation and deterministic single-loop execution

Core logic:

1. Reads NPK sensor over Modbus RTU (RS485)
2. Reads PIR motion and drives buzzer pulse
3. Reads water level analog and prints DRY/LOW/MEDIUM/HIGH
4. Pump auto-toggle logic has been removed, so it no longer self-toggles

Limitations:

- No WiFi stack
- No MQTT publish/subscribe
- Cannot receive web app control commands directly

---

## Firmware B: `esp-32-code` (FreeRTOS + MQTT)

Purpose:

- Production firmware for remote monitoring and control over local WiFi + MQTT

Key runtime tasks:

1. `taskNPK`: reads RS485 NPK every 3 seconds
2. `taskWater`: reads analog water level every second
3. `taskMotionBuzzer`: motion detection + buzzer pulse + motion event publish
4. `taskConnectivity`: WiFi reconnect + MQTT reconnect + MQTT loop
5. `taskTelemetry`: publishes telemetry every 5 seconds
6. `taskActuatorSafety`: auto-off relay timeout guard

Control handling:

- Subscribes to control topic
- Accepts relay and pump ON/OFF commands
- Applies optional timed auto-off via `durationMs`

---

## Critical Difference Between the Two Firmwares

| Capability | `final_merge.ino` | `esp-32-code/src/main.cpp` |
|---|---|---|
| Reads NPK sensor | Yes | Yes |
| Water level sensing | Yes | Yes |
| Motion + buzzer | Yes | Yes |
| WiFi connection | No | Yes |
| MQTT telemetry publish | No | Yes |
| MQTT control receive | No | Yes |
| Web app pump ON/OFF support | No | Yes |

If your goal is web control of pump, flash `esp-32-code` firmware.

---

## Pin Map and Hardware Mapping

| Function | ESP32 Pin |
|---|---|
| Relay / Pump control | 26 |
| RS485 RX | 16 |
| RS485 TX | 17 |
| RS485 DE/RE enable | 23 |
| PIR motion input | 13 |
| Buzzer output | 25 |
| Water level analog | 32 |

---

## MQTT Topic Contract

Base topic per probe:

- `fertobot/probes/<probeUuid>`

Published by ESP32:

- `fertobot/probes/<probeUuid>/sensor-data`
- `fertobot/probes/<probeUuid>/motion`
- `fertobot/probes/<probeUuid>/status`

Subscribed by ESP32:

- `fertobot/probes/<probeUuid>/control`

Critical mapping requirement:

- `FW_DEVICE_ID` in firmware must equal `Probe.uuid` in MongoDB.

---

## Telemetry Payload Contract

Primary telemetry fields currently published:

- `deviceId`
- `timestamp`
- `soilMoisture`
- `temperature`
- `humidity` (currently set to 0 unless separate humidity sensor is added)
- `pH`
- `conductivity`
- `nitrogen`
- `phosphorus`
- `potassium`
- `waterRaw`
- `waterLevel`
- `waterTankLevel`
- `batteryLevel`
- `signalStrength`
- `relayOn`
- `motionDetected`

Backend normalizations applied:

- `pH` and `ph` aliases accepted
- RSSI converts to 0..100 `signalStrength`
- water level text fallback maps to tank percentage
- battery and tank values clamped to schema range

---

## Control Payload Contract (Pump ON/OFF)

API route expects at least one target identifier:

- `probeId` or `probeUuid`

At least one control field is required:

- `relay`: `"on"` or `"off"`
- `pump`: `true` or `false`

Optional:

- `durationMs`
- `buzzerMs`

Examples:

```json
{ "probeUuid": "probe-001", "pump": true, "relay": "on" }
```

```json
{ "probeUuid": "probe-001", "pump": false, "relay": "off" }
```

```json
{ "probeUuid": "probe-001", "pump": true, "durationMs": 300000 }
```

---

## Backend MQTT Bridge Implementation

Main file:

- `server/src/services/mqtt.service.ts`

What it does:

1. Connects to MQTT broker (`MQTT_BROKER_URL`)
2. Subscribes to wildcard telemetry topics
3. Parses probe UUID from topic path
4. Writes `SensorReading` to MongoDB
5. Updates `Probe` status and latest reading reference
6. Exposes `publishProbeControl` for irrigation API

Startup lifecycle:

- Started from `server/src/index.ts` when API starts
- Stopped cleanly on SIGTERM/SIGINT

---

## Irrigation API Implementation

Main file:

- `server/src/routes/irrigation.routes.ts`

Route:

- `POST /api/irrigation/control`

Behavior:

1. Validates request body
2. Resolves probe by id or uuid
3. Optionally validates ownership if authenticated user exists
4. Publishes command payload to MQTT control topic
5. Returns command echo in response data for traceability

---

## Frontend Irrigation Control Implementation

Main file:

- `src/pages/SprinklerControl/SprinklerControl.tsx`

Behavior:

1. Loads probe zones from dashboard overview endpoint
2. Sends control request on Start/Stop button click
3. Shows success/error banners from API response

Control requests sent from UI:

- Start pump sends `pump: true` and `relay: "on"`
- Stop pump sends `pump: false` and `relay: "off"`

---

## Docker Compose Stack

Defined in `docker-compose.yml`.

Services:

1. `mongodb`
2. `api`
3. `web`
4. `mqtt`
5. `redis`

Network:

- `fertobot-network`

Persistence volumes:

- Mongo data and config
- MQTT data and logs
- Redis data
- API logs

---

## Environment Configuration

### Backend env

From `.env` or compose environment:

- `NODE_ENV`
- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `MQTT_BROKER_URL`
- `MQTT_USERNAME`
- `MQTT_PASSWORD`

### Frontend env

- `VITE_API_URL`

### Firmware compile flags

In `esp-32-code/platformio.ini`:

- `FW_DEVICE_ID`
- `WIFI_SSID`
- `WIFI_PASSWORD`
- `MQTT_HOST`
- `MQTT_PORT`
- `MQTT_USER`
- `MQTT_PASSWORD`

---

## Step-by-Step Local WiFi Bring-Up

### 1. Set firmware network values

Edit `esp-32-code/platformio.ini` build flags:

- set WiFi SSID and password for your local router
- set `MQTT_HOST` to your machine LAN IP or broker host IP
- set `FW_DEVICE_ID` to match probe UUID in DB

### 2. Start Docker stack

From project root:

```bash
docker-compose up -d --build
```

### 3. Flash ESP32 production firmware

From `esp-32-code`:

```bash
pio run -t upload
pio device monitor -b 115200
```

### 4. Ensure probe mapping exists

In MongoDB `Probe` collection:

- `uuid` must exactly match firmware `FW_DEVICE_ID`

### 5. Open web app and verify live data

- Dashboard should show recent telemetry-driven values

### 6. Test pump control

- Open irrigation page
- Click Start Pump
- Confirm relay toggles on hardware
- Click Stop Pump
- Confirm relay toggles off

---

## Verification Checklist

Firmware:

- WiFi connected in serial output
- MQTT connected in serial output
- Sensor telemetry published periodically
- Control command callback triggered

Backend:

- API health endpoint returns OK
- Logs show MQTT connected + subscriptions active
- Sensor readings are inserted into Mongo
- Probe status transitions to online

Frontend:

- Dashboard reflects live values
- Recommendations appear from live thresholds
- Irrigation Start/Stop returns success without errors

---

## Demo Script (What to Show)

1. Show ESP32 serial monitor with telemetry lines.
2. Show backend logs receiving MQTT and persisting data.
3. Show dashboard cards/charts updating with real values.
4. Click Start Pump from web UI and show relay activation.
5. Click Stop Pump from web UI and show relay deactivation.
6. Show corresponding API response payload and/or MQTT traffic.

---

## Troubleshooting

### Dashboard has no live data

Checks:

1. Verify ESP32 is running `esp-32-code` firmware
2. Verify MQTT broker connectivity from ESP32 and API
3. Verify `FW_DEVICE_ID == Probe.uuid`
4. Check backend logs for telemetry parse/persist errors

### Start/Stop buttons do not affect pump

Checks:

1. Verify irrigation API returns success
2. Verify control payload reaches topic `.../control`
3. Verify ESP32 subscribed to that exact topic
4. Verify relay wiring and active-high/active-low behavior

### MQTT connected but no writes in Mongo

Checks:

1. Confirm payload schema fields are numeric where required
2. Confirm probe exists and is active
3. Confirm API has MongoDB connectivity and write permissions

---

## Known Constraints

1. `final_merge.ino` is not network-controlled firmware.
2. Irrigation endpoint is currently mounted without mandatory auth middleware for easier showcase flow.
3. Some irrigation UI copy remains partially static and can be further normalized.
4. Humidity is currently not sourced from dedicated hardware sensor.

---

## Production Hardening Checklist

1. Re-enable strict auth for irrigation control route.
2. Enforce MQTT TLS and per-device credentials.
3. Apply topic ACLs: each device can only access its own namespace.
4. Add command acknowledgment topic and UI confirmation state.
5. Replace placeholder secrets and rotate credentials.
6. Add alerting for stale telemetry and offline probes.

---

## Implementation File Index

Firmware baseline:

- `final_merge.ino`

Firmware production:

- `esp-32-code/platformio.ini`
- `esp-32-code/src/main.cpp`

Backend:

- `server/src/index.ts`
- `server/src/services/mqtt.service.ts`
- `server/src/routes/irrigation.routes.ts`

Frontend:

- `src/pages/Dashboard/Dashboard.tsx`
- `src/services/dashboardService.ts`
- `src/pages/SprinklerControl/SprinklerControl.tsx`

Infra:

- `docker-compose.yml`

---

## Acceptance Criteria

Implementation is accepted when all are true:

1. ESP32 publishes telemetry over local WiFi to MQTT.
2. Backend receives and stores telemetry in MongoDB.
3. Dashboard shows live readings and recommendation changes.
4. Web app Start/Stop pump actions publish MQTT control command.
5. ESP32 receives control command and toggles relay reliably.
6. Entire stack runs from Docker Compose with healthy services.
