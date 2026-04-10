import { Alert, Probe, SensorReading } from '../types';

export interface DashboardSummary {
  totalProbes: number;
  onlineProbes: number;
  offlineProbes: number;
  maintenanceProbes: number;
  activeAlerts: number;
  criticalAlerts: number;
  averageBattery: number;
  averageMoisture: number;
  averageTemperature: number;
  averageHumidity: number;
}

export interface DashboardOverview {
  probes: Probe[];
  alerts: Alert[];
  recentReadings: SensorReading[];
  summary: DashboardSummary;
  generatedAt: Date;
}

interface DashboardOverviewResponse {
  success: boolean;
  data: {
    probes: Array<Record<string, unknown>>;
    alerts: Array<Record<string, unknown>>;
    recentReadings: Array<Record<string, unknown>>;
    summary: DashboardSummary;
    generatedAt: string;
  };
}

const toDate = (value: unknown): Date => {
  if (value instanceof Date) {
    return value;
  }

  return new Date(value as string);
};

const normalizeReading = (reading: Record<string, unknown>): SensorReading => ({
  timestamp: toDate(reading.timestamp),
  soilMoisture: Number(reading.soilMoisture ?? 0),
  temperature: Number(reading.temperature ?? 0),
  humidity: Number(reading.humidity ?? 0),
  pH: Number(reading.pH ?? 0),
  conductivity: Number(reading.conductivity ?? 0),
  nitrogen: Number(reading.nitrogen ?? 0),
  phosphorus: Number(reading.phosphorus ?? 0),
  potassium: Number(reading.potassium ?? 0),
  waterTankLevel: Number(reading.waterTankLevel ?? 0),
  batteryLevel: Number(reading.batteryLevel ?? 0),
  signalStrength: Number(reading.signalStrength ?? 0),
  microNutrients: {
    iron: 0,
    zinc: 0,
    manganese: 0,
    copper: 0,
    boron: 0,
    molybdenum: 0,
  },
  macroNutrients: {
    calcium: 0,
    magnesium: 0,
    sulfur: 0,
  },
});

const normalizeProbe = (probe: Record<string, unknown>): Probe => {
  const location = (probe.location as Record<string, unknown>) || {};
  const battery = (probe.battery as Record<string, unknown>) || {};
  const wifi = (probe.wifi as Record<string, unknown>) || {};
  const lastReading = probe.lastReading ? normalizeReading(probe.lastReading as Record<string, unknown>) : normalizeReading({
    timestamp: probe.lastActive,
    soilMoisture: 0,
    temperature: 0,
    humidity: 0,
    pH: 0,
    nitrogen: 0,
    phosphorus: 0,
    potassium: 0,
  });

  return {
    id: String(probe._id ?? probe.id ?? probe.uuid ?? ''),
    uuid: String(probe.uuid ?? ''),
    name: String(probe.name ?? 'Unknown Probe'),
    groupId: probe.groupId ? String(probe.groupId) : undefined,
    status: (probe.status as Probe['status']) || 'offline',
    batteryLevel: Number(battery.level ?? 0),
    wifiStrength: Number(wifi.signalStrength ?? 0),
    lastActive: toDate(probe.lastActive ?? new Date()),
    location: {
      latitude: Number(location.latitude ?? 0),
      longitude: Number(location.longitude ?? 0),
      fieldName: String(location.fieldName ?? 'Unknown Field'),
    },
    currentReading: lastReading,
    isBluetoothConnected: false,
    waterTankLevel: Number(lastReading.waterTankLevel ?? 0),
  };
};

const normalizeAlert = (alert: Record<string, unknown>): Alert => ({
  id: String(alert._id ?? alert.id ?? ''),
  type: 'device',
  severity: alert.type === 'critical' ? 'critical' : alert.type === 'warning' ? 'warning' : 'info',
  title: String(alert.title ?? 'Alert'),
  message: String(alert.description ?? alert.message ?? ''),
  timestamp: toDate(alert.createdAt ?? new Date()),
  acknowledged: Boolean(alert.isResolved),
  probeId: alert.probeId ? String(alert.probeId) : undefined,
});

export const fetchDashboardOverview = async (): Promise<DashboardOverview> => {
  const response = await fetch('/api/dashboard/overview');

  if (!response.ok) {
    throw new Error(`Dashboard overview request failed: ${response.status}`);
  }

  const payload = (await response.json()) as DashboardOverviewResponse;

  return {
    probes: payload.data.probes.map(normalizeProbe),
    alerts: payload.data.alerts.map(normalizeAlert),
    recentReadings: payload.data.recentReadings.map(normalizeReading),
    summary: payload.data.summary,
    generatedAt: toDate(payload.data.generatedAt),
  };
};