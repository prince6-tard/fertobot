import React, { useState } from 'react';
import { SecurityCamera, SecurityAlert } from '../types';
import {
  Camera,
  Moon,
  Volume2,
  AlertTriangle,
  Radio,
  Crosshair
} from 'lucide-react';

interface SecurityViewProps {
  cameras: SecurityCamera[];
  setCameras: React.Dispatch<React.SetStateAction<SecurityCamera[]>>;
  alerts: SecurityAlert[];
  setAlerts: React.Dispatch<React.SetStateAction<SecurityAlert[]>>;
}

export const SecurityView: React.FC<SecurityViewProps> = ({
  cameras,
  setCameras,
  alerts,
  setAlerts,
}) => {
  const [selectedCamId, setSelectedCamId] = useState(cameras[0]?.id || 'CAM-01');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isSirenActive, setIsSirenActive] = useState(false);

  const activeCam = cameras.find((c) => c.id === selectedCamId) || cameras[0];

  const toggleNightVision = (camId: string) => {
    setCameras((prev) =>
      prev.map((c) => (c.id === camId ? { ...c, nightVision: !c.nightVision } : c))
    );
  };

  const handleTriggerSiren = () => {
    setIsSirenActive(true);
    setActionNotice('Acoustic Pest Deterrent & Strobe Siren Activated across Perimeter.');
    setTimeout(() => {
      setIsSirenActive(false);
      setActionNotice(null);
    }, 3500);
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="matte-card rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-800 text-rose-400 text-xs font-medium mb-1.5">
            <Camera className="w-3.5 h-3.5" />
            <span>AI CCTV SURVEILLANCE & WILDLIFE DETECTION</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Perimeter Security & Animal Intrusion
          </h1>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Neural vision monitors for wild herbivores (Nilgai, wild boars) and nocturnal rodents with automatic deterrence.
          </p>
        </div>

        <button
          onClick={handleTriggerSiren}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
            isSirenActive ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 hover:bg-rose-900/60 text-slate-200 border border-slate-700'
          }`}
        >
          <Volume2 className="w-4 h-4 text-rose-400" />
          <span>{isSirenActive ? 'Siren Active...' : 'Trigger Siren'}</span>
        </button>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-[#0D131A] border border-slate-700 text-slate-200 text-xs flex items-center gap-2 animate-fadeIn">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Main Layout: Video + Alerts */}
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 matte-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>{activeCam.name}</span>
            </h2>

            <button
              onClick={() => toggleNightVision(activeCam.id)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#0A0E13] border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5"
            >
              <Moon className="w-3.5 h-3.5" />
              <span>{activeCam.nightVision ? 'Night IR: ON' : 'Night IR: OFF'}</span>
            </button>
          </div>

          {/* Viewport */}
          <div className="w-full aspect-video rounded-xl bg-[#080C10] border border-slate-800 relative overflow-hidden flex items-center justify-center">
            <Crosshair className="w-16 h-16 text-slate-800 pointer-events-none" />

            {/* Bounding box simulation */}
            {activeCam.detectedObjects.map((obj, idx) => (
              <div
                key={idx}
                className="absolute border border-amber-400/80 bg-amber-500/10 rounded p-1 text-[10px] font-mono text-amber-300"
                style={{
                  left: `${obj.box[0]}%`,
                  top: `${obj.box[1]}%`,
                  width: `${obj.box[2]}%`,
                  height: `${obj.box[3]}%`,
                }}
              >
                {obj.label} ({(obj.confidence * 100).toFixed(0)}%)
              </div>
            ))}

            <div className="absolute top-3 left-3 text-[10px] font-mono text-slate-400 bg-black/60 px-2 py-0.5 rounded">
              LIVE • {activeCam.location}
            </div>
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            {cameras.map((cam) => (
              <button
                key={cam.id}
                onClick={() => setSelectedCamId(cam.id)}
                className={`p-2.5 rounded-xl border text-left transition-colors ${
                  cam.id === activeCam.id
                    ? 'bg-[#161F2A] border-slate-700 text-white'
                    : 'bg-[#0A0E13] border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-semibold text-white truncate">{cam.name}</div>
                <div className="text-[10px] text-slate-500 truncate">{cam.location}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Security Log */}
        <div className="lg:col-span-4 matte-card rounded-2xl p-5 space-y-3 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white mb-2">Perimeter Incident Log</h2>
            <div className="space-y-2">
              {alerts.map((alt) => (
                <div
                  key={alt.id}
                  className="p-3 rounded-xl bg-[#0D131A] border border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>{alt.type.toUpperCase()}</span>
                    <span>{alt.timestamp}</span>
                  </div>
                  <div className="font-semibold text-white">{alt.title}</div>
                  <p className="text-[11px] text-slate-400">{alt.description}</p>
                  <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-emerald-400">
                      Conf: {(alt.confidence * 100).toFixed(0)}%
                    </span>
                    {!alt.acknowledged && (
                      <button
                        onClick={() => handleAcknowledgeAlert(alt.id)}
                        className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#0A0E13] border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2 mt-3">
            <Radio className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Infrared laser fences operational.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
