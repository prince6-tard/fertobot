import React, { useState } from 'react';
import { CustomFeature } from '../types';
import {
  Sparkles,
  Plus,
  Pin,
  PinOff,
  Trash2,
  CheckCircle2,
  Cpu,
  Sliders,
  Gauge,
  ToggleRight,
  ScanLine,
  Zap,
  Tag
} from 'lucide-react';

interface FeatureStudioViewProps {
  customFeatures: CustomFeature[];
  setCustomFeatures: React.Dispatch<React.SetStateAction<CustomFeature[]>>;
}

export const FeatureStudioView: React.FC<FeatureStudioViewProps> = ({
  customFeatures,
  setCustomFeatures,
}) => {
  const [typedTitle, setTypedTitle] = useState('');
  const [typedPrompt, setTypedPrompt] = useState('');
  const [category, setCategory] = useState<CustomFeature['category']>('AI & Vision');
  const [priority, setPriority] = useState<CustomFeature['priority']>('Game-Changer');
  const [widgetType, setWidgetType] = useState<CustomFeature['widgetType']>('action_slider');
  const [isGenerating, setIsGenerating] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [notice, setNotice] = useState<string | null>(null);

  const quickIdeas = [
    {
      title: 'Satellite NDVI Vegetation Canopy Index',
      prompt: 'integrate Sentinel-2 satellite infrared NDVI imaging to detect vegetation vigor from orbit',
      category: 'AI & Vision' as const,
      widgetType: 'metric_gauge' as const
    },
    {
      title: 'Frost & Extreme Heat Early Warning Siren',
      prompt: 'alert 6 hours before frost freeze event and automatically trigger warm mist sprinklers',
      category: 'Automation' as const,
      widgetType: 'toggle_switch' as const
    },
    {
      title: 'Autonomous Drone Night Pest Patrol',
      prompt: 'schedule autonomous thermal drone flights to scare wild boars and nilgai with strobe lights',
      category: 'Drone & Robotics' as const,
      widgetType: 'action_slider' as const
    },
    {
      title: 'Smart Fertilizer Dosing Pump by Electric Conductivity',
      prompt: 'automatically inject liquid NPK concentrate into drip line when EC falls below 1.2 dS/m',
      category: 'Irrigation' as const,
      widgetType: 'toggle_switch' as const
    }
  ];

  const handleApplyQuickIdea = (idea: typeof quickIdeas[0]) => {
    setTypedTitle(idea.title);
    setTypedPrompt(idea.prompt);
    setCategory(idea.category);
    setWidgetType(idea.widgetType);
  };

  const handleCreateFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedTitle.trim()) return;

    setIsGenerating(true);

    setTimeout(() => {
      let initialVal: any = 75;
      let unit = '% Optimal';
      let metricLabel = 'System Status: Active & Operational';
      let options = ['Run Diagnostic Test', 'Calibrate Sensor', 'View Sub-Log'];

      if (widgetType === 'toggle_switch') {
        initialVal = true;
        unit = 'Enabled';
        metricLabel = 'Active Automated Loop';
        options = ['Auto-Trigger On Event', 'Manual Override', 'Audit Trail'];
      } else if (widgetType === 'metric_gauge') {
        initialVal = '₹2,850';
        unit = 'Current Index';
        metricLabel = 'Confidence Score: 96.2%';
        options = ['Refresh Live Feed', 'Export History', 'Alert Rules'];
      } else if (widgetType === 'ai_scanner') {
        initialVal = 99.1;
        unit = '% Health Rating';
        metricLabel = 'Neural Model v4.1 Synced';
        options = ['Trigger Optical Scan', 'Upload New Image', 'Generate Prescription'];
      }

      const newFeat: CustomFeature = {
        id: `FEAT-${Date.now()}`,
        title: typedTitle.trim(),
        userPrompt: typedPrompt.trim() || typedTitle.trim(),
        category,
        status: 'live',
        priority,
        createdAt: new Date().toISOString().split('T')[0],
        pinnedToDashboard: true,
        widgetType,
        currentValue: initialVal,
        unit,
        metricLabel,
        summary: `User-defined smart feature: "${typedPrompt || typedTitle}". Fully instantiated into FertoBot OS runtime with real-time controls.`,
        interactiveOptions: options,
      };

      setCustomFeatures((prev) => [newFeat, ...prev]);
      setIsGenerating(false);
      setTypedTitle('');
      setTypedPrompt('');
      setNotice(`Feature "${newFeat.title}" instantiated & pinned to your FertoBot Dashboard.`);
      setTimeout(() => setNotice(null), 3500);
    }, 400);
  };

  const togglePin = (id: string) => {
    setCustomFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, pinnedToDashboard: !f.pinnedToDashboard } : f))
    );
  };

  const deleteFeature = (id: string) => {
    setCustomFeatures((prev) => prev.filter((f) => f.id !== id));
  };

  const handleWidgetValueChange = (id: string, val: any) => {
    setCustomFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, currentValue: val } : f))
    );
  };

  const filtered = customFeatures.filter(
    (f) => filterCategory === 'all' || f.category === filterCategory
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="matte-card rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-800 text-emerald-400 text-xs font-medium mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MODULAR FEATURE STUDIO</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Add Any Feature by Typing It
          </h1>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Type any capability you desire in plain text. FertoBot will construct an interactive live widget and pin it to your dashboard.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#0A0E13] p-3 rounded-xl border border-slate-800 text-xs">
          <div className="text-center px-3 border-r border-slate-800">
            <div className="text-lg font-bold text-white font-mono">{customFeatures.length}</div>
            <div className="text-[10px] text-slate-500 uppercase">Features</div>
          </div>
          <div className="text-center px-3">
            <div className="text-lg font-bold text-emerald-400 font-mono">
              {customFeatures.filter((f) => f.pinnedToDashboard).length}
            </div>
            <div className="text-[10px] text-slate-500 uppercase">Pinned</div>
          </div>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Creation Form Box */}
      <div className="matte-card rounded-2xl p-5 sm:p-6 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <span>Type New Feature Specification</span>
        </h2>

        <form onSubmit={handleCreateFeature} className="space-y-4">
          <div className="grid md:grid-cols-12 gap-3.5">
            <div className="md:col-span-6">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Feature Name / Title
              </label>
              <input
                type="text"
                value={typedTitle}
                onChange={(e) => setTypedTitle(e.target.value)}
                placeholder="e.g. Drone Precision Spraying"
                className="w-full px-3.5 py-2 matte-input rounded-xl text-xs"
                required
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#0D131A] border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="AI & Vision">AI & Vision</option>
                <option value="Automation">Automation</option>
                <option value="Drone & Robotics">Drone & Robotics</option>
                <option value="Irrigation">Irrigation</option>
                <option value="Market & Mandi">Market & Mandi</option>
                <option value="Soil Science">Soil Science</option>
                <option value="IoT Hardware">IoT Hardware</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#0D131A] border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="Must-Have">Must-Have</option>
                <option value="Game-Changer">Game-Changer</option>
                <option value="Enhancement">Enhancement</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Description / Prompt (What should this feature do?)
            </label>
            <textarea
              value={typedPrompt}
              onChange={(e) => setTypedPrompt(e.target.value)}
              rows={2}
              placeholder="e.g. Schedule autonomous drone spray missions when wind speed is under 10 km/h..."
              className="w-full px-3.5 py-2 matte-input rounded-xl text-xs font-mono resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Live Widget Interactive Type:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'action_slider', label: 'Action Slider', icon: Sliders },
                { id: 'metric_gauge', label: 'Data Gauge', icon: Gauge },
                { id: 'toggle_switch', label: 'Auto Switch', icon: ToggleRight },
                { id: 'ai_scanner', label: 'Optical Scan', icon: ScanLine },
              ].map((wt) => {
                const Icon = wt.icon;
                const isSelected = widgetType === wt.id;
                return (
                  <button
                    key={wt.id}
                    type="button"
                    onClick={() => setWidgetType(wt.id as any)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-colors ${
                      isSelected
                        ? 'bg-emerald-600/15 border-emerald-500/50 text-white'
                        : 'bg-[#0D131A] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className="text-xs font-medium">{wt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Idea Chips */}
          <div className="pt-1">
            <div className="text-[11px] text-slate-500 mb-1.5 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Or click a pre-set idea:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {quickIdeas.map((idea, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyQuickIdea(idea)}
                  className="px-2.5 py-1 rounded-lg bg-[#0D131A] hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 text-emerald-400" />
                  <span>{idea.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isGenerating || !typedTitle.trim()}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Synthesizing...' : 'Instantiate Feature in FertoBot'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Feature Catalog Grid */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-white">Active Features Catalog</h2>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {['all', 'AI & Vision', 'Drone & Robotics', 'Market & Mandi', 'Automation', 'Soil Science'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-colors whitespace-nowrap ${
                  filterCategory === cat
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((feature) => (
            <div
              key={feature.id}
              className="matte-card rounded-2xl p-5 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {feature.category}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                        {feature.priority}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{feature.title}</h3>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => togglePin(feature.id)}
                      title={feature.pinnedToDashboard ? 'Unpin' : 'Pin to Dashboard'}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        feature.pinnedToDashboard
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-white'
                      }`}
                    >
                      {feature.pinnedToDashboard ? <Pin className="w-3.5 h-3.5 fill-emerald-400" /> : <PinOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => deleteFeature(feature.id)}
                      title="Delete"
                      className="p-1.5 rounded-lg bg-slate-900 text-slate-500 hover:text-rose-400 border border-slate-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {feature.summary}
                </p>

                {/* Interactive Widget Box */}
                <div className="p-3 rounded-xl bg-[#0A0E13] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px] font-mono flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-emerald-400" />
                      <span>Live Controller</span>
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {feature.currentValue} {feature.unit || ''}
                    </span>
                  </div>

                  {feature.widgetType === 'action_slider' && (
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={Number(feature.currentValue) || 50}
                      onChange={(e) => handleWidgetValueChange(feature.id, Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  )}

                  {feature.widgetType === 'toggle_switch' && (
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-xs text-slate-300">Auto Trigger</span>
                      <button
                        onClick={() => handleWidgetValueChange(feature.id, !feature.currentValue)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold ${
                          feature.currentValue ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {feature.currentValue ? 'ENABLED' : 'DISABLED'}
                      </button>
                    </div>
                  )}

                  {feature.widgetType === 'metric_gauge' && (
                    <div className="text-[11px] text-slate-400 font-mono">
                      {feature.metricLabel}
                    </div>
                  )}

                  {feature.widgetType === 'ai_scanner' && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{feature.metricLabel}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono">Ready</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              {feature.interactiveOptions && (
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                  {feature.interactiveOptions.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setNotice(`Action "${opt}" dispatched.`);
                        setTimeout(() => setNotice(null), 2500);
                      }}
                      className="px-2 py-0.5 rounded bg-slate-800/70 hover:bg-slate-800 text-[11px] text-slate-300 transition-colors"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
