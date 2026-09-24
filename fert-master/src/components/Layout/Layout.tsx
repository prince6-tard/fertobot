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
  Language as LanguageIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

// ── Design Tokens (Light Theme) ───────────────────────────
const SB_BG      = '#FFFFFF';
const SB_HOVER   = 'rgba(40,167,69,0.06)';
const SB_ACTIVE  = 'rgba(40,167,69,0.1)';
const SB_BORDER  = 'rgba(0,0,0,0.06)';
const SB_TEXT    = '#1F2937';
const SB_MUTED   = '#6B7280';
const SB_ACCENT  = '#1A7F37';
const SB_W       = 240;

const TOP_BG  = '#FFFFFF';
const CONTENT = '#F5F8F6';

// ── Nav config ────────────────────────────────────────────
const navSections = [
  {
    id: 'main',
    label: 'MAIN',
    items: [
      { id: 'dashboard',     label: 'Overview',   icon: OverviewIcon,   path: '/dashboard' },
      { id: 'voice-chatbot', label: 'Voice Assistant', icon: AIIcon,    path: '/voice-chatbot' },
      { id: 'security',      label: 'Alerts',     icon: AlertsIcon,     path: '/security',    badge: 3 },
    ],
  },
  {
    id: 'fieldOps',
    label: 'FIELD OPS',
    items: [
      { id: 'probes',        label: 'Devices',    icon: DevicesIcon,    path: '/probes' },
      { id: 'irrigation',    label: 'Irrigation', icon: IrrigationIcon, path: '/irrigation' },
    ],
  },
];

const mobileNav = [
  { id: 'dashboard',     label: 'Overview', icon: OverviewIcon,   path: '/dashboard' },
  { id: 'voice-chatbot', label: 'AI',       icon: AIIcon,         path: '/voice-chatbot' },
  { id: 'security',      label: 'Alerts',   icon: AlertsIcon,     path: '/security' },
  { id: 'probes',        label: 'Devices',  icon: SensorsIcon,    path: '/probes' },
  { id: 'irrigation',    label: 'Water',    icon: IrrigationIcon, path: '/irrigation' },
];

interface LayoutProps { children: React.ReactNode; }

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const muiTheme  = useTheme();
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up('md'));
  const currentPath   = location.pathname;
  const mobileCurrent = mobileNav.findIndex(item => item.path === currentPath);
  const { lang, setLang, t } = useLanguage();

  const toggleLang = () => {
    setLang(lang === 'en' ? 'hi' : 'en');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: CONTENT }}>

      {/* ── SIDEBAR ── */}
      {isDesktop && (
        <Box component="nav" sx={{
          width: SB_W, flexShrink: 0, display: 'flex', flexDirection: 'column',
          bgcolor: SB_BG, height: '100vh', position: 'sticky', top: 0,
          borderRight: `1px solid ${SB_BORDER}`,
        }}>

          {/* Logo */}
          <Box sx={{ px: 2.5, pt: 2.5, pb: 2, borderBottom: `1px solid ${SB_BORDER}`, textAlign: 'center' }}>
            <Box
              component="img"
              src="/images/fertobot-logo.png"
              alt="FertoBot Logo"
              sx={{
                width: '100%',
                maxWidth: 175,
                height: 'auto',
                display: 'block',
                mx: 'auto',
                mb: 0.5,
              }}
            />
            <Typography sx={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: 600, letterSpacing: '0.04em' }}>
              Farms That Think.
            </Typography>
          </Box>

          {/* Nav sections */}
          <Box sx={{ flex: 1, py: 2, px: 1.5, display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
            {navSections.map(section => (
              <Box key={section.id}>
                <Typography sx={{
                  fontSize: '0.6rem', fontWeight: 700, color: SB_MUTED,
                  letterSpacing: '0.1em', textTransform: 'uppercase', px: 1.25, mb: 0.75,
                }}>
                  {t(section.id)}
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
                        transition: 'all 0.15s ease',
                        position: 'relative', overflow: 'hidden',
                        '&:hover': { backgroundColor: active ? SB_ACTIVE : SB_HOVER },
                      }}>
                        {active && (
                          <Box sx={{
                            position: 'absolute', left: 0, top: '20%', bottom: '20%',
                            width: 3, borderRadius: '0 3px 3px 0', bgcolor: SB_ACCENT,
                          }} />
                        )}
                        <Box sx={{
                          width: 28, height: 28, borderRadius: '7px', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          bgcolor: active ? 'rgba(26,127,55,0.1)' : 'rgba(0,0,0,0.03)',
                        }}>
                          <Icon sx={{ fontSize: 16, color: active ? SB_ACCENT : SB_MUTED }} />
                        </Box>
                        <Typography sx={{
                          fontSize: '0.85rem', fontWeight: active ? 600 : 500,
                          color: active ? SB_TEXT : SB_MUTED,
                          fontFamily: '"Inter", sans-serif', flex: 1,
                        }}>
                          {t(item.id)}
                        </Typography>
                        {item.badge && (
                          <Box sx={{
                            minWidth: 20, height: 20, borderRadius: '10px', px: 0.5,
                            bgcolor: '#DC3545', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: '#FFFFFF' }}>
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
              px: 1.5, py: 1.1, borderRadius: '9px', cursor: 'pointer', mb: 1,
              background: 'linear-gradient(135deg, rgba(40,167,69,0.1), rgba(26,127,55,0.05))',
              border: '1px solid rgba(40,167,69,0.2)',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, rgba(40,167,69,0.15), rgba(26,127,55,0.1))',
              },
            }}>
              <Box sx={{ width: 24, height: 24, borderRadius: '6px', bgcolor: 'rgba(26,127,55,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AddIcon sx={{ fontSize: 16, color: SB_ACCENT }} />
              </Box>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: SB_ACCENT, fontFamily: '"Inter", sans-serif' }}>
                {t('deployNode')}
              </Typography>
            </Box>

            <Box onClick={() => navigate('/profile')} sx={{
              display: 'flex', alignItems: 'center', gap: 1.25, px: 1.25, py: 0.8,
              borderRadius: '7px', cursor: 'pointer', mt: 0.5,
              '&:hover': { bgcolor: SB_HOVER },
            }}>
              <LogsIcon sx={{ fontSize: 16, color: SB_MUTED }} />
              <Typography sx={{ fontSize: '0.8rem', color: SB_MUTED, fontWeight: 500 }}>{t('systemLogs')}</Typography>
            </Box>

            <Box onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} sx={{
              display: 'flex', alignItems: 'center', gap: 1.25, px: 1.25, py: 0.8,
              borderRadius: '7px', cursor: 'pointer',
              '&:hover': { bgcolor: 'rgba(220,53,69,0.08)' },
            }}>
              <LogoutIcon sx={{ fontSize: 16, color: '#DC3545' }} />
              <Typography sx={{ fontSize: '0.8rem', color: '#DC3545', fontWeight: 600 }}>{t('logout')}</Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* ── RIGHT: Topbar + Content ── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* TOPBAR */}
        <Box sx={{
          position: 'sticky', top: 0, zIndex: 1100,
          height: 64, display: 'flex', alignItems: 'center',
          px: { xs: 2, md: 3 }, gap: 1.5,
          bgcolor: TOP_BG,
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          flexShrink: 0,
        }}>

          {/* Search */}
          <Box sx={{
            flex: 1, maxWidth: 400, display: 'flex', alignItems: 'center',
            gap: 1, px: 1.5, py: 0.8, borderRadius: '10px',
            backgroundColor: '#F3F4F6',
            border: '1px solid transparent',
            transition: 'border-color 0.2s, background-color 0.2s',
            '&:focus-within': { borderColor: 'rgba(26,127,55,0.3)', backgroundColor: '#FFFFFF' },
          }}>
            <SearchIcon sx={{ fontSize: 18, color: '#6B7280' }} />
            <InputBase
              placeholder={t('searchPlaceholder')}
              sx={{
                flex: 1, fontSize: '0.85rem', color: '#1F2937',
                fontFamily: '"Inter", sans-serif',
                '& input::placeholder': { color: '#9CA3AF', opacity: 1 },
              }}
            />
          </Box>

          <Box sx={{ flex: 1 }} />

          {/* Live status pill */}
          <Box sx={{
            display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.75,
            px: 1.5, py: 0.6, borderRadius: '20px',
            bgcolor: 'rgba(40,167,69,0.1)', border: '1px solid rgba(40,167,69,0.2)',
          }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#28A745',
              animation: 'pulse-dot 2s ease-in-out infinite' }} />
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#1A7F37', letterSpacing: '0.05em' }}>
              {t('liveActive')}
            </Typography>
          </Box>

          <IconButton size="small" onClick={toggleLang} sx={{ color: '#6B7280', '&:hover': { color: '#1A7F37', bgcolor: 'rgba(26,127,55,0.08)' } }} title="Toggle Language (English/Hindi)">
            <LanguageIcon sx={{ fontSize: 22 }} />
            <Typography sx={{ fontSize: '0.6rem', ml: 0.5, fontWeight: 700 }}>{lang.toUpperCase()}</Typography>
          </IconButton>
          <IconButton size="small" sx={{ color: '#6B7280', '&:hover': { color: '#1A7F37', bgcolor: 'rgba(26,127,55,0.08)' } }}>
            <Badge badgeContent={3} sx={{ '& .MuiBadge-badge': { bgcolor: '#DC3545', fontSize: '0.6rem', color: '#fff' } }}>
              <AlertsIcon sx={{ fontSize: 22 }} />
            </Badge>
          </IconButton>
          <IconButton size="small" sx={{ color: '#6B7280', '&:hover': { color: '#1A7F37', bgcolor: 'rgba(26,127,55,0.08)' } }}>
            <SupportIcon sx={{ fontSize: 22 }} />
          </IconButton>
          <IconButton size="small" onClick={() => navigate('/profile')} sx={{ color: '#6B7280', '&:hover': { color: '#1A7F37', bgcolor: 'rgba(26,127,55,0.08)' } }}>
            <SettingsIcon sx={{ fontSize: 22 }} />
          </IconButton>

          <Avatar onClick={() => navigate('/profile')} sx={{
            width: 36, height: 36, ml: 1,
            background: 'linear-gradient(135deg, #4CAF50, #1A7F37)',
            fontSize: '0.9rem', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer',
          }}>
            RS
          </Avatar>
        </Box>

        {/* CONTENT */}
        <Box component="main" sx={{
          flex: 1,
          px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 },
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
          borderTop: '1px solid rgba(0,0,0,0.06)',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 -2px 12px rgba(0,0,0,0.05)',
        }}>
          <BottomNavigation
            value={mobileCurrent === -1 ? false : mobileCurrent}
            onChange={(_e, v) => navigate(mobileNav[v].path)}
            showLabels
            sx={{ height: 64, backgroundColor: 'transparent' }}
          >
            {mobileNav.map((item, idx) => {
              const Icon = item.icon;
              const isActive = mobileCurrent === idx;
              return (
                <BottomNavigationAction key={item.id} label={t(item.id)} icon={<Icon />}
                  sx={{
                    color: '#6B7280', minWidth: 'auto', padding: '10px 0 8px',
                    '&.Mui-selected': { color: '#1A7F37' },
                    '& .MuiBottomNavigationAction-label': {
                      fontFamily: '"Inter", sans-serif',
                      fontSize: '0.65rem', fontWeight: isActive ? 600 : 500,
                      '&.Mui-selected': { fontSize: '0.65rem' },
                    },
                    '& .MuiSvgIcon-root': { fontSize: isActive ? '1.4rem' : '1.2rem' },
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
