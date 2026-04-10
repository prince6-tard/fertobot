/* =========================================================
   FertoBot ESP32 — WiFi + HTTP Data Uploader  (v2 — merged)
   Changes from v1:
     • FreeRTOS multi-task architecture (6 tasks, same as MQTT build)
     • Mutex-protected DeviceState struct (g_stateMutex / g_rs485Mutex)
     • Relay auto-off safety timer (taskActuatorSafety)
     • Buzzer timer handled in dedicated task (taskMotionBuzzer)
     • Build-time FW_DEVICE_ID / PROBE_UUID via compiler defines
     • Continuous WiFi reconnect task (taskConnectivity)
     • RS485 bus guard uses semaphore instead of volatile bool
     • Telemetry payload includes relayOn + motionDetected fields
     • HTTP command polling (GET /api/device/command) for relay/buzzer control
   ========================================================= */

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

/* =========================================================
   -------------------- BUILD-TIME DEFINES -----------------
   Override via -D flags in platformio.ini or build_flags.
   ========================================================= */
#ifndef FW_DEVICE_ID
#define FW_DEVICE_ID "FBOT-1001"
#endif

#ifndef WIFI_SSID
#define WIFI_SSID "Hackathon-2025"
#endif

#ifndef WIFI_PASSWORD
#define WIFI_PASSWORD "20252025"
#endif

#ifndef SERVER_BASE_URL
#define SERVER_BASE_URL "https://fertobot-production.up.railway.app"
#endif

#ifndef DEVICE_API_KEY
#define DEVICE_API_KEY "fertobot-esp32-key-2024"
#endif

/* =========================================================
   -------------------- PIN DEFINITIONS --------------------
   ========================================================= */
#define RELAY_CONTROL 26
#define RXD2          16
#define TXD2          17
#define RS485_EN      23
#define PIR_PIN       13
#define BUZZER_PIN    25
#define WATER_PIN     32

HardwareSerial RS485(2);

/* =========================================================
   -------------------- FREERTOS PRIMITIVES ----------------
   ========================================================= */
SemaphoreHandle_t g_stateMutex  = nullptr;
SemaphoreHandle_t g_rs485Mutex  = nullptr;

/* =========================================================
   -------------------- SENSOR / DEVICE STATE --------------
   ========================================================= */
struct NPK_Data {
  float    temperature;
  float    moisture;
  float    ph;
  uint16_t conductivity;
  uint16_t nitrogen;
  uint16_t phosphorus;
  uint16_t potassium;
};

struct DeviceState {
  NPK_Data    npk;
  int         waterRaw;
  const char *waterLevel;
  bool        motionDetected;
  bool        relayOn;
  bool        buzzerOn;
  uint32_t    lastNpkMs;
  uint32_t    lastWaterMs;
  uint32_t    lastMotionMs;
  int8_t      wifiRssi;
};

DeviceState g_state = {
  {0, 0, 0, 0, 0, 0, 0},
  0, "UNKNOWN",
  false, false, false,
  0, 0, 0,
  -127
};

/* Actuator timers (checked in taskActuatorSafety) */
volatile uint32_t g_relayAutoOffTime = 0;
volatile bool     g_buzzerOn         = false;
volatile uint32_t g_buzzerOffTime    = 0;

/* =========================================================
   -------------------- UTILITIES --------------------------
   ========================================================= */
uint16_t modbusCRC(uint8_t *buf, uint16_t len) {
  uint16_t crc = 0xFFFF;
  for (uint16_t pos = 0; pos < len; pos++) {
    crc ^= (uint16_t)buf[pos];
    for (int i = 0; i < 8; i++) {
      if (crc & 0x0001) { crc >>= 1; crc ^= 0xA001; }
      else               { crc >>= 1; }
    }
  }
  return crc;
}

const char *waterLevelFromRaw(int raw) {
  if (raw < 400)  return "DRY";
  if (raw < 1200) return "LOW";
  if (raw < 2500) return "MEDIUM";
  return "HIGH";
}

int waterLevelToPercent(const char *level) {
  if (strcmp(level, "HIGH")   == 0) return 100;
  if (strcmp(level, "MEDIUM") == 0) return 65;
  if (strcmp(level, "LOW")    == 0) return 30;
  return 5;
}

/* =========================================================
   -------------------- RS485 / MODBUS / NPK ---------------
   ========================================================= */
void sendReadRequest(uint8_t slaveID, uint16_t startAddr, uint16_t quantity) {
  uint8_t frame[8];
  frame[0] = slaveID;
  frame[1] = 0x03;
  frame[2] = highByte(startAddr);
  frame[3] = lowByte(startAddr);
  frame[4] = highByte(quantity);
  frame[5] = lowByte(quantity);
  uint16_t crc = modbusCRC(frame, 6);
  frame[6] = crc & 0xFF;
  frame[7] = crc >> 8;

  digitalWrite(RS485_EN, HIGH);
  delayMicroseconds(100);
  RS485.write(frame, 8);
  RS485.flush();
  delayMicroseconds(200);
  digitalWrite(RS485_EN, LOW);
}

bool decodeNPKFrame(uint8_t *rx, uint16_t len, uint16_t startReg, NPK_Data &data) {
  if (len < 7 || rx[1] != 0x03) return false;
  uint8_t byteCount = rx[2];
  if (byteCount + 5 != len) return false;
  uint8_t *payload  = &rx[3];
  uint8_t  regCount = byteCount / 2;

  for (uint8_t i = 0; i < regCount; i++) {
    uint16_t value = (payload[i * 2] << 8) | payload[i * 2 + 1];
    switch (startReg + i) {
      case 0x0000: data.temperature  = value / 10.0f;  break;
      case 0x0001: data.moisture     = value / 10.0f;  break;
      case 0x0002: data.conductivity = value;           break;
      case 0x0003: data.ph           = value / 100.0f; break;
      case 0x0004: data.nitrogen     = value;           break;
      case 0x0005: data.phosphorus   = value;           break;
      case 0x0006: data.potassium    = value;           break;
      default: break;
    }
  }
  return true;
}

bool readNPKSensor(NPK_Data &sensor) {
  /* --- acquire RS485 bus semaphore (was: volatile bool rs485Busy) --- */
  if (xSemaphoreTake(g_rs485Mutex, pdMS_TO_TICKS(1500)) != pdTRUE) {
    Serial.println("RS485 lock timeout");
    return false;
  }

  uint8_t  rxBuf[64] = {0};
  uint16_t rxLen     = 0;

  sendReadRequest(2, 0x0000, 7);

  uint32_t start = millis();
  while (millis() - start < 1000) {
    while (RS485.available()) {
      if (rxLen < sizeof(rxBuf)) rxBuf[rxLen++] = RS485.read();
      else RS485.read();
    }
    vTaskDelay(pdMS_TO_TICKS(2));
  }

  xSemaphoreGive(g_rs485Mutex);

  if (rxLen == 0) { Serial.println("No response from NPK sensor"); return false; }

  uint16_t crcRx   = rxBuf[rxLen - 2] | (rxBuf[rxLen - 1] << 8);
  uint16_t crcCalc = modbusCRC(rxBuf, rxLen - 2);
  if (crcRx != crcCalc) { Serial.println("CRC ERROR"); return false; }

  if (!decodeNPKFrame(rxBuf, rxLen, 0x0000, sensor)) {
    Serial.println("Invalid Modbus payload");
    return false;
  }
  return true;
}

/* =========================================================
   -------------------- WIFI -------------------------------
   ========================================================= */
void ensureWifiConnected() {
  if (WiFi.status() == WL_CONNECTED) return;

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  uint32_t start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 12000) {
    vTaskDelay(pdMS_TO_TICKS(300));
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("WiFi connected. IP: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("WiFi connect timeout");
  }
}

/* =========================================================
   -------------------- HTTP HELPERS -----------------------
   ========================================================= */

/* POST sensor reading to /api/device/reading */
void uploadReading() {
  if (WiFi.status() != WL_CONNECTED) return;

  DeviceState snapshot;
  if (xSemaphoreTake(g_stateMutex, pdMS_TO_TICKS(100)) != pdTRUE) return;
  snapshot = g_state;
  xSemaphoreGive(g_stateMutex);

  int signalPct = constrain(map(snapshot.wifiRssi, -100, -30, 0, 100), 0, 100);

  StaticJsonDocument<512> doc;
  doc["probeUuid"]      = FW_DEVICE_ID;
  doc["soilMoisture"]   = snapshot.npk.moisture;
  doc["temperature"]    = snapshot.npk.temperature;
  doc["humidity"]       = 0;           /* add DHT22 here if available */
  doc["pH"]             = snapshot.npk.ph;
  doc["conductivity"]   = snapshot.npk.conductivity;
  doc["nitrogen"]       = snapshot.npk.nitrogen;
  doc["phosphorus"]     = snapshot.npk.phosphorus;
  doc["potassium"]      = snapshot.npk.potassium;
  doc["waterRaw"]       = snapshot.waterRaw;
  doc["waterLevel"]     = snapshot.waterLevel;
  doc["waterTankLevel"] = waterLevelToPercent(snapshot.waterLevel);
  doc["batteryLevel"]   = 100;         /* TODO: real ADC reading */
  doc["signalStrength"] = signalPct;
  doc["relayOn"]        = snapshot.relayOn;       /* NEW — from MQTT version */
  doc["motionDetected"] = snapshot.motionDetected; /* NEW — from MQTT version */

  String body;
  serializeJson(doc, body);

  HTTPClient http;
  http.begin(String(SERVER_BASE_URL) + "/api/device/reading");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", DEVICE_API_KEY);
  http.setTimeout(10000);

  int code = http.POST(body);
  if (code == 201) {
    Serial.println("Upload OK");
  } else {
    Serial.printf("Upload failed: HTTP %d\n", code);
    Serial.println(http.getString());
  }
  http.end();
}

/*
 * NEW — poll the backend for pending commands.
 * Replaces the MQTT inbound control channel with a simple HTTP GET.
 * The server should return 200 with a JSON body (or 204 if no command):
 *   { "relay": "on"|"off", "pump": true|false,
 *     "durationMs": 5000, "buzzerMs": 1000 }
 */
void pollCommands() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(String(SERVER_BASE_URL) + "/api/device/command?probeUuid=" + FW_DEVICE_ID);
  http.addHeader("x-api-key", DEVICE_API_KEY);
  http.setTimeout(8000);

  int code = http.GET();
  if (code == 200) {
    String payload = http.getString();
    StaticJsonDocument<256> doc;
    if (deserializeJson(doc, payload) == DeserializationError::Ok) {
      /* ---- relay / pump ---- */
      if (doc["relay"].is<const char *>()) {
        bool on = strcasecmp(doc["relay"].as<const char *>(), "on") == 0;
        digitalWrite(RELAY_CONTROL, on ? HIGH : LOW);
        if (xSemaphoreTake(g_stateMutex, pdMS_TO_TICKS(50)) == pdTRUE) {
          g_state.relayOn = on;
          xSemaphoreGive(g_stateMutex);
        }
      }
      if (doc["pump"].is<bool>()) {
        bool on = doc["pump"].as<bool>();
        digitalWrite(RELAY_CONTROL, on ? HIGH : LOW);
        if (xSemaphoreTake(g_stateMutex, pdMS_TO_TICKS(50)) == pdTRUE) {
          g_state.relayOn = on;
          xSemaphoreGive(g_stateMutex);
        }
      }
      /* ---- auto-off timer (from MQTT version) ---- */
      if (doc["durationMs"].is<uint32_t>()) {
        uint32_t dur = doc["durationMs"].as<uint32_t>();
        if (dur > 0) g_relayAutoOffTime = millis() + dur;
      }
      /* ---- buzzer (from MQTT version) ---- */
      if (doc["buzzerMs"].is<uint32_t>()) {
        uint32_t bms = doc["buzzerMs"].as<uint32_t>();
        if (bms > 0) {
          digitalWrite(BUZZER_PIN, HIGH);
          g_buzzerOn      = true;
          g_buzzerOffTime = millis() + bms;
          if (xSemaphoreTake(g_stateMutex, pdMS_TO_TICKS(50)) == pdTRUE) {
            g_state.buzzerOn = true;
            xSemaphoreGive(g_stateMutex);
          }
        }
      }
    }
  }
  /* 204 = no pending command — do nothing */
  http.end();
}

/* =========================================================
   -------------------- FREERTOS TASKS --------------------
   (new in v2 — replaces sequential loop())
   ========================================================= */

/* --- NPK sensor: reads every 3 s --- */
void taskNPK(void *pvParameters) {
  (void)pvParameters;
  for (;;) {
    NPK_Data sensor = {0, 0, 0, 0, 0, 0, 0};
    if (readNPKSensor(sensor)) {
      if (xSemaphoreTake(g_stateMutex, pdMS_TO_TICKS(100)) == pdTRUE) {
        g_state.npk      = sensor;
        g_state.lastNpkMs = millis();
        xSemaphoreGive(g_stateMutex);
      }
      Serial.println("------ NPK SENSOR DATA ------");
      Serial.printf("Temperature : %.1f C\n",   sensor.temperature);
      Serial.printf("Moisture    : %.1f %%\n",  sensor.moisture);
      Serial.printf("EC          : %u uS/cm\n", sensor.conductivity);
      Serial.printf("pH          : %.2f\n",      sensor.ph);
      Serial.printf("Nitrogen    : %u mg/kg\n", sensor.nitrogen);
      Serial.printf("Phosphorus  : %u mg/kg\n", sensor.phosphorus);
      Serial.printf("Potassium   : %u mg/kg\n", sensor.potassium);
      Serial.println("-----------------------------");
    }
    vTaskDelay(pdMS_TO_TICKS(3000));
  }
}

/* --- Water level: reads every 1 s --- */
void taskWater(void *pvParameters) {
  (void)pvParameters;
  for (;;) {
    int         raw   = analogRead(WATER_PIN);
    const char *level = waterLevelFromRaw(raw);

    if (xSemaphoreTake(g_stateMutex, pdMS_TO_TICKS(100)) == pdTRUE) {
      g_state.waterRaw   = raw;
      g_state.waterLevel = level;
      g_state.lastWaterMs = millis();
      xSemaphoreGive(g_stateMutex);
    }
    Serial.printf("Water: %s (%d)\n", level, raw);
    vTaskDelay(pdMS_TO_TICKS(1000));
  }
}

/* --- PIR + buzzer: polls every 25 ms --- */
void taskMotionBuzzer(void *pvParameters) {
  (void)pvParameters;
  int lastMotion = LOW;

  for (;;) {
    int motion = digitalRead(PIR_PIN);

    if (motion == HIGH && lastMotion == LOW) {
      Serial.println("Motion detected!");
      digitalWrite(BUZZER_PIN, HIGH);
      g_buzzerOn      = true;
      g_buzzerOffTime = millis() + 1000;

      if (xSemaphoreTake(g_stateMutex, pdMS_TO_TICKS(50)) == pdTRUE) {
        g_state.motionDetected = true;
        g_state.lastMotionMs   = millis();
        g_state.buzzerOn       = true;
        xSemaphoreGive(g_stateMutex);
      }
    } else if (motion == LOW) {
      if (xSemaphoreTake(g_stateMutex, pdMS_TO_TICKS(50)) == pdTRUE) {
        g_state.motionDetected = false;
        xSemaphoreGive(g_stateMutex);
      }
    }
    lastMotion = motion;

    /* turn buzzer off when timer expires */
    if (g_buzzerOn && ((int32_t)(millis() - g_buzzerOffTime) >= 0)) {
      digitalWrite(BUZZER_PIN, LOW);
      g_buzzerOn = false;
      if (xSemaphoreTake(g_stateMutex, pdMS_TO_TICKS(50)) == pdTRUE) {
        g_state.buzzerOn = false;
        xSemaphoreGive(g_stateMutex);
      }
    }
    vTaskDelay(pdMS_TO_TICKS(25));
  }
}

/* --- WiFi keepalive: runs every 100 ms --- */
void taskConnectivity(void *pvParameters) {
  (void)pvParameters;
  for (;;) {
    ensureWifiConnected();
    if (xSemaphoreTake(g_stateMutex, pdMS_TO_TICKS(50)) == pdTRUE) {
      g_state.wifiRssi = (WiFi.status() == WL_CONNECTED) ? WiFi.RSSI() : -127;
      xSemaphoreGive(g_stateMutex);
    }
    vTaskDelay(pdMS_TO_TICKS(100));
  }
}

/* --- Telemetry upload every 30 s + command poll every 10 s --- */
void taskTelemetry(void *pvParameters) {
  (void)pvParameters;
  uint32_t lastUpload  = 0;
  uint32_t lastCmdPoll = 0;

  for (;;) {
    uint32_t now = millis();

    if (now - lastUpload >= 30000) {
      lastUpload = now;
      uploadReading();
    }
    if (now - lastCmdPoll >= 10000) {
      lastCmdPoll = now;
      pollCommands();   /* replaces MQTT subscribe for relay/buzzer commands */
    }
    vTaskDelay(pdMS_TO_TICKS(500));
  }
}

/*
 * NEW — Actuator safety task (ported from MQTT version).
 * Enforces relay auto-off after durationMs set by pollCommands().
 */
void taskActuatorSafety(void *pvParameters) {
  (void)pvParameters;
  for (;;) {
    if (g_relayAutoOffTime > 0 && (int32_t)(millis() - g_relayAutoOffTime) >= 0) {
      g_relayAutoOffTime = 0;
      digitalWrite(RELAY_CONTROL, LOW);
      if (xSemaphoreTake(g_stateMutex, pdMS_TO_TICKS(50)) == pdTRUE) {
        g_state.relayOn = false;
        xSemaphoreGive(g_stateMutex);
      }
      Serial.println("Relay auto-off executed");
    }
    vTaskDelay(pdMS_TO_TICKS(50));
  }
}

/* =========================================================
   -------------------- SETUP ------------------------------
   ========================================================= */
void setup() {
  Serial.begin(115200);
  delay(200);

  pinMode(RELAY_CONTROL, OUTPUT); digitalWrite(RELAY_CONTROL, LOW);
  pinMode(PIR_PIN,        INPUT_PULLDOWN);
  pinMode(BUZZER_PIN,     OUTPUT); digitalWrite(BUZZER_PIN, LOW);
  pinMode(WATER_PIN,      INPUT);
  analogSetWidth(12);
  analogSetAttenuation(ADC_11db);
  pinMode(RS485_EN, OUTPUT); digitalWrite(RS485_EN, LOW);

  RS485.begin(9600, SERIAL_8N1, RXD2, TXD2);

  /* Create FreeRTOS synchronisation primitives */
  g_stateMutex = xSemaphoreCreateMutex();
  g_rs485Mutex = xSemaphoreCreateMutex();

  Serial.printf("FertoBot HTTP v2 — device: %s\n", FW_DEVICE_ID);

  /* Pin all tasks to core 1 (same as MQTT version) */
  xTaskCreatePinnedToCore(taskConnectivity,  "taskConn",   6144, nullptr, 4, nullptr, 1);
  xTaskCreatePinnedToCore(taskNPK,           "taskNPK",    6144, nullptr, 3, nullptr, 1);
  xTaskCreatePinnedToCore(taskWater,         "taskWater",  4096, nullptr, 2, nullptr, 1);
  xTaskCreatePinnedToCore(taskMotionBuzzer,  "taskMotion", 4096, nullptr, 2, nullptr, 1);
  xTaskCreatePinnedToCore(taskTelemetry,     "taskTelem",  6144, nullptr, 1, nullptr, 1);
  xTaskCreatePinnedToCore(taskActuatorSafety,"taskSafety", 3072, nullptr, 2, nullptr, 1);
}

/* =========================================================
   -------------------- LOOP (idle) ------------------------
   ========================================================= */
void loop() {
  vTaskDelay(pdMS_TO_TICKS(1000));
}
