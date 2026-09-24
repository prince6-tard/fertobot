import { createTheme, ThemeOptions } from '@mui/material/styles';

// ═══════════════════════════════════════════════════════════
// FertoBot Design System v3 — Light Theme
// Clean, modern agriculture theme with green accents
// ═══════════════════════════════════════════════════════════
export const colors = {
  bg: {
    base:     '#F5F8F6',
    surface:  '#FFFFFF',
    elevated: '#FFFFFF',
    overlay:  'rgba(255,255,255,0.8)',
  },
  accent: {
    primary:  '#28A745',   // Solid green
    teal:     '#20C997',
    amber:    '#FFC107',
    red:      '#DC3545',
    blue:     '#0D6EFD',
    purple:   '#6F42C1',
  },
  sensor: {
    moisture:    '#0D6EFD',
    temperature: '#FD7E14',
    humidity:    '#20C997',
    nitrogen:    '#28A745',
    phosphorus:  '#FFC107',
    potassium:   '#6F42C1',
    pH:          '#20C997',
  },
  status: {
    success: '#28A745',
    warning: '#FFC107',
    error:   '#DC3545',
    info:    '#0D6EFD',
    live:    '#28A745',
  },
  neutral: {
    50:  '#F8F9FA',
    100: '#F1F3F5',
    200: '#E9ECEF',
    300: '#DEE2E6',
    400: '#CED4DA',
    500: '#ADB5BD',
    600: '#868E96',
    700: '#495057',
    800: '#343A40',
    900: '#212529',
  },
  primary: {
    50:  '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50',
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },
  sidebar: {
    bg:     '#FFFFFF',
    hover:  'rgba(40,167,69,0.08)',
    active: 'rgba(40,167,69,0.12)',
    border: 'rgba(0,0,0,0.06)',
    text:   '#212529',
    muted:  '#6C757D',
  },
};

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main:         '#1A7F37', // Deep green for primary brand
      light:        '#4CAF50',
      dark:         '#115926',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main:         '#20C997',
      light:        '#63DFBC',
      dark:         '#168F6B',
      contrastText: '#FFFFFF',
    },
    error:   { main: '#DC3545' },
    warning: { main: '#FFC107' },
    info:    { main: '#0D6EFD' },
    success: { main: '#28A745' },
    background: {
      default: '#F5F8F6',
      paper:   '#FFFFFF',
    },
    text: {
      primary:   '#1F2937',
      secondary: '#4B5563',
    },
    divider: 'rgba(0,0,0,0.08)',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: { fontSize: '2.5rem',  fontWeight: 700, lineHeight: 1.15, fontFamily: '"Inter", sans-serif', letterSpacing: '-0.02em', color: '#111827' },
    h2: { fontSize: '2rem',    fontWeight: 700, lineHeight: 1.2,  fontFamily: '"Inter", sans-serif', letterSpacing: '-0.02em', color: '#111827' },
    h3: { fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.3,  fontFamily: '"Inter", sans-serif', letterSpacing: '-0.01em', color: '#111827' },
    h4: { fontSize: '1.4rem',  fontWeight: 700, lineHeight: 1.35, fontFamily: '"Inter", sans-serif', letterSpacing: '-0.01em', color: '#111827' },
    h5: { fontSize: '1.15rem', fontWeight: 600, lineHeight: 1.4,  fontFamily: '"Inter", sans-serif', color: '#1F2937' },
    h6: { fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.5,  fontFamily: '"Inter", sans-serif', color: '#1F2937' },
    body1: { fontSize: '0.9rem',  lineHeight: 1.65, fontFamily: '"Inter", sans-serif', color: '#374151' },
    body2: { fontSize: '0.8rem',  lineHeight: 1.55, fontFamily: '"Inter", sans-serif', color: '#4B5563' },
    caption: { fontSize: '0.68rem', lineHeight: 1.4, color: '#6B7280', fontFamily: '"Inter", monospace', letterSpacing: '0.04em' },
    overline: { fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: '"Inter", monospace', color: '#6B7280' },
  },
  shape: { borderRadius: 12 },
  shadows: [
    'none',
    '0px 2px 8px rgba(0,0,0,0.04)',
    '0px 4px 16px rgba(0,0,0,0.06)',
    '0px 8px 24px rgba(0,0,0,0.08)',
    '0px 12px 32px rgba(0,0,0,0.1)',
    '0px 16px 40px rgba(0,0,0,0.12)',
    '0px 2px 8px rgba(0,0,0,0.04)',
    '0px 2px 8px rgba(0,0,0,0.04)',
    '0px 4px 16px rgba(0,0,0,0.06)',
    '0px 4px 16px rgba(0,0,0,0.06)',
    '0px 8px 24px rgba(0,0,0,0.08)',
    '0px 8px 24px rgba(0,0,0,0.08)',
    '0px 8px 24px rgba(0,0,0,0.08)',
    '0px 8px 24px rgba(0,0,0,0.08)',
    '0px 12px 32px rgba(0,0,0,0.1)',
    '0px 12px 32px rgba(0,0,0,0.1)',
    '0px 12px 32px rgba(0,0,0,0.1)',
    '0px 12px 32px rgba(0,0,0,0.1)',
    '0px 16px 40px rgba(0,0,0,0.12)',
    '0px 16px 40px rgba(0,0,0,0.12)',
    '0px 16px 40px rgba(0,0,0,0.12)',
    '0px 16px 40px rgba(0,0,0,0.12)',
    '0px 20px 48px rgba(0,0,0,0.14)',
    '0px 20px 48px rgba(0,0,0,0.14)',
    '0px 24px 56px rgba(0,0,0,0.16)',
  ],
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          backgroundImage: 'none',
          border: '1px solid #E5E7EB',
          borderTop: '3px solid #1A7F37',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          borderRadius: 16,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          fontFamily: '"Inter", sans-serif',
          minHeight: 44,
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          userSelect: 'none',
          '&:active': { transform: 'scale(0.97)', transition: 'transform 0.1s ease' },
        },
        contained: {
          background: 'linear-gradient(135deg, #28A745, #1A7F37)',
          color: '#FFFFFF',
          boxShadow: '0 4px 16px rgba(40,167,69,0.25)',
          fontWeight: 700,
          '&:hover': {
            background: 'linear-gradient(135deg, #2FB84D, #209341)',
            boxShadow: '0 6px 24px rgba(40,167,69,0.4)',
          },
        },
        outlined: {
          borderColor: 'rgba(40,167,69,0.25)',
          color: '#1A7F37',
          '&:hover': {
            borderColor: '#1A7F37',
            backgroundColor: 'rgba(40,167,69,0.06)',
          },
        },
        text: {
          color: '#1A7F37',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontFamily: '"Figtree", sans-serif',
          fontSize: '0.7rem',
          backgroundColor: 'rgba(40,167,69,0.08)',
          border: '1px solid rgba(40,167,69,0.15)',
          color: '#1A7F37',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          backgroundImage: 'none',
          boxShadow: '0px 1px 0px rgba(0,0,0,0.06)',
          color: '#1F2937',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          backgroundImage: 'none',
          borderRight: '1px solid rgba(0,0,0,0.06)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          minHeight: 44,
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          userSelect: 'none',
          '&:active': { transform: 'scale(0.98)', transition: 'transform 0.1s ease' },
          '&.Mui-selected': {
            backgroundColor: 'rgba(40,167,69,0.08)',
            color: '#1A7F37',
            '&:hover': { backgroundColor: 'rgba(40,167,69,0.12)' },
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: '#FFFFFF',
            fontFamily: '"Figtree", sans-serif',
            '& fieldset': { borderColor: 'rgba(0,0,0,0.12)' },
            '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.3)' },
            '&.Mui-focused fieldset': { borderColor: '#1A7F37' },
          },
          '& .MuiInputLabel-root': {
            fontFamily: '"Figtree", sans-serif',
            '&.Mui-focused': { color: '#1A7F37' },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          backgroundImage: 'none',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 20,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontFamily: '"Figtree", sans-serif',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0,0,0,0.08)',
          borderRadius: 4,
        },
        bar: {
          borderRadius: 4,
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': {
            color: '#1A7F37',
            '& + .MuiSwitch-track': {
              backgroundColor: 'rgba(40,167,69,0.4)',
            },
          },
        },
        track: {
          backgroundColor: 'rgba(0,0,0,0.12)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontFamily: '"Figtree", sans-serif',
          fontSize: '0.85rem',
          minHeight: 44,
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          userSelect: 'none',
          color: '#6B7280',
          '&.Mui-selected': { color: '#1A7F37' },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#1A7F37',
          height: 3,
          borderRadius: '3px 3px 0 0',
          boxShadow: '0 -2px 8px rgba(40,167,69,0.3)',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          WebkitTextSizeAdjust: '100%',
          WebkitTapHighlightColor: 'transparent',
        },
        body: {
          backgroundColor: '#F3F6F4',
          color: '#1F2937',
        },
        '*': { WebkitTapHighlightColor: 'transparent' },
        'input, textarea': {
          userSelect: 'text',
          WebkitUserSelect: 'text',
        },
        '::-webkit-scrollbar': {
          width: '6px',
          height: '6px',
        },
        '::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '::-webkit-scrollbar-thumb': {
          background: 'rgba(0,0,0,0.15)',
          borderRadius: '10px',
          '&:hover': { background: 'rgba(0,0,0,0.25)' },
        },
      },
    },
  },
};

export const theme = createTheme(themeOptions);

export const getStatusColor = (status: 'normal' | 'warning' | 'critical' | 'offline' | 'online') => {
  switch (status) {
    case 'normal':
    case 'online':  return colors.status.success;
    case 'warning': return colors.status.warning;
    case 'critical': return colors.status.error;
    case 'offline': return colors.neutral[500];
    default:        return colors.neutral[500];
  }
};

export const getSensorColor = (sensorType: string) => {
  return colors.sensor[sensorType as keyof typeof colors.sensor] || colors.accent.primary;
};

export const breakpoints = {
  mobile:  '(max-width: 768px)',
  tablet:  '(min-width: 769px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)',
  large:   '(min-width: 1440px)',
};

export const animationVariants = {
  fadeIn:  { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } },
  slideIn: { hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0 } },
  scaleIn: { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } },
  stagger: { visible: { transition: { staggerChildren: 0.08 } } },
};
