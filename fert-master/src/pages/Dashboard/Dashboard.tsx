import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, CircularProgress, IconButton, Switch, alpha,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  ArrowUpward as ArrowUpIcon,
  TrendingUp as TrendingUpIcon,
  WaterDrop as WaterIcon,
  Thermostat as ThermoIcon,
  Science as ScienceIcon,
  ElectricBolt as BoltIcon,
  WarningAmber as WarnIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ArrowForward as ArrowRightIcon,
  Memory as MemoryIcon,
  GridOn as GridIcon,
  Mic as MicIcon,
} from '@mui/icons-material';
import {
  BarChart, Bar, Cell, ResponsiveContainer, AreaChart, Area, Tooltip,
} from 'recharts';
import { fetchDashboardOverview, DashboardOverview } from '../../services/dashboardService';
import { useLanguage } from '../../context/LanguageContext';

// ── Design Tokens (Light Theme) ───────────────────────────
const ACCENT   = '#1A7F37';
const TEAL     = '#20C997';
const AMBER    = '#F59E0B';
const RED      = '#EF4444';
const BLUE     = '#3B82F6';
const PURPLE   = '#8B5CF6';
const TEXT     = '#111827';
const MUTED    = '#6B7280';
const CARD     = '#FFFFFF';
const CARD_E   = '#F9FAFB';
const BG       = '#F5F8F6';
const BORDER   = 'rgba(0,0,0,0.08)';
const SHADOW   = '0 4px 12px rgba(0,0,0,0.03)';

// ── Helpers ───────────────────────────────────────────────
const getUserName = (): string => {
  const token = localStorage.getItem('token');
  if (!token) return 'Farmer';
  try {
    const p = JSON.parse(atob(token.split('.')[1]));
    return p.firstName || p.name || 'Farmer';
  } catch { return 'Farmer'; }
};

const computeHealthScore = (o: DashboardOverview): number => {
  const r = o.recentReadings[0];
  if (!r) return 98;
  let s = 100;
  if (r.soilMoisture < 30 || r.soilMoisture > 80) s -= 15;
  if (r.pH < 5.5 || r.pH > 8) s -= 20;
  if (r.temperature > 40 || r.temperature < 5) s -= 15;
  if (r.batteryLevel < 20) s -= 10;
  s -= o.summary.offlineProbes * 8;
  return Math.max(0, Math.min(100, s));
};

const getTimeAgo = (d: Date) => {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
};

const getSevColor = (sev: string) => {
  if (sev === 'critical' || sev === 'error') return RED;
  if (sev === 'warning') return AMBER;
  return BLUE;
};

const getSevIcon = (sev: string) => {
  if (sev === 'critical' || sev === 'error') return ErrorIcon;
  if (sev === 'warning') return WarnIcon;
  return InfoIcon;
};

// ── Stat Pill ─────────────────────────────────────────────
const StatPill: React.FC<{
  icon: React.ElementType; label: string; value: string | number;
  unit?: string; color: string;
}> = ({ icon: Icon, label, value, unit, color }) => (
  <Box sx={{
    display: 'flex', alignItems: 'center', gap: 1.5,
    px: 2.5, py: 2, borderRadius: '16px',
    bgcolor: CARD_E, border: `1px solid ${BORDER}`,
    flex: '1 1 0', minWidth: 0,
    transition: 'border-color 0.2s, transform 0.2s',
    '&:hover': { borderColor: alpha(color, 0.3), transform: 'translateY(-2px)' },
    className: 'nexus-card',
  }}>
    <Box sx={{
      width: 48, height: 48, borderRadius: '12px', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      bgcolor: alpha(color, 0.1), border: `1px solid ${alpha(color, 0.18)}`,
    }}>
      <Icon sx={{ fontSize: 26, color }} />
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: MUTED, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: '"DM Mono", monospace', mb: 0.25 }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.3 }}>
        <Typography sx={{ fontFamily: '"DM Mono", monospace', fontSize: '1.8rem', fontWeight: 700, color, lineHeight: 1.1 }}>
          {value}
        </Typography>
        {unit && <Typography sx={{ fontFamily: '"DM Mono", monospace', fontSize: '0.8rem', color: alpha(color, 0.5) }}>{unit}</Typography>}
      </Box>
    </Box>
  </Box>
);

// ── Resource Bar ──────────────────────────────────────────
const ResourceBar: React.FC<{
  label: string; sublabel: string; value: number; color: string; status: string;
}> = ({ label, sublabel, value, color, status }) => (
  <Box sx={{ py: 1.25, borderBottom: `1px solid ${BORDER}`, '&:last-child': { borderBottom: 'none' } }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
      <Box>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: TEXT, fontFamily: '"Inter", sans-serif', lineHeight: 1.2 }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: '0.6rem', color: MUTED, fontFamily: '"DM Mono", monospace' }}>{sublabel}</Typography>
      </Box>
      <Box sx={{ textAlign: 'right' }}>
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color, fontFamily: '"DM Mono", monospace' }}>
          {value}%
        </Typography>
        <Typography sx={{ fontSize: '0.5rem', color, fontFamily: '"DM Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {status}
        </Typography>
      </Box>
    </Box>
    <Box sx={{ height: 3, bgcolor: alpha(color, 0.1), borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{
        height: '100%', width: `${value}%`, borderRadius: 2,
        background: `linear-gradient(90deg, ${alpha(color, 0.6)}, ${color})`,
        boxShadow: `0 0 6px ${alpha(color, 0.4)}`,
        transition: 'width 0.8s ease',
      }} />
    </Box>
  </Box>
);

// ── NPK Dial ──────────────────────────────────────────────
const NpkDial: React.FC<{ label: string; value: number; max: number; color: string; symbol: string }> = ({ label, value, max, color, symbol }) => {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
      <Box sx={{
        width: 64, height: 64, borderRadius: '50%', position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `conic-gradient(${color} 0% ${pct}%, rgba(255,255,255,0.05) ${pct}% 100%)`,
        boxShadow: `0 0 12px ${alpha(color, 0.25)}`,
      }}>
        <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: CARD_E, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Typography sx={{ fontSize: '0.7rem', lineHeight: 1 }}>{symbol}</Typography>
          <Typography sx={{ fontFamily: '"DM Mono", monospace', fontSize: '0.72rem', fontWeight: 700, color, lineHeight: 1.1 }}>{value || '—'}</Typography>
        </Box>
      </Box>
      <Typography sx={{ fontSize: '0.58rem', color: MUTED, fontFamily: '"DM Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</Typography>
      <Typography sx={{ fontSize: '0.52rem', color: alpha(color, 0.5), fontFamily: '"DM Mono", monospace' }}>mg/kg</Typography>
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [overview, setOverview]         = useState<DashboardOverview | null>(null);
  const [loading, setLoading]           = useState(true);
  const [irrigationOn, setIrrigationOn] = useState(true);
  const [fertOn, setFertOn]             = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'warning'>('all');
  const { t } = useLanguage();
  const userName = useMemo(getUserName, []);

  const [refreshing, setRefreshing]     = useState(false);

  const load = async (forceRefresh = false) => {
    if (forceRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      setOverview(await fetchDashboardOverview(forceRefresh));
    } catch { /* silent */ }
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void load(false);
    // Poll every 30s to check for 5-min window expiration
    const interval = setInterval(() => void load(false), 30000);
    return () => clearInterval(interval);
  }, []);

  const latest       = overview?.recentReadings[0] ?? null;
  const healthScore  = overview ? computeHealthScore(overview) : 98;
  const totalNodes   = overview?.probes.length ?? 0;
  const onlineNodes  = overview?.probes.filter(p => p.status === 'online').length ?? 0;
  const allAlerts    = overview?.alerts ?? [];
  const recentAlerts = allAlerts.slice(0, 6);

  const filteredAlerts = useMemo(() => {
    if (activeFilter === 'all') return recentAlerts;
    return recentAlerts.filter(a => a.severity === activeFilter ||
      (activeFilter === 'critical' && a.severity === 'error'));
  }, [recentAlerts, activeFilter]);

  // Sparkline data
  const sparkData = useMemo(() => {
    const rr = [...(overview?.recentReadings ?? [])].reverse().slice(-12);
    if (rr.length === 0) return [45, 62, 78, 55, 80, 70, 65, 88, 72, 95, 85, 90].map((v, i) => ({ v, i }));
    return rr.map((r, i) => ({ v: Math.round(r.soilMoisture), i }));
  }, [overview]);

  const npk = {
    n: Math.round(latest?.nitrogen   ?? 105),
    p: Math.round(latest?.phosphorus ?? 43),
    k: Math.round(latest?.potassium  ?? 210),
  };

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <Box sx={{ width: '100%', pb: 3 }}>

      {/* ── PAGE HEADER ── */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography sx={{
            fontFamily: '"Inter", sans-serif', fontWeight: 800, letterSpacing: '-0.03em',
            fontSize: { xs: '1.6rem', md: '2rem' }, color: TEXT, lineHeight: 1.1, mb: 0.4,
          }}>
            {greeting}, {userName}
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: MUTED, fontFamily: '"Inter", sans-serif', maxWidth: 480, lineHeight: 1.65 }}>
            {loading
              ? 'Fetching live data from your field nodes…'
              : `Field ecosystem nominal · ${onlineNodes || 10} of ${totalNodes || 14} nodes streaming · Next irrigation at 06:00 AM`}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
          <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
            <Typography sx={{ fontSize: '0.65rem', color: MUTED, fontWeight: 600 }}>
              Updated: {overview?.generatedAt ? new Date(overview.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
            </Typography>
            <Typography sx={{ fontSize: '0.6rem', color: alpha(ACCENT, 0.8), fontWeight: 500 }}>
              5-min cycle
            </Typography>
          </Box>
          <IconButton
            size="small"
            disabled={loading || refreshing}
            onClick={() => void load(true)}
            title="Refresh now (Generates new reading cycle)"
            sx={{
              color: MUTED, border: `1px solid ${BORDER}`, borderRadius: '8px', p: 1,
              '&:hover': { color: ACCENT, borderColor: 'rgba(40,167,69,0.2)', bgcolor: alpha(ACCENT, 0.05) },
            }}
          >
            <RefreshIcon sx={{
              fontSize: 18,
              transition: 'transform 0.4s ease',
              ...(refreshing && { animation: 'spin 1s linear infinite' }),
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }} />
          </IconButton>
        </Box>
      </Box>

      {/* ── MAIN 2-COLUMN LAYOUT ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 320px' }, gap: 2, alignItems: 'start' }}>

        {/* ═══ LEFT COLUMN ═══ */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* STAT PILLS ROW */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 1.25 }}>
            <StatPill icon={WaterIcon}  label="Soil Moisture" value={latest ? Math.round(latest.soilMoisture) : '—'} unit="%" color={BLUE} />
            <StatPill icon={ThermoIcon} label="Temperature"   value={latest ? latest.temperature.toFixed(1) : '—'}   unit="°C" color={AMBER} />
            <StatPill icon={ScienceIcon} label="pH Level"     value={latest ? latest.pH.toFixed(1) : '—'}            color={TEAL} />
            <StatPill icon={BoltIcon}   label="Conductivity"  value={latest ? latest.conductivity.toFixed(1) : '—'}  unit="mS" color={PURPLE} />
          </Box>

          {/* INTELLIGENCE FEED */}
          <Box sx={{ bgcolor: CARD, borderRadius: '16px', border: `1px solid ${BORDER}`, boxShadow: SHADOW, overflow: 'hidden' }}>

            {/* Feed header */}
            <Box sx={{ px: 2.5, pt: 2.25, pb: 2, borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: '1.05rem', color: TEXT, mb: 0.2 }}>
                  Active Intelligence
                </Typography>
                <Typography sx={{ fontSize: '0.64rem', color: MUTED, fontFamily: '"DM Mono", monospace' }}>
                  Real-time alerts and system diagnostics
                </Typography>
              </Box>
              {/* Filter pills */}
              <Box sx={{ display: 'flex', gap: 0.75 }}>
                {(['all', 'critical', 'warning'] as const).map(f => (
                  <Box key={f} onClick={() => setActiveFilter(f)} sx={{
                    px: 1.25, py: 0.5, borderRadius: '20px', cursor: 'pointer',
                    fontSize: '0.6rem', fontWeight: 700, fontFamily: '"DM Mono", monospace',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    transition: 'all 0.15s',
                    bgcolor: activeFilter === f ? (f === 'all' ? 'rgba(40,167,69,0.12)' : f === 'critical' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)') : 'transparent',
                    color: activeFilter === f ? (f === 'all' ? ACCENT : f === 'critical' ? RED : AMBER) : MUTED,
                    border: `1px solid ${activeFilter === f ? (f === 'all' ? 'rgba(40,167,69,0.2)' : f === 'critical' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)') : BORDER}`,
                  }}>
                    {f}
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Alert cards */}
            <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2 }}>
                  <CircularProgress size={16} sx={{ color: ACCENT }} />
                  <Typography sx={{ fontSize: '0.75rem', color: MUTED, fontFamily: '"Inter", sans-serif' }}>Loading intelligence feed…</Typography>
                </Box>
              ) : filteredAlerts.length > 0 ? filteredAlerts.map((alert, idx) => {
                const c = getSevColor(alert.severity);
                const SevIcon = getSevIcon(alert.severity);
                const bgLabel = alert.severity === 'error' || alert.severity === 'critical' ? 'CRITICAL INTERFERENCE' :
                                alert.severity === 'warning' ? 'RESOURCE & ENVIRONMENTAL STATE' : 'SYSTEM UPDATE';
                const bgColor = alert.severity === 'error' || alert.severity === 'critical' ? RED :
                                alert.severity === 'warning' ? AMBER : BLUE;
                return (
                  <Box key={alert.id} className="nexus-card" sx={{
                    borderRadius: '12px', overflow: 'hidden',
                    border: `1px solid ${alpha(c, 0.15)}`,
                    bgcolor: alpha(c, 0.04),
                    animationDelay: `${idx * 0.06}s`,
                    transition: 'border-color 0.2s, background-color 0.2s',
                    '&:hover': { borderColor: alpha(c, 0.3), bgcolor: alpha(c, 0.07) },
                  }}>
                    {/* Category label bar */}
                    <Box sx={{ px: 1.75, py: 0.55, bgcolor: alpha(bgColor, 0.08), borderBottom: `1px solid ${alpha(bgColor, 0.12)}` }}>
                      <Typography sx={{ fontSize: '0.5rem', fontWeight: 700, color: bgColor, fontFamily: '"DM Mono", monospace', letterSpacing: '0.12em' }}>
                        ● {bgLabel}
                      </Typography>
                    </Box>

                    <Box sx={{ p: 1.75, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      {/* Icon */}
                      <Box sx={{
                        width: 36, height: 36, borderRadius: '9px', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: alpha(c, 0.12), border: `1px solid ${alpha(c, 0.2)}`,
                        mt: 0.1,
                      }}>
                        <SevIcon sx={{ fontSize: 17, color: c }} />
                      </Box>

                      {/* Content */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 0.4 }}>
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: TEXT, fontFamily: '"Inter", sans-serif', lineHeight: 1.35 }}>
                            {alert.title}
                          </Typography>
                          <Typography sx={{ fontSize: '0.58rem', color: MUTED, fontFamily: '"DM Mono", monospace', flexShrink: 0 }}>
                            {getTimeAgo(new Date(alert.timestamp))}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: '0.72rem', color: alpha(TEXT, 0.55), fontFamily: '"Inter", sans-serif', lineHeight: 1.5, mb: 1 }}>
                          {alert.message || 'Automated detection system identified anomaly. Field operator notification dispatched.'}
                        </Typography>

                        {/* Action buttons */}
                        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                          <Box sx={{
                            px: 1.25, py: 0.5, borderRadius: '7px', cursor: 'pointer',
                            bgcolor: alpha(c, 0.1), border: `1px solid ${alpha(c, 0.2)}`,
                            fontSize: '0.62rem', fontWeight: 700, color: c,
                            fontFamily: '"DM Mono", monospace', letterSpacing: '0.06em',
                            transition: 'all 0.15s',
                            '&:hover': { bgcolor: alpha(c, 0.18) },
                          }}>
                            {alert.severity === 'critical' || alert.severity === 'error' ? 'Dispatch Security' : 'Acknowledge'}
                          </Box>
                          <Box sx={{
                            px: 1.25, py: 0.5, borderRadius: '7px', cursor: 'pointer',
                            border: `1px solid ${BORDER}`,
                            fontSize: '0.62rem', fontWeight: 600, color: MUTED,
                            fontFamily: '"DM Mono", monospace', letterSpacing: '0.06em',
                            transition: 'all 0.15s',
                            '&:hover': { borderColor: alpha(TEXT, 0.15), color: TEXT },
                          }}>
                            Dismiss
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                );
              }) : (
                <Box sx={{
                  p: 2.5, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 1.5,
                  bgcolor: alpha(ACCENT, 0.04), border: `1px solid ${alpha(ACCENT, 0.12)}`,
                }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '9px', bgcolor: alpha(ACCENT, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckIcon sx={{ fontSize: 17, color: ACCENT }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: ACCENT, fontFamily: '"Inter", sans-serif' }}>All systems nominal</Typography>
                    <Typography sx={{ fontSize: '0.64rem', color: MUTED, fontFamily: '"Inter", sans-serif' }}>No active alerts or anomalies detected</Typography>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Feed footer */}
            <Box sx={{ px: 2.5, py: 1.5, borderTop: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'flex-end' }}>
              <Box onClick={() => navigate('/security')} sx={{
                display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer',
                fontSize: '0.62rem', fontWeight: 700, color: MUTED,
                fontFamily: '"DM Mono", monospace', letterSpacing: '0.1em', textTransform: 'uppercase',
                transition: 'color 0.15s',
                '&:hover': { color: ACCENT },
              }}>
                View all alerts <ArrowRightIcon sx={{ fontSize: 12 }} />
              </Box>
            </Box>
          </Box>

          {/* FARM HEALTH + CONTROLS ROW */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>

            {/* Farm Health Score */}
            <Box sx={{ bgcolor: CARD, borderRadius: '16px', border: `1px solid ${BORDER}`, boxShadow: SHADOW, p: 2.5, overflow: 'hidden', position: 'relative' }}>
              {/* Subtle bg glow */}
              <Box sx={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(ACCENT, 0.08)} 0%, transparent 70%)`, pointerEvents: 'none' }} />

              <Typography sx={{ fontSize: '0.52rem', fontWeight: 700, color: MUTED, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: '"DM Mono", monospace', mb: 1.5 }}>
                Farm Health Score
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, mb: 1.5 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                    <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: '3.5rem', fontWeight: 800, color: ACCENT, lineHeight: 1, letterSpacing: '-0.04em',
                      textShadow: `0 0 20px ${alpha(ACCENT, 0.4)}` }}>
                      {loading ? '—' : healthScore}
                    </Typography>
                    <Typography sx={{ fontFamily: '"DM Mono", monospace', fontSize: '1.4rem', color: alpha(ACCENT, 0.45) }}>%</Typography>
                  </Box>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4, px: 0.9, py: 0.3, borderRadius: '20px', bgcolor: alpha(ACCENT, 0.1), border: `1px solid ${alpha(ACCENT, 0.2)}` }}>
                    <ArrowUpIcon sx={{ fontSize: 10, color: ACCENT }} />
                    <Typography sx={{ fontSize: '0.58rem', fontWeight: 700, color: ACCENT, fontFamily: '"DM Mono", monospace' }}>+2.4% this week</Typography>
                  </Box>
                </Box>

                {/* Mini sparkline */}
                <Box sx={{ flex: 1, height: 55 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparkData} margin={{ top: 2, right: 2, bottom: 0, left: 0 }}>
                      <defs>
                        <linearGradient id="accentGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={ACCENT} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="v" stroke={ACCENT} strokeWidth={1.5} fill="url(#accentGrad)" dot={false} isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 3 }}>
                {[
                  { val: totalNodes || 14, label: 'Total Nodes' },
                  { val: onlineNodes || 10, label: 'Online' },
                  { val: allAlerts.length || 3, label: 'Active Alerts' },
                ].map(s => (
                  <Box key={s.label}>
                    <Typography sx={{ fontFamily: '"DM Mono", monospace', fontSize: '1rem', fontWeight: 700, color: TEXT }}>{s.val}</Typography>
                    <Typography sx={{ fontSize: '0.52rem', color: MUTED, fontFamily: '"Inter", sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Controls */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              {[
                { icon: '💧', label: t('smartWater'), status: irrigationOn, setStatus: setIrrigationOn, color: BLUE, sub: irrigationOn ? 'Next cycle · 06:00 AM' : t('manualMode') },
                { icon: '🌿', label: t('smartKhaad'),   status: fertOn,       setStatus: setFertOn,       color: ACCENT, sub: fertOn ? t('activeBalanced') : t('manualAdj') },
              ].map(ctrl => (
                <Box key={ctrl.label} sx={{ bgcolor: CARD, borderRadius: '14px', border: `1px solid ${BORDER}`, boxShadow: SHADOW, p: 2, flex: 1,
                  transition: 'border-color 0.2s',
                  ...(ctrl.status && { borderColor: alpha(ctrl.color, 0.2) }),
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ width: 34, height: 34, borderRadius: '9px', bgcolor: alpha(ctrl.color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', border: `1px solid ${alpha(ctrl.color, 0.15)}` }}>
                      {ctrl.icon}
                    </Box>
                    <Switch size="small" checked={ctrl.status} onChange={e => ctrl.setStatus(e.target.checked)}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: ctrl.color }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: alpha(ctrl.color, 0.4) } }} />
                  </Box>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: TEXT, fontFamily: '"Inter", sans-serif', mb: 0.2 }}>{ctrl.label}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: ctrl.status ? ctrl.color : MUTED,
                      ...(ctrl.status && { animation: 'pulse-dot 2s ease-in-out infinite' }) }} />
                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: ctrl.status ? ctrl.color : MUTED, fontFamily: '"DM Mono", monospace', letterSpacing: '0.06em' }}>
                      {ctrl.status ? 'ENABLED' : 'DISABLED'}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.58rem', color: MUTED, fontFamily: '"Inter", sans-serif', mt: 0.15 }}>{ctrl.sub}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* NPK + FIELD MAP */}
          <Box sx={{ bgcolor: CARD, borderRadius: '16px', border: `1px solid ${BORDER}`, boxShadow: SHADOW, overflow: 'hidden' }}>
            <Box sx={{ px: 2.5, pt: 2.25, pb: 1.75, borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: '1rem', color: TEXT, mb: 0.15 }}>Nutrient Concentration</Typography>
                <Typography sx={{ fontSize: '0.6rem', color: MUTED, fontFamily: '"DM Mono", monospace' }}>NPK · Real-time soil analysis</Typography>
              </Box>
              <Box sx={{ display: 'inline-flex', px: 1, py: 0.4, borderRadius: '20px', bgcolor: alpha(ACCENT, 0.1), border: `1px solid ${alpha(ACCENT, 0.2)}` }}>
                <Typography sx={{ fontSize: '0.56rem', fontWeight: 700, color: ACCENT, fontFamily: '"DM Mono", monospace', letterSpacing: '0.08em' }}>FULL NUTRIENT</Typography>
              </Box>
            </Box>
            <Box sx={{ p: 2.5 }}>
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CircularProgress size={16} sx={{ color: ACCENT }} />
                  <Typography sx={{ fontSize: '0.75rem', color: MUTED }}>Loading nutrient data…</Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(3, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2.5, justifyItems: 'center' }}>
                  <NpkDial label="Nitrogen"   value={npk.n} max={300} color={ACCENT}  symbol="🌿" />
                  <NpkDial label="Phosphorus" value={npk.p} max={200} color={AMBER}   symbol="⚡" />
                  <NpkDial label="Potassium"  value={npk.k} max={400} color={PURPLE}  symbol="💎" />
                </Box>
              )}
            </Box>
          </Box>

          {/* SPATIAL MAP */}
          <Box sx={{ bgcolor: CARD, borderRadius: '16px', border: `1px solid ${BORDER}`, boxShadow: SHADOW, overflow: 'hidden' }}>
            <Box sx={{ px: 2.5, pt: 2, pb: 1.75, borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: '1rem', color: TEXT, mb: 0.15 }}>Spatial Monitoring</Typography>
                <Typography sx={{ fontSize: '0.6rem', color: MUTED, fontFamily: '"DM Mono", monospace' }}>Geo-node streaming · 4 active zones</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, px: 1, py: 0.4, borderRadius: '20px', bgcolor: alpha(TEAL, 0.08), border: `1px solid ${alpha(TEAL, 0.15)}` }}>
                <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: TEAL, animation: 'pulse-dot 2s ease-in-out infinite' }} />
                <Typography sx={{ fontSize: '0.54rem', fontWeight: 700, color: TEAL, fontFamily: '"DM Mono", monospace', letterSpacing: '0.08em' }}>LIVE STREAM</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '180px 1fr' } }}>
              <Box sx={{ borderRight: { md: `1px solid ${BORDER}` }, p: 1.75, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                {[
                  { label: 'Spatial View',     sub: 'Active zones: 4',                icon: GridIcon,  color: ACCENT, active: true },
                  { label: 'Node Management',  sub: 'Valley Ridge · Sector 5',         icon: MemoryIcon, color: TEAL,  active: false },
                ].map(item => (
                  <Box key={item.label} sx={{
                    display: 'flex', alignItems: 'flex-start', gap: 1.25, p: 1.25, borderRadius: '10px',
                    cursor: 'pointer',
                    bgcolor: item.active ? alpha(item.color, 0.07) : 'transparent',
                    border: `1px solid ${item.active ? alpha(item.color, 0.15) : 'transparent'}`,
                    '&:hover': { bgcolor: alpha(item.color, 0.06) },
                  }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: '7px', bgcolor: alpha(item.color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <item.icon sx={{ fontSize: 14, color: item.color }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.74rem', fontWeight: 600, color: TEXT, fontFamily: '"Inter", sans-serif' }}>{item.label}</Typography>
                      <Typography sx={{ fontSize: '0.58rem', color: MUTED, fontFamily: '"DM Mono", monospace' }}>{item.sub}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Field map */}
              <Box sx={{
                minHeight: 180, position: 'relative', overflow: 'hidden',
                background: 'linear-gradient(160deg, #E8F5E9 0%, #C8E6C9 40%, #A5D6A7 70%, #81C784 100%)',
              }}>
                {/* Radial glow nodes */}
                {[{ x: 55, y: 45, r: 0.12 }, { x: 28, y: 62, r: 0.08 }, { x: 72, y: 28, r: 0.1 }].map((g, i) => (
                  <Box key={i} sx={{ position: 'absolute', inset: 0, pointerEvents: 'none',
                    backgroundImage: `radial-gradient(ellipse at ${g.x}% ${g.y}%, rgba(40,167,69,${g.r}) 0%, transparent 50%)` }} />
                ))}
                {/* Grid lines */}
                {[15, 35, 55, 75].map((pct, i) => (
                  <Box key={i} sx={{ position: 'absolute', top: `${pct}%`, left: '3%', right: '3%', height: '1px', background: `rgba(40,167,69,${0.06 + i * 0.02})`, pointerEvents: 'none' }} />
                ))}
                {[20, 40, 60, 80].map((pct, i) => (
                  <Box key={i} sx={{ position: 'absolute', left: `${pct}%`, top: '3%', bottom: '3%', width: '1px', background: `rgba(40,167,69,${0.04 + i * 0.01})`, pointerEvents: 'none' }} />
                ))}
                {/* Active zone */}
                <Box sx={{ position: 'absolute', bottom: '25%', right: '28%', width: 85, height: 50, borderRadius: '38%',
                  border: `1.5px solid rgba(40,167,69,0.5)`, boxShadow: '0 0 20px rgba(40,167,69,0.18), inset 0 0 14px rgba(40,167,69,0.08)', pointerEvents: 'none' }} />
                {/* Sensor dots */}
                {[{ x: 28, y: 42, main: true }, { x: 52, y: 35, main: false }, { x: 68, y: 60, main: false }, { x: 38, y: 68, main: false }].map((pos, i) => (
                  <Box key={i} sx={{
                    position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`,
                    width: pos.main ? 10 : 7, height: pos.main ? 10 : 7,
                    borderRadius: '50%', bgcolor: pos.main ? ACCENT : alpha(ACCENT, 0.45),
                    boxShadow: pos.main ? `0 0 12px ${ACCENT}` : 'none',
                    border: `1.5px solid ${alpha(ACCENT, 0.5)}`, transform: 'translate(-50%, -50%)',
                  }} />
                ))}
                {/* Label chip */}
                <Box sx={{ position: 'absolute', bottom: '18%', right: '24%', px: 1.1, py: 0.4, borderRadius: '6px',
                  bgcolor: 'rgba(0,0,0,0.7)', border: `1px solid ${alpha(ACCENT, 0.25)}`, backdropFilter: 'blur(4px)' }}>
                  <Typography sx={{ fontSize: '0.52rem', color: ACCENT, fontFamily: '"DM Mono", monospace', letterSpacing: '0.06em' }}>
                    Valley Ridge · Sector 5
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* AI CTA */}
          <Box onClick={() => navigate('/voice-chatbot')} sx={{
            bgcolor: CARD, borderRadius: '14px', border: `1px solid rgba(40,167,69,0.12)`,
            boxShadow: SHADOW, p: 2, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 1.5,
            background: `linear-gradient(135deg, rgba(40,167,69,0.05) 0%, rgba(32,201,151,0.03) 100%)`,
            transition: 'all 0.2s ease',
            '&:hover': { boxShadow: `0 4px 24px ${alpha(ACCENT, 0.15)}`, transform: 'translateY(-1px)', borderColor: 'rgba(40,167,69,0.25)' },
          }}>
            <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: `linear-gradient(135deg, ${alpha(ACCENT, 0.2)}, ${alpha(TEAL, 0.1)})`,
              border: `1px solid ${alpha(ACCENT, 0.25)}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 16px ${alpha(ACCENT, 0.2)}`, flexShrink: 0 }}>
              <MicIcon sx={{ fontSize: 20, color: ACCENT }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: TEXT, fontFamily: '"Inter", sans-serif', mb: 0.15 }}>AI Crop Advisory</Typography>
              <Typography sx={{ fontSize: '0.6rem', color: alpha(ACCENT, 0.7), fontFamily: '"DM Mono", monospace', letterSpacing: '0.07em' }}>
                VOICE + CHAT ASSISTANT · TAP TO OPEN
              </Typography>
            </Box>
            <ArrowRightIcon sx={{ fontSize: 16, color: MUTED }} />
          </Box>
        </Box>

        {/* ═══ RIGHT COLUMN ═══ */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* FERTILIZER RECOMMENDATIONS */}
          <Box sx={{ bgcolor: CARD, borderRadius: '16px', border: `1px solid ${BORDER}`, boxShadow: SHADOW, overflow: 'hidden' }}>
            <Box sx={{ px: 2.25, pt: 2, pb: 1.75, borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Typography sx={{ fontSize: '1.3rem' }}>🌾</Typography>
              <Box>
                <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 800, fontSize: '0.95rem', color: TEXT, mb: 0.15 }}>{t('khaadAdvice')}</Typography>
                <Typography sx={{ fontSize: '0.7rem', color: MUTED, fontWeight: 500 }}>{t('soilBased')}</Typography>
              </Box>
            </Box>
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {(!latest || (latest.nitrogen >= 40 && latest.phosphorus >= 30 && latest.potassium >= 30 && healthScore > 80)) ? (
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: alpha(ACCENT, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Typography sx={{ fontSize: '1.1rem' }}>✅</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: TEXT }}>{t('cropHealthy')}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: MUTED, mt: 0.25, lineHeight: 1.4 }}>{t('cropHealthySub')}</Typography>
                  </Box>
                </Box>
              ) : (
                <>
                  {latest.nitrogen < 40 && (
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: alpha(ACCENT, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Typography sx={{ fontSize: '1.1rem' }}>⚪</Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: TEXT }}>{t('urea')}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: MUTED, mt: 0.25, lineHeight: 1.4 }}>{t('ureaLowN')}</Typography>
                      </Box>
                    </Box>
                  )}
                  {(latest.phosphorus < 30 || latest.potassium < 30) && (
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: alpha(TEAL, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Typography sx={{ fontSize: '1.1rem' }}>🧪</Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: TEXT }}>{t('npk')}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: MUTED, mt: 0.25, lineHeight: 1.4 }}>{t('npkLowP')}</Typography>
                      </Box>
                    </Box>
                  )}
                  {healthScore < 80 && (
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: alpha(AMBER, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Typography sx={{ fontSize: '1.1rem' }}>🍂</Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: TEXT }}>{t('compost')}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: MUTED, mt: 0.25, lineHeight: 1.4 }}>{t('compostAdvice')}</Typography>
                      </Box>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Box>

          {/* CROP PROTECTION */}
          <Box sx={{ bgcolor: CARD, borderRadius: '16px', border: `1px solid ${BORDER}`, boxShadow: SHADOW, overflow: 'hidden' }}>
            <Box sx={{ px: 2.25, pt: 2, pb: 1.75, borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Typography sx={{ fontSize: '1.3rem' }}>🛡️</Typography>
              <Box>
                <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 800, fontSize: '0.95rem', color: TEXT, mb: 0.15 }}>{t('pestControl')}</Typography>
                <Typography sx={{ fontSize: '0.7rem', color: MUTED, fontWeight: 500 }}>{t('protectCrop')}</Typography>
              </Box>
            </Box>
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {(!latest || (latest.temperature < 28 && latest.humidity < 60)) ? (
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: alpha(ACCENT, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Typography sx={{ fontSize: '1.1rem' }}>👍</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: TEXT }}>{t('noPests')}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: MUTED, mt: 0.25, lineHeight: 1.4 }}>{t('noPestsSub')}</Typography>
                  </Box>
                </Box>
              ) : (
                <>
                  {latest.temperature >= 28 && (
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: alpha(ACCENT, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Typography sx={{ fontSize: '1.1rem' }}>🌿</Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: TEXT }}>{t('neemOil')}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: MUTED, mt: 0.25, lineHeight: 1.4 }}>{t('neemAdvice')}</Typography>
                      </Box>
                    </Box>
                  )}
                  {latest.humidity >= 60 && (
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: alpha(BLUE, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Typography sx={{ fontSize: '1.1rem' }}>💦</Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: TEXT }}>{t('fungicide')}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: MUTED, mt: 0.25, lineHeight: 1.4 }}>{t('fungiAdvice')}</Typography>
                      </Box>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Box>

          {/* LIVE CAMERA PREVIEW */}
          <Box onClick={() => navigate('/security')} sx={{
            bgcolor: CARD, borderRadius: '16px', border: `1px solid ${BORDER}`,
            boxShadow: SHADOW, overflow: 'hidden', cursor: 'pointer',
            transition: 'border-color 0.2s',
            '&:hover': { borderColor: 'rgba(40,167,69,0.2)' },
          }}>
            <Box sx={{ p: 1.75, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${BORDER}` }}>
              <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: '0.9rem', color: TEXT }}>Live Feed</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 0.85, py: 0.35, borderRadius: '20px', bgcolor: alpha(RED, 0.1), border: `1px solid ${alpha(RED, 0.2)}` }}>
                <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: RED, animation: 'pulse-dot 1.5s ease-in-out infinite' }} />
                <Typography sx={{ fontSize: '0.5rem', fontWeight: 700, color: RED, fontFamily: '"DM Mono", monospace', letterSpacing: '0.1em' }}>RECORDING</Typography>
              </Box>
            </Box>
            <Box sx={{
              height: 140, position: 'relative', overflow: 'hidden',
              background: 'linear-gradient(160deg, #E8F5E9 0%, #C8E6C9 50%, #A5D6A7 100%)',
            }}>
              <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 50% 50%, rgba(40,167,69,0.07) 0%, transparent 65%)' }} />
              {/* Scanline effect */}
              <Box sx={{ position: 'absolute', left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${alpha(ACCENT, 0.3)}, transparent)`,
                animation: 'scan-line 3s linear infinite', top: 0 }} />
              {/* Corner brackets */}
              {[{ top: 12, left: 12 }, { top: 12, right: 12 }, { bottom: 12, left: 12 }, { bottom: 12, right: 12 }].map((pos, i) => (
                <Box key={i} sx={{ position: 'absolute', ...pos, width: 16, height: 16, borderColor: alpha(ACCENT, 0.5),
                  borderStyle: 'solid',
                  borderTopWidth: pos.bottom !== undefined ? 0 : 1.5,
                  borderBottomWidth: pos.top !== undefined ? 0 : 1.5,
                  borderLeftWidth: pos.right !== undefined ? 0 : 1.5,
                  borderRightWidth: pos.left !== undefined ? 0 : 1.5,
                }} />
              ))}
              {/* Center reticle */}
              <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 30, height: 30,
                borderRadius: '50%', border: `1px solid ${alpha(ACCENT, 0.25)}` }} />
              {/* Label */}
              <Box sx={{ position: 'absolute', bottom: 10, left: 12, px: 1, py: 0.4, borderRadius: '5px', bgcolor: 'rgba(0,0,0,0.65)', border: `1px solid ${alpha(ACCENT, 0.2)}` }}>
                <Typography sx={{ fontSize: '0.5rem', color: ACCENT, fontFamily: '"DM Mono", monospace', letterSpacing: '0.08em' }}>Sector A-12 Cam</Typography>
              </Box>
            </Box>
          </Box>

          {/* RECENT ALERTS MINI */}
          <Box sx={{ bgcolor: CARD, borderRadius: '16px', border: `1px solid ${BORDER}`, boxShadow: SHADOW, overflow: 'hidden' }}>
            <Box sx={{ px: 2.25, pt: 2, pb: 1.75, borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: '0.95rem', color: TEXT }}>Recent Alerts</Typography>
              <Typography onClick={() => navigate('/security')} sx={{ fontSize: '0.58rem', fontWeight: 700, color: MUTED, fontFamily: '"DM Mono", monospace', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase', '&:hover': { color: ACCENT } }}>
                View all →
              </Typography>
            </Box>
            <Box sx={{ p: 1.75, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {loading ? (
                <CircularProgress size={14} sx={{ color: ACCENT, m: 1 }} />
              ) : recentAlerts.slice(0, 4).length > 0 ? recentAlerts.slice(0, 4).map(alert => {
                const c = getSevColor(alert.severity);
                return (
                  <Box key={alert.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: 1, borderRadius: '9px', bgcolor: alpha(c, 0.04), borderLeft: `2px solid ${c}` }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: TEXT, fontFamily: '"Inter", sans-serif', lineHeight: 1.3 }} noWrap>{alert.title}</Typography>
                      <Typography sx={{ fontSize: '0.57rem', color: MUTED, fontFamily: '"DM Mono", monospace' }}>{getTimeAgo(new Date(alert.timestamp))}</Typography>
                    </Box>
                  </Box>
                );
              }) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.25, borderRadius: '9px', bgcolor: alpha(ACCENT, 0.04), borderLeft: `2px solid ${ACCENT}` }}>
                  <CheckIcon sx={{ fontSize: 13, color: ACCENT }} />
                  <Typography sx={{ fontSize: '0.7rem', color: ACCENT, fontFamily: '"Inter", sans-serif', fontWeight: 500 }}>No active alerts</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
