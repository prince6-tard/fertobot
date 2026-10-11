import React, { useState, useEffect } from 'react';
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
import {
  INITIAL_USER,
  INITIAL_FARM_PROFILE,
  INITIAL_TELEMETRY,
  INITIAL_PROBES,
  INITIAL_IRRIGATION_ZONES,
  INITIAL_SCHEDULES,
  INITIAL_CAMERAS,
  INITIAL_SECURITY_ALERTS,
  INITIAL_AGRO_ALERTS,
  INITIAL_RECOMMENDATIONS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_CUSTOM_FEATURES
} from './mockData';

import { ParticleCanvas } from './components/ParticleCanvas';
import { Navbar } from './components/Navbar';
import { LoginModal } from './components/LoginModal';

import { DashboardView } from './pages/DashboardView';
import { IrrigationView } from './pages/IrrigationView';
import { ProbesView } from './pages/ProbesView';
import { SecurityView } from './pages/SecurityView';
import { VoiceAssistantView } from './pages/VoiceAssistantView';
import { ReportsView } from './pages/ReportsView';
import { FeatureStudioView } from './pages/FeatureStudioView';
import { FarmProfileView } from './pages/FarmProfileView';
import {
  subscribeToCloudEvents,
  fetchHistoricalEvents,
  SyncPayload
} from './services/syncService';

export function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('fertobot_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [farmProfile, setFarmProfile] = useState<FarmProfile>(() => {
    const saved = localStorage.getItem('fertobot_profile');
    return saved ? JSON.parse(saved) : INITIAL_FARM_PROFILE;
  });

  const [telemetry, setTelemetry] = useState<SensorTelemetry>(() => {
    const saved = localStorage.getItem('fertobot_telemetry');
    return saved ? JSON.parse(saved) : INITIAL_TELEMETRY;
  });

  const [probes, setProbes] = useState<ProbeDevice[]>(INITIAL_PROBES);
  const [zones, setZones] = useState<IrrigationZone[]>(INITIAL_IRRIGATION_ZONES);
  const [schedules, setSchedules] = useState<IrrigationSchedule[]>(INITIAL_SCHEDULES);
  const [cameras, setCameras] = useState<SecurityCamera[]>(INITIAL_CAMERAS);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>(INITIAL_SECURITY_ALERTS);
  const [agroAlerts, setAgroAlerts] = useState<AgroAlert[]>(INITIAL_AGRO_ALERTS);
  const [recommendations, setRecommendations] = useState<AgroRecommendation[]>(INITIAL_RECOMMENDATIONS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);

  const [customFeatures, setCustomFeatures] = useState<CustomFeature[]>(() => {
    const saved = localStorage.getItem('fertobot_custom_features');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOM_FEATURES;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('fertobot_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('fertobot_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('fertobot_custom_features', JSON.stringify(customFeatures));
  }, [customFeatures]);

  useEffect(() => {
    localStorage.setItem('fertobot_profile', JSON.stringify(farmProfile));
  }, [farmProfile]);

  // Synchronize features and comments with Friend in real time & fetch updates
  useEffect(() => {
    // 1. Fetch any features/comments created while away
    fetchHistoricalEvents().then((events) => {
      if (events && events.length > 0) {
        setCustomFeatures((prev) => {
          let updated = [...prev];
          for (const evt of events) {
            if (evt.type === 'NEW_FEATURE' && evt.payload) {
              if (!updated.some((f) => f.id === evt.payload.id)) {
                updated = [evt.payload, ...updated];
              }
            } else if (evt.type === 'NEW_COMMENT' && evt.payload) {
              const comment = evt.payload;
              updated = updated.map((feat) => {
                if (feat.id === comment.featureId) {
                  const existing = feat.comments || [];
                  if (!existing.some((c) => c.id === comment.id)) {
                    return { ...feat, comments: [...existing, comment] };
                  }
                }
                return feat;
              });
            }
          }
          return updated;
        });
      }
    });

    // 2. Subscribe to live stream for real-time collaboration
    const unsubscribe = subscribeToCloudEvents((event: SyncPayload) => {
      if (event.type === 'NEW_FEATURE' && event.payload) {
        setCustomFeatures((prev) => {
          if (prev.some((f) => f.id === event.payload.id)) return prev;
          return [event.payload, ...prev];
        });
        setToastMessage(`🔔 ${event.senderName || 'Your friend'} added new feature: "${event.payload.title}"`);
        setTimeout(() => setToastMessage(null), 5000);
      } else if (event.type === 'NEW_COMMENT' && event.payload) {
        const comment = event.payload;
        setCustomFeatures((prev) =>
          prev.map((feat) => {
            if (feat.id === comment.featureId) {
              const existing = feat.comments || [];
              if (existing.some((c) => c.id === comment.id)) return feat;
              return { ...feat, comments: [...existing, comment] };
            }
            return feat;
          })
        );
        setToastMessage(`💬 ${event.senderName || 'Friend'} posted feedback on a feature.`);
        setTimeout(() => setToastMessage(null), 4000);
      }
    });

    return () => unsubscribe();
  }, []);

  const computeHealth = (): number => {
    let score = 98;
    if (telemetry.soilMoisture < 40 || telemetry.soilMoisture > 80) score -= 14;
    if (telemetry.pH < 6.0 || telemetry.pH > 7.8) score -= 12;
    if (telemetry.nitrogen < 40) score -= 8;
    if (telemetry.batteryLevel < 30) score -= 10;
    const offlineCount = probes.filter((p) => p.status !== 'online').length;
    score -= offlineCount * 5;
    return Math.max(10, Math.min(100, score));
  };

  const healthScore = computeHealth();

  const handleSimulateRain = () => {
    setTelemetry((prev) => ({
      ...prev,
      soilMoisture: Math.min(100, prev.soilMoisture + 18),
      temperature: Math.max(14, prev.temperature - 3.2),
      humidity: Math.min(99, prev.humidity + 15),
      waterTankLevel: Math.min(100, prev.waterTankLevel + 10),
    }));
    setToastMessage('Rain simulated: Soil moisture increased (+18%).');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSimulateDepletion = () => {
    setTelemetry((prev) => ({
      ...prev,
      soilMoisture: Math.max(25, prev.soilMoisture - 14),
      nitrogen: Math.max(20, prev.nitrogen - 16),
      phosphorus: Math.max(15, prev.phosphorus - 10),
      temperature: prev.temperature + 2.5,
    }));
    const newAlert: AgroAlert = {
      id: `ALT-SIM-${Date.now()}`,
      type: 'nutrient',
      severity: 'warning',
      title: 'Rapid Nutrient Depletion Alert',
      message: 'Nitrogen dropped to low threshold (<35 ppm).',
      time: 'Just now',
      acknowledged: false,
      actionRequired: 'Trigger Nitrogen dosing in Sector 1',
    };
    setAgroAlerts((prev) => [newAlert, ...prev]);
    setToastMessage('Depletion simulated: Low nutrient warning raised.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSimulateIntrusion = () => {
    const newSecAlert: SecurityAlert = {
      id: `SEC-SIM-${Date.now()}`,
      cameraId: 'CAM-01',
      cameraName: 'North Crop Perimeter',
      type: 'wildlife',
      severity: 'high',
      title: 'Wild Animal Perimeter Breach',
      description: 'AI Vision detected 2 wild boars entering via North Fence.',
      timestamp: 'Just now',
      confidence: 0.94,
      acknowledged: false,
    };
    setSecurityAlerts((prev) => [newSecAlert, ...prev]);
    setToastMessage('Intrusion simulated: Camera AI alert registered.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResetSim = () => {
    setTelemetry(INITIAL_TELEMETRY);
    setProbes(INITIAL_PROBES);
    setToastMessage('Telemetry reset to baseline optimal conditions.');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleAcknowledgeAlert = (id: string) => {
    setAgroAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
  };

  const handleApplyRecommendation = (rec: AgroRecommendation) => {
    setToastMessage(`Advisory applied: "${rec.title}"`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#0B1015] text-slate-100 relative">
      {/* Subtle ambient particle canvas */}
      <ParticleCanvas density={18} />

      {/* Login Screen (if logged out) */}
      {!user && <LoginModal onLogin={(u) => setUser(u)} />}

      {/* Navbar */}
      {user && (
        <Navbar
          user={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={() => setUser(null)}
          farmProfile={farmProfile}
          setFarmProfile={setFarmProfile}
          onSimulateRain={handleSimulateRain}
          onSimulateDepletion={handleSimulateDepletion}
          onSimulateIntrusion={handleSimulateIntrusion}
          onResetSim={handleResetSim}
          healthScore={healthScore}
        />
      )}

      {/* Clean toast alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs shadow-xl flex items-center gap-2 animate-fadeIn">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content */}
      {user && (
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-5 sm:pt-6">
          {activeTab === 'dashboard' && (
            <DashboardView
              telemetry={telemetry}
              alerts={agroAlerts}
              recommendations={recommendations}
              customFeatures={customFeatures}
              farmProfile={farmProfile}
              probes={probes}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onApplyRecommendation={handleApplyRecommendation}
              onNavigateTab={(tab) => setActiveTab(tab)}
              healthScore={healthScore}
            />
          )}

          {activeTab === 'irrigation' && (
            <IrrigationView
              zones={zones}
              setZones={setZones}
              schedules={schedules}
              setSchedules={setSchedules}
              waterTankLevel={telemetry.waterTankLevel}
            />
          )}

          {activeTab === 'probes' && (
            <ProbesView
              probes={probes}
              setProbes={setProbes}
              defaultTelemetry={telemetry}
            />
          )}

          {activeTab === 'security' && (
            <SecurityView
              cameras={cameras}
              setCameras={setCameras}
              alerts={securityAlerts}
              setAlerts={setSecurityAlerts}
            />
          )}

          {activeTab === 'voice' && (
            <VoiceAssistantView
              messages={chatMessages}
              setMessages={setChatMessages}
              telemetry={telemetry}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              telemetry={telemetry}
              farmProfile={farmProfile}
              healthScore={healthScore}
            />
          )}

          {activeTab === 'features' && (
            <FeatureStudioView
              customFeatures={customFeatures}
              setCustomFeatures={setCustomFeatures}
              user={user}
            />
          )}

          {activeTab === 'profile' && (
            <FarmProfileView
              farmProfile={farmProfile}
              setFarmProfile={setFarmProfile}
            />
          )}
        </main>
      )}
    </div>
  );
}

export default App;
