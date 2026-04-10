/* =========================================================
   FertoBot ESP32 — WiFi + HTTP Data Uploader
   Reads NPK/soil sensor via RS485, posts to FertoBot API.
   ========================================================= */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ── CONFIG — edit these before flashing ──────────────────
const char* WIFI_SSID     = "lol123";
const char* WIFI_PASSWORD = "12345678";

// Backend URL — replace with your Railway/Render URL after deployment
// For local testing use your PC's IP: http://192.168.x.x:3001
const char* SERVER_URL    = "https://fertobot-production.up.railway.app/api/device/reading";

const char* DEVICE_API_KEY = "fertobot-esp32-key-2024"; // must match server DEVICE_API_KEY env var
const char* PROBE_UUID     = "FBOT-1001";                // must match probe UUID in DB
// ─────────────────────────────────────────────────────────

// ── PIN DEFINITIONS ──────────────────────────────────────
#define RELAY_CONTROL 26
#define RXD2          16
#define TXD2          17
#define RS485_EN      23
#define PIR_PIN       13
#define BUZZER_PIN    25
#define WATER_PIN     32

HardwareSerial RS485(2);

// ── GLOBALS ───────────────────────────────────────────────
volatile bool rs485Busy  = false;
bool buzzerOn            = false;
unsigned long buzzerOffTime = 0;

unsigned long lastUpload = 0;
const unsigned long UPLOAD_INTERVAL = 30000; // POST every 30 seconds

struct NPK_Data {
  float    temperature;
  float    moisture;
  float    ph;
  uint16_t conductivity;
  uint16_t nitrogen;
  uint16_t phosphorus;
  uint16_t potassium;
  bool     valid = false;
};

NPK_Data latestReading;

// ── WIFI ──────────────────────────────────────────────────
void connectWifi() {
  Serial.printf("Connecting to WiFi: %s\n", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\nWiFi connected. IP: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\nWiFi failed — will retry in loop");
  }
}

// ── MODBUS CRC ────────────────────────────────────────────
uint16_t modbusCRC(uint8_t* buf, uint16_t len) {
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

bool decodeNPKFrame(uint8_t* rx, uint16_t len, uint16_t startReg, NPK_Data& data) {
  if (len < 7 || rx[1] != 0x03) return false;
  uint8_t byteCount = rx[2];
  if (byteCount + 5 != len) return false;
  uint8_t* payload  = &rx[3];
  uint8_t  regCount = byteCount / 2;

  for (uint8_t i = 0; i < regCount; i++) {
    uint16_t value = (payload[i * 2] << 8) | payload[i * 2 + 1];
    switch (startReg + i) {
      case 0x0000: data.temperature  = value / 10.0; break;
      case 0x0001: data.moisture     = value / 10.0; break;
      case 0x0002: data.conductivity = value;        break;
      case 0x0003: data.ph           = value / 100.0;break;
      case 0x0004: data.nitrogen     = value;        break;
      case 0x0005: data.phosphorus   = value;        break;
      case 0x0006: data.potassium    = value;        break;
    }
  }
  return true;
}

// ── READ NPK SENSOR ───────────────────────────────────────
void readNPKSensor() {
  static unsigned long lastRead = 0;
  if (millis() - lastRead < 3000) return;
  lastRead = millis();

  rs485Busy = true;
  uint8_t rxBuf[64];
  uint16_t rxLen = 0;
  NPK_Data sensor = {0};

  sendReadRequest(2, 0x0000, 7);

  unsigned long start = millis();
  while (millis() - start < 1000) {
    if (RS485.available()) rxBuf[rxLen++] = RS485.read();
  }
  rs485Busy = false;

  if (rxLen == 0) { Serial.println("No response from NPK sensor"); return; }

  uint16_t crcRx   = rxBuf[rxLen - 2] | (rxBuf[rxLen - 1] << 8);
  uint16_t crcCalc = modbusCRC(rxBuf, rxLen - 2);
  if (crcRx != crcCalc) { Serial.println("CRC ERROR"); return; }

  if (decodeNPKFrame(rxBuf, rxLen, 0x0000, sensor)) {
    latestReading           = sensor;
    latestReading.valid     = true;

    Serial.println("------ NPK SENSOR DATA ------");
    Serial.printf("Temperature : %.1f °C\n",    latestReading.temperature);
    Serial.printf("Moisture    : %.1f %%\n",    latestReading.moisture);
    Serial.printf("EC          : %d uS/cm\n",   latestReading.conductivity);
    Serial.printf("pH          : %.2f\n",        latestReading.ph);
    Serial.printf("Nitrogen    : %d mg/kg\n",   latestReading.nitrogen);
    Serial.printf("Phosphorus  : %d mg/kg\n",   latestReading.phosphorus);
    Serial.printf("Potassium   : %d mg/kg\n",   latestReading.potassium);
    Serial.println("-----------------------------");
  }
}

// ── READ WATER LEVEL ──────────────────────────────────────
float readWaterLevelPercent() {
  if (rs485Busy) return 0;
  int raw = analogRead(WATER_PIN);
  // Map raw ADC (0-4095) to percentage
  if (raw < 400)  return 10.0;
  if (raw < 1200) return 30.0;
  if (raw < 2500) return 65.0;
  return 90.0;
}

// ── HTTP POST TO BACKEND ──────────────────────────────────
void uploadReading() {
  if (!latestReading.valid) {
    Serial.println("No valid reading yet — skipping upload");
    return;
  }
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected — reconnecting...");
    connectWifi();
    return;
  }

  float waterLevel  = readWaterLevelPercent();
  int   battery     = 85; // TODO: read actual battery if you have ADC circuit
  int   signal      = WiFi.RSSI();
  // Map RSSI (-100 to -30 dBm) to 0-100%
  int   signalPct   = constrain(map(signal, -100, -30, 0, 100), 0, 100);

  // Build JSON
  StaticJsonDocument<512> doc;
  doc["probeUuid"]     = PROBE_UUID;
  doc["soilMoisture"]  = latestReading.moisture;
  doc["temperature"]   = latestReading.temperature;
  doc["humidity"]      = 60; // placeholder — add DHT22 if available
  doc["pH"]            = latestReading.ph;
  doc["conductivity"]  = latestReading.conductivity;
  doc["nitrogen"]      = latestReading.nitrogen;
  doc["phosphorus"]    = latestReading.phosphorus;
  doc["potassium"]     = latestReading.potassium;
  doc["waterTankLevel"]= waterLevel;
  doc["batteryLevel"]  = battery;
  doc["signalStrength"]= signalPct;

  String body;
  serializeJson(doc, body);

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", DEVICE_API_KEY);
  http.setTimeout(10000);

  int httpCode = http.POST(body);

  if (httpCode == 201) {
    Serial.println("Upload OK");
  } else {
    Serial.printf("Upload failed: HTTP %d\n", httpCode);
    Serial.println(http.getString());
  }
  http.end();
}

// ── MOTION + BUZZER ───────────────────────────────────────
void handleMotionAndBuzzer() {
  if (rs485Busy) return;
  static int lastMotion = LOW;
  int motion = digitalRead(PIR_PIN);
  if (motion == HIGH && lastMotion == LOW) {
    Serial.println("Motion detected!");
    digitalWrite(BUZZER_PIN, HIGH);
    buzzerOn = true;
    buzzerOffTime = millis() + 1000;
  }
  lastMotion = motion;
  if (buzzerOn && millis() > buzzerOffTime) {
    digitalWrite(BUZZER_PIN, LOW);
    buzzerOn = false;
  }
}

// ── SETUP ─────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);

  pinMode(RELAY_CONTROL, OUTPUT); digitalWrite(RELAY_CONTROL, LOW);
  pinMode(PIR_PIN, INPUT_PULLDOWN);
  pinMode(BUZZER_PIN, OUTPUT);    digitalWrite(BUZZER_PIN, LOW);
  pinMode(WATER_PIN, INPUT);
  analogSetWidth(12);
  analogSetAttenuation(ADC_11db);
  pinMode(RS485_EN, OUTPUT);      digitalWrite(RS485_EN, LOW);

  RS485.begin(9600, SERIAL_8N1, RXD2, TXD2);

  connectWifi();
  Serial.println("FertoBot ESP32 Ready");
}

// ── LOOP ──────────────────────────────────────────────────
void loop() {
  readNPKSensor();
  handleMotionAndBuzzer();

  // Upload every UPLOAD_INTERVAL ms
  if (millis() - lastUpload >= UPLOAD_INTERVAL) {
    lastUpload = millis();
    uploadReading();
  }
}
