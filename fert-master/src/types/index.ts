// Core data types for the FertoBot System

export interface SensorReading {
  timestamp: Date;
  soilMoisture: number; // percentage 0-100
  temperature: number; // celsius
  humidity: number; // percentage 0-100
  pH: number; // 0-14 scale
  conductivity: number;
  nitrogen: number; // ppm
  phosphorus: number; // ppm
  potassium: number; // ppm
  waterTankLevel: number; // percentage 0-100
  batteryLevel: number; // percentage 0-100
  signalStrength: number; // percentage 0-100
  microNutrients: MicroNutrients;
  macroNutrients: MacroNutrients;
}

export interface MicroNutrients {
  iron: number;
  zinc: number;
  manganese: number;
  copper: number;
  boron: number;
  molybdenum: number;
}

export interface MacroNutrients {
  calcium: number;
  magnesium: number;
  sulfur: number;
}

export interface Probe {
  id: string;
  uuid: string;
  name: string;
  groupId?: string;
  status: 'online' | 'offline' | 'maintenance';
  batteryLevel: number; // percentage 0-100
  wifiStrength: number; // percentage 0-100
  lastActive: Date;
  location: {
    latitude?: number;
    longitude?: number;
    fieldName: string;
  };
  currentReading: SensorReading;
  isBluetoothConnected: boolean;
  waterTankLevel: number; // percentage 0-100
}

export interface ProbeGroup {
  id: string;
  name: string;
  description: string;
  color: string;
  probeIds: string[];
  averageReadings?: SensorReading;
}

export interface Farm {
  id: string;
  name: string;
  owner: string;
  location: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  probes: Probe[];
  groups: ProbeGroup[];
  totalArea: number; // hectares
  crops: string[];
}

export interface WeatherData {
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    precipitation: number;
    uvIndex: number;
    visibility: number;
    pressure: number;
    condition: string;
    icon: string;
  };
  forecast: Array<{
    date: Date;
    high: number;
    low: number;
    condition: string;
    icon: string;
    precipitation: number;
    humidity: number;
  }>;
}

export interface Recommendation {
  id: string;
  type: 'irrigation' | 'fertilizer' | 'pesticide' | 'harvest' | 'warning';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  probeId?: string;
  groupId?: string;
  actionRequired: boolean;
  timestamp: Date;
  estimatedImpact: string;
  icon: string;
  color: string;
}

export interface Alert {
  id: string;
  type: 'security' | 'weather' | 'device' | 'irrigation' | 'nutrient';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  probeId?: string;
  groupId?: string;
  actionUrl?: string;
}

export interface SprinklerSystem {
  id: string;
  name: string;
  probeId: string;
  status: 'active' | 'inactive' | 'maintenance';
  isAutomatic: boolean;
  schedule: IrrigationSchedule[];
  waterUsage: WaterUsageLog[];
  lastActivation: Date;
  totalRuntime: number; // minutes today
}

export interface IrrigationSchedule {
  id: string;
  name: string;
  enabled: boolean;
  startTime: string; // HH:mm format
  duration: number; // minutes
  days: string[]; // ['monday', 'wednesday', 'friday']
  moistureThreshold?: number; // activate only if moisture below this
  conditions: {
    minTemperature?: number;
    maxTemperature?: number;
    maxWindSpeed?: number;
    noRainHours?: number;
  };
}

export interface WaterUsageLog {
  timestamp: Date;
  duration: number; // minutes
  volume: number; // liters
  trigger: 'manual' | 'scheduled' | 'automatic';
  efficiency: number; // percentage
}

export interface SecurityCamera {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'inactive' | 'maintenance';
  streamUrl?: string;
  recordingEnabled: boolean;
  motionDetection: boolean;
  lastMotionDetected?: Date;
}

export interface SecurityEvent {
  id: string;
  cameraId: string;
  type: 'motion' | 'intrusion' | 'anomaly';
  timestamp: Date;
  confidence: number; // 0-1
  thumbnailUrl?: string;
  videoUrl?: string;
  acknowledged: boolean;
  description: string;
}

export interface BluetoothDevice {
  id: string;
  name: string;
  rssi: number; // signal strength
  isConnected: boolean;
  isRegistered: boolean;
  deviceType: 'probe' | 'sensor' | 'actuator';
}

export interface Report {
  id: string;
  type: 'weekly' | 'monthly' | 'custom';
  name: string;
  generatedAt: Date;
  dateRange: {
    start: Date;
    end: Date;
  };
  probeIds: string[];
  groupIds: string[];
  sections: ReportSection[];
  format: 'pdf' | 'csv' | 'xlsx';
}

export interface ReportSection {
  title: string;
  type: 'summary' | 'chart' | 'table' | 'recommendations';
  data: any;
  chartType?: 'line' | 'bar' | 'pie' | 'scatter';
}

// Chart data types
export interface ChartDataPoint {
  timestamp: Date;
  value: number;
  label?: string;
}

export interface MultiSeriesChartData {
  [key: string]: ChartDataPoint[];
}

// Navigation and UI types
export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
  children?: NavigationItem[];
}

export interface DashboardCard {
  id: string;
  title: string;
  value: string | number;
  unit?: string;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'stable';
    period: string;
  };
  status: 'normal' | 'warning' | 'critical';
  icon: string;
  color: string;
}