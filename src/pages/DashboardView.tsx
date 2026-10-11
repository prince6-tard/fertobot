import React, { useState } from 'react';
import {
  SensorTelemetry,
  AgroAlert,
  AgroRecommendation,
  CustomFeature,
  FarmProfile,
  ProbeDevice
} from '../types';
import { TELEMETRY_24H_HISTORY } from '../mockData';
import {
  Droplets,
  Thermometer,
  Activity,
  Flame,
  Zap,
  CheckCircle2,
  TrendingUp,
  CloudRain,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Sprout,
  Check
} from 'lucide-react';

interface DashboardViewProps {
  telemetry: SensorTelemetry;
  alerts: AgroAlert[];
  recommendations: AgroRecommendation[];
  customFeatures: CustomFeature[];
  farmProfile: FarmProfile;
  probes: ProbeDevice[];
  onAcknowledgeAlert: (id: string) => void;
  onApplyRecommendation: (rec: AgroRecommendation) => void;
  onNavigateTab: (tab: string) => void;
  healthScore: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  telemetry,
  alerts,
  recommendations,
  customFeatures,
  farmProfile,
  probes,
  onAcknowledgeAlert,
  onApplyRecommendation,
  onNavigateTab,
  healthScore,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'moisture' | 'nitrogen' | 'temp'>('moisture');
  const [showNutrientsModal, setShowNutrientsModal] = useState(false);

  const pinnedFeatures = customFeatures.filter((f) => f.pinnedToDashboard);

  // SVG chart parameters
  const chartPoints = TELEMETRY_24H_HISTORY;
  const values = chartPoints.map((p) =>
    selectedMetric === 'moisture' ? p.moisture : selectedMetric === 'nitrogen' ? p.nitrogen : p.temp
  );
  const minVal = Math.min(...values) - 4;
  const maxVal = Math.max(...values) + 4;
  const height = 120;
  const width = 500;

  const pointsString = chartPoints
    .map((p, i) => {
      const val = selectedMetric === 'moisture' ? p.moisture : selectedMetric === 'nitrogen' ? p.nitrogen : p.temp;
      const x = (i / (chartPoints.length - 1)) * width;
      const y = height - ((val - minVal) / (maxVal - minVal || 1)) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const areaString = `0,${height} ${pointsString} ${width},${height}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Farm Overview Top Banner */}
      <div className="matte-card rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-800 text-emerald-400 text-xs font-medium">
            <Sprout className="w-3.5 h-3.5 text-emerald-400" />
            <span>{farmProfile.primaryCrop} • {farmProfile.cropStage}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Field Telemetry & Soil Health Station
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Active monitoring across 5 IoT soil probes in <strong>{farmProfile.region}</strong>. Soil conditions are balanced for the current tillering cycle.
          </p>
        </div>

        {/* Health Score Box */}
        <div className="flex items-center gap-4 bg-[#0A0E13] p-3.5 rounded-xl border border-slate-800 shrink-0">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500"
                strokeDasharray={`${healthScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-sm font-bold text-white font-mono">{healthScore}%</span>
          </div>

          <div className="text-left text-xs space-y-0.5">
            <div className="font-semibold text-white flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Normal Vigor</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Tank: <strong className="text-slate-200 font-mono">{telemetry.waterTankLevel}%</strong>
            </div>
            <button
              onClick={() => onNavigateTab('irrigation')}
              className="text-[11px] text-emerald-400 font-medium hover:underline flex items-center gap-0.5 pt-0.5"
            >
              <span>Manage Valves</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary 6 Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Soil Moisture */}
        <div className="matte-card matte-card-hover rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Moisture</span>
            <Droplets className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono mb-1">
            {telemetry.soilMoisture.toFixed(1)}<span className="text-xs font-normal text-slate-400">%</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-medium">
            Optimal (50-70%)
          </div>
        </div>

        {/* Soil pH */}
        <div className="matte-card matte-card-hover rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Soil pH</span>
            <Activity className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono mb-1">
            {telemetry.pH.toFixed(1)}
          </div>
          <div className="text-[10px] text-teal-300 font-medium">
            Neutral (6.5-7.2)
          </div>
        </div>

        {/* Nitrogen */}
        <div className="matte-card matte-card-hover rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Nitrogen (N)</span>
            <Sprout className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono mb-1">
            {telemetry.nitrogen}<span className="text-xs font-normal text-slate-400"> ppm</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Target: 60 ppm
          </div>
        </div>

        {/* Phosphorus */}
        <div className="matte-card matte-card-hover rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Phosphorus (P)</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono mb-1">
            {telemetry.phosphorus}<span className="text-xs font-normal text-slate-400"> ppm</span>
          </div>
          <div className="text-[10px] text-amber-400 font-medium">
            Good Root State
          </div>
        </div>

        {/* Potassium */}
        <div className="matte-card matte-card-hover rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Potassium (K)</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono mb-1">
            {telemetry.potassium}<span className="text-xs font-normal text-slate-400"> ppm</span>
          </div>
          <div className="text-[10px] text-cyan-300 font-medium">
            High Resilience
          </div>
        </div>

        {/* Soil Temp */}
        <div className="matte-card matte-card-hover rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Soil Temp</span>
            <Thermometer className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono mb-1">
            {telemetry.temperature.toFixed(1)}°C
          </div>
          <div className="text-[10px] text-slate-400">
            Humidity: {telemetry.humidity.toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Secondary Nutrients Bar */}
      <div className="matte-card rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-3 text-slate-400">
          <span className="text-emerald-400 font-mono text-[11px]">EC: {telemetry.conductivity} dS/m</span>
          <span className="hidden sm:inline">•</span>
          <span>Calcium: <strong className="text-slate-200 font-mono">{telemetry.macroNutrients.calcium} ppm</strong></span>
          <span className="hidden sm:inline">•</span>
          <span>Magnesium: <strong className="text-slate-200 font-mono">{telemetry.macroNutrients.magnesium} ppm</strong></span>
          <span className="hidden md:inline">•</span>
          <span>Iron: <strong className="text-slate-200 font-mono">{telemetry.microNutrients.iron} ppm</strong></span>
        </div>
        <button
          onClick={() => setShowNutrientsModal(!showNutrientsModal)}
          className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
        >
          <span>{showNutrientsModal ? 'Hide Details' : 'View Trace Assay'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Trace Assay Dropdown */}
      {showNutrientsModal && (
        <div className="matte-card rounded-xl p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs animate-fadeIn">
          <div className="p-2.5 bg-[#0D131A] rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400">Calcium (Ca)</div>
            <div className="font-bold text-white font-mono">{telemetry.macroNutrients.calcium} ppm</div>
          </div>
          <div className="p-2.5 bg-[#0D131A] rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400">Magnesium (Mg)</div>
            <div className="font-bold text-white font-mono">{telemetry.macroNutrients.magnesium} ppm</div>
          </div>
          <div className="p-2.5 bg-[#0D131A] rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400">Sulfur (S)</div>
            <div className="font-bold text-white font-mono">{telemetry.macroNutrients.sulfur} ppm</div>
          </div>
          <div className="p-2.5 bg-[#0D131A] rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400">Iron (Fe)</div>
            <div className="font-bold text-white font-mono">{telemetry.microNutrients.iron} ppm</div>
          </div>
          <div className="p-2.5 bg-[#0D131A] rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400">Zinc (Zn)</div>
            <div className="font-bold text-white font-mono">{telemetry.microNutrients.zinc} ppm</div>
          </div>
          <div className="p-2.5 bg-[#0D131A] rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400">Boron (B)</div>
            <div className="font-bold text-white font-mono">{telemetry.microNutrients.boron} ppm</div>
          </div>
        </div>
      )}

      {/* Main Grid: Telemetry Trends & AI Recommendations */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: 24h Telemetry Chart */}
        <div className="lg:col-span-7 matte-card rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>24-Hour Telemetry Curve</span>
              </h2>
              <p className="text-[11px] text-slate-400">Sampled via ESP32 telemetry nodes</p>
            </div>

            <div className="flex items-center gap-1 bg-[#0A0E13] p-1 rounded-lg border border-slate-800 text-xs">
              {(['moisture', 'nitrogen', 'temp'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMetric(m)}
                  className={`px-2.5 py-1 rounded text-[11px] transition-colors capitalize ${
                    selectedMetric === m
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {m === 'temp' ? 'Temp (°C)' : m}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Chart */}
          <div className="w-full h-36 relative bg-[#0A0E13] rounded-xl p-3 border border-slate-800/80">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
              <polygon points={areaString} fill="rgba(16, 185, 129, 0.12)" />
              <polyline
                fill="none"
                stroke="#10B981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsString}
              />
              {chartPoints.map((p, i) => {
                const val =
                  selectedMetric === 'moisture'
                    ? p.moisture
                    : selectedMetric === 'nitrogen'
                    ? p.nitrogen
                    : p.temp;
                const x = (i / (chartPoints.length - 1)) * width;
                const y = height - ((val - minVal) / (maxVal - minVal || 1)) * height;
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="3.5"
                    className="fill-emerald-400 stroke-[#0A0E13] stroke-2"
                  />
                );
              })}
            </svg>

            <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1">
              {chartPoints.map((p, i) => (
                <span key={i}>{p.time}</span>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Probes: <strong className="text-white font-mono">{probes.filter((p) => p.status === 'online').length} / {probes.length} Online</strong></span>
            <button
              onClick={() => onNavigateTab('probes')}
              className="text-emerald-400 hover:underline flex items-center gap-0.5"
            >
              <span>Fleet Manager</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: AI Recommendations */}
        <div className="lg:col-span-5 matte-card rounded-2xl p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>AI Agronomic Recommendations</span>
              </h2>
              <span className="text-[10px] font-mono text-slate-400">Real-Time</span>
            </div>

            <div className="space-y-2.5">
              {recommendations.slice(0, 3).map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 rounded-xl bg-[#0D131A] border border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide">
                      {rec.category.replace('_', ' ')} • {rec.targetZone}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                      {rec.priority}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200">{rec.action}</p>

                  <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      Impact: <strong className="text-emerald-400">{rec.estimatedImpact}</strong>
                    </span>
                    <button
                      onClick={() => onApplyRecommendation(rec)}
                      className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Apply</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('voice')}
            className="w-full mt-3 py-2 rounded-xl bg-[#0A0E13] hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Ask Agronomist Chatbot</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>
      </div>

      {/* Pinned Custom Features Section */}
      {pinnedFeatures.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Your Typed Features</span>
            </h2>
            <button
              onClick={() => onNavigateTab('features')}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-0.5"
            >
              <span>Open Feature Studio</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-3.5">
            {pinnedFeatures.map((feature) => (
              <div
                key={feature.id}
                className="matte-card rounded-xl p-4 space-y-2 border-slate-800"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    {feature.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {feature.currentValue} {feature.unit || ''}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-white line-clamp-1">
                  {feature.title}
                </h3>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {feature.summary}
                </p>

                <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono truncate">
                  {feature.metricLabel}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts and Weather Grid */}
      <div className="grid md:grid-cols-12 gap-5 pt-2">
        {/* Alerts Feed */}
        <div className="md:col-span-8 matte-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Farm Sensor Alerts</span>
            </h2>
            <span className="text-[11px] text-slate-400">
              {alerts.filter((a) => !a.acknowledged).length} Pending
            </span>
          </div>

          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs transition-colors ${
                  alert.acknowledged
                    ? 'bg-[#0D131A] border-slate-800/60 opacity-60'
                    : alert.severity === 'critical'
                    ? 'bg-rose-500/10 border-rose-500/20 text-white'
                    : 'bg-amber-500/10 border-amber-500/20 text-white'
                }`}
              >
                <div>
                  <div className="font-semibold text-white">{alert.title}</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">{alert.message}</div>
                  {alert.actionRequired && (
                    <div className="text-[10px] text-emerald-400 font-mono mt-1">
                      Action: {alert.actionRequired}
                    </div>
                  )}
                </div>

                {!alert.acknowledged && (
                  <button
                    onClick={() => onAcknowledgeAlert(alert.id)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-200 font-medium shrink-0"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Weather Forecast */}
        <div className="md:col-span-4 matte-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <CloudRain className="w-4 h-4 text-blue-400" />
              <span>Agro Weather</span>
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">Varanasi, UP</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[#0D131A] border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Tomorrow</div>
                <div className="text-[11px] text-blue-400">Showers (75%)</div>
              </div>
              <div className="text-right font-mono text-sm font-bold text-white">22°C</div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#0D131A] border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Tuesday</div>
                <div className="text-[11px] text-emerald-400">Sunny</div>
              </div>
              <div className="text-right font-mono text-sm font-bold text-white">26°C</div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#0D131A] border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Wednesday</div>
                <div className="text-[11px] text-amber-400">Clear</div>
              </div>
              <div className="text-right font-mono text-sm font-bold text-white">28°C</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
