# Local WiFi Validation & Deployment Guide

This document provides step-by-step instructions for bringing up the FertoBot system on your local WiFi network and validating the complete end-to-end flow from ESP32 sensor → MQTT → Backend → Database → Frontend visualization and control.

---

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] ESP32 board connected via USB to your development machine
- [ ] PlatformIO CLI installed (`pio` command available)
- [ ] Docker and Docker Compose installed (`docker-compose` command available)
- [ ] Local WiFi network credentials (SSID and password)
- [ ] Machine IP address on local network (run `ifconfig` or `ipconfig`)
- [ ] Project folder correct
- [ ] At least one Probe record in MongoDB with `uuid` field defined

---

## Step 1: Determine Your Network Configuration

### 1.1 Get Your Machine's LAN IP

This is the IP address that ESP32 and Docker services will use to communicate.

**On Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```
Look for output like: `inet 192.168.1.50 netmask 0xffffff00`

**On macOS:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**On Windows (PowerShell):**
```powershell
ipconfig | findstr /v 127.0.0.1
```

Example: If your output shows `192.168.1.50`, use that as `MQTT_HOST`.

### 1.2 Verify WiFi Network Details

- WiFi SSID (network name): `lol123` (already configured)
- WiFi Password: `11111111` (already configured)
- Your router's gateway IP (usually 192.168.1.1 or 10.0.0.1)

### 1.3 Validate Probe UUID in Database

You need at least one Probe record in MongoDB with a matching UUID. This is critical.

**Connect to MongoDB:**
```bash
docker exec -it fert_mongodb_1 mongosh
```

**In the MongoDB shell:**
```javascript
use fert
db.Probe.findOne({})
```

Output should show a document like:
```json
{
  "_id": "...",
  "uuid": "probe-001",
  "userId": "...",
  "name": "Main Field",
  "status": "offline",
  "lastReading": null,
  ...
}
```

**Record the `uuid` value** — this must match `FW_DEVICE_ID` in firmware.

If no probes exist, create one:
```javascript
db.Probe.insertOne({
  uuid: "probe-001",
  userId: "user-001",
  name: "Test Probe",
  status: "offline",
  lastReading: null,
  battery: 85,
  wifi: 70,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

---

## Step 2: Configure Firmware Network Parameters

### 2.1 Update ESP32 Firmware Configuration

Edit `esp-32-code/platformio.ini` and update the build flags:

```ini
build_flags =
  -DCORE_DEBUG_LEVEL=3
  -DFW_DEVICE_ID=\"probe-001\"
  -DWIFI_SSID=\"lol123\"
  -DWIFI_PASSWORD=\"11111111\"
  -DMQTT_HOST=\"192.168.1.50\"
  -DMQTT_PORT=1883
  -DMQTT_USER=\"\"
  -DMQTT_PASSWORD=\"\"
```

**Critical updates:**
- Replace `192.168.1.50` with your actual machine LAN IP from Step 1.1
- Replace `probe-001` with your actual Probe UUID from Step 1.3
- Keep WiFi SSID and password as configured (they already match your network)

### 2.2 Verify MQTT Host is Reachable

Your machine will run the MQTT broker inside Docker. Test network connectivity:

**From your machine, confirm the IP is bound to a real interface (not localhost):**
```bash
ifconfig | grep "inet 192.168"
```

**Note:** Do NOT use `127.0.0.1` or `localhost` as MQTT_HOST if using Docker — use your actual LAN IP so the ESP32 can reach it remotely.

---

## Step 3: Start the Docker Stack

### 3.1 Build and Launch Services

From project root directory:

```bash
cd /home/anubhavtripathi/Documents/Projects/fert
docker-compose up -d --build
```

This command:
- Builds the frontend and backend images
- Pulls MongoDB and MQTT broker images
- Starts all 5 services in the background: `mongodb`, `api`, `web`, `mqtt`, `redis`
- Applies health checks

### 3.2 Verify Services Are Running

```bash
docker-compose ps
```

Expected output — all services with status `Up`:
```
NAME                    STATUS
fert_mongodb_1          Up (healthy)
fert_api_1              Up (healthy)
fert_web_1              Up (healthy)
fert_mqtt_1             Up (healthy)
fert_redis_1            Up (healthy)
```

If any service is `Exited` or `Unhealthy`, check logs:
```bash
docker-compose logs api
docker-compose logs mqtt
```

### 3.3 Open the Web Dashboard

Open your browser to:
```
http://localhost:80
```

or

```
http://192.168.1.50:80
```

You should see the FertoBot dashboard. It will be empty until ESP32 publishes data.

---

## Step 4: Flash ESP32 with Production Firmware

### 4.1 Connect ESP32 via USB

Plug your ESP32 board into your development machine via USB cable.

### 4.2 Verify USB Port Detection

**On Linux:**
```bash
ls -la /dev/ttyUSB* /dev/ttyACM*
```

You should see something like `/dev/ttyUSB0` or `/dev/ttyACM0`.

**On macOS:**
```bash
ls -la /dev/tty.usbserial* /dev/tty.usbmodem*
```

### 4.3 Build and Upload Firmware

Navigate to the firmware directory:

```bash
cd /home/anubhavtripathi/Documents/Projects/fert/esp-32-code
```

Build and upload to ESP32:

```bash
pio run -t upload
```

**Expected output:**
```
RAM:   [======    ]  42.5% (used 139352 bytes from 328192 bytes)
Flash: [======    ]  38.2% (used 998912 bytes from 2621440 bytes)
esptool.py v4.4
Serial port: /dev/ttyUSB0
Chip is ESP32
```

Wait for completion message:
```
Leaving... Hard resetting via RTS pin...
```

### 4.4 Monitor Serial Output

Keep the ESP32 connected and open the serial monitor:

```bash
pio device monitor -b 115200
```

Watch for these key lines (over next 10-15 seconds):

**Expected output sequence:**
```
[I] (100) WiFi: Connecting to SSID: lol123
[I] (2500) WiFi: WiFi connected! IP: 192.168.1.120
[I] (3000) MQTT: Connecting to 192.168.1.50:1883
[I] (3500) MQTT: Connected to MQTT broker
[I] (4000) TaskTelemetry: Publishing sensor data...
{
  "deviceId": "probe-001",
  "timestamp": 1712670123456,
  "soilMoisture": 65.2,
  "temperature": 24.5,
  "pH": 6.8,
  "nitrogen": 120,
  "phosphorus": 45,
  "potassium": 200,
  "waterLevel": "MEDIUM",
  "batteryLevel": 85,
  "signalStrength": -65
}
```

**Troubleshooting serial output:**
- If no output, press the reset button on ESP32
- If WiFi fails, double-check SSID and password in platformio.ini
- If MQTT connection fails, verify machine LAN IP is correct in MQTT_HOST

Keep this terminal open for the rest of validation.

---

## Step 5: Validate Backend Data Ingestion

### 5.1 Check Backend Logs

In a new terminal:

```bash
docker-compose logs -f api
```

Watch for these signs of successful telemetry:
```
[MQTT] Connected to broker
[MQTT] Subscribed to: fertobot/probes/+/sensor-data
[MQTT] Subscribed to: fertobot/probes/+/motion
[MQTT] Telemetry received from probe-001
[DB] Persistent SensorReading: { probeId: "...", soilMoisture: 65.2, ... }
[DB] Updated Probe status to online
```

### 5.2 Verify MongoDB Persistence

In a new terminal, connect to MongoDB and check recent readings:

```bash
docker exec -it fert_mongodb_1 mongosh
```

In the MongoDB shell:

```javascript
use fert

// Check if readings are being stored
db.SensorReading.find({}).sort({timestamp: -1}).limit(5)
```

Expected output — documents with recent timestamps and sensor values:
```json
{
  "_id": "...",
  "probeId": "...",
  "soilMoisture": 65.2,
  "temperature": 24.5,
  "pH": 6.8,
  "nitrogen": 120,
  "phosphorus": 45,
  "potassium": 200,
  "waterLevel": "MEDIUM",
  "batteryLevel": 85,
  "signalStrength": 70,
  "timestamp": 2024-04-09T14:02:03.456Z
}
```

Also verify Probe status updated to online:

```javascript
db.Probe.findOne({uuid: "probe-001"})
```

Should show `"status": "online"` and recent `lastReading` timestamp.

---

## Step 6: Validate Frontend Dashboard

### 6.1 Refresh and Inspect

Go to your browser and reload the dashboard:

```
http://localhost/
```

### 6.2 Look for Live Data

You should see:

- **Summary Cards** in the top section:
  - Soil Moisture: 65.2%
  - Temperature: 24.5°C
  - pH: 6.8
  - Nitrogen/Phosphorus/Potassium levels
  - Battery Level: 85%
  - Signal Strength: 70%

- **Live Charts** (if chart library is enabled):
  - Time-series plots of temperature, pH, moisture over the last hour

- **Recommendations Panel**:
  - Automated insights based on sensor thresholds (e.g., "Low nitrogen detected")

- **Alerts Panel**:
  - Any triggered alerts (e.g., "Battery low" if < 20%)

If dashboard is empty:
- Check backend logs for parsing errors: `docker-compose logs api | grep -i error`
- Verify probe UUID in DB matches firmware FW_DEVICE_ID
- Wait 30 seconds for first telemetry to transmit and process

---

## Step 7: Test Water Pump Control (End-to-End)

### 7.1 Open Irrigation Control Page

Navigate to the Sprinkler Control page in your web app:

```
http://localhost/sprinkler-control
```

or via the left sidebar menu.

### 7.2 Validate Zone Loading

The page should display available zones/probes. If you have created the "probe-001" Probe record, it should show in the list.

### 7.3 Send Start Pump Command

Click the **Start Pump** button for your zone.

**Watch three terminals concurrently:**

**Terminal 1 (ESP32 Serial Monitor):**
Expect output:
```
[I] MQTT Callback: Received control command on fertobot/probes/probe-001/control
[I] Command: pump=true, relay=on
[I] Relay GPIO 26: HIGH
[I] Pump started (timed auto-off in 300000ms)
```

**Terminal 2 (Backend Logs):**
Expect output:
```
[MQTT] Publishing control: {probeUuid: "probe-001", pump: true, relay: "on", durationMs: 300000}
[Control] Relay activated for probe-001
```

**Terminal 3 (Web Browser):**
Expect feedback alert:
```
✓ Pump started for probe-001 (pump: true, relay: on)
```

### 7.4 Verify Hardware

If your relay is wired and connected:
- You should hear/see the relay click ON
- Water should start flowing (if pump is connected)
- Measure continuity on relay pins if uncertain

### 7.5 Send Stop Pump Command

Click the **Stop Pump** button.

**Watch the same three terminals:**

**ESP32 Serial:**
```
[I] MQTT Callback: Received control command on fertobot/probes/probe-001/control
[I] Command: pump=false, relay=off
[I] Relay GPIO 26: LOW
[I] Pump stopped
```

**Backend:**
```
[Control] Relay deactivated for probe-001
```

**Browser:**
```
✓ Pump stopped for probe-001 (pump: false, relay: off)
```

**Hardware:** Relay clicks OFF, water stops.

---

## Step 8: Full Validation Checklist

### Data Path (Sensor → Dashboard)

- [ ] ESP32 connects to WiFi (serial monitor shows IP)
- [ ] ESP32 connects to MQTT broker (serial monitor shows "Connected")
- [ ] ESP32 publishes telemetry every 5 seconds (serial monitor shows JSON payloads)
- [ ] Backend receives telemetry (docker logs shows "Telemetry received")
- [ ] MongoDB stores SensorReading documents (mongosh query returns results)
- [ ] Probe status updates to "online" (mongosh query shows online status)
- [ ] Dashboard refreshes and displays live values (all cards populated)
- [ ] Charts update with historical data (if chart UI is enabled)

### Control Path (Web → Pump)

- [ ] Start Pump button sends POST request to /api/irrigation/control
- [ ] API validates probe and publishes MQTT command (backend logs show publish)
- [ ] ESP32 receives control command (serial monitor shows callback message)
- [ ] Relay GPIO activates (hardware relay clicks or you measure voltage)
- [ ] Stop Pump button deactivates relay (relay clicks OFF or voltage drops)
- [ ] Web UI shows success alerts (green banner appears)
- [ ] Control payload includes correct probe UUID (inspect browser network tab)

### System Health

- [ ] All Docker services are healthy: `docker-compose ps` shows "Up (healthy)"
- [ ] No error messages in backend logs: `docker-compose logs api | grep -i error` is empty
- [ ] No MQTT connection drops (serial monitor has no "Connection lost" messages)
- [ ] Database has no write errors (backend logs show clean persistence)

---

## Step 9: Demo Script

If you're showcasing to stakeholders, follow this sequence:

### Setup (5 min before demo)

1. Ensure Docker stack is running and healthy
2. Ensure ESP32 is flashed and connected to WiFi
3. Wait for first 2-3 telemetry cycles (10 seconds)
4. Open dashboard and refresh to show live data
5. Have serial monitor and backend logs visible side-by-side

### Demo Flow (10 minutes)

1. **Show Real-Time Sensor Data (2 min)**
   - Display ESP32 serial monitor showing incoming sensor JSON payloads
   - Show dashboard cards with live values matching serial output
   - Point out soil moisture, temperature, NPK levels
   - Explain: "This data updates every 5 seconds over WiFi + MQTT"

2. **Show Backend Data Pipeline (2 min)**
   - Open backend logs: `docker-compose logs -f api`
   - Trigger a sensor publish by waiting for next cycle
   - Show backend receiving, parsing, and persisting telemetry
   - Explain: "This is automatic normalization and database write"

3. **Show Historical Data (2 min)**
   - Switch to Dashboard view showing charts
   - Explain how recommendations are generated from thresholds
   - Point out alerts triggered by low/high values

4. **Show Pump Control (4 min)**
   - Have two windows open: irrigation control page + ESP32 serial
   - Click **Start Pump**
   - Show relay activation in serial output
   - If real pump: demonstrate actual water flow
   - Wait 2 seconds, then click **Stop Pump**
   - Show relay deactivation
   - Emphasize: "Complete control from web app over local WiFi"

### Expected Demo Outcomes

- Audience sees real sensor data flowing live
- Audience sees remote pump control working on command
- Audience understands IoT architecture: device → cloud bridge → UI control loop

---

## Troubleshooting Reference

### Issue: Dashboard is Empty

**Checks:**
1. Verify ESP32 is running and connected to WiFi (check serial monitor)
2. Verify Probe UUID in database matches firmware FW_DEVICE_ID
3. Check backend logs for parse/persist errors: `docker-compose logs api | grep -i error`
4. Verify MQTT broker is running: `docker-compose logs mqtt | head -20`
5. Check MongoDB connectivity: `docker-compose logs api | grep -i "mongo\|database"`

**Common fixes:**
- Restart Docker stack: `docker-compose restart`
- Reflash ESP32 firmware: `cd esp-32-code && pio run -t upload`
- Wait 60 seconds after ESP32 boots for first telemetry cycle

### Issue: Pump Control Not Working

**Checks:**
1. Verify irrigation API is returning success responses (check browser network tab)
2. Verify ESP32 receives control callback (check serial monitor for "MQTT Callback")
3. Verify relay wiring on ESP32 pin 26
4. Check backend logs for control publish errors: `docker-compose logs api | grep -i "control\|relay"`

**Common fixes:**
- Double-check probe UUID in control request matches database record
- Ensure MQTT broker is connected (backend logs should show subscriptions)
- Test relay with manual GPIO toggle to verify pin works
- Verify relay is active-HIGH (assumes pull-down to ground)

### Issue: MQTT Connection Fails

**Checks:**
1. Verify MQTT_HOST in firmware is your machine's LAN IP (not localhost)
2. Verify machine firewall allows port 1883 (MQTT default)
3. Verify Docker MQTT service is running: `docker-compose ps mqtt`
4. Test network connectivity: `ping <MQTT_HOST>` from another device (or on same machine)

**Common fixes:**
- Update platformio.ini with correct MQTT_HOST and rebuild firmware
- Allow port 1883 through firewall: `sudo ufw allow 1883`
- Restart MQTT container: `docker-compose restart mqtt`
- Check MQTT logs: `docker-compose logs mqtt`

### Issue: ESP32 Can't Connect to WiFi

**Checks:**
1. Verify SSID and password in platformio.ini match your network
2. Verify 2.4 GHz WiFi (most ESP32s don't support 5 GHz)
3. Check serial monitor for specific WiFi error codes
4. Test WiFi with another device to confirm network is healthy

**Common fixes:**
- Recheck WIFI_SSID and WIFI_PASSWORD spelling and special characters
- Recompile firmware with corrected credentials
- Restart your WiFi router
- Try moving ESP32 closer to router to rule out signal issues

### Issue: Backend Doesn't Persist Data

**Checks:**
1. Verify MongoDB is running: `docker-compose ps mongodb`
2. Verify backend can connect to MongoDB: `docker-compose logs api | grep -i "mongo"`
3. Verify Probe record exists in database with exact UUID match
4. Check for permission or write errors in backend logs

**Common fixes:**
- Ensure Probe.uuid exactly matches firmware FW_DEVICE_ID (case-sensitive)
- Restart MongoDB: `docker-compose restart mongodb`
- Check MongoDB disk space: `docker exec fert_mongodb_1 df -h`
- Drop and recreate database collection if corrupted

---

## Quick Reference: Critical Configuration Values

| Parameter | Location | Example Value | Must Match |
|-----------|----------|---------------|-----------|
| FW_DEVICE_ID | `esp-32-code/platformio.ini` | `probe-001` | `Probe.uuid` in MongoDB |
| MQTT_HOST | `esp-32-code/platformio.ini` | `192.168.1.50` | Your machine LAN IP |
| WIFI_SSID | `esp-32-code/platformio.ini` | `lol123` | Your actual WiFi network name |
| WIFI_PASSWORD | `esp-32-code/platformio.ini` | `11111111` | Your WiFi password |
| MQTT_BROKER_URL | `server/.env` or docker-compose | `mqtt://mqtt:1883` | Docker service name or IP |

---

## Next Steps After Validation

Once all checks pass:

1. **Document Your Configuration:**
   - Save a copy of your platformio.ini settings
   - Record the Probe UUID and machine LAN IP for future reference

2. **Test in Real Conditions:**
   - Move ESP32 to actual field location
   - Monitor signal strength as you change distance/obstacles
   - Test pump control from different WiFi zones

3. **Implement Production Hardening:**
   - Enable TLS on MQTT broker (mosquitto.conf)
   - Move JWT_SECRET to secrets file
   - Restrict irrigation API to authenticated users
   - Add command acknowledgment topic for UI state tracking

4. **Deploy to Public Cloud (Optional):**
   - Set up cloud MQTT broker (AWS IoT Core, Azure IoT Hub, or HiveMQ Cloud)
   - Update endpoint configuration in firmware and backend
   - Re-validate complete flow with cloud broker

---

## Support & Questions

If validation fails at any step:

1. **Check this guide's troubleshooting section** (Step 9)
2. **Review logs** in the order: ESP32 serial → backend docker logs → MongoDB mongosh
3. **Verify critical config matches** using the Quick Reference table
4. **Check FINAL_IMPLEMENTATION.md** for detailed architecture and payload schemas

---

**Last Updated:** April 9, 2026  
**System Status:** Ready for local WiFi validation
