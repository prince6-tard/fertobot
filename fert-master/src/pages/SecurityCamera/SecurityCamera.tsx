import React, { useState, useEffect, useRef } from 'react';
import {
  Typography, Box, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar, Alert, alpha,
} from '@mui/material';
import {
  VideocamOff as VideocamOffIcon,
  Security as SecurityIcon,
  CheckCircle as CheckIcon,
  FiberManualRecord as DotIcon,
  WarningAmber as WarnIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Notifications as BellIcon,
} from '@mui/icons-material';
import {
  BarChart, Bar, Cell, ResponsiveContainer,
} from 'recharts';
import { MotionNotificationService } from '../../services/motionNotificationService';

// ── Design Tokens (Deep Earth Nexus) ─────────────────────
const ACCENT  = '#A8FF3E';
const TEAL    = '#00E5C6';
const AMBER   = '#FFB830';
const RED     = '#FF4565';
const BLUE    = '#4DA8FF';
const PURPLE  = '#B06EFF';
const TEXT    = '#D8EDE0';
const MUTED   = '#4A6E55';
const CARD    = '#0A1410';
const CARD_E  = '#0F1C14';
const BG      = '#060C08';
const BORDER  = 'rgba(168,255,62,0.07)';
const SHADOW  = '0 2px 20px rgba(0,0,0,0.55)';

// ── Types ─────────────────────────────────────────────────
interface Camera {
  id: string; name: string; location: string;
  status: 'online' | 'offline' | 'recording';
  lastMotion?: string; recording: boolean;
  nightVision: boolean; resolution: string; battery?: number;
}

interface SecurityAlert {
  id: string; type: 'motion' | 'offline' | 'low_battery' | 'tampering';
  camera: string; timestamp: string;
  severity: 'low' | 'medium' | 'high';
  acknowledged: boolean; title: string; description: string;
}

const getAlertColor = (sev: SecurityAlert['severity']) =>
  sev === 'high' ? RED : sev === 'medium' ? AMBER : BLUE;

const getTypeLabel = (type: SecurityAlert['type']) => {
  switch (type) {
    case 'motion':      return 'MOTION DETECTED';
    case 'offline':     return 'DEVICE OFFLINE';
    case 'low_battery': return 'ATMOSPHERIC WARNING';
    case 'tampering':   return 'SYSTEM EVENT';
  }
};

const getTypeIcon = (type: SecurityAlert['type']) => {
  switch (type) {
    case 'motion':      return ErrorIcon;
    case 'offline':     return ErrorIcon;
    case 'low_battery': return WarnIcon;
    case 'tampering':   return InfoIcon;
  }
};

const timeAgo = (ts: string) => {
  const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)} mins ago`;
  return `${Math.floor(s / 3600)}h ago`;
};

const healthBars = [
  { v: 88, c: ACCENT }, { v: 72, c: ACCENT }, { v: 95, c: ACCENT },
  { v: 40, c: RED    }, { v: 85, c: ACCENT }, { v: 78, c: ACCENT },
  { v: 62, c: AMBER  }, { v: 90, c: ACCENT }, { v: 55, c: RED    },
  { v: 80, c: ACCENT }, { v: 93, c: ACCENT }, { v: 99, c: ACCENT },
];

const SecurityCamera: React.FC = () => {
  const [fullscreenCamera, setFullscreenCamera] = useState<Camera | null>(null);
  const [filterSeverity, setFilterSeverity]     = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [sortPriority, setSortPriority]         = useState(true);
  const [acknowledgedIds, setAcknowledgedIds]   = useState<Set<string>>(new Set());
  const [motionSnack, setMotionSnack]           = useState({ open: false, msg: '' });
  const motionService = new MotionNotificationService();
  const lastPollTimeRef = useRef(0);

  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const res = await fetch(`/api/device/motion?since=${lastPollTimeRef.current}`);
        if (!res.ok || !active) return;
        const data = await res.json();
        if (data.hasNewMotion && data.motion) {
          const m = data.motion;
          lastPollTimeRef.current = m.timestamp;
          const newAlert: SecurityAlert = {
            id: `esp32-motion-${m.timestamp}`, type: 'motion',
            camera: m.device || 'ESP32',
            timestamp: new Date(m.timestamp).toISOString(),
            severity: 'high', acknowledged: false,
            title: 'Motion Detected — ESP32 PIR',
            description: m.message || `Motion detected by ${m.device} at ${m.location}`,
          };
          setAlerts(prev => prev.some(a => a.id === newAlert.id) ? prev : [newAlert, ...prev]);
          setMotionSnack({ open: true, msg: `Motion detected by ${m.device}!` });
        }
      } catch { /* silent */ }
    };
    poll();
    const interval = setInterval(poll, 10000);
    return () => { active = false; clearInterval(interval); };
  }, []);

  const [cameras] = useState<Camera[]>([{
    id: 'cam-001', name: 'Newgen IEDC Camera',
    location: 'Field Monitoring Zone A', status: 'offline',
    lastMotion: '2025-12-03T14:37:00', recording: false,
    nightVision: true, resolution: '1080p', battery: 15,
  }]);

  const [alerts, setAlerts] = useState<SecurityAlert[]>([
    {
      id: 'alert-001', type: 'motion', camera: 'Newgen IEDC Camera',
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      severity: 'high', acknowledged: false,
      title: 'Animal Intrusion Detected',
      description: 'Node Sector 12A reported heavy thermal activity and motion signature matching "Wild Boar". Containment fence CB status: Compromised.',
    },
    {
      id: 'alert-002', type: 'low_battery', camera: 'Field Sensor Array',
      timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      severity: 'medium', acknowledged: false,
      title: 'Critical High Humidity',
      description: 'Greenhouse Delta sensing unsafe humidity levels. Auto-ventilation system response delayed. Risk of fungal growth increasing.',
    },
    {
      id: 'alert-003', type: 'tampering', camera: 'Cloud Sync',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      severity: 'low', acknowledged: false,
      title: 'Cloud Sync Completed',
      description: 'Batch #1802 sensor data successfully encrypted and uploaded to central laboratory database.',
    },
  ]);

  const handleAcknowledge = (id: string) => {
    setAcknowledgedIds(prev => new Set([...prev, id]));
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const testMotionAlert = async () => {
    try {
      await motionService.sendMotionAlert('cam-001', 'field monitoring zone a');
      setMotionSnack({ open: true, msg: 'Motion alert triggered — check the Dashboard.' });
    } catch { /* silent */ }
  };

  const visibleAlerts = alerts
    .filter(a => filterSeverity === 'all' || a.severity === filterSeverity)
    .sort((a, b) => sortPriority
      ? (['high', 'medium', 'low'].indexOf(a.severity) - ['high', 'medium', 'low'].indexOf(b.severity))
      : (new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

  const liveCount  = cameras.filter(c => c.status === 'online' || c.status === 'recording').length;
  const unackCount = alerts.filter(a => !a.acknowledged).length;

  const resourceLoads = [
    { label: 'Camera Feed Analysis', sub: 'Active Flow',            pct: 71,                          color: ACCENT  },
    { label: 'Motion Detection AI',  sub: 'Laboratory Core',        pct: 42,                          color: TEAL    },
    { label: 'Alert Processing',     sub: `${unackCount} Pending`,  pct: unackCount > 0 ? 85 : 10,   color: unackCount > 0 ? RED : ACCENT },
    { label: 'Sync & Backup',        sub: 'Cloud Upload',           pct: 95,                          color: BLUE    },
  ];

  return (
    <Box sx={{ width: '100%', pb: 3 }}>

      {/* ── HEADER ── */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.4 }}>
            <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: { xs: '1.5rem', md: '1.85rem' }, color: TEXT, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Intelligence Center
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, px: 1, py: 0.35, borderRadius: '20px', bgcolor: alpha(ACCENT, 0.08), border: `1px solid ${alpha(ACCENT, 0.18)}` }}>
              <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: ACCENT, animation: 'pulse-dot 2s ease-in-out infinite' }} />
              <Typography sx={{ fontSize: '0.56rem', fontWeight: 700, color: ACCENT, fontFamily: '"DM Mono", monospace', letterSpacing: '0.1em' }}>
                LIVE: {liveCount}/{cameras.length} ACTIVE
              </Typography>
            </Box>
          </Box>
          <Typography sx={{ fontSize: '0.8rem', color: MUTED, fontFamily: '"Figtree", sans-serif' }}>
            Active Intelligence · System & field diagnostics
          </Typography>
        </Box>

        <Box onClick={testMotionAlert} sx={{
          display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.85, borderRadius: '10px',
          border: `1px solid ${BORDER}`, cursor: 'pointer', bgcolor: CARD_E,
          transition: 'all 0.2s', '&:hover': { borderColor: alpha(ACCENT, 0.2) },
        }}>
          <SecurityIcon sx={{ fontSize: 14, color: MUTED }} />
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: MUTED, fontFamily: '"DM Mono", monospace', letterSpacing: '0.06em' }}>
            Test Motion
          </Typography>
        </Box>
      </Box>

      {/* ── MAIN GRID ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 300px' }, gap: 2, alignItems: 'start' }}>

        {/* LEFT: Intelligence feed */}
        <Box>
          {/* Filter row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 2, flexWrap: 'wrap' }}>
            {(['all', 'high', 'medium', 'low'] as const).map(f => {
              const fc = f === 'all' ? ACCENT : f === 'high' ? RED : f === 'medium' ? AMBER : BLUE;
              return (
                <Box key={f} onClick={() => setFilterSeverity(f)} sx={{
                  px: 1.25, py: 0.45, borderRadius: '20px', cursor: 'pointer', userSelect: 'none',
                  transition: 'all 0.15s',
                  bgcolor: filterSeverity === f ? alpha(fc, 0.12) : 'transparent',
                  border: `1px solid ${filterSeverity === f ? alpha(fc, 0.25) : BORDER}`,
                  color: filterSeverity === f ? fc : MUTED,
                  fontSize: '0.6rem', fontWeight: 700,
                  fontFamily: '"DM Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>
                  {f === 'all' ? 'Filter: All' : f}
                </Box>
              );
            })}
            <Box onClick={() => setSortPriority(v => !v)} sx={{
              ml: 'auto', px: 1.25, py: 0.45, borderRadius: '20px', cursor: 'pointer', userSelect: 'none',
              border: `1px solid ${BORDER}`, bgcolor: CARD_E, transition: 'border-color 0.15s',
              '&:hover': { borderColor: alpha(ACCENT, 0.2) },
            }}>
              <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: MUTED, fontFamily: '"DM Mono", monospace', letterSpacing: '0.06em' }}>
                Sort: {sortPriority ? 'Priority' : 'Recent'}
              </Typography>
            </Box>
          </Box>

          {/* Alert cards */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            {visibleAlerts.map((alert, idx) => {
              const c = getAlertColor(alert.severity);
              const isAcked = alert.acknowledged || acknowledgedIds.has(alert.id);
              const TypeIcon = getTypeIcon(alert.type);
              const bgLabel = alert.severity === 'high' ? 'CRITICAL INTERFERENCE' :
                              alert.severity === 'medium' ? 'RESOURCE & ENVIRONMENTAL STATE' : 'SYSTEM UPDATE';
              return (
                <Box key={alert.id} className="nexus-card" sx={{
                  borderRadius: '14px', overflow: 'hidden',
                  border: `1px solid ${alpha(c, 0.15)}`,
                  bgcolor: alpha(c, 0.04),
                  opacity: isAcked ? 0.55 : 1,
                  animationDelay: `${idx * 0.07}s`,
                  transition: 'border-color 0.2s, opacity 0.3s',
                  '&:hover': { borderColor: alpha(c, 0.28) },
                }}>
                  {/* Category bar */}
                  <Box sx={{ px: 2, py: 0.6, bgcolor: alpha(c, 0.07), borderBottom: `1px solid ${alpha(c, 0.1)}` }}>
                    <Typography sx={{ fontSize: '0.5rem', fontWeight: 700, color: c, fontFamily: '"DM Mono", monospace', letterSpacing: '0.14em' }}>
                      ● {bgLabel}
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    {/* Icon */}
                    <Box sx={{
                      width: 38, height: 38, borderRadius: '10px', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: alpha(c, 0.1), border: `1px solid ${alpha(c, 0.2)}`,
                    }}>
                      <TypeIcon sx={{ fontSize: 18, color: c }} />
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
                        <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: TEXT, fontFamily: '"Syne", sans-serif', lineHeight: 1.3 }}>
                          {alert.title}
                        </Typography>
                        <Typography sx={{ fontSize: '0.58rem', color: MUTED, fontFamily: '"DM Mono", monospace', flexShrink: 0 }}>
                          {timeAgo(alert.timestamp)}
                        </Typography>
                      </Box>

                      <Typography sx={{ fontSize: '0.74rem', color: alpha(TEXT, 0.55), fontFamily: '"Figtree", sans-serif', lineHeight: 1.6, mb: 1.5 }}>
                        {alert.description}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                        {!isAcked && (
                          <Box onClick={() => handleAcknowledge(alert.id)} sx={{
                            px: 1.5, py: 0.55, borderRadius: '8px', cursor: 'pointer',
                            bgcolor: alpha(c, 0.1), border: `1px solid ${alpha(c, 0.22)}`,
                            fontSize: '0.64rem', fontWeight: 700, color: c,
                            fontFamily: '"DM Mono", monospace', letterSpacing: '0.06em',
                            transition: 'all 0.15s', '&:hover': { bgcolor: alpha(c, 0.18) },
                          }}>
                            {alert.severity === 'high' ? 'Dispatch Security' : 'Acknowledge'}
                          </Box>
                        )}
                        {alert.type === 'motion' && (
                          <Box onClick={() => setFullscreenCamera(cameras[0])} sx={{
                            px: 1.5, py: 0.55, borderRadius: '8px', cursor: 'pointer',
                            border: `1px solid ${BORDER}`,
                            fontSize: '0.64rem', fontWeight: 600, color: MUTED,
                            fontFamily: '"DM Mono", monospace', letterSpacing: '0.06em',
                            transition: 'all 0.15s', '&:hover': { borderColor: alpha(TEXT, 0.15), color: TEXT },
                          }}>
                            Visual Feed
                          </Box>
                        )}
                        {alert.type === 'low_battery' && (
                          <Box sx={{
                            px: 1.5, py: 0.55, borderRadius: '8px', cursor: 'pointer',
                            border: `1px solid ${BORDER}`,
                            fontSize: '0.64rem', fontWeight: 600, color: MUTED,
                            fontFamily: '"DM Mono", monospace', letterSpacing: '0.06em',
                            transition: 'all 0.15s', '&:hover': { borderColor: alpha(TEXT, 0.15), color: TEXT },
                          }}>
                            Boost Ventilation
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            })}

            {visibleAlerts.length === 0 && (
              <Box sx={{ bgcolor: CARD, borderRadius: '14px', border: `1px solid ${alpha(ACCENT, 0.12)}`, p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 38, height: 38, borderRadius: '10px', bgcolor: alpha(ACCENT, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckIcon sx={{ fontSize: 18, color: ACCENT }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: ACCENT, fontFamily: '"Figtree", sans-serif' }}>All clear</Typography>
                  <Typography sx={{ fontSize: '0.66rem', color: MUTED, fontFamily: '"Figtree", sans-serif' }}>No alerts matching current filter</Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* RIGHT: System Health + Resources + Camera */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>

          {/* System Health */}
          <Box sx={{ bgcolor: CARD, borderRadius: '16px', border: `1px solid ${BORDER}`, boxShadow: SHADOW, overflow: 'hidden' }}>
            <Box sx={{ px: 2.25, pt: 2, pb: 1.75, borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.9rem', color: TEXT }}>System Health</Typography>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontFamily: '"DM Mono", monospace', fontSize: '1.2rem', fontWeight: 700, color: ACCENT, lineHeight: 1,
                  textShadow: `0 0 16px ${alpha(ACCENT, 0.4)}` }}>99.98%</Typography>
                <Box sx={{ display: 'inline-flex', px: 0.8, py: 0.2, borderRadius: '20px', bgcolor: alpha(ACCENT, 0.1), border: `1px solid ${alpha(ACCENT, 0.2)}`, mt: 0.25 }}>
                  <Typography sx={{ fontSize: '0.46rem', fontWeight: 700, color: ACCENT, fontFamily: '"DM Mono", monospace', letterSpacing: '0.1em' }}>STABLE</Typography>
                </Box>
              </Box>
            </Box>
            <Box sx={{ p: 2 }}>
              <ResponsiveContainer width="100%" height={88}>
                <BarChart data={healthBars} margin={{ top: 0, right: 0, bottom: 0, left: 0 }} barCategoryGap="14%">
                  <Bar dataKey="v" radius={[3, 3, 0, 0]} isAnimationActive={false}>
                    {healthBars.map((bar, i) => <Cell key={i} fill={bar.c} fillOpacity={0.85} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                {['Jul 01', '', '', '', 'Jul 15', '', 'Jul 21'].map((l, i) => (
                  <Typography key={i} sx={{ fontSize: '0.44rem', color: MUTED, fontFamily: '"DM Mono", monospace' }}>{l}</Typography>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Active Resource Loads */}
          <Box sx={{ bgcolor: CARD, borderRadius: '16px', border: `1px solid ${BORDER}`, boxShadow: SHADOW, overflow: 'hidden' }}>
            <Box sx={{ px: 2.25, pt: 2, pb: 1.75, borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.9rem', color: TEXT }}>Active Resource Loads</Typography>
            </Box>
            <Box sx={{ p: 1.75 }}>
              {resourceLoads.map((r, i) => (
                <Box key={i} sx={{ py: 1.1, borderBottom: i < resourceLoads.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 0.65 }}>
                    <Box>
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: TEXT, fontFamily: '"Figtree", sans-serif', lineHeight: 1.2 }}>{r.label}</Typography>
                      <Typography sx={{ fontSize: '0.56rem', color: MUTED, fontFamily: '"DM Mono", monospace' }}>{r.sub}</Typography>
                    </Box>
                    <Typography sx={{ fontFamily: '"DM Mono", monospace', fontSize: '0.72rem', fontWeight: 700, color: r.color }}>{r.pct}%</Typography>
                  </Box>
                  <Box sx={{ height: 3, bgcolor: alpha(r.color, 0.1), borderRadius: 2, overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', width: `${r.pct}%`, background: `linear-gradient(90deg, ${alpha(r.color, 0.6)}, ${r.color})`,
                      borderRadius: 2, boxShadow: `0 0 6px ${alpha(r.color, 0.35)}`, transition: 'width 0.8s ease' }} />
                  </Box>
                </Box>
              ))}
            </Box>
            <Box sx={{ px: 1.75, pb: 1.75 }}>
              <Box sx={{
                py: 0.85, borderRadius: '9px', textAlign: 'center', cursor: 'pointer',
                border: `1px solid ${BORDER}`, bgcolor: CARD_E,
                transition: 'all 0.15s', '&:hover': { borderColor: alpha(ACCENT, 0.2) },
              }}>
                <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: MUTED, fontFamily: '"DM Mono", monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Manage All Processes
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Camera card */}
          <Box sx={{ bgcolor: CARD, borderRadius: '16px', border: `1px solid ${BORDER}`, boxShadow: SHADOW, overflow: 'hidden', cursor: 'pointer',
            transition: 'border-color 0.2s', '&:hover': { borderColor: alpha(ACCENT, 0.18) } }}
            onClick={() => setFullscreenCamera(cameras[0])}>
            {/* Camera feed */}
            <Box sx={{
              height: 140, position: 'relative', overflow: 'hidden',
              background: 'linear-gradient(160deg, #081208 0%, #0c1e0d 50%, #091508 100%)',
            }}>
              <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 55% 40%, rgba(168,255,62,0.07) 0%, transparent 60%)' }} />
              {/* Scanline */}
              <Box sx={{ position: 'absolute', left: 0, right: 0, height: 1.5, background: `linear-gradient(90deg, transparent, ${alpha(ACCENT, 0.25)}, transparent)`,
                animation: 'scan-line 3s linear infinite', top: 0 }} />
              {/* Corner brackets */}
              {[{ top: 10, left: 10 }, { top: 10, right: 10 }, { bottom: 10, left: 10 }, { bottom: 10, right: 10 }].map((pos, i) => (
                <Box key={i} sx={{ position: 'absolute', ...pos, width: 14, height: 14, borderColor: alpha(ACCENT, 0.4),
                  borderStyle: 'solid',
                  borderTopWidth: pos.bottom !== undefined ? 0 : 1.5,
                  borderBottomWidth: pos.top !== undefined ? 0 : 1.5,
                  borderLeftWidth: pos.right !== undefined ? 0 : 1.5,
                  borderRightWidth: pos.left !== undefined ? 0 : 1.5,
                }} />
              ))}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <VideocamOffIcon sx={{ fontSize: 26, color: alpha('#ffffff', 0.25), mb: 0.5 }} />
                <Typography sx={{ fontSize: '0.58rem', color: alpha('#ffffff', 0.35), fontFamily: '"DM Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Field Monitor · Offline
                </Typography>
              </Box>
              <Box sx={{ position: 'absolute', top: 8, left: 8, px: 0.85, py: 0.3, borderRadius: '5px', bgcolor: alpha(RED, 0.8) }}>
                <Typography sx={{ fontSize: '0.5rem', fontWeight: 700, color: '#fff', fontFamily: '"DM Mono", monospace', letterSpacing: '0.08em' }}>OFFLINE</Typography>
              </Box>
              <Box sx={{ position: 'absolute', top: 8, right: 8, px: 0.85, py: 0.3, borderRadius: '5px', bgcolor: 'rgba(0,0,0,0.6)', border: `1px solid ${alpha(ACCENT, 0.15)}` }}>
                <Typography sx={{ fontSize: '0.5rem', color: alpha('#fff', 0.6), fontFamily: '"DM Mono", monospace' }}>1080p · NV</Typography>
              </Box>
            </Box>
            <Box sx={{ p: 1.75, borderTop: `1px solid ${BORDER}` }}>
              <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: TEXT, fontFamily: '"Figtree", sans-serif', mb: 0.25 }}>
                {cameras[0].name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: RED }} />
                <Typography sx={{ fontSize: '0.56rem', color: MUTED, fontFamily: '"DM Mono", monospace' }}>
                  Standard Growth Cycle · Offline
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Fullscreen camera dialog */}
      <Dialog open={!!fullscreenCamera} onClose={() => setFullscreenCamera(null)} maxWidth="md" fullWidth
        PaperProps={{ sx: { bgcolor: CARD, borderRadius: '16px', border: `1px solid ${BORDER}` } }}>
        <DialogTitle sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, color: TEXT, fontSize: '1rem', pb: 1 }}>
          {fullscreenCamera?.name} — Visual Feed
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ height: 320, background: 'linear-gradient(160deg, #081208, #0c1e0d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 50% 40%, rgba(168,255,62,0.07) 0%, transparent 60%)' }} />
            <Box sx={{ textAlign: 'center' }}>
              <VideocamOffIcon sx={{ fontSize: 52, color: alpha('#fff', 0.2), mb: 1 }} />
              <Typography sx={{ fontSize: '0.82rem', color: alpha(TEXT, 0.5), fontFamily: '"Figtree", sans-serif' }}>
                Camera offline — probe not connected
              </Typography>
              <Typography sx={{ fontSize: '0.66rem', color: MUTED, fontFamily: '"DM Mono", monospace', mt: 0.5 }}>
                Last motion: {fullscreenCamera?.lastMotion ? new Date(fullscreenCamera.lastMotion).toLocaleString() : '—'}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${BORDER}` }}>
          <Box onClick={() => setFullscreenCamera(null)} sx={{
            px: 1.75, py: 0.7, borderRadius: '8px', cursor: 'pointer', border: `1px solid ${BORDER}`,
            transition: 'border-color 0.15s', '&:hover': { borderColor: alpha(TEXT, 0.15) },
          }}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: MUTED, fontFamily: '"Figtree", sans-serif' }}>Close</Typography>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Motion snackbar */}
      <Snackbar open={motionSnack.open} autoHideDuration={4000} onClose={() => setMotionSnack({ open: false, msg: '' })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setMotionSnack({ open: false, msg: '' })}
          sx={{ fontFamily: '"Figtree", sans-serif', borderRadius: '10px', bgcolor: alpha(ACCENT, 0.12), color: ACCENT, border: `1px solid ${alpha(ACCENT, 0.25)}`,
            '& .MuiAlert-icon': { color: ACCENT } }}>
          {motionSnack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SecurityCamera;
