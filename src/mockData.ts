import {
  User,
  SensorTelemetry,
  ProbeDevice,
  IrrigationZone,
  IrrigationSchedule,
  SecurityCamera,
  SecurityAlert,
  AgroAlert,
  AgroRecommendation,
  ChatMessage,
  CustomFeature,
  FarmProfile
} from './types';

export const INITIAL_USER: User = {
  id: 'PRINCE-01',
  name: 'Prince (Farm Lead)',
  email: 'prince@fertobot.com',
  role: 'farmer',
  farmName: 'Prince AgriTech Hub',
  avatar: '👨‍🌾',
  joinedDate: 'Oct 2026',
};

// Two dedicated logins requested by the user + quick fallback
export const DEMO_ACCOUNTS = [
  {
    id: 'prince',
    email: 'prince@fertobot.com',
    pass: 'prince123',
    name: 'Prince',
    role: 'farmer' as const,
    farm: 'Prince AgriTech Hub',
    badge: 'Your Account'
  },
  {
    id: 'friend',
    email: 'friend@fertobot.com',
    pass: 'friend123',
    name: 'Friend / Co-Farmer',
    role: 'agronomist' as const,
    farm: 'Prince AgriTech Hub (Sector 2)',
    badge: "Friend's Account"
  },
  {
    id: 'demo@fertobot.com',
    email: 'demo@fertobot.com',
    pass: 'demo1234',
    name: 'Guest Farmer',
    role: 'farmer' as const,
    farm: 'Demonstration Farm',
    badge: 'Guest Account'
  }
];

export const INITIAL_FARM_PROFILE: FarmProfile = {
  farmName: 'Prince AgriTech Hub',
  ownerName: 'Prince',
  region: 'Upper Gangetic Plains (Alluvial Soil Belt)',
  soilType: 'Alluvial Loamy Clay',
  totalHectares: 28.0,
  primaryCrop: 'Golden Durum Wheat',
  cropStage: 'Tillering & Vegetative Growth (Day 42)',
  sowingDate: '2025-11-20',
  weatherCity: 'Varanasi, Uttar Pradesh',
  language: 'en',
};

export const INDIAN_SOIL_REGIONS = [
  'Upper Gangetic Plains - Alluvial Soil',
  'Upper Gangetic Plains - Calcareous Alluvial',
  'Middle Gangetic Plains - Saline Alkaline Soil',
  'Southern Plateau (Karnataka / Tamil Nadu) - Black Cotton Soil',
  'Southern Plateau - Red Loamy & Laterite Soil',
  'Western Arid Region (Thar Desert) - Arid Desert Sandy Soil',
  'Western Coastal Plains (Konkan) - Laterite Soil',
  'Semi-Arid Gujarat & Rajasthan - Mixed Red-Black Soil',
  'Northeastern Hills - Acidic Hill Soil',
  'Western Ghats - Forest & Podzolic Mountain Soil'
];

export const CROPS_CATALOG = [
  { name: 'Wheat (गेहूं)', category: 'Cereal', duration: '120 days', waterNeed: 'Medium', idealPh: '6.0 - 7.5' },
  { name: 'Paddy / Basmati Rice (धान)', category: 'Cereal', duration: '140 days', waterNeed: 'High', idealPh: '5.5 - 6.5' },
  { name: 'Cotton (कपास)', category: 'Fiber', duration: '160 days', waterNeed: 'Medium-High', idealPh: '6.5 - 8.0' },
  { name: 'Sugarcane (गन्ना)', category: 'Cash Crop', duration: '360 days', waterNeed: 'Very High', idealPh: '6.0 - 7.5' },
  { name: 'Tomato (टमाटर)', category: 'Vegetable', duration: '90 days', waterNeed: 'Moderate', idealPh: '6.0 - 6.8' },
  { name: 'Maize / Corn (मक्का)', category: 'Cereal', duration: '100 days', waterNeed: 'Medium', idealPh: '5.8 - 7.0' },
  { name: 'Mustard (सरसों)', category: 'Oilseed', duration: '110 days', waterNeed: 'Low-Medium', idealPh: '6.0 - 7.2' },
  { name: 'Soybean (सोयाबीन)', category: 'Legume', duration: '95 days', waterNeed: 'Medium', idealPh: '6.2 - 7.0' },
];

export const INITIAL_TELEMETRY: SensorTelemetry = {
  timestamp: new Date().toISOString(),
  soilMoisture: 62.4, // %
  temperature: 24.8, // °C
  humidity: 68.2, // %
  pH: 6.7,
  nitrogen: 48, // ppm
  phosphorus: 32, // ppm
  potassium: 54, // ppm
  conductivity: 1.42, // dS/m
  waterTankLevel: 84, // %
  batteryLevel: 91, // %
  signalStrength: 94, // %
  microNutrients: {
    iron: 14.8,
    zinc: 8.6,
    manganese: 12.4,
    copper: 3.2,
    boron: 1.1,
    molybdenum: 0.6,
  },
  macroNutrients: {
    calcium: 185,
    magnesium: 62,
    sulfur: 28,
  }
};

export const INITIAL_PROBES: ProbeDevice[] = [
  {
    id: 'PRB-001',
    uuid: 'fb-esp32-node-01',
    name: 'Sector Alpha - Deep Root Probe',
    zone: 'Zone 1 (Wheat Field North)',
    depthCm: 45,
    status: 'online',
    batteryLevel: 94,
    signalStrength: 92,
    lastActive: 'Just now',
    location: { fieldName: 'North Field A', lat: 25.3176, lng: 82.9739 },
    currentTelemetry: { ...INITIAL_TELEMETRY, soilMoisture: 64.2, temperature: 24.1, pH: 6.8, nitrogen: 52 }
  },
  {
    id: 'PRB-002',
    uuid: 'fb-esp32-node-02',
    name: 'Sector Beta - Surface Sensor',
    zone: 'Zone 2 (Vegetable Polyhouse)',
    depthCm: 15,
    status: 'online',
    batteryLevel: 88,
    signalStrength: 86,
    lastActive: '1 min ago',
    location: { fieldName: 'Polyhouse B', lat: 25.3182, lng: 82.9745 },
    currentTelemetry: { ...INITIAL_TELEMETRY, soilMoisture: 58.5, temperature: 26.4, pH: 6.5, nitrogen: 44, phosphorus: 36 }
  },
  {
    id: 'PRB-003',
    uuid: 'fb-esp32-node-03',
    name: 'Sector Gamma - Orchard Drip Node',
    zone: 'Zone 3 (Citrus & Mango Orchard)',
    depthCm: 60,
    status: 'online',
    batteryLevel: 79,
    signalStrength: 78,
    lastActive: '3 mins ago',
    location: { fieldName: 'South Orchard', lat: 25.3168, lng: 82.9725 },
    currentTelemetry: { ...INITIAL_TELEMETRY, soilMoisture: 51.0, temperature: 25.0, pH: 7.1, potassium: 59 }
  },
  {
    id: 'PRB-004',
    uuid: 'fb-esp32-node-04',
    name: 'Sector Delta - Nursery Bed Probe',
    zone: 'Zone 4 (Nursery Germination)',
    depthCm: 20,
    status: 'warning',
    batteryLevel: 28,
    signalStrength: 65,
    lastActive: '12 mins ago',
    location: { fieldName: 'Seedling Shade', lat: 25.3190, lng: 82.9750 },
    currentTelemetry: { ...INITIAL_TELEMETRY, soilMoisture: 38.2, temperature: 28.5, batteryLevel: 28 }
  },
  {
    id: 'PRB-005',
    uuid: 'fb-esp32-node-05',
    name: 'Sector Epsilon - Perimeter Sensor',
    zone: 'Zone 5 (Boundary Buffer)',
    depthCm: 30,
    status: 'maintenance',
    batteryLevel: 14,
    signalStrength: 0,
    lastActive: '2 hours ago',
    location: { fieldName: 'West Fence', lat: 25.3155, lng: 82.9710 },
    currentTelemetry: { ...INITIAL_TELEMETRY, soilMoisture: 42.0, batteryLevel: 14, signalStrength: 0 }
  }
];

export const INITIAL_IRRIGATION_ZONES: IrrigationZone[] = [
  {
    id: 'IRR-Z1',
    name: 'Main Sprinkler Array 01',
    sector: 'Zone 1 (Wheat Field North)',
    status: 'inactive',
    mode: 'auto',
    currentMoisture: 64,
    targetMoisture: 70,
    flowRateLpm: 38.5,
    litersToday: 1450,
    runDurationMin: 25,
    lastRun: 'Today, 06:15 AM',
    nextScheduled: 'Today, 06:00 PM',
    valveHealth: 'good'
  },
  {
    id: 'IRR-Z2',
    name: 'Misting System (Polyhouse)',
    sector: 'Zone 2 (Vegetable Polyhouse)',
    status: 'active',
    mode: 'auto',
    currentMoisture: 58,
    targetMoisture: 65,
    flowRateLpm: 18.2,
    litersToday: 620,
    runDurationMin: 15,
    lastRun: 'Running Now',
    nextScheduled: 'Continuous humidity cycles',
    valveHealth: 'good'
  },
  {
    id: 'IRR-Z3',
    name: 'Subsurface Drip Line 3',
    sector: 'Zone 3 (Citrus & Mango Orchard)',
    status: 'scheduled',
    mode: 'auto',
    currentMoisture: 51,
    targetMoisture: 60,
    flowRateLpm: 45.0,
    litersToday: 2100,
    runDurationMin: 40,
    lastRun: 'Yesterday, 07:00 PM',
    nextScheduled: 'Today, 09:30 PM',
    valveHealth: 'good'
  },
  {
    id: 'IRR-Z4',
    name: 'Micro-Sprinklers Nursery',
    sector: 'Zone 4 (Nursery Germination)',
    status: 'inactive',
    mode: 'manual',
    currentMoisture: 38,
    targetMoisture: 65,
    flowRateLpm: 12.0,
    litersToday: 380,
    runDurationMin: 10,
    lastRun: 'Today, 08:00 AM',
    nextScheduled: 'Manual trigger only',
    valveHealth: 'check_filter'
  }
];

export const INITIAL_SCHEDULES: IrrigationSchedule[] = [
  {
    id: 'SCH-1',
    zoneId: 'IRR-Z1',
    zoneName: 'Main Sprinkler Array 01',
    time: '06:00 AM',
    durationMinutes: 30,
    days: ['Mon', 'Wed', 'Fri', 'Sun'],
    enabled: true,
    minMoistureTrigger: 50
  },
  {
    id: 'SCH-2',
    zoneId: 'IRR-Z2',
    zoneName: 'Misting System (Polyhouse)',
    time: '12:30 PM',
    durationMinutes: 15,
    days: ['Daily'],
    enabled: true,
    minMoistureTrigger: 55
  },
  {
    id: 'SCH-3',
    zoneId: 'IRR-Z3',
    zoneName: 'Subsurface Drip Line 3',
    time: '09:00 PM',
    durationMinutes: 45,
    days: ['Tue', 'Thu', 'Sat'],
    enabled: true,
    minMoistureTrigger: 45
  }
];

export const INITIAL_CAMERAS: SecurityCamera[] = [
  {
    id: 'CAM-01',
    name: 'North Crop Perimeter & Entry',
    location: 'Sector 1 Gate',
    status: 'recording',
    fps: 30,
    nightVision: false,
    motionDetected: false,
    streamType: 'RGB',
    detectedObjects: [
      { label: 'Farm Tractor', confidence: 0.96, box: [20, 45, 28, 35], type: 'vehicle' }
    ]
  },
  {
    id: 'CAM-02',
    name: 'Pump House & Chemical Store',
    location: 'Central Control Hub',
    status: 'online',
    fps: 25,
    nightVision: true,
    motionDetected: true,
    lastMotion: '3 mins ago',
    streamType: 'Night-IR',
    detectedObjects: [
      { label: 'Field Rodent / Pest', confidence: 0.88, box: [65, 70, 12, 14], type: 'pest' }
    ]
  },
  {
    id: 'CAM-03',
    name: 'South Orchard Boundary',
    location: 'Forest Buffer Line',
    status: 'recording',
    fps: 30,
    nightVision: false,
    motionDetected: true,
    lastMotion: '12 mins ago',
    streamType: 'RGB',
    detectedObjects: [
      { label: 'Wild Nilgai Antelope', confidence: 0.92, box: [40, 30, 24, 40], type: 'wildlife' }
    ]
  }
];

export const INITIAL_SECURITY_ALERTS: SecurityAlert[] = [
  {
    id: 'SEC-101',
    cameraId: 'CAM-03',
    cameraName: 'South Orchard Boundary',
    type: 'wildlife',
    severity: 'high',
    title: 'Wildlife Intrusion Detected (Nilgai herd)',
    description: 'AI Vision detected 2 large herbivores grazing near citrus saplings in buffer sector.',
    timestamp: '12 mins ago',
    confidence: 0.92,
    acknowledged: false
  },
  {
    id: 'SEC-102',
    cameraId: 'CAM-02',
    cameraName: 'Pump House & Chemical Store',
    type: 'pest',
    severity: 'medium',
    title: 'Night Motion: Pest Activity near Feed Storage',
    description: 'Thermal camera observed nocturnal rodent motion by nutrient tanks.',
    timestamp: '1 hour ago',
    confidence: 0.88,
    acknowledged: true
  }
];

export const INITIAL_AGRO_ALERTS: AgroAlert[] = [
  {
    id: 'ALT-1',
    type: 'moisture',
    severity: 'warning',
    title: 'Low Moisture in Nursery Bed',
    message: 'Sector Delta moisture dropped to 38.2% (Recommended threshold: 55%).',
    time: '25m ago',
    acknowledged: false,
    actionRequired: 'Trigger Micro-Sprinkler Zone 4',
    zone: 'Zone 4'
  },
  {
    id: 'ALT-2',
    type: 'nutrient',
    severity: 'info',
    title: 'Phosphorus Optimization Window',
    message: 'Root uptake conditions optimal. Soil temperature 24°C favors DAP application.',
    time: '1h ago',
    acknowledged: false,
    actionRequired: 'Review fertilizer schedule',
    zone: 'Zone 1'
  },
  {
    id: 'ALT-3',
    type: 'device',
    severity: 'critical',
    title: 'Hardware Battery Critical',
    message: 'Sector Epsilon probe battery is at 14%. Solar charging panel requires cleaning.',
    time: '2h ago',
    acknowledged: true,
    actionRequired: 'Inspect Node 05 solar panel',
    zone: 'Zone 5'
  }
];

export const INITIAL_RECOMMENDATIONS: AgroRecommendation[] = [
  {
    id: 'REC-1',
    category: 'fertilizer',
    priority: 'urgent',
    title: 'Urea Top-Dressing for Tillering Stage',
    action: 'Apply 35 kg/ha Nitrogen (Urea 46%) ahead of upcoming evening irrigation.',
    reasoning: 'Current Nitrogen reading is 48 ppm, slightly below the 60 ppm tillering target for Durum Wheat.',
    estimatedImpact: '+14% Expected Grain Weight & Tiller Density',
    targetZone: 'Zone 1 (Wheat Field North)',
    cropTarget: 'Wheat'
  },
  {
    id: 'REC-2',
    category: 'irrigation',
    priority: 'recommended',
    title: 'Optimize Irrigation Schedule for Rain Forecast',
    action: 'Postpone North Field 30-min cycle to Wednesday. Light showers forecasted tomorrow night.',
    reasoning: 'Soil moisture is stable at 62.4% and rainfall probability is 75% over next 36 hours.',
    estimatedImpact: 'Saves ~4,200 Liters of Ground Water & Prevents Leaching',
    targetZone: 'Zone 1 & Zone 3',
    cropTarget: 'Wheat & Orchard'
  },
  {
    id: 'REC-3',
    category: 'pest_control',
    priority: 'optimal',
    title: 'Preventive Neem Bio-Spray for Aphids',
    action: 'Foliar spray with 5ml/L Cold-Pressed Neem Oil (Azadirachtin 10,000 ppm).',
    reasoning: 'Relative humidity reached 68% with morning dew, elevating aphid nymph colonization index.',
    estimatedImpact: 'Organic Pest Prevention without chemical residues',
    targetZone: 'Zone 2 (Vegetable Polyhouse)',
    cropTarget: 'Polyhouse Vegetables'
  }
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'assistant',
    text: 'Namaskar Prince ji! 🙏 I am FertoBot AI, your personal Smart Agronomist. All 5 field probes, soil sensors, and irrigation valves are synchronized. How can I assist your farm today?',
    timestamp: '09:00 AM',
    category: 'telemetry'
  },
  {
    id: 'msg-2',
    sender: 'user',
    text: 'Meri fasal ki condition kya hai aur kya aaj paani dena chahiye?',
    timestamp: '09:02 AM',
  },
  {
    id: 'msg-3',
    sender: 'assistant',
    text: 'Aapki fasal (Wheat) ki sthiti bahut achhi hai! 🌱 Current average moisture 62.4% hai aur soil pH 6.7 ekdam anukool hai.\n\n💧 Irrigation Advice: Sector 1 (Wheat) mein aaj paani rok sakte hain kyunki kal barish ke 75% aasaar hain. Sector 4 (Nursery) mein 10 minute ka micro-sprinkling anukool rahega.',
    timestamp: '09:02 AM',
    category: 'irrigation'
  }
];

export const INITIAL_CUSTOM_FEATURES: CustomFeature[] = [
  {
    id: 'FEAT-DRONE-01',
    title: 'Autonomous Drone Pesticide & Bio-Fertilizer Spraying',
    userPrompt: 'add drone spraying scheduler with flight route maps and payload tank level',
    category: 'Drone & Robotics',
    status: 'live',
    priority: 'Game-Changer',
    createdAt: '2026-10-10',
    pinnedToDashboard: true,
    widgetType: 'action_slider',
    currentValue: 78,
    unit: '% Payload Capacity',
    metricLabel: 'Drone Battery: 88% | Altitude: 2.5m | Speed: 14 km/h',
    summary: 'Automates DJI Agras & Krishi drone waypoint missions. Synchronizes spraying precisely with low-wind hours and sensor pest hotspot coordinates.',
    interactiveOptions: ['Launch Route A (North)', 'Calibrate Nozzle Flow', 'Return to Charging Pad']
  },
  {
    id: 'FEAT-MANDI-02',
    title: 'Live APMC Mandi Wholesale Price Ticker & Profit Estimator',
    userPrompt: 'i want live mandi bhav prices for wheat and vegetables and profit calculator',
    category: 'Market & Mandi',
    status: 'live',
    priority: 'Must-Have',
    createdAt: '2026-10-10',
    pinnedToDashboard: true,
    widgetType: 'metric_gauge',
    currentValue: '₹2,640',
    unit: '/ Quintal (Wheat)',
    metricLabel: 'Varanasi Mandi: +₹65 (2.5%) today | Highest: ₹2,710',
    summary: 'Direct e-NAM API feed displaying wholesale market rates across your 5 nearest APMC grain and vegetable mandis with dynamic harvest profit projection.',
    interactiveOptions: ['Varanasi APMC', 'Kanpur Mandi', 'Indore Market', 'Azamgarh Yard']
  },
  {
    id: 'FEAT-VISION-03',
    title: 'AI Leaf Disease & Blight Scanner (Photo Diagnostics)',
    userPrompt: 'scan leaves with camera to detect fungal rust, leaf curl and nutrient deficiency',
    category: 'AI & Vision',
    status: 'live',
    priority: 'Must-Have',
    createdAt: '2026-10-11',
    pinnedToDashboard: false,
    widgetType: 'ai_scanner',
    currentValue: 98.4,
    unit: '% Health Confidence',
    metricLabel: 'Zero Leaf Rust detected | Mild Nitrogen Chlorosis on Lower Leaf Nodes',
    summary: 'Neural network model trained on 150,000+ crop foliage images. Point your phone camera or upload a leaf photo to diagnose bacterial, fungal, or viral pathogen damage.',
    interactiveOptions: ['Upload Leaf Photo', 'Run Realtime Scan', 'Generate Treatment Plan']
  },
  {
    id: 'FEAT-SOLAR-04',
    title: 'Solar Inverter & PM-KUSUM Water Pump Optimizer',
    userPrompt: 'add solar panel power generation tracking and auto pump run when solar power is peak',
    category: 'Automation',
    status: 'live',
    priority: 'Game-Changer',
    createdAt: '2026-10-11',
    pinnedToDashboard: true,
    widgetType: 'toggle_switch',
    currentValue: true,
    unit: 'Peak Solar Tracking Active',
    metricLabel: 'Solar Yield: 4.8 kW | Grid Power Saved: 16.2 kWh today',
    summary: 'Coordinates your 7.5 HP solar irrigation pump with real-time PV generation curve so heavy irrigation runs for free without consuming grid electricity.',
    interactiveOptions: ['Sun-Tracking Mode', 'Grid Backup Fallback', 'Battery Storage Priority']
  },
  {
    id: 'FEAT-CARBON-05',
    title: 'Soil Organic Carbon (SOC) & Green Credit Ledger',
    userPrompt: 'track soil carbon sequestration and calculate verified green credits for regenerative farming',
    category: 'Soil Science',
    status: 'building',
    priority: 'Enhancement',
    createdAt: '2026-10-11',
    pinnedToDashboard: false,
    widgetType: 'metric_gauge',
    currentValue: '1.42',
    unit: '% SOC Level',
    metricLabel: 'Credits Accrued: 18.5 Verified Green Credits (~$370 value)',
    summary: 'Calculates active humus accumulation and carbon capture index based on organic mulch, no-till practice, and NPK microbial balance.',
    interactiveOptions: ['Export Carbon Audit', 'Connect Verra Registry', 'Simulate Compost Benefit']
  }
];

export const TELEMETRY_24H_HISTORY = [
  { time: '00:00', moisture: 65, temp: 19, nitrogen: 50, ph: 6.7 },
  { time: '03:00', moisture: 64, temp: 18, nitrogen: 49, ph: 6.7 },
  { time: '06:00', moisture: 68, temp: 18, nitrogen: 52, ph: 6.8 },
  { time: '09:00', moisture: 66, temp: 22, nitrogen: 50, ph: 6.7 },
  { time: '12:00', moisture: 61, temp: 26, nitrogen: 48, ph: 6.6 },
  { time: '15:00', moisture: 59, temp: 27, nitrogen: 47, ph: 6.6 },
  { time: '18:00', moisture: 62, temp: 23, nitrogen: 48, ph: 6.7 },
  { time: '21:00', moisture: 63, temp: 20, nitrogen: 49, ph: 6.7 },
  { time: 'Now',   moisture: 62, temp: 24, nitrogen: 48, ph: 6.7 },
];
