import React, { useState } from 'react';
import { User } from '../types';
import { DEMO_ACCOUNTS } from '../mockData';
import { Lock, User as UserIcon, Eye, EyeOff, Sprout, ArrowRight, ShieldCheck, Check } from 'lucide-react';

interface LoginModalProps {
  onLogin: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin }) => {
  const [usernameInput, setUsernameInput] = useState('prince');
  const [passwordInput, setPasswordInput] = useState('prince123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    if (!cleanUser) {
      setError('Please enter your username or email');
      return;
    }
    if (!cleanPass) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Check match with Prince or Friend or Demo
      const matched = DEMO_ACCOUNTS.find(
        acc =>
          (acc.id.toLowerCase() === cleanUser || acc.email.toLowerCase() === cleanUser) &&
          acc.pass === cleanPass
      );

      if (matched) {
        const userObj: User = {
          id: matched.id === 'prince' ? 'PRINCE-01' : matched.id === 'friend' ? 'FRIEND-02' : 'GUEST-03',
          name: matched.name,
          email: matched.email,
          role: matched.role,
          farmName: matched.farm,
          avatar: matched.id === 'prince' ? '👨‍🌾' : '🌾',
          joinedDate: 'Active Session'
        };
        setIsLoading(false);
        onLogin(userObj);
      } else {
        // Universal fallback for Vercel: allow password with at least 4 characters
        if (cleanPass.length >= 4) {
          const customUser: User = {
            id: `USER-${Math.floor(Math.random() * 899 + 100)}`,
            name: cleanUser.includes('@') ? cleanUser.split('@')[0] : cleanUser,
            email: cleanUser.includes('@') ? cleanUser : `${cleanUser}@fertobot.com`,
            role: 'farmer',
            farmName: 'Prince AgriTech Hub',
            avatar: '🌾',
            joinedDate: 'Active Session'
          };
          setIsLoading(false);
          onLogin(customUser);
        } else {
          setIsLoading(false);
          setError('Invalid credentials. Use "prince" / "prince123" or "friend" / "friend123".');
        }
      }
    }, 400);
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsernameInput(u);
    setPasswordInput(p);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#070B0E]/90 backdrop-blur-md">
      <div className="w-full max-w-xl matte-card rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
        
        {/* Top Header */}
        <div className="p-6 sm:p-8 border-b border-slate-800 bg-[#0E141B]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-1.5">
                  Ferto<span className="text-emerald-400">Bot</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-normal">v2.0</span>
                </h1>
                <p className="text-xs text-slate-400">Precision Agriculture OS</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Vercel Ready</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Sign in to access your farm telemetry, sprinkler valves, CCTV security, and dynamic features.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="prince or friend"
                  className="w-full pl-9 pr-3 py-2.5 matte-input rounded-xl text-sm font-mono"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 matte-input rounded-xl text-sm font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Dedicated Login Accounts Box */}
          <div className="pt-5 border-t border-slate-800/80">
            <div className="text-[11px] font-medium text-slate-400 mb-3">
              Click a card to auto-fill credentials for you or your friend:
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {/* Account 1: Prince */}
              <button
                type="button"
                onClick={() => handleQuickFill('prince', 'prince123')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  usernameInput === 'prince'
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-white'
                    : 'bg-[#0D131A] border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">Your Account</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">Lead</span>
                </div>
                <div className="text-xs font-mono text-emerald-400">username: <strong>prince</strong></div>
                <div className="text-xs font-mono text-slate-400">password: <strong>prince123</strong></div>
              </button>

              {/* Account 2: Friend */}
              <button
                type="button"
                onClick={() => handleQuickFill('friend', 'friend123')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  usernameInput === 'friend'
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-white'
                    : 'bg-[#0D131A] border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">Friend's Account</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono">Partner</span>
                </div>
                <div className="text-xs font-mono text-blue-400">username: <strong>friend</strong></div>
                <div className="text-xs font-mono text-slate-400">password: <strong>friend123</strong></div>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
