#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

/* =========================================================
   -------------------- PIN DEFINITIONS --------------------
   ========================================================= */
#define RELAY_CONTROL 26
#define RXD2 16
#define TXD2 17
#define RS485_EN 23
#define PIR_PIN 13
#define BUZZER_PIN 25
#define WATER_PIN 32

#ifndef FW_DEVICE_ID
#define FW_DEVICE_ID "probe-001"
#endif

#ifndef WIFI_SSID
#define WIFI_SSID "lol123"
#endif

#ifndef WIFI_PASSWORD
#define WIFI_PASSWORD "11111111"
#endif

#ifndef MQTT_HOST
#define MQTT_HOST "192.168.1.100"
#endif

#ifndef MQTT_PORT
#define MQTT_PORT 1883
#endif

#ifndef MQTT_USER
#define MQTT_USER ""
#endif

#ifndef MQTT_PASSWORD
#define MQTT_PASSWORD ""
#endif

/* =========================================================
   -------------------- RS485 SERIAL -----------------------
   ========================================================= */
HardwareSerial RS485(2);

/* =========================================================
   -------------------- FREE RTOS PRIMITIVES --------------
   ========================================================= */
SemaphoreHandle_t g_stateMutex = nullptr;
SemaphoreHandle_t g_rs485Mutex = nullptr;

/* =========================================================
   -------------------- MQTT/WIFI GLOBALS ------------------
   ========================================================= */
WiFiClient g_wifiClient;
PubSubClient g_mqttClient(g_wifiClient);

String g_topicBase = String("fertobot/probes/") + FW_DEVICE_ID;
String g_topicTelemetry = g_topicBase + "/sensor-data";
String g_topicMotion = g_topicBase + "/motion";
String g_topicStatus = g_topicBase + "/status";
String g_topicControl = g_topicBase + "/control";

/* =========================================================
   -------------------- SENSOR/DEVICE STATE ----------------
   ========================================================= */
struct NPK_Data {
  float temperature;
  float moisture;
  float ph;
  uint16_t conductivity;
  uint16_t nitrogen;
  uint16_t phosphorus;
  uint16_t potassium;
};

struct DeviceState {
  NPK_Data npk;
  int waterRaw;
  const char *waterLevel;
  bool motionDetected;
  bool relayOn;
  bool buzzerOn;
  uint32_t lastNpkMs;
  uint32_t lastWaterMs;
  uint32_t lastMotionMs;
  int8_t wifiRssi;
  bool mqttConnected;
};

DeviceState g_state = {
  {0, 0, 0, 0, 0, 0, 0},
  0,
  "UNKNOWN",
  false,
  false,
  false,
  0,
  0,
  0,
  -127,
  false,
};

volatile bool g_buzzerOn = false;
volatile uint32_t g_buzzerOffTime = 0;
volatile bool g_motionLatched = false;
volatile uint32_t g_relayAutoOffTime = 0;

/* =========================================================
   -------------------- UTILITIES --------------------------
   ========================================================= */
uint16_t modbusCRC(uint8_t *buf, uint16_t len) {
  uint16_t crc = 0xFFFF;
  for (uint16_t pos = 0; pos < len; pos++) {
    crc ^= (uint16_t)buf[pos];
    for (int i = 0; i < 8; i++) {
      if (crc & 0x0001) {
        crc >>= 1;
        crc ^= 0xA001;
      } else {
        crc >>= 1;
      }
    }
  }
  return crc;
}

void printFrameHex(const char *tag, uint8_t *buf, uint16_t len) {
  Serial.print(tag);
  Serial.print(" [");
  Serial.print(len);
  Serial.print("]: ");
  for (uint16_t i = 0; i < len; i++) {
    if (buf[i] < 0x10) Serial.print("0");
    Serial.print(buf[i], HEX);
    Serial.print(" ");
  }
  Serial.println();
}

const char *waterLevelFromRaw(int waterRaw) {
  if (waterRaw < 400) return "DRY";
  if (waterRaw < 1200) return "LOW";
  if (waterRaw < 2500) return "MEDIUM";
  return "HIGH";
}

/* =========================================================
   -------------------- MODBUS/NPK -------------------------
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

  printFrameHex("TX", frame, 8);

  digitalWrite(RS485_EN, HIGH);
  delayMicroseconds(100);

  RS485.write(frame, 8);
  RS485.flush();

  delayMicroseconds(200);
  digitalWrite(RS485_EN, LOW);
}

bool decodeNPKFrame(uint8_t *rx, uint16_t len, uint16_t startRegister, NPK_Data &data) {
  if (len < 7) return false;
  if (rx[1] != 0x03) return false;

  uint8_t byteCount = rx[2];
  if (byteCount + 5 != len) return false;

  uint8_t *payload = &rx[3];
  uint8_t regCount = byteCount / 2;

  for (uint8_t i = 0; i < regCount; i++) {
    uint16_t value = (payload[i * 2] << 8) | payload[i * 2 + 1];
    uint16_t reg = startRegister + i;

    switch (reg) {
      case 0x0000: data.temperature = value / 10.0f; break;
      case 0x0001: data.moisture = value / 10.0f; break;
      case 0x0002: data.conductivity = value; break;
      case 0x0003: data.ph = value / 100.0f; break;
      case 0x0004: data.nitrogen = value; break;
      case 0x0005: data.phosphorus = value; break;
      case 0x0006: data.potassium = value; break;
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

  uint8_t rxBuf[64] = {0};
  uint16_t rxLen = 0;

  sendReadRequest(2, 0x0000, 7);

  uint32_t start = millis();
  while (millis() - start < 1000) {
    while (RS485.available()) {
      if (rxLen < sizeof(rxBuf)) {
        rxBuf[rxLen++] = RS485.read();
      } else {
        RS485.read();
      }
    }
    vTaskDelay(pdMS_TO_TICKS(2));
  }

  xSemaphoreGive(g_rs485Mutex);

  if (rxLen == 0) {
    Serial.println("No response from NPK sensor");
    return false;
  }

  printFrameHex("RX", rxBuf, rxLen);

  uint16_t crcRx = rxBuf[rxLen - 2] | (rxBuf[rxLen - 1] << 8);
  uint16_t crcCalc = modbusCRC(rxBuf, rxLen - 2);

  if (crcRx != crcCalc) {
    Serial.println("CRC ERROR");
    return false;
  }

  if (!decodeNPKFrame(rxBuf, rxLen, 0x0000, sensor)) {
    Serial.println("Invalid Modbus payload");
    return false;
  }

  return true;
}

/* =========================================================
   -------------------- MQTT -------------------------------
   ========================================================= */
void publishStatus(const char *status) {
  if (!g_mqttClient.connected()) return;

  StaticJsonDocument<256> doc;
  doc["deviceId"] = FW_DEVICE_ID;
  doc["status"] = status;
  doc["timestamp"] = millis();

  char payload[256];
  size_t n = serializeJson(doc, payload, sizeof(payload));
  g_mqttClient.publish(g_topicStatus.c_str(), payload, n, true);
}

void publishMotionEvent() {
  if (!g_mqttClient.connected()) return;

  StaticJsonDocument<256> doc;
  doc["deviceId"] = FW_DEVICE_ID;
  doc["motion"] = true;
  doc["timestamp"] = millis();

  char payload[256];
  size_t n = serializeJson(doc, payload, sizeof(payload));
  g_mqttClient.publish(g_topicMotion.c_str(), payload, n, false);
}

void publishTelemetry() {
  if (!g_mqttClient.connected()) return;

  DeviceState snapshot;
  if (xSemaphoreTake(g_stateMutex, pdMS_TO_TICKS(100)) != pdTRUE) {
    return;
  }
  snapshot = g_state;
  xSemaphoreGive(g_stateMutex);

  StaticJsonDocument<512> doc;
  doc["deviceId"] = FW_DEVICE_ID;
  doc["timestamp"] = millis();
  doc["soilMoisture"] = snapshot.npk.moisture;
  doc["temperature"] = snapshot.npk.temperature;
  doc["humidity"] = 0;
  doc["pH"] = snapshot.npk.ph;
  doc["conductivity"] = snapshot.npk.conductivity;
  doc["nitrogen"] = snapshot.npk.nitrogen;
  doc["phosphorus"] = snapshot.npk.phosphorus;
  doc["potassium"] = snapshot.npk.potassium;
  doc["waterRaw"] = snapshot.waterRaw;
  doc["waterLevel"] = snapshot.waterLevel;
  doc["waterTankLevel"] = strcmp(snapshot.waterLevel, "HIGH") == 0
                            ? 100
                            : strcmp(snapshot.waterLevel, "MEDIUM") == 0
                                  ? 65
                                  : strcmp(snapshot.waterLevel, "LOW") == 0
                                        ? 30
                                        : 5;
  doc["batteryLevel"] = 100;
  doc["signalStrength"] = snapshot.wifiRssi;
  doc["relayOn"] = snapshot.relayOn;
  doc["motionDetected"] = snapshot.motionDetected;

  char payload[512];
  size_t n = serializeJson(doc, payload, sizeof(payload));
  g_mqttClient.publish(g_topicTelemetry.c_str(), payload, n, false);
}

void applyControlPayload(const JsonDocument &doc) {
  if (doc["relay"].is<const char *>()) {
    const char *relay = doc["relay"];
    bool turnOn = strcasecmp(relay, "on") == 0;
    digitalWrite(RELAY_CONTROL, turnOn ? HIGH : LOW);

    if (xSemaphoreTake(g_stateMutex, pdMS_TO_TICKS(50)) == pdTRUE) {
      g_state.relayOn = turnOn;
      xSemaphoreGive(g_stateMutex);
    }
  }

  if (doc["pump"].is<bool>()) {
    bool pump = doc["pump"].as<bool>();
    digitalWrite(RELAY_CONTROL, pump ? HIGH : LOW);
    if (xSemaphoreTake(g_stateMutex, pdMS_TO_TICKS(50)) == pdTRUE) {
      g_state.relayOn = pump;
      xSemaphoreGive(g_stateMutex);
    }
  }

  if (doc["durationMs"].is<uint32_t>()) {
    uint32_t duration = doc["durationMs"].as<uint32_t>();
    if (duration > 0) {
      g_relayAutoOffTime = millis() + duration;
    }
  }

  if (doc["buzzerMs"].is<uint32_t>()) {
    uint32_t buzzerMs = doc["buzzerMs"].as<uint32_t>();
    if (buzzerMs > 0) {
      digitalWrite(BUZZER_PIN, HIGH);
      g_buzzerOn = true;
      g_buzzerOffTime = millis() + buzzerMs;
      if (xSemaphoreTake(g_stateMutex, pdMS_TO_TICKS(50)) == pdTRUE) {
        g_state.buzzerOn = true;
        xSemaphoreGive(g_stateMutex);
      }
    }
  }
}

void mqttCallback(char *topic, uint8_t *payload, unsigned int length) {
  if (String(topic) != g_topicControl) return;

  StaticJsonDocument<256> doc;
  DeserializationError err = deserializeJson(doc, payload, length);
  if (err) {
    Serial.print("Control payload JSON error: ");
    Serial.println(err.c_str());
    return;
  }

  applyControlPayload(doc);
}

void ensureWifiConnected() {
  if (WiFi.status() == WL_CONNECTED) return;

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  uint32_t start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 12000) {
    vTaskDelay(pdMS_TO_TICKS(300));
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("WiFi connected. IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("WiFi connect timeout");
  }
}

void ensureMqttConnected() {
  if (g_mqttClient.connected()) return;
  if (WiFi.status() != WL_CONNECTED) return;

  String clientId = String("esp32-") + FW_DEVICE_ID + "-" + String((uint32_t)ESP.getEfuseMac(), HEX);

  bool ok;
  if (strlen(MQTT_USER) > 0) {
    ok = g_mqttClient.connect(clientId.c_str(), MQTT_USER, MQTT_PASSWORD);
  } else {
    ok = g_mqttClient.connect(clientId.c_str());
  }

  if (!ok) {
    Serial.print("MQTT connect failed, rc=");
    Serial.println(g_mqttClient.state());
    return;
  }

  Serial.println("MQTT connected");
  g_mqttClient.subscribe(g_topicControl.c_str());
  publishStatus("online");
}

/* =========================================================
   -------------------- RTOS TASKS -------------------------
   ========================================================= */
void taskNPK(void *pvParameters) {
  (void)pvParameters;
  for (;;) {
    NPK_Data sensor = {0, 0, 0, 0, 0, 0, 0};
    if (readNPKSensor(sensor)) {
      if (xSemaphoreTake(g_stateMutex, pdMS_TO_TICKS(100)) == pdTRUE) {
        g_state.npk = sensor;
        g_state.lastNpkMs = millis();
        xSemaphoreGive(g_stateMutex);
      }

      Serial.println("------ NPK SENSOR DATA ------");
      Serial.printf("Temperature : %.1f C\n", sensor.temperature);
      Serial.printf("Moisture    : %.1f %%\n", sensor.moisture);
      Serial.printf("EC          : %u uS/cm\n", sensor.conductivity);
      Serial.printf("pH          : %.2f\n", sensor.ph);
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
    int waterRaw = analogRead(WATER_PIN);
    const char *level = waterLevelFromRaw(waterRaw);

    if (xSemaphoreTake(g_stateMutex, pdMS_TO_TICKS(100)) == pdTRUE) {
      g_state.waterRaw = waterRaw;
      g_state.waterLevel = level;
      g_state.lastWaterMs = millis();
      xSemaphoreGive(g_stateMutex);
    }

    Serial.print("Water: ");
    Serial.println(level);
    vTaskDelay(pdMS_TO_TICKS(1000));
  }
}

void taskMotionBuzzer(void *pvParameters) {
  (void)pvParameters;
  int lastMotion = LOW;

  for (;;) {
    int motion = digitalRead(PIR_PIN);

    if (motion == HIGH && lastMotion == LOW) {
      Serial.println("Motion detected!");
      digitalWrite(BUZZER_PIN, HIGH);
      g_buzzerOn = true;
      g_buzzerOffTime = millis() + 1000;
      g_motionLatched = true;

      if (xSemaphoreTake(g_stateMutex, pdMS_TO_TICKS(50)) == pdTRUE) {
        g_state.motionDetected = true;
        g_state.lastMotionMs = millis();
        g_state.buzzerOn = true;
        xSemaphoreGive(g_stateMutex);
      }

      publishMotionEvent();
    }
    lastMotion = motion;

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

void taskConnectivity(void *pvParameters) {
  (void)pvParameters;
  for (;;) {
    ensureWifiConnected();
    ensureMqttConnected();

    if (xSemaphoreTake(g_stateMutex, pdMS_TO_TICKS(50)) == pdTRUE) {
      g_state.wifiRssi = WiFi.status() == WL_CONNECTED ? WiFi.RSSI() : -127;
      g_state.mqttConnected = g_mqttClient.connected();
      xSemaphoreGive(g_stateMutex);
    }

    g_mqttClient.loop();
    vTaskDelay(pdMS_TO_TICKS(100));
  }
}

void taskTelemetry(void *pvParameters) {
  (void)pvParameters;
  for (;;) {
    publishTelemetry();
    vTaskDelay(pdMS_TO_TICKS(5000));
  }
}

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

  pinMode(RELAY_CONTROL, OUTPUT);
  digitalWrite(RELAY_CONTROL, LOW);

  pinMode(PIR_PIN, INPUT_PULLDOWN);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  pinMode(WATER_PIN, INPUT);
  analogSetWidth(12);
  analogSetAttenuation(ADC_11db);

  pinMode(RS485_EN, OUTPUT);
  digitalWrite(RS485_EN, LOW);

  RS485.begin(9600, SERIAL_8N1, RXD2, TXD2);

  g_stateMutex = xSemaphoreCreateMutex();
  g_rs485Mutex = xSemaphoreCreateMutex();

  g_mqttClient.setServer(MQTT_HOST, MQTT_PORT);
  g_mqttClient.setCallback(mqttCallback);
  g_mqttClient.setBufferSize(1024);

  Serial.println("ESP32 FreeRTOS firmware initialized");

  xTaskCreatePinnedToCore(taskConnectivity, "taskConnectivity", 6144, nullptr, 4, nullptr, 1);
  xTaskCreatePinnedToCore(taskNPK, "taskNPK", 6144, nullptr, 3, nullptr, 1);
  xTaskCreatePinnedToCore(taskWater, "taskWater", 4096, nullptr, 2, nullptr, 1);
  xTaskCreatePinnedToCore(taskMotionBuzzer, "taskMotionBuzzer", 4096, nullptr, 2, nullptr, 1);
  xTaskCreatePinnedToCore(taskTelemetry, "taskTelemetry", 6144, nullptr, 1, nullptr, 1);
  xTaskCreatePinnedToCore(taskActuatorSafety, "taskActuatorSafety", 3072, nullptr, 2, nullptr, 1);
}

/* =========================================================
   -------------------- LOOP -------------------------------
   ========================================================= */
void loop() {
  vTaskDelay(pdMS_TO_TICKS(1000));
}
