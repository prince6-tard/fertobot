import React, { useState } from 'react';
import { IrrigationZone, IrrigationSchedule } from '../types';
import {
  Droplets,
  Play,
  Square,
  Clock,
  Plus,
  Calendar,
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';

interface IrrigationViewProps {
  zones: IrrigationZone[];
  setZones: React.Dispatch<React.SetStateAction<IrrigationZone[]>>;
  schedules: IrrigationSchedule[];
  setSchedules: React.Dispatch<React.SetStateAction<IrrigationSchedule[]>>;
  waterTankLevel: number;
}

export const IrrigationView: React.FC<IrrigationViewProps> = ({
  zones,
  setZones,
  schedules,
  setSchedules,
  waterTankLevel,
}) => {
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);
  const [newScheduleZone, setNewScheduleZone] = useState(zones[0]?.id || '');
  const [newScheduleTime, setNewScheduleTime] = useState('06:00 AM');
  const [newScheduleDuration, setNewScheduleDuration] = useState(20);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const toggleZoneValve = (zoneId: string) => {
    setZones((prev) =>
      prev.map((z) => {
        if (z.id === zoneId) {
          const nextStatus = z.status === 'active' ? 'inactive' : 'active';
          return {
            ...z,
            status: nextStatus,
            litersToday: nextStatus === 'active' ? z.litersToday + 50 : z.litersToday,
            currentMoisture: nextStatus === 'active' ? Math.min(100, z.currentMoisture + 4) : z.currentMoisture,
            lastRun: nextStatus === 'active' ? 'Running Now' : 'Just stopped',
          };
        }
        return z;
      })
    );

    const target = zones.find((z) => z.id === zoneId);
    const willStart = target?.status !== 'active';
    setActionNotice(
      willStart
        ? `Valve opened for "${target?.name}". Flow active.`
        : `Valve closed for "${target?.name}". Cycle concluded.`
    );
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleStopAll = () => {
    setZones((prev) => prev.map((z) => ({ ...z, status: 'inactive' })));
    setActionNotice('Emergency Stop: All valves closed.');
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleQuickSoak = (mins: number) => {
    setZones((prev) =>
      prev.map((z) => ({
        ...z,
        status: 'active',
        currentMoisture: Math.min(100, z.currentMoisture + 6),
        litersToday: z.litersToday + 120,
      }))
    );
    setActionNotice(`Quick Soak (${mins} mins) started across all zones.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const toggleAutoMode = (zoneId: string) => {
    setZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, mode: z.mode === 'auto' ? 'manual' : 'auto' } : z))
    );
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const zoneObj = zones.find((z) => z.id === newScheduleZone);
    const newSch: IrrigationSchedule = {
      id: `SCH-${Date.now()}`,
      zoneId: newScheduleZone,
      zoneName: zoneObj?.name || 'Irrigation Zone',
      time: newScheduleTime,
      durationMinutes: newScheduleDuration,
      days: ['Mon', 'Wed', 'Fri'],
      enabled: true,
      minMoistureTrigger: 50,
    };
    setSchedules((prev) => [...prev, newSch]);
    setIsAddingSchedule(false);
    setActionNotice(`Schedule created for ${newSch.zoneName} at ${newSch.time}.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const toggleScheduleEnabled = (schId: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === schId ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const totalLitersToday = zones.reduce((sum, z) => sum + z.litersToday, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="matte-card rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-800 text-blue-400 text-xs font-medium mb-1.5">
            <Droplets className="w-3.5 h-3.5" />
            <span>IRRIGATION & SOLENOID VALVES</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Sprinkler & Moisture Automation
          </h1>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Control field solenoid valves with soil moisture threshold cutoffs to prevent over-watering and nutrient leaching.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#0A0E13] p-3 rounded-xl border border-slate-800 text-xs">
          <div className="text-center px-3 border-r border-slate-800">
            <div className="text-lg font-bold text-blue-400 font-mono">
              {totalLitersToday.toLocaleString()} L
            </div>
            <div className="text-[10px] text-slate-500 uppercase">Used Today</div>
          </div>
          <div className="text-center px-3">
            <div className="text-lg font-bold text-emerald-400 font-mono">
              {waterTankLevel}%
            </div>
            <div className="text-[10px] text-slate-500 uppercase">Reservoir</div>
          </div>
        </div>
      </div>

      {/* Global Actions */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          onClick={() => handleQuickSoak(15)}
          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Quick Soak (15 Min Cycle)</span>
        </button>
        <button
          onClick={handleStopAll}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 hover:text-rose-200 text-slate-300 font-medium text-xs flex items-center gap-1.5 border border-slate-700 transition-colors"
        >
          <Square className="w-3.5 h-3.5" />
          <span>Emergency Stop All</span>
        </button>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-[#0D131A] border border-slate-700 text-slate-200 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Zone Cards Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {zones.map((zone) => {
          const isActive = zone.status === 'active';
          return (
            <div
              key={zone.id}
              className={`matte-card rounded-2xl p-5 space-y-4 border transition-colors ${
                isActive ? 'border-blue-500/40 bg-[#101722]' : 'border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {zone.id}
                    </span>
                    <span className="text-xs text-slate-400">{zone.sector}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{zone.name}</span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                    )}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAutoMode(zone.id)}
                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono uppercase"
                  >
                    {zone.mode === 'auto' ? 'AI Auto' : 'Manual'}
                  </button>
                  <button
                    onClick={() => toggleZoneValve(zone.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-rose-600 hover:bg-rose-500 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {isActive ? 'Stop' : 'Start'}
                  </button>
                </div>
              </div>

              {/* Moisture Level bar */}
              <div className="space-y-1.5 p-3 rounded-xl bg-[#0A0E13] border border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Soil Moisture</span>
                  <span className="font-mono text-white font-bold">{zone.currentMoisture}% / Target {zone.targetMoisture}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${Math.min(100, zone.currentMoisture)}%` }}
                  />
                </div>
              </div>

              {/* Quick Specs */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-[#0A0E13] border border-slate-800">
                  <div className="text-[10px] text-slate-500">Flow Rate</div>
                  <div className="font-mono font-bold text-white">{zone.flowRateLpm} L/m</div>
                </div>
                <div className="p-2 rounded-lg bg-[#0A0E13] border border-slate-800">
                  <div className="text-[10px] text-slate-500">Today</div>
                  <div className="font-mono font-bold text-blue-300">{zone.litersToday} L</div>
                </div>
                <div className="p-2 rounded-lg bg-[#0A0E13] border border-slate-800">
                  <div className="text-[10px] text-slate-500">Valve</div>
                  <div className="font-mono font-bold text-emerald-400 uppercase text-[10px]">{zone.valveHealth.replace('_', ' ')}</div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between">
                <span>Last run: {zone.lastRun}</span>
                {zone.nextScheduled && <span className="font-mono text-slate-400">{zone.nextScheduled}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedules Section */}
      <div className="matte-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Automated Watering Schedules</span>
          </h2>

          <button
            onClick={() => setIsAddingSchedule(!isAddingSchedule)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Schedule</span>
          </button>
        </div>

        {isAddingSchedule && (
          <form onSubmit={handleAddSchedule} className="p-4 rounded-xl bg-[#0D131A] border border-slate-800 space-y-3 animate-fadeIn text-xs">
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Zone</label>
                <select
                  value={newScheduleZone}
                  onChange={(e) => setNewScheduleZone(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#0A0E13] border border-slate-800 rounded-lg text-white"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>{z.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Time</label>
                <input
                  type="text"
                  value={newScheduleTime}
                  onChange={(e) => setNewScheduleTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#0A0E13] border border-slate-800 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Duration (Min)</label>
                <input
                  type="number"
                  value={newScheduleDuration}
                  onChange={(e) => setNewScheduleDuration(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-[#0A0E13] border border-slate-800 rounded-lg text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingSchedule(false)}
                className="px-3 py-1 rounded-lg text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-medium"
              >
                Save
              </button>
            </div>
          </form>
        )}

        <div className="grid sm:grid-cols-3 gap-3">
          {schedules.map((sch) => (
            <div key={sch.id} className="p-3 rounded-xl bg-[#0A0E13] border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">{sch.zoneName}</span>
                <button
                  onClick={() => toggleScheduleEnabled(sch.id)}
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    sch.enabled ? 'bg-emerald-600/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {sch.enabled ? 'Active' : 'Off'}
                </button>
              </div>
              <div className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{sch.time} • {sch.durationMinutes}m</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
