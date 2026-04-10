import mqtt, { MqttClient } from 'mqtt';
import Probe from '../models/Probe';
import SensorReading from '../models/SensorReading';
import logger from '../config/logger';

type TelemetryPayload = {
  deviceId?: string;
  probeId?: string;
  soilMoisture?: number;
  temperature?: number;
  humidity?: number;
  pH?: number;
  ph?: number;
  conductivity?: number;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  waterTankLevel?: number;
  waterLevel?: string;
  batteryLevel?: number;
  signalStrength?: number;
  timestamp?: number | string;
};

let client: MqttClient | null = null;

const telemetryTopic = 'fertobot/probes/+/sensor-data';
const statusTopic = 'fertobot/probes/+/status';
const motionTopic = 'fertobot/probes/+/motion';

const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

const normalizeSignalStrength = (rawSignal: unknown): number => {
  const value = Number(rawSignal ?? 0);

  if (!Number.isFinite(value)) {
    return 0;
  }

  if (value >= 0 && value <= 100) {
    return value;
  }

  if (value <= -100) {
    return 0;
  }

  if (value >= -50) {
    return 100;
  }

  return Math.round((value + 100) * 2);
};

const normalizeWaterLevel = (payload: TelemetryPayload): number => {
  if (typeof payload.waterTankLevel === 'number' && Number.isFinite(payload.waterTankLevel)) {
    return clamp(payload.waterTankLevel, 0, 100);
  }

  const level = (payload.waterLevel || '').toUpperCase();
  if (level === 'HIGH') return 100;
  if (level === 'MEDIUM') return 65;
  if (level === 'LOW') return 30;
  if (level === 'DRY') return 5;
  return 0;
};

const parseProbeUuidFromTopic = (topic: string): string | null => {
  const parts = topic.split('/');
  if (parts.length < 4) {
    return null;
  }
  return parts[2] || null;
};

const persistTelemetry = async (probeUuid: string, payload: TelemetryPayload): Promise<void> => {
  const probe = await Probe.findOne({ uuid: probeUuid, isActive: true });

  if (!probe) {
    logger.warn(`MQTT telemetry ignored: probe not found for uuid=${probeUuid}`);
    return;
  }

  const reading = await SensorReading.create({
    probeId: probe._id,
    userId: probe.userId,
    timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
    soilMoisture: Number(payload.soilMoisture ?? 0),
    temperature: Number(payload.temperature ?? 0),
    humidity: Number(payload.humidity ?? 0),
    pH: Number(payload.pH ?? payload.ph ?? 0),
    conductivity: Number(payload.conductivity ?? 0),
    nitrogen: Number(payload.nitrogen ?? 0),
    phosphorus: Number(payload.phosphorus ?? 0),
    potassium: Number(payload.potassium ?? 0),
    waterTankLevel: normalizeWaterLevel(payload),
    batteryLevel: clamp(Number(payload.batteryLevel ?? 100), 0, 100),
    signalStrength: normalizeSignalStrength(payload.signalStrength),
    isAnomaly: false,
  });

  await Probe.findByIdAndUpdate(probe._id, {
    status: 'online',
    lastActive: new Date(),
    lastReading: reading._id,
    'battery.level': clamp(Number(payload.batteryLevel ?? 100), 0, 100),
    'battery.lastUpdated': new Date(),
    'wifi.signalStrength': normalizeSignalStrength(payload.signalStrength),
    'wifi.lastConnected': new Date(),
  });
};

export const startMqttService = (): void => {
  if (client) {
    return;
  }

  const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
  const username = process.env.MQTT_USERNAME;
  const password = process.env.MQTT_PASSWORD;

  client = mqtt.connect(brokerUrl, {
    username,
    password,
    reconnectPeriod: 2000,
    keepalive: 30,
  });

  client.on('connect', () => {
    logger.info(`MQTT connected to ${brokerUrl}`);
    client?.subscribe([telemetryTopic, statusTopic, motionTopic], (error) => {
      if (error) {
        logger.error(`MQTT subscribe failed: ${error.message}`);
      } else {
        logger.info('MQTT subscriptions active for probe telemetry/status/motion');
      }
    });
  });

  client.on('reconnect', () => {
    logger.info('MQTT reconnecting...');
  });

  client.on('error', (error) => {
    logger.error(`MQTT error: ${error.message}`);
  });

  client.on('message', async (topic, messageBuffer) => {
    if (!topic.endsWith('/sensor-data')) {
      return;
    }

    const probeUuid = parseProbeUuidFromTopic(topic);
    if (!probeUuid) {
      logger.warn(`MQTT telemetry ignored: invalid topic=${topic}`);
      return;
    }

    try {
      const payload = JSON.parse(messageBuffer.toString()) as TelemetryPayload;
      await persistTelemetry(probeUuid, payload);
    } catch (error) {
      logger.error('MQTT telemetry processing failed', error);
    }
  });
};

export const publishProbeControl = async (
  probeUuid: string,
  command: Record<string, unknown>
): Promise<void> => {
  if (!client || !client.connected) {
    throw new Error('MQTT is not connected');
  }

  const topic = `fertobot/probes/${probeUuid}/control`;
  const payload = JSON.stringify(command);

  await new Promise<void>((resolve, reject) => {
    client?.publish(topic, payload, { qos: 1 }, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

export const stopMqttService = (): void => {
  if (!client) {
    return;
  }

  client.end(true);
  client = null;
};
