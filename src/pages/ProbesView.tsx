import React, { useState } from 'react';
import { ProbeDevice, SensorTelemetry } from '../types';
import {
  Radio,
  Plus,
  Battery,
  Wifi,
  MapPin,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

interface ProbesViewProps {
  probes: ProbeDevice[];
  setProbes: React.Dispatch<React.SetStateAction<ProbeDevice[]>>;
  defaultTelemetry: SensorTelemetry;
}

export const ProbesView: React.FC<ProbesViewProps> = ({
  probes,
  setProbes,
  defaultTelemetry,
}) => {
  const [selectedProbe, setSelectedProbe] = useState<ProbeDevice | null>(null);
  const [isAddingProbe, setIsAddingProbe] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [newUuid, setNewUuid] = useState(`fb-esp32-node-0${probes.length + 1}`);
  const [newZone, setNewZone] = useState('Zone 1 (Wheat Field North)');
  const [newDepth, setNewDepth] = useState(30);

  const handleRegisterProbe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newProbe: ProbeDevice = {
      id: `PRB-00${probes.length + 1}`,
      uuid: newUuid,
      name: newName.trim(),
      zone: newZone,
      depthCm: newDepth,
      status: 'online',
      batteryLevel: 98,
      signalStrength: 95,
      lastActive: 'Just now',
      location: {
        fieldName: newZone.split(' ')[0],
        lat: 25.318,
        lng: 82.973,
      },
      currentTelemetry: { ...defaultTelemetry },
    };

    setProbes((prev) => [newProbe, ...prev]);
    setIsAddingProbe(false);
    setNewName('');
    setActionNotice(`Probe "${newProbe.name}" registered.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handlePingProbe = (probeId: string) => {
    setActionNotice(`Ping sent to ${probeId} via LoRa... 24ms ACK.`);
    setTimeout(() => setActionNotice(null), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="matte-card rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-800 text-emerald-400 text-xs font-medium mb-1.5">
            <Radio className="w-3.5 h-3.5" />
            <span>SUBTERRANEAN IOT PROBES</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Soil Sensor Fleet Manager
          </h1>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Monitor real-time NPK, volumetric water content, and electrical conductivity across all field sectors.
          </p>
        </div>

        <button
          onClick={() => setIsAddingProbe(true)}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Register New Probe</span>
        </button>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-[#0D131A] border border-slate-700 text-slate-200 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Probes Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {probes.map((probe) => {
          const isOnline = probe.status === 'online';
          const isWarning = probe.status === 'warning';

          return (
            <div
              key={probe.id}
              className="matte-card rounded-2xl p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono">
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">{probe.id}</span>
                      <span className="text-slate-500">{probe.uuid}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{probe.name}</h3>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase ${
                      isOnline
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                        : isWarning
                        ? 'bg-amber-950/40 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-950/40 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {probe.status}
                  </span>
                </div>

                <div className="text-xs text-slate-400 mb-3 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{probe.zone} • {probe.depthCm} cm depth</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs p-2.5 rounded-xl bg-[#0A0E13] border border-slate-800 mb-3">
                  <div>
                    <div className="text-[10px] text-slate-500">Moisture</div>
                    <div className="font-mono font-bold text-white">{probe.currentTelemetry.soilMoisture}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">pH</div>
                    <div className="font-mono font-bold text-teal-400">{probe.currentTelemetry.pH}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">NPK Total</div>
                    <div className="font-mono font-bold text-amber-400">
                      {probe.currentTelemetry.nitrogen + probe.currentTelemetry.phosphorus + probe.currentTelemetry.potassium} ppm
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Battery className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Battery {probe.batteryLevel}%</span>
                  </span>
                  <span className="text-slate-500 text-[11px] font-mono">{probe.lastActive}</span>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <button
                  onClick={() => handlePingProbe(probe.id)}
                  className="text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  <span>Ping Node</span>
                </button>

                <button
                  onClick={() => setSelectedProbe(probe)}
                  className="text-emerald-400 hover:underline font-medium flex items-center gap-0.5"
                >
                  <span>Trace Assay</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Register Probe Modal */}
      {isAddingProbe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md matte-card rounded-2xl p-6 border border-slate-700 space-y-4 animate-fadeIn text-xs">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Register Subterranean Probe</span>
            </h2>

            <form onSubmit={handleRegisterProbe} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1">Probe Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Sector Gamma Deep Probe"
                  className="w-full px-3 py-2 matte-input rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">UUID</label>
                <input
                  type="text"
                  value={newUuid}
                  onChange={(e) => setNewUuid(e.target.value)}
                  className="w-full px-3 py-2 matte-input rounded-xl font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Zone</label>
                  <select
                    value={newZone}
                    onChange={(e) => setNewZone(e.target.value)}
                    className="w-full px-2.5 py-2 bg-[#0D131A] border border-slate-800 rounded-xl text-white"
                  >
                    <option value="Zone 1 (Wheat Field North)">Zone 1 (Wheat North)</option>
                    <option value="Zone 2 (Vegetable Polyhouse)">Zone 2 (Polyhouse)</option>
                    <option value="Zone 3 (Citrus Orchard)">Zone 3 (Orchard)</option>
                    <option value="Zone 4 (Nursery)">Zone 4 (Nursery)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Depth (cm)</label>
                  <input
                    type="number"
                    value={newDepth}
                    onChange={(e) => setNewDepth(Number(e.target.value))}
                    className="w-full px-2.5 py-2 matte-input rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingProbe(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-medium"
                >
                  Pair Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deep-dive details modal */}
      {selectedProbe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg matte-card rounded-2xl p-6 border border-slate-700 space-y-4 animate-fadeIn max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-500">{selectedProbe.id} • {selectedProbe.uuid}</span>
                <h2 className="text-base font-bold text-white">{selectedProbe.name}</h2>
                <p className="text-xs text-slate-400">{selectedProbe.zone} • Depth {selectedProbe.depthCm} cm</p>
              </div>
              <button
                onClick={() => setSelectedProbe(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300">Macro Nutrients (ppm)</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#0A0E13] border border-slate-800">
                  <div className="text-slate-500">Nitrogen</div>
                  <div className="font-mono font-bold text-white">{selectedProbe.currentTelemetry.nitrogen}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0A0E13] border border-slate-800">
                  <div className="text-slate-500">Phosphorus</div>
                  <div className="font-mono font-bold text-amber-400">{selectedProbe.currentTelemetry.phosphorus}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0A0E13] border border-slate-800">
                  <div className="text-slate-500">Potassium</div>
                  <div className="font-mono font-bold text-cyan-400">{selectedProbe.currentTelemetry.potassium}</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300">Micro Trace Nutrients (ppm)</div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-[#0A0E13] border border-slate-800">
                  <div className="text-[10px] text-slate-500">Fe</div>
                  <div className="font-mono text-white">{selectedProbe.currentTelemetry.microNutrients.iron}</div>
                </div>
                <div className="p-2 rounded-lg bg-[#0A0E13] border border-slate-800">
                  <div className="text-[10px] text-slate-500">Zn</div>
                  <div className="font-mono text-white">{selectedProbe.currentTelemetry.microNutrients.zinc}</div>
                </div>
                <div className="p-2 rounded-lg bg-[#0A0E13] border border-slate-800">
                  <div className="text-[10px] text-slate-500">Mn</div>
                  <div className="font-mono text-white">{selectedProbe.currentTelemetry.microNutrients.manganese}</div>
                </div>
                <div className="p-2 rounded-lg bg-[#0A0E13] border border-slate-800">
                  <div className="text-[10px] text-slate-500">Cu</div>
                  <div className="font-mono text-white">{selectedProbe.currentTelemetry.microNutrients.copper}</div>
                </div>
                <div className="p-2 rounded-lg bg-[#0A0E13] border border-slate-800">
                  <div className="text-[10px] text-slate-500">B</div>
                  <div className="font-mono text-white">{selectedProbe.currentTelemetry.microNutrients.boron}</div>
                </div>
                <div className="p-2 rounded-lg bg-[#0A0E13] border border-slate-800">
                  <div className="text-[10px] text-slate-500">Mo</div>
                  <div className="font-mono text-white">{selectedProbe.currentTelemetry.microNutrients.molybdenum}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedProbe(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
