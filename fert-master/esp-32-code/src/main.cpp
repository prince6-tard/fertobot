/* =========================================================
   FertoBot ESP32 — WiFi + HTTP Data Uploader  (v2 — merged)
   ========================================================= */

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

/* =========================================================
   -------------------- BUILD-TIME DEFINES -----------------
   ========================================================= */
#ifndef FW_DEVICE_ID
#define FW_DEVICE_ID "FBOT-1001"
#endif

#ifndef WIFI_SSID
#define WIFI_SSID "Lol123"
#endif

#ifndef WIFI_PASSWORD
#define WIFI_PASSWORD "12345678"
#endif

#ifndef SERVER_BASE_URL
#define SERVER_BASE_URL  "http://10.247.88.39:3001"
#endif

#ifndef DEVICE_API_KEY
#define DEVICE_API_KEY "fertobot-esp32-key-2024"
#endif

/* =========================================================
   -------------------- PIN DEFINITIONS --------------------
   ========================================================= */
#define RELAY_CONTROL 27
#define RXD2          16
#define TXD2          17
#define RS485_EN      23
#define PIR_PIN       13
#define PIR_PIN_2     14  // Added PIR pin 14
#define BUZZER_PIN    25
#define WATER_PIN     32

HardwareSerial RS485(2);

/* =========================================================
   -------------------- TIMING CONSTANTS -------------------
   ========================================================= */
#define NPK_POLL_MS           3000
#define WATER_POLL_MS         1000
#define MOTION_POLL_MS        25
#define CONNECTIVITY_POLL_MS  10000
#define TELEMETRY_LOOP_MS     500
#define UPLOAD_INTERVAL_MS    30000
#define CMD_POLL_INTERVAL_MS  10000
#define SAFETY_CHECK_MS       50
#define WIFI_TIMEOUT_MS       12000
#define HTTP_TIMEOUT_MS       10000
#define CMD_HTTP_TIMEOUT_MS   8000

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
  uint32_t    relayAutoOffTime;
  uint32_t    buzzerOffTime;
  uint32_t    lastNpkMs;
  uint32_t    lastWaterMs;
  uint32_t    lastMotionMs;
  int8_t      wifiRssi;
};

DeviceState g_state = {
  {0, 0, 0, 0, 0, 0, 0},
  0, "UNKNOWN",
  false, false, false,
  0, 0,
  0, 0, 0,
  -127
};

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
  // Modbus frame minimum: addr + fn + byteCount + 2 CRC = 5 bytes.
  // Guard rxLen - 2 indexing below against a short/garbage reply (uint16_t underflow → OOB read).
  if (rxLen < 5) { Serial.println("Truncated NPK response"); return false; }

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

// Centralized function to execute parsed commands.
// relay/pump both drive the same RELAY_CONTROL pin; resolve a single desired
// state so the keys can't race (a later key would silently win the pin).
// When both are present, `pump` (boolean) takes precedence over `relay` (string).
void applyCommand(DynamicJsonDocument &doc) {
  bool haveRelayState = false;
  bool relayOn        = false;

  if (doc["pump"].is<bool>()) {
    relayOn        = doc["pump"].as<bool>();
    haveRelayState = true;
    Serial.printf("Pump -> %s\n", relayOn ? "ON" : "OFF");
  } else if (doc["relay"].is<const char *>()) {
    relayOn        = strcasecmp(doc["relay"].as<const char *>(), "on") == 0;
    haveRelayState = true;
    Serial.printf("Relay -> %s\n", relayOn ? "ON" : "OFF");
  }

  if (haveRelayState) {
    if (xSemaphoreTake(g_stateMutex, pdMS_TO_TICKS(50)) == pdTRUE) {
      g_state.relayOn = relayOn;
      digitalWrite(RELAY_CONTROL, relayOn ? HIGH : LOW);
      xSemaphoreGive(g_stateMutex);
    }
  }

  if (doc["durationMs"].is<uint32_t>()) {
    uint32_t dur = doc["durationMs"].as<uint32_t>();
    if (dur > 0) {
      if (xSemaphoreTake(g_stateMutex, pdMS_TO_TICKS(50)) == pdTRUE) {
        g_state.relayAutoOffTime = millis() + dur;
        xSemaphoreGive(g_stateMutex);
      }
    }
  }
  if (doc["buzzerMs"].is<uint32_t>()) {
    uint32_t bms = doc["buzzerMs"].as<uint32_t>();
    if (bms > 0) {
      if (xSemaphoreTake(g_stateMutex, pdMS_TO_TICKS(50)) == pdTRUE) {
        digitalWrite(BUZZER_PIN, HIGH);
        g_state.buzzerOn = true;
        g_state.buzzerOffTime = millis() + bms;
        xSemaphoreGive(g_stateMutex);
      }
    }
  }
}

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
  doc["humidity"]       = 0;
  doc["pH"]             = snapshot.npk.ph;
  doc["conductivity"]   = snapshot.npk.conductivity;
  doc["nitrogen"]       = snapshot.npk.nitrogen;
  doc["phosphorus"]     = snapshot.npk.phosphorus;
  doc["potassium"]      = snapshot.npk.potassium;
  doc["waterRaw"]       = snapshot.waterRaw;
  doc["waterLevel"]     = snapshot.waterLevel;
  doc["waterTankLevel"] = waterLevelToPercent(snapshot.waterLevel);
  doc["batteryLevel"]   = 100;
  doc["signalStrength"] = signalPct;
  doc["relayOn"]        = snapshot.relayOn;
  doc["motionDetected"] = snapshot.motionDetected;

  String body;
  serializeJson(doc, body);

  HTTPClient http;
  http.begin(String(SERVER_BASE_URL) + "/api/device/reading");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", DEVICE_API_KEY);
  http.setTimeout(10000);

  int code = http.POST(body);
  if (code == 201 || code == 200) {
    Serial.println("Upload OK");
    String responseStr = http.getString();
    
    // Parse piggybacked command from the reading response using expanded buffer
    DynamicJsonDocument rdoc(1024);
    if (deserializeJson(rdoc, responseStr) == DeserializationError::Ok) {
      if (rdoc["data"]["command"]) {
        String cmdStr;
        serializeJson(rdoc["data"]["command"], cmdStr);
        
        DynamicJsonDocument cmdDoc(1024);
        if (deserializeJson(cmdDoc, cmdStr) == DeserializationError::Ok) {
          applyCommand(cmdDoc);
        }
      }
    }
  } else {
    Serial.printf("Upload failed: HTTP %d\n", code);
    Serial.println(http.getString());
  }
  http.end();
}

void longPollCommand() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(String(SERVER_BASE_URL) + "/api/device/command?probeUuid=" + FW_DEVICE_ID);
  http.addHeader("x-api-key", DEVICE_API_KEY);
  http.setTimeout(8000);

  int code = http.GET();
  if (code == 200) {
    String payload = http.getString();
    Serial.printf("Command received: %s\n", payload.c_str());

    DynamicJsonDocument doc(1024);

    if (deserializeJson(doc, payload) == DeserializationError::Ok) {
      applyCommand(doc);
    }
  }
  http.end();
}

/* =========================================================
   -------------------- FREERTOS TASKS --------------------
   ========================================================= */

void taskNPK(void *pvParameters) {
  (void)pvParameters;
  for (;;) {
    NPK_Data sensor = {0, 0, 0, 0, 0, 0, 0};
    if (readNPKSensor(sensor)) {
      if (xSemaphoreTake(g_stateMutex, pdMS_TO_TICKS(100)) == pdTRUE) {
        g_state.npk       = sensor;
        g_state.lastNpkMs = millis();
        xSemaphoreGive(g_stateMutex);
      }
      Serial.println("------ NPK SENSOR DATA ------");
      Serial.printf("Temperature : %.1f C\n",   sensor.temperature);
      Serial.printf("Moisture     : %.1f %%\n",  sensor.moisture);
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

void taskMotionBuzzer(void *pvParameters) {
  (void)pvParameters;
  int lastMotion = LOW;

  for (;;) {
    // Check both PIR pins. HIGH on either triggers the motion logic.
    int motion = (digitalRead(PIR_PIN) == HIGH || digitalRead(PIR_PIN_2) == HIGH) ? HIGH : LOW;

    if (motion == HIGH && lastMotion == LOW) {
      Serial.println("Motion detected!");
      if (xSemaphoreTake(g_stateMutex, pdMS_TO_TICKS(50)) == pdTRUE) {
        digitalWrite(BUZZER_PIN, HIGH);
        g_state.motionDetected = true;
        g_state.lastMotionMs   = millis();
        g_state.buzzerOn       = true;
        g_state.buzzerOffTime  = millis() + 1000;
        xSemaphoreGive(g_stateMutex);
      }
    } else if (motion == LOW) {
      if (xSemaphoreTake(g_stateMutex, pdMS_TO_TICKS(50)) == pdTRUE) {
        g_state.motionDetected = false;
        xSemaphoreGive(g_stateMutex);
      }
    }
    lastMotion = motion;

    bool localBuzzerOn = false;
    uint32_t localBuzzerOff = 0;
    if (xSemaphoreTake(g_stateMutex, pdMS_TO_TICKS(50)) == pdTRUE) {
      localBuzzerOn = g_state.buzzerOn;
      localBuzzerOff = g_state.buzzerOffTime;
      xSemaphoreGive(g_stateMutex);
    }

    if (localBuzzerOn && ((int32_t)(millis() - localBuzzerOff) >= 0)) {
      if (xSemaphoreTake(g_stateMutex, pdMS_TO_TICKS(50)) == pdTRUE) {
        digitalWrite(BUZZER_PIN, LOW);
        g_state.buzzerOn = false;
        xSemaphoreGive(g_stateMutex);
      }
    }
    vTaskDelay(pdMS_TO_TICKS(MOTION_POLL_MS));
  }
}

void taskConnectivity(void *pvParameters) {
  (void)pvParameters;
  for (;;) {
    ensureWifiConnected();
    if (xSemaphoreTake(g_stateMutex, pdMS_TO_TICKS(50)) == pdTRUE) {
      g_state.wifiRssi = (WiFi.status() == WL_CONNECTED) ? WiFi.RSSI() : -127;
      xSemaphoreGive(g_stateMutex);
    }
    // RSSI barely moves second-to-second; 100 ms polling was burning cycles
    // and hammering the state mutex. 10 s is plenty and still well under the
    // 30 s telemetry cadence that reports this value.
    vTaskDelay(pdMS_TO_TICKS(10000));
  }
}

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
      longPollCommand(); // Updated to match the new function name
    }
    vTaskDelay(pdMS_TO_TICKS(500));
  }
}

void taskActuatorSafety(void *pvParameters) {
  (void)pvParameters;
  for (;;) {
    bool doRelayOff = false;
    
    if (xSemaphoreTake(g_stateMutex, pdMS_TO_TICKS(50)) == pdTRUE) {
      if (g_state.relayAutoOffTime > 0 && (int32_t)(millis() - g_state.relayAutoOffTime) >= 0) {
        g_state.relayAutoOffTime = 0;
        g_state.relayOn = false;
        doRelayOff = true;
      }
      xSemaphoreGive(g_stateMutex);
    }
    
    if (doRelayOff) {
      digitalWrite(RELAY_CONTROL, LOW);
      Serial.println("Relay auto-off executed");
    }
    vTaskDelay(pdMS_TO_TICKS(SAFETY_CHECK_MS));
  }
}

/* =========================================================
   -------------------- SETUP ------------------------------
   ========================================================= */
void setup() {
  Serial.begin(115200);
  delay(200);

  pinMode(RELAY_CONTROL, OUTPUT); digitalWrite(RELAY_CONTROL, LOW);
  pinMode(PIR_PIN,         INPUT_PULLDOWN);
  pinMode(PIR_PIN_2,       INPUT_PULLDOWN); // Initialize Pin 14
  pinMode(BUZZER_PIN,      OUTPUT); digitalWrite(BUZZER_PIN, LOW);
  pinMode(WATER_PIN,       INPUT);
  analogSetWidth(12);
  analogSetAttenuation(ADC_11db);
  pinMode(RS485_EN, OUTPUT); digitalWrite(RS485_EN, LOW);

  RS485.begin(9600, SERIAL_8N1, RXD2, TXD2);

  g_stateMutex = xSemaphoreCreateMutex();
  g_rs485Mutex = xSemaphoreCreateMutex();

  Serial.printf("FertoBot HTTP v2 — device: %s\n", FW_DEVICE_ID);

  xTaskCreatePinnedToCore(taskConnectivity,   "taskConn",   6144, nullptr, 4, nullptr, 1);
  xTaskCreatePinnedToCore(taskNPK,            "taskNPK",    6144, nullptr, 3, nullptr, 1);
  xTaskCreatePinnedToCore(taskWater,          "taskWater",  4096, nullptr, 2, nullptr, 1);
  xTaskCreatePinnedToCore(taskMotionBuzzer,   "taskMotion", 4096, nullptr, 2, nullptr, 1);
  xTaskCreatePinnedToCore(taskTelemetry,      "taskTelem",  8192, nullptr, 1, nullptr, 1);
  xTaskCreatePinnedToCore(taskActuatorSafety, "taskSafety", 3072, nullptr, 2, nullptr, 1);
}

/* =========================================================
   -------------------- LOOP (idle) ------------------------
   ========================================================= */
void loop() {
  vTaskDelay(pdMS_TO_TICKS(1000));
}