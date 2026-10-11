// Types for FertoBot Next-Gen OS

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'farmer' | 'agronomist' | 'admin';
  farmName: string;
  avatar?: string;
  joinedDate: string;
}

export interface SensorTelemetry {
  timestamp: string;
  soilMoisture: number; // 0 - 100 %
  temperature: number; // Celsius
  humidity: number; // 0 - 100 %
  pH: number; // 0 - 14
  nitrogen: number; // ppm
  phosphorus: number; // ppm
  potassium: number; // ppm
  conductivity: number; // dS/m (EC)
  waterTankLevel: number; // 0 - 100 %
  batteryLevel: number; // 0 - 100 %
  signalStrength: number; // 0 - 100 %
  microNutrients: {
    iron: number; // ppm
    zinc: number; // ppm
    manganese: number; // ppm
    copper: number; // ppm
    boron: number; // ppm
    molybdenum: number; // ppm
  };
  macroNutrients: {
    calcium: number; // ppm
    magnesium: number; // ppm
    sulfur: number; // ppm
  };
}

export interface ProbeDevice {
  id: string;
  uuid: string;
  name: string;
  zone: string;
  depthCm: number;
  status: 'online' | 'offline' | 'maintenance' | 'warning';
  batteryLevel: number;
  signalStrength: number;
  lastActive: string;
  location: {
    fieldName: string;
    lat: number;
    lng: number;
  };
  currentTelemetry: SensorTelemetry;
}

export interface IrrigationZone {
  id: string;
  name: string;
  sector: string;
  status: 'active' | 'inactive' | 'scheduled';
  mode: 'auto' | 'manual';
  currentMoisture: number;
  targetMoisture: number;
  flowRateLpm: number;
  litersToday: number;
  runDurationMin: number;
  lastRun: string;
  nextScheduled?: string;
  valveHealth: 'good' | 'check_filter' | 'low_pressure';
}

export interface IrrigationSchedule {
  id: string;
  zoneId: string;
  zoneName: string;
  time: string;
  durationMinutes: number;
  days: string[];
  enabled: boolean;
  minMoistureTrigger: number;
}

export interface SecurityCamera {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'recording' | 'offline';
  fps: number;
  nightVision: boolean;
  motionDetected: boolean;
  lastMotion?: string;
  batteryLevel?: number;
  streamType: 'RGB' | 'Thermal' | 'Night-IR';
  detectedObjects: Array<{
    label: string;
    confidence: number;
    box: [number, number, number, number]; // x, y, w, h in %
    type: 'pest' | 'wildlife' | 'human' | 'vehicle';
  }>;
}

export interface SecurityAlert {
  id: string;
  cameraId: string;
  cameraName: string;
  type: 'pest' | 'wildlife' | 'intrusion' | 'hardware';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  confidence: number;
  acknowledged: boolean;
}

export interface AgroAlert {
  id: string;
  type: 'nutrient' | 'moisture' | 'weather' | 'device' | 'pest';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  time: string;
  acknowledged: boolean;
  actionRequired?: string;
  zone?: string;
}

export interface AgroRecommendation {
  id: string;
  category: 'fertilizer' | 'irrigation' | 'pest_control' | 'harvest';
  priority: 'urgent' | 'recommended' | 'optimal';
  title: string;
  action: string;
  reasoning: string;
  estimatedImpact: string;
  targetZone: string;
  cropTarget: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  audioGenerated?: boolean;
  category?: 'telemetry' | 'fertilizer' | 'irrigation' | 'pest';
}

// Custom Dynamic Feature typed by the user!
export interface CustomFeature {
  id: string;
  title: string;
  userPrompt: string; // The text typed by the user
  category: 'Automation' | 'AI & Vision' | 'Drone & Robotics' | 'Irrigation' | 'Market & Mandi' | 'Soil Science' | 'IoT Hardware';
  status: 'live' | 'building' | 'concept';
  priority: 'Must-Have' | 'Game-Changer' | 'Enhancement';
  createdAt: string;
  pinnedToDashboard: boolean;
  widgetType: 'toggle_switch' | 'metric_gauge' | 'action_slider' | 'schedule_timer' | 'ai_scanner';
  currentValue: number | boolean | string;
  unit?: string;
  metricLabel?: string;
  summary: string;
  interactiveOptions?: string[];
}

export interface FarmProfile {
  farmName: string;
  ownerName: string;
  region: string;
  soilType: string;
  totalHectares: number;
  primaryCrop: string;
  cropStage: string;
  sowingDate: string;
  weatherCity: string;
  language: 'en' | 'hi' | 'gu' | 'mr';
}
