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
  isOffline?: boolean;
  cachedAt?: Date;
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

const generateMockOverview = (): DashboardOverview => {
  const probes = [];
  const recentReadings = [];
  for (let i = 1; i <= 50; i++) {
    const isOnline = i <= 44;
    const probe = {
      _id: `probe-${i}`,
      uuid: `FBOT-${1000 + i}`,
      name: `Field Sensor ${i}`,
      status: (isOnline ? 'online' : 'offline') as 'online' | 'offline',
      battery: { level: Math.floor(Math.random() * 50) + 50, voltage: 3.7 },
      location: { fieldName: `Sector ${String.fromCharCode(65 + Math.floor((i - 1) / 10))}-${((i - 1) % 10) + 1}`, latitude: 28.7, longitude: 77.1 },
      lastActive: new Date(),
    };
    probes.push(probe);
    if (isOnline) {
      recentReadings.push({
        _id: `reading-${i}`,
        probeId: probe._id,
        timestamp: new Date(),
        soilMoisture: Math.floor(Math.random() * 40) + 40,
        temperature: Number((Math.random() * 8 + 24).toFixed(1)),
        humidity: Math.floor(Math.random() * 30) + 50,
        pH: Number((Math.random() * 1.5 + 6.2).toFixed(1)),
        conductivity: Math.floor(Math.random() * 300) + 600,
        nitrogen: Math.floor(Math.random() * 40) + 35,
        phosphorus: Math.floor(Math.random() * 30) + 25,
        potassium: Math.floor(Math.random() * 50) + 40,
        batteryLevel: probe.battery.level,
      });
    }
  }
  return {
    probes: probes.map(normalizeProbe),
    alerts: [
      normalizeAlert({ _id: 'alert-1', type: 'info', message: 'Smart irrigation schedule optimized for morning humidity', createdAt: new Date() }),
      normalizeAlert({ _id: 'alert-2', type: 'warning', message: 'Sector B-3 soil moisture is 32% - watering recommended', createdAt: new Date(Date.now() - 3600000) }),
    ],
    recentReadings: recentReadings.map(normalizeReading),
    summary: {
      totalProbes: 50,
      onlineProbes: 44,
      offlineProbes: 6,
      maintenanceProbes: 0,
      activeAlerts: 2,
      criticalAlerts: 0,
      averageBattery: 82,
      averageMoisture: 58,
      averageTemperature: 27.4,
      averageHumidity: 64,
    },
    generatedAt: new Date(),
  };
};

export const CACHE_KEY_OVERVIEW = 'fertobot_overview_cache_v2';
export const CACHE_KEY_HISTORY  = 'fertobot_entries_history_v2';

export const saveOverviewToCache = (overview: DashboardOverview): void => {
  try {
    const payload = {
      ...overview,
      cachedAt: new Date().toISOString(),
    };
    localStorage.setItem(CACHE_KEY_OVERVIEW, JSON.stringify(payload));
  } catch (err) {
    console.warn('Failed to save overview to cache', err);
  }
};

export const saveReadingToHistory = (reading: SensorReading): void => {
  try {
    const existingStr = localStorage.getItem(CACHE_KEY_HISTORY);
    const existing: SensorReading[] = existingStr ? JSON.parse(existingStr) : [];
    const updated = [
      reading,
      ...existing.filter((item) => {
        const t1 = new Date(item.timestamp).getTime();
        const t2 = new Date(reading.timestamp).getTime();
        return Math.abs(t1 - t2) > 60000;
      }),
    ].slice(0, 50);
    localStorage.setItem(CACHE_KEY_HISTORY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save reading history', err);
  }
};

export const getOfflineEntriesHistory = (): SensorReading[] => {
  try {
    const raw = localStorage.getItem(CACHE_KEY_HISTORY);
    if (!raw) return [];
    const parsed: SensorReading[] = JSON.parse(raw);
    return parsed.map((item) => ({
      ...item,
      timestamp: toDate(item.timestamp),
    }));
  } catch {
    return [];
  }
};

export const getCachedOverview = (): DashboardOverview | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY_OVERVIEW);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.probes) || !Array.isArray(parsed.recentReadings)) {
      return null;
    }

    return {
      probes: parsed.probes.map((p: Record<string, unknown>) => ({
        ...p,
        lastActive: toDate(p.lastActive),
        currentReading: p.currentReading
          ? normalizeReading(p.currentReading as Record<string, unknown>)
          : undefined,
      })),
      alerts: (parsed.alerts || []).map((a: Record<string, unknown>) => normalizeAlert(a)),
      recentReadings: parsed.recentReadings.map((r: Record<string, unknown>) => normalizeReading(r)),
      summary: parsed.summary,
      generatedAt: toDate(parsed.generatedAt),
      cachedAt: parsed.cachedAt ? toDate(parsed.cachedAt) : toDate(parsed.generatedAt),
      isOffline: true,
    };
  } catch (err) {
    console.warn('Failed to load cached overview', err);
    return null;
  }
};

export const fetchDashboardOverview = async (forceRefresh = false): Promise<DashboardOverview> => {
  // If browser is explicitly offline, immediately serve from offline cache
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    const cached = getCachedOverview();
    if (cached) {
      return cached;
    }
    const mock = generateMockOverview();
    const offlineMock = { ...mock, isOffline: true, cachedAt: new Date() };
    saveOverviewToCache(offlineMock);
    return offlineMock;
  }

  try {
    const url = forceRefresh ? '/api/dashboard/overview?refresh=true' : '/api/dashboard/overview';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const cached = getCachedOverview();
      if (cached) return cached;
      const mock = generateMockOverview();
      saveOverviewToCache(mock);
      return mock;
    }

    const payload = (await response.json()) as DashboardOverviewResponse;
    if (!payload?.data?.probes) {
      const cached = getCachedOverview();
      if (cached) return cached;
      const mock = generateMockOverview();
      saveOverviewToCache(mock);
      return mock;
    }

    const overview: DashboardOverview = {
      probes: payload.data.probes.map(normalizeProbe),
      alerts: payload.data.alerts.map(normalizeAlert),
      recentReadings: payload.data.recentReadings.map(normalizeReading),
      summary: payload.data.summary,
      generatedAt: toDate(payload.data.generatedAt),
      isOffline: false,
    };

    saveOverviewToCache(overview);
    if (overview.recentReadings.length > 0) {
      saveReadingToHistory(overview.recentReadings[0]);
    }

    return overview;
  } catch {
    const cached = getCachedOverview();
    if (cached) {
      return cached;
    }
    const mock = generateMockOverview();
    const offlineMock = { ...mock, isOffline: true, cachedAt: new Date() };
    saveOverviewToCache(offlineMock);
    if (offlineMock.recentReadings.length > 0) {
      saveReadingToHistory(offlineMock.recentReadings[0]);
    }
    return offlineMock;
  }
};