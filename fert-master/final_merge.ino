/* =========================================================
   -------------------- PIN DEFINITIONS --------------------
   ========================================================= */

// Relay / Pump
#define RELAY_CONTROL 26

// RS485 / NPK Sensor
#define RXD2      16
#define TXD2      17
#define RS485_EN  23

// Motion / Water / Buzzer
#define PIR_PIN        13
#define BUZZER_PIN     25
#define WATER_PIN      32


/* =========================================================
   -------------------- RS485 SERIAL -----------------------
   ========================================================= */
HardwareSerial RS485(2);


/* =========================================================
   -------------------- GLOBAL VARIABLES -------------------
   ========================================================= */
unsigned long buzzerOffTime = 0;
bool buzzerOn = false;

// 🔒 RS485 LOCK (VERY IMPORTANT)
volatile bool rs485Busy = false;


/* =========================================================
   -------------------- NPK DATA STRUCT --------------------
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


/* =========================================================
   -------------------- MODBUS CRC -------------------------
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


/* =========================================================
   -------------------- PRINT FRAME ------------------------
   ========================================================= */
void printFrameHex(const char *tag, uint8_t *buf, uint16_t len) {
  Serial.print(tag);
  Serial.print(" [");
  Serial.print(len);
  Serial.print("]: ");
  for (int i = 0; i < len; i++) {
    if (buf[i] < 0x10) Serial.print("0");
    Serial.print(buf[i], HEX);
    Serial.print(" ");
  }
  Serial.println();
}


/* =========================================================
   -------------------- SEND MODBUS REQUEST ----------------
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

  digitalWrite(RS485_EN, HIGH);      // TX mode
  delayMicroseconds(100);

  RS485.write(frame, 8);
  RS485.flush();

  delayMicroseconds(200);            // sensor turnaround
  digitalWrite(RS485_EN, LOW);       // RX mode
}


/* =========================================================
   -------------------- DECODE NPK FRAME -------------------
   ========================================================= */
bool decodeNPKFrame(uint8_t *rx, uint16_t len,
                    uint16_t startRegister,
                    NPK_Data &data) {

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
      case 0x0000: data.temperature = value / 10.0; break;
      case 0x0001: data.moisture = value / 10.0; break;
      case 0x0002: data.conductivity = value; break;
      case 0x0003: data.ph = value / 100.0; break;
      case 0x0004: data.nitrogen = value; break;
      case 0x0005: data.phosphorus = value; break;
      case 0x0006: data.potassium = value; break;
    }
  }
  return true;
}


/* =========================================================
   -------------------- READ NPK SENSOR --------------------
   ========================================================= */
void readNPKSensor() {
  static unsigned long lastRead = 0;
  unsigned long now = millis();

  if (now - lastRead < 3000) return;  // EXACT 3 seconds
  lastRead = now;

  rs485Busy = true;   // 🔒 LOCK SYSTEM

  uint8_t rxBuf[64];
  uint16_t rxLen = 0;
  NPK_Data sensor = {0};

  sendReadRequest(2, 0x0000, 7);   // ✅ SLAVE ID = 2

  unsigned long start = millis();
  while (millis() - start < 1000) {
    if (RS485.available()) {
      rxBuf[rxLen++] = RS485.read();
    }
  }

  rs485Busy = false;  // 🔓 UNLOCK SYSTEM

  if (rxLen == 0) {
    Serial.println("No response from NPK sensor");
    return;
  }

  printFrameHex("RX", rxBuf, rxLen);

  uint16_t crcRx   = rxBuf[rxLen - 2] | (rxBuf[rxLen - 1] << 8);
  uint16_t crcCalc = modbusCRC(rxBuf, rxLen - 2);

  if (crcRx != crcCalc) {
    Serial.println("CRC ERROR");
    return;
  }

  if (decodeNPKFrame(rxBuf, rxLen, 0x0000, sensor)) {
    Serial.println("------ NPK SENSOR DATA ------");
    Serial.print("Temperature : "); Serial.print(sensor.temperature); Serial.println(" °C");
    Serial.print("Moisture    : "); Serial.print(sensor.moisture); Serial.println(" %");
    Serial.print("EC          : "); Serial.print(sensor.conductivity); Serial.println(" uS/cm");
    Serial.print("pH          : "); Serial.println(sensor.ph);
    Serial.print("Nitrogen    : "); Serial.print(sensor.nitrogen); Serial.println(" mg/kg");
    Serial.print("Phosphorus  : "); Serial.print(sensor.phosphorus); Serial.println(" mg/kg");
    Serial.print("Potassium   : "); Serial.print(sensor.potassium); Serial.println(" mg/kg");
    Serial.println("-----------------------------");
  }
}


/* =========================================================
   -------------------- RELAY PUMP -------------------------
   ========================================================= */
void pumpControl() {
  if (rs485Busy) return;

  // Manual mode only: do not auto-toggle relay.
  // Relay state must be set by an external control path (web/MQTT/API command).
}


/* =========================================================
   -------------------- PIR + BUZZER -----------------------
   ========================================================= */
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


/* =========================================================
   -------------------- WATER LEVEL ------------------------
   ========================================================= */
void readWaterLevel() {
  if (rs485Busy) return;

  static unsigned long lastPrint = 0;
  if (millis() - lastPrint < 1000) return;
  lastPrint = millis();

  int waterRaw = analogRead(WATER_PIN);

  Serial.print("Water: ");
  if (waterRaw < 400) Serial.println("DRY");
  else if (waterRaw < 1200) Serial.println("LOW");
  else if (waterRaw < 2500) Serial.println("MEDIUM");
  else Serial.println("HIGH");
}


/* =========================================================
   -------------------- SETUP ------------------------------
   ========================================================= */
void setup() {
  Serial.begin(115200);

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

  Serial.println("ESP32 System Initialized (FINAL STABLE)");
}


/* =========================================================
   -------------------- LOOP -------------------------------
   ========================================================= */
void loop() {
  readNPKSensor();        // MUST be first
  pumpControl();
  handleMotionAndBuzzer();
  readWaterLevel();
}
