import React, { useState } from 'react';
import { FarmProfile } from '../types';
import { INDIAN_SOIL_REGIONS, CROPS_CATALOG } from '../mockData';
import {
  Settings,
  Sprout,
  Save,
  CheckCircle2,
  Layers
} from 'lucide-react';

interface FarmProfileViewProps {
  farmProfile: FarmProfile;
  setFarmProfile: React.Dispatch<React.SetStateAction<FarmProfile>>;
}

export const FarmProfileView: React.FC<FarmProfileViewProps> = ({
  farmProfile,
  setFarmProfile,
}) => {
  const [formData, setFormData] = useState<FarmProfile>({ ...farmProfile });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFarmProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="matte-card rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-800 text-emerald-400 text-xs font-medium mb-1.5">
            <Settings className="w-3.5 h-3.5" />
            <span>FARM CHARACTERISTICS & CROPS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Farm Settings & Soil Profile
          </h1>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Configure soil type and current crop cultivars to calibrate automated fertilizer and watering recommendations.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-[#0D131A] border border-slate-700 text-slate-200 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Farm configurations saved.</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="matte-card rounded-2xl p-6 sm:p-8 space-y-6">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2.5">
          <Sprout className="w-4 h-4 text-emerald-400" />
          <span>Farm Identity</span>
        </h2>

        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Farm Name</label>
            <input
              type="text"
              value={formData.farmName}
              onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
              className="w-full px-3 py-2 matte-input rounded-xl text-white"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Farm Owner / Lead</label>
            <input
              type="text"
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              className="w-full px-3 py-2 matte-input rounded-xl text-white"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Cultivated Area (Hectares)</label>
            <input
              type="number"
              step="0.1"
              value={formData.totalHectares}
              onChange={(e) => setFormData({ ...formData, totalHectares: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 matte-input rounded-xl text-white font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Weather City</label>
            <input
              type="text"
              value={formData.weatherCity}
              onChange={(e) => setFormData({ ...formData, weatherCity: e.target.value })}
              className="w-full px-3 py-2 matte-input rounded-xl text-white"
              required
            />
          </div>
        </div>

        <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2.5 pt-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Soil Database & Active Crops</span>
        </h2>

        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Indian Agro-Climatic Zone</label>
            <select
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="w-full px-3 py-2 bg-[#0D131A] border border-slate-800 rounded-xl text-white"
            >
              {INDIAN_SOIL_REGIONS.map((r, i) => (
                <option key={i} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Primary Crop Cultivar</label>
            <select
              value={formData.primaryCrop}
              onChange={(e) => setFormData({ ...formData, primaryCrop: e.target.value })}
              className="w-full px-3 py-2 bg-[#0D131A] border border-slate-800 rounded-xl text-white"
            >
              {CROPS_CATALOG.map((c, i) => (
                <option key={i} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Crop Stage</label>
            <input
              type="text"
              value={formData.cropStage}
              onChange={(e) => setFormData({ ...formData, cropStage: e.target.value })}
              className="w-full px-3 py-2 matte-input rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Language</label>
            <select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value as any })}
              className="w-full px-3 py-2 bg-[#0D131A] border border-slate-800 rounded-xl text-white"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="gu">ગુજરાતી</option>
              <option value="mr">मराठी</option>
            </select>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
