import React from 'react';
import {
  Box, Typography, InputBase, Badge, Avatar, IconButton,
  BottomNavigation, BottomNavigationAction,
  useMediaQuery, useTheme,
} from '@mui/material';
import {
  Dashboard as OverviewIcon,
  NotificationsNone as AlertsIcon,
  DeviceHub as DevicesIcon,
  Water as IrrigationIcon,
  Mic as AIIcon,
  Settings as SettingsIcon,
  HelpOutline as SupportIcon,
  Search as SearchIcon,
  Sensors as SensorsIcon,
  Description as LogsIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  FiberManualRecord as DotIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

// ── Design Tokens ─────────────────────────────────────────
const SB_BG      = '#070D09';
const SB_HOVER   = 'rgba(168,255,62,0.05)';
const SB_ACTIVE  = 'rgba(168,255,62,0.10)';
const SB_BORDER  = 'rgba(168,255,62,0.07)';
const SB_TEXT    = '#C8E8D2';
const SB_MUTED   = '#3E5A48';
const SB_ACCENT  = '#A8FF3E';
const SB_W       = 230;

const TOP_BG  = '#0A1410';
const CONTENT = '#060C08';

// ── Nav config ────────────────────────────────────────────
const navSections = [
  {
    label: 'MAIN',
    items: [
      { id: 'dashboard',     label: 'Overview',   icon: OverviewIcon,   path: '/dashboard' },
      { id: 'security',      label: 'Alerts',     icon: AlertsIcon,     path: '/security',    badge: 3 },
    ],
  },
  {
    label: 'FIELD OPS',
    items: [
      { id: 'probes',        label: 'Devices',    icon: DevicesIcon,    path: '/probes' },
      { id: 'irrigation',    label: 'Irrigation', icon: IrrigationIcon, path: '/irrigation' },
    ],
  },
  {
    label: 'INTELLIGENCE',
    items: [
      { id: 'voice-chatbot', label: 'AI Support', icon: SupportIcon,    path: '/voice-chatbot' },
    ],
  },
];

const mobileNav = [
  { id: 'dashboard',     label: 'Overview', icon: OverviewIcon,   path: '/dashboard' },
  { id: 'security',      label: 'Alerts',   icon: AlertsIcon,     path: '/security' },
  { id: 'probes',        label: 'Devices',  icon: SensorsIcon,    path: '/probes' },
  { id: 'irrigation',    label: 'Water',    icon: IrrigationIcon, path: '/irrigation' },
  { id: 'voice-chatbot', label: 'AI',       icon: AIIcon,         path: '/voice-chatbot' },
];

interface LayoutProps { children: React.ReactNode; }

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const muiTheme  = useTheme();
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up('md'));
  const currentPath   = location.pathname;
  const mobileCurrent = mobileNav.findIndex(item => item.path === currentPath);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: CONTENT }}>

      {/* ── SIDEBAR ── */}
      {isDesktop && (
        <Box component="nav" sx={{
          width: SB_W, flexShrink: 0, display: 'flex', flexDirection: 'column',
          bgcolor: SB_BG, height: '100vh', position: 'sticky', top: 0,
          borderRight: `1px solid ${SB_BORDER}`,
          backgroundImage: `
            radial-gradient(ellipse at 0% 30%, rgba(168,255,62,0.03) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 80%, rgba(0,229,198,0.02) 0%, transparent 50%)
          `,
        }}>

          {/* Logo */}
          <Box sx={{ px: 2.5, pt: 2.5, pb: 2.5, borderBottom: `1px solid ${SB_BORDER}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {/* Icon mark */}
              <Box sx={{
                width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                background: 'linear-gradient(135deg, #A8FF3E 0%, #5AC800 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 16px rgba(168,255,62,0.35)',
                position: 'relative', overflow: 'hidden',
              }}>
                <Typography sx={{ fontSize: '1.1rem', lineHeight: 1, zIndex: 1 }}>🌿</Typography>
                <Box sx={{
                  position: 'absolute', inset: 0, opacity: 0.2,
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.4) 3px, rgba(255,255,255,0.4) 4px)',
                }} />
              </Box>
              <Box>
                <Typography sx={{
                  fontWeight: 800, fontSize: '0.92rem', color: '#FFFFFF',
                  fontFamily: '"Syne", sans-serif', lineHeight: 1.2, letterSpacing: '-0.01em',
                }}>
                  FertoBot Pro
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                  <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: SB_ACCENT,
                    animation: 'pulse-dot 2s ease-in-out infinite' }} />
                  <Typography sx={{ fontSize: '0.52rem', color: SB_MUTED, fontFamily: '"DM Mono", monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Live · Connected
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Nav sections */}
          <Box sx={{ flex: 1, py: 2, px: 1.5, display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
            {navSections.map(section => (
              <Box key={section.label}>
                <Typography sx={{
                  fontSize: '0.5rem', fontWeight: 700, color: SB_MUTED,
                  fontFamily: '"DM Mono", monospace', letterSpacing: '0.16em',
                  textTransform: 'uppercase', px: 1.25, mb: 0.75,
                }}>
                  {section.label}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                  {section.items.map(item => {
                    const active = currentPath === item.path
                      || (item.path !== '/dashboard' && currentPath.startsWith(item.path));
                    const Icon = item.icon;
                    return (
                      <Box key={item.id} onClick={() => navigate(item.path)} sx={{
                        display: 'flex', alignItems: 'center', gap: 1.25,
                        px: 1.25, py: 0.9, borderRadius: '8px', cursor: 'pointer',
                        backgroundColor: active ? SB_ACTIVE : 'transparent',
                        border: `1px solid ${active ? 'rgba(168,255,62,0.12)' : 'transparent'}`,
                        transition: 'all 0.15s ease',
                        position: 'relative', overflow: 'hidden',
                        '&:hover': { backgroundColor: active ? SB_ACTIVE : SB_HOVER },
                      }}>
                        {active && (
                          <Box sx={{
                            position: 'absolute', left: 0, top: '20%', bottom: '20%',
                            width: 2, borderRadius: '0 2px 2px 0', bgcolor: SB_ACCENT,
                            boxShadow: `0 0 8px ${SB_ACCENT}`,
                          }} />
                        )}
                        <Box sx={{
                          width: 28, height: 28, borderRadius: '7px', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          bgcolor: active ? 'rgba(168,255,62,0.12)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${active ? 'rgba(168,255,62,0.2)' : 'rgba(255,255,255,0.04)'}`,
                        }}>
                          <Icon sx={{ fontSize: 14, color: active ? SB_ACCENT : SB_MUTED }} />
                        </Box>
                        <Typography sx={{
                          fontSize: '0.78rem', fontWeight: active ? 600 : 400,
                          color: active ? SB_TEXT : SB_MUTED,
                          fontFamily: '"Figtree", sans-serif', flex: 1,
                        }}>
                          {item.label}
                        </Typography>
                        {item.badge && (
                          <Box sx={{
                            minWidth: 18, height: 18, borderRadius: '9px', px: 0.5,
                            bgcolor: '#FF4565', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Typography sx={{ fontSize: '0.48rem', fontWeight: 700, color: '#FFFFFF', fontFamily: '"DM Mono", monospace' }}>
                              {item.badge}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            ))}
          </Box>

          {/* Bottom actions */}
          <Box sx={{ px: 1.5, pb: 2.5, pt: 1.5, borderTop: `1px solid ${SB_BORDER}` }}>
            {/* Deploy button */}
            <Box onClick={() => navigate('/probes')} sx={{
              display: 'flex', alignItems: 'center', gap: 1.25,
              px: 1.5, py: 1.1, borderRadius: '9px', cursor: 'pointer', mb: 0.5,
              background: 'linear-gradient(135deg, rgba(168,255,62,0.12), rgba(168,255,62,0.06))',
              border: '1px solid rgba(168,255,62,0.2)',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, rgba(168,255,62,0.18), rgba(168,255,62,0.10))',
                boxShadow: '0 0 16px rgba(168,255,62,0.12)',
              },
            }}>
              <Box sx={{ width: 22, height: 22, borderRadius: '6px', bgcolor: 'rgba(168,255,62,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AddIcon sx={{ fontSize: 13, color: SB_ACCENT }} />
              </Box>
              <Typography sx={{ fontSize: '0.74rem', fontWeight: 600, color: SB_ACCENT, fontFamily: '"Figtree", sans-serif' }}>
                Deploy New Node
              </Typography>
            </Box>

            <Box onClick={() => navigate('/profile')} sx={{
              display: 'flex', alignItems: 'center', gap: 1.25, px: 1.25, py: 0.7,
              borderRadius: '7px', cursor: 'pointer', mt: 0.5,
              '&:hover': { bgcolor: SB_HOVER },
            }}>
              <LogsIcon sx={{ fontSize: 13, color: SB_MUTED }} />
              <Typography sx={{ fontSize: '0.71rem', color: SB_MUTED, fontFamily: '"Figtree", sans-serif' }}>System Logs</Typography>
            </Box>

            <Box onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} sx={{
              display: 'flex', alignItems: 'center', gap: 1.25, px: 1.25, py: 0.7,
              borderRadius: '7px', cursor: 'pointer',
              '&:hover': { bgcolor: 'rgba(255,69,101,0.08)' },
            }}>
              <LogoutIcon sx={{ fontSize: 13, color: '#FF4565' }} />
              <Typography sx={{ fontSize: '0.71rem', color: '#FF4565', fontFamily: '"Figtree", sans-serif', fontWeight: 500 }}>Logout</Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* ── RIGHT: Topbar + Content ── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'hidden' }}>

        {/* TOPBAR */}
        <Box sx={{
          height: 58, display: 'flex', alignItems: 'center',
          px: { xs: 2, md: 3 }, gap: 1.5,
          bgcolor: TOP_BG,
          borderBottom: '1px solid rgba(168,255,62,0.07)',
          flexShrink: 0,
          backdropFilter: 'blur(12px)',
        }}>

          {/* Search */}
          <Box sx={{
            flex: 1, maxWidth: 360, display: 'flex', alignItems: 'center',
            gap: 1, px: 1.5, py: 0.7, borderRadius: '10px',
            backgroundColor: 'rgba(168,255,62,0.04)',
            border: '1px solid rgba(168,255,62,0.1)',
            transition: 'border-color 0.2s',
            '&:focus-within': { borderColor: 'rgba(168,255,62,0.3)' },
          }}>
            <SearchIcon sx={{ fontSize: 14, color: '#3E5A48' }} />
            <InputBase
              placeholder="Search sensors, nodes, field ID…"
              sx={{
                flex: 1, fontSize: '0.74rem', color: '#C8E8D2',
                fontFamily: '"Figtree", sans-serif',
                '& input::placeholder': { color: '#3E5A48', opacity: 1 },
              }}
            />
          </Box>

          <Box sx={{ flex: 1 }} />

          {/* Live status pill */}
          <Box sx={{
            display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.75,
            px: 1.25, py: 0.5, borderRadius: '20px',
            bgcolor: 'rgba(168,255,62,0.06)', border: '1px solid rgba(168,255,62,0.12)',
          }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#A8FF3E',
              animation: 'pulse-dot 2s ease-in-out infinite' }} />
            <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#A8FF3E', fontFamily: '"DM Mono", monospace', letterSpacing: '0.08em' }}>
              LIVE · ACTIVE
            </Typography>
          </Box>

          <IconButton size="small" sx={{ color: '#4A6E55', '&:hover': { color: '#A8FF3E' }, transition: 'color 0.2s' }}>
            <Badge badgeContent={3} sx={{ '& .MuiBadge-badge': { bgcolor: '#FF4565', fontSize: '0.48rem', minWidth: 14, height: 14, padding: 0 } }}>
              <AlertsIcon sx={{ fontSize: 19 }} />
            </Badge>
          </IconButton>
          <IconButton size="small" sx={{ color: '#4A6E55', '&:hover': { color: '#A8FF3E' }, transition: 'color 0.2s' }}>
            <SupportIcon sx={{ fontSize: 19 }} />
          </IconButton>
          <IconButton size="small" onClick={() => navigate('/profile')} sx={{ color: '#4A6E55', '&:hover': { color: '#A8FF3E' }, transition: 'color 0.2s' }}>
            <SettingsIcon sx={{ fontSize: 19 }} />
          </IconButton>

          {/* Weather chip */}
          <Box sx={{
            display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.85,
            px: 1.25, py: 0.5, borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.06)', bgcolor: 'rgba(255,255,255,0.03)',
          }}>
            <Typography sx={{ fontSize: '0.9rem', lineHeight: 1 }}>🌤</Typography>
            <Box>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#D8EDE0', fontFamily: '"DM Mono", monospace', lineHeight: 1 }}>24°C</Typography>
              <Typography sx={{ fontSize: '0.48rem', color: '#4A6E55', fontFamily: '"DM Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Outdoor</Typography>
            </Box>
          </Box>

          <Avatar onClick={() => navigate('/profile')} sx={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, rgba(168,255,62,0.15), rgba(168,255,62,0.05))',
            border: '1.5px solid rgba(168,255,62,0.25)',
            fontSize: '0.7rem', color: '#A8FF3E', fontWeight: 700, cursor: 'pointer',
            fontFamily: '"Syne", sans-serif',
          }}>
            F
          </Avatar>
        </Box>

        {/* CONTENT */}
        <Box component="main" sx={{
          flex: 1, overflowY: 'auto', overflowX: 'hidden',
          px: { xs: 2, md: 3 }, py: { xs: 2, md: 2.5 },
          pb: { xs: '90px', md: '28px' },
          bgcolor: CONTENT,
        }}>
          {children}
        </Box>
      </Box>

      {/* ── BOTTOM NAV (mobile) ── */}
      {!isDesktop && (
        <Box sx={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1100,
          borderTop: '1px solid rgba(168,255,62,0.08)',
          backgroundColor: '#0A1410',
          boxShadow: '0 -2px 24px rgba(0,0,0,0.5)',
        }}>
          <BottomNavigation
            value={mobileCurrent === -1 ? false : mobileCurrent}
            onChange={(_e, v) => navigate(mobileNav[v].path)}
            showLabels
            sx={{ height: 62, backgroundColor: 'transparent' }}
          >
            {mobileNav.map((item, idx) => {
              const Icon = item.icon;
              const isActive = mobileCurrent === idx;
              return (
                <BottomNavigationAction key={item.id} label={item.label} icon={<Icon />}
                  sx={{
                    color: '#3E5A48', minWidth: 'auto', padding: '10px 0 8px',
                    '&.Mui-selected': { color: '#A8FF3E' },
                    '& .MuiBottomNavigationAction-label': {
                      fontFamily: '"Figtree", sans-serif',
                      fontSize: '0.58rem', fontWeight: isActive ? 600 : 400,
                      '&.Mui-selected': { fontSize: '0.58rem' },
                    },
                    '& .MuiSvgIcon-root': { fontSize: isActive ? '1.3rem' : '1.15rem' },
                  }}
                />
              );
            })}
          </BottomNavigation>
        </Box>
      )}
    </Box>
  );
};

export default Layout;
