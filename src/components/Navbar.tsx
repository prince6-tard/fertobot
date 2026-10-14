import React, { useState } from 'react';
import { User, FarmProfile } from '../types';
import {
  Sprout,
  LayoutDashboard,
  Droplets,
  Radio,
  Camera,
  Bot,
  FileSpreadsheet,
  Sparkles,
  Settings,
  LogOut,
  CloudSun,
  Activity,
  Flame,
  CloudRain,
  RotateCcw,
  ShieldAlert,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  farmProfile: FarmProfile;
  setFarmProfile: React.Dispatch<React.SetStateAction<FarmProfile>>;
  onSimulateRain: () => void;
  onSimulateDepletion: () => void;
  onSimulateIntrusion: () => void;
  onResetSim: () => void;
  healthScore: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  farmProfile,
  setFarmProfile,
  onSimulateRain,
  onSimulateDepletion,
  onSimulateIntrusion,
  onResetSim,
  healthScore,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'irrigation', label: 'Irrigation', icon: Droplets },
    { id: 'probes', label: 'Probes', icon: Radio },
    { id: 'security', label: 'Security', icon: Camera },
    { id: 'voice', label: 'Agronomist', icon: Bot },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'features', label: 'Feature Studio', icon: Sparkles, badge: 'Type' },
    { id: 'profile', label: 'Farm Settings', icon: Settings },
  ];

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0E141B] border-b border-slate-800">
      {/* Top Status & Simulation Bar */}
      <div className="px-4 sm:px-6 py-1.5 bg-[#0A0E13] border-b border-slate-800/80 text-[11px] flex flex-wrap items-center justify-between text-slate-400 gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>5 NODES ONLINE</span>
          </div>
          <span className="text-slate-700 hidden sm:inline">•</span>
          <div className="hidden sm:flex items-center gap-1 text-slate-300">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Health: <strong className="text-white font-mono">{healthScore}%</strong></span>
          </div>
          <span className="text-slate-700 hidden md:inline">•</span>
          <div className="hidden md:flex items-center gap-1 text-slate-400">
            <CloudSun className="w-3.5 h-3.5 text-slate-400" />
            <span>{farmProfile.weatherCity} • 25°C</span>
          </div>
        </div>

        {/* Simulation Controls - Clean, minimal button strip */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500 font-mono hidden lg:inline mr-1">SIM:</span>
          <button
            onClick={onSimulateRain}
            title="Simulate Rain Shower"
            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-blue-300 text-[10px] flex items-center gap-1 transition-colors"
          >
            <CloudRain className="w-3 h-3 text-blue-400" />
            <span>+ Rain</span>
          </button>
          <button
            onClick={onSimulateDepletion}
            title="Simulate Nutrient Drop"
            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-amber-300 text-[10px] flex items-center gap-1 transition-colors"
          >
            <Flame className="w-3 h-3 text-amber-400" />
            <span>- NPK</span>
          </button>
          <button
            onClick={onSimulateIntrusion}
            title="Simulate CCTV Motion"
            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-rose-300 text-[10px] flex items-center gap-1 transition-colors"
          >
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            <span>! Intruder</span>
          </button>
          <button
            onClick={onResetSim}
            title="Reset Simulation"
            className="p-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleTabClick('dashboard')}
            className="flex items-center gap-2.5 text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              <Sprout className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-1">
                Ferto<span className="text-emerald-400">Bot</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono hidden sm:block">
                {farmProfile.farmName}
              </div>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  isActive
                    ? 'bg-emerald-600/15 text-emerald-400 font-semibold border border-emerald-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          {/* Language selector */}
          <select
            value={farmProfile.language}
            onChange={(e) => setFarmProfile({ ...farmProfile, language: e.target.value as any })}
            className="bg-[#0D131A] border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="en">EN</option>
            <option value="hi">हिन्दी</option>
            <option value="gu">ગુજરાતી</option>
            <option value="mr">मराठी</option>
          </select>

          {/* User Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-xs">
              {user.avatar || '👨‍🌾'}
            </div>
            <div className="hidden sm:block text-left text-xs">
              <div className="font-semibold text-white truncate max-w-[110px]">{user.name}</div>
            </div>

            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0A0E13] border-t border-slate-800 p-3 grid grid-cols-2 sm:grid-cols-4 gap-1.5 animate-fadeIn">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`p-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${
                  isActive
                    ? 'bg-emerald-600/20 text-emerald-400 font-bold border border-emerald-500/30'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-slate-400" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
