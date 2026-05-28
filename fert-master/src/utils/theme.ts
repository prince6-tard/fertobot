import { createTheme, ThemeOptions } from '@mui/material/styles';

// ═══════════════════════════════════════════════════════════
// DEEP EARTH NEXUS — FertoBot Design System v2
// Dark-mode phosphorescent bioluminescent field ops theme
// ═══════════════════════════════════════════════════════════
export const colors = {
  bg: {
    base:     '#060C08',
    surface:  '#0A1410',
    elevated: '#0F1C14',
    overlay:  '#132018',
  },
  accent: {
    primary:  '#A8FF3E',   // phosphorescent lime — the signature color
    teal:     '#00E5C6',   // bioluminescent teal
    amber:    '#FFB830',   // warm alert
    red:      '#FF4565',   // critical
    blue:     '#4DA8FF',   // info/moisture
    purple:   '#B06EFF',   // NPK purple
  },
  sensor: {
    moisture:    '#4DA8FF',
    temperature: '#FF9060',
    humidity:    '#00E5C6',
    nitrogen:    '#A8FF3E',
    phosphorus:  '#FFB830',
    potassium:   '#B06EFF',
    pH:          '#00E5C6',
  },
  status: {
    success: '#A8FF3E',
    warning: '#FFB830',
    error:   '#FF4565',
    info:    '#4DA8FF',
    live:    '#A8FF3E',
  },
  neutral: {
    25:  '#0A1410',
    50:  '#0F1C14',
    100: '#14231A',
    200: '#1A2D22',
    300: '#253B2E',
    400: '#345040',
    500: '#4A6E55',
    600: '#6A9478',
    700: '#94B8A2',
    800: '#C0D8C8',
    900: '#E2F0E8',
  },
  // Compat: components that still reference colors.primary
  primary: {
    50:  '#F0FDE4',
    100: '#DCFCA7',
    200: '#C4FF75',
    300: '#A8FF3E',
    400: '#8FEE1E',
    500: '#A8FF3E',
    600: '#7ACC1C',
    700: '#5EAD0C',
    800: '#4A8C08',
    900: '#326506',
  },
  sidebar: {
    bg:     '#070D09',
    hover:  'rgba(168,255,62,0.05)',
    active: 'rgba(168,255,62,0.10)',
    border: 'rgba(168,255,62,0.07)',
    text:   '#C8E8D2',
    muted:  '#3E5A48',
  },
};

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main:         '#A8FF3E',
      light:        '#C4FF75',
      dark:         '#7ACC1C',
      contrastText: '#060C08',
    },
    secondary: {
      main:         '#00E5C6',
      light:        '#40FFDF',
      dark:         '#00B09A',
      contrastText: '#060C08',
    },
    error:   { main: '#FF4565' },
    warning: { main: '#FFB830' },
    info:    { main: '#4DA8FF' },
    success: { main: '#A8FF3E' },
    background: {
      default: '#060C08',
      paper:   '#0A1410',
    },
    text: {
      primary:   '#D8EDE0',
      secondary: '#4A6E55',
    },
    divider: 'rgba(168,255,62,0.07)',
  },
  typography: {
    fontFamily: '"Figtree", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: { fontSize: '2.5rem',  fontWeight: 700, lineHeight: 1.15, fontFamily: '"Syne", sans-serif', letterSpacing: '-0.02em' },
    h2: { fontSize: '2rem',    fontWeight: 700, lineHeight: 1.2,  fontFamily: '"Syne", sans-serif', letterSpacing: '-0.02em' },
    h3: { fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.3,  fontFamily: '"Syne", sans-serif', letterSpacing: '-0.01em' },
    h4: { fontSize: '1.4rem',  fontWeight: 700, lineHeight: 1.35, fontFamily: '"Syne", sans-serif', letterSpacing: '-0.01em' },
    h5: { fontSize: '1.15rem', fontWeight: 600, lineHeight: 1.4,  fontFamily: '"Syne", sans-serif' },
    h6: { fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.5,  fontFamily: '"Syne", sans-serif' },
    body1: { fontSize: '0.9rem',  lineHeight: 1.65, fontFamily: '"Figtree", sans-serif' },
    body2: { fontSize: '0.8rem',  lineHeight: 1.55, fontFamily: '"Figtree", sans-serif' },
    caption: { fontSize: '0.68rem', lineHeight: 1.4, color: '#4A6E55', fontFamily: '"DM Mono", monospace', letterSpacing: '0.06em' },
    overline: { fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: '"DM Mono", monospace', color: '#4A6E55' },
  },
  shape: { borderRadius: 12 },
  shadows: [
    'none',
    '0px 2px 8px rgba(0,0,0,0.6)',
    '0px 4px 16px rgba(0,0,0,0.6)',
    '0px 8px 24px rgba(0,0,0,0.65)',
    '0px 12px 32px rgba(0,0,0,0.7)',
    '0px 16px 40px rgba(0,0,0,0.7)',
    '0px 2px 8px rgba(0,0,0,0.6)',
    '0px 2px 8px rgba(0,0,0,0.6)',
    '0px 4px 16px rgba(0,0,0,0.6)',
    '0px 4px 16px rgba(0,0,0,0.6)',
    '0px 8px 24px rgba(0,0,0,0.65)',
    '0px 8px 24px rgba(0,0,0,0.65)',
    '0px 8px 24px rgba(0,0,0,0.65)',
    '0px 8px 24px rgba(0,0,0,0.65)',
    '0px 12px 32px rgba(0,0,0,0.7)',
    '0px 12px 32px rgba(0,0,0,0.7)',
    '0px 12px 32px rgba(0,0,0,0.7)',
    '0px 12px 32px rgba(0,0,0,0.7)',
    '0px 16px 40px rgba(0,0,0,0.7)',
    '0px 16px 40px rgba(0,0,0,0.7)',
    '0px 16px 40px rgba(0,0,0,0.7)',
    '0px 16px 40px rgba(0,0,0,0.7)',
    '0px 20px 48px rgba(0,0,0,0.75)',
    '0px 20px 48px rgba(0,0,0,0.75)',
    '0px 24px 56px rgba(0,0,0,0.8)',
  ],
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#0A1410',
          backgroundImage: 'none',
          border: '1px solid rgba(168,255,62,0.07)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.5)',
          borderRadius: 14,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#0A1410',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 600,
          fontFamily: '"Figtree", sans-serif',
          minHeight: 44,
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          userSelect: 'none',
          '&:active': { transform: 'scale(0.97)', transition: 'transform 0.1s ease' },
        },
        contained: {
          background: 'linear-gradient(135deg, #A8FF3E, #7ACC1C)',
          color: '#060C08',
          boxShadow: '0 4px 16px rgba(168,255,62,0.25)',
          fontWeight: 700,
          '&:hover': {
            background: 'linear-gradient(135deg, #C4FF75, #A8FF3E)',
            boxShadow: '0 6px 24px rgba(168,255,62,0.4)',
          },
        },
        outlined: {
          borderColor: 'rgba(168,255,62,0.25)',
          color: '#A8FF3E',
          '&:hover': {
            borderColor: '#A8FF3E',
            backgroundColor: 'rgba(168,255,62,0.06)',
          },
        },
        text: {
          color: '#A8FF3E',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontFamily: '"DM Mono", monospace',
          fontSize: '0.65rem',
          backgroundColor: 'rgba(168,255,62,0.08)',
          border: '1px solid rgba(168,255,62,0.15)',
          color: '#A8FF3E',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0A1410',
          backgroundImage: 'none',
          boxShadow: '0px 1px 0px rgba(168,255,62,0.07)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#070D09',
          backgroundImage: 'none',
          borderRight: '1px solid rgba(168,255,62,0.07)',
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
            backgroundColor: 'rgba(168,255,62,0.10)',
            color: '#A8FF3E',
            '&:hover': { backgroundColor: 'rgba(168,255,62,0.14)' },
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: '#0F1C14',
            fontFamily: '"Figtree", sans-serif',
            '& fieldset': { borderColor: 'rgba(168,255,62,0.12)' },
            '&:hover fieldset': { borderColor: 'rgba(168,255,62,0.3)' },
            '&.Mui-focused fieldset': { borderColor: '#A8FF3E' },
          },
          '& .MuiInputLabel-root': {
            fontFamily: '"Figtree", sans-serif',
            '&.Mui-focused': { color: '#A8FF3E' },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0F1C14',
          backgroundImage: 'none',
          border: '1px solid rgba(168,255,62,0.12)',
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
          backgroundColor: 'rgba(168,255,62,0.08)',
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
            color: '#A8FF3E',
            '& + .MuiSwitch-track': {
              backgroundColor: 'rgba(168,255,62,0.4)',
            },
          },
        },
        track: {
          backgroundColor: 'rgba(255,255,255,0.12)',
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
          color: '#4A6E55',
          '&.Mui-selected': { color: '#A8FF3E' },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#A8FF3E',
          height: 2,
          borderRadius: 1,
          boxShadow: '0 0 8px rgba(168,255,62,0.6)',
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
          // No touch-action override — keeps trackpad/wheel scrolling working on laptops
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          WebkitTapHighlightColor: 'transparent',
          overscrollBehavior: 'none',
          backgroundColor: '#060C08',
        },
        '*': { WebkitTapHighlightColor: 'transparent' },
        'input, textarea': {
          userSelect: 'text',
          WebkitUserSelect: 'text',
        },
        '::-webkit-scrollbar': {
          width: '4px',
          height: '4px',
        },
        '::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '::-webkit-scrollbar-thumb': {
          background: 'rgba(168,255,62,0.15)',
          borderRadius: '4px',
          '&:hover': { background: 'rgba(168,255,62,0.3)' },
        },
      },
    },
  },
};

export const theme = createTheme(themeOptions);

export const getStatusColor = (status: 'normal' | 'warning' | 'critical' | 'offline' | 'online') => {
  switch (status) {
    case 'normal':
    case 'online':  return colors.accent.primary;
    case 'warning': return colors.accent.amber;
    case 'critical': return colors.accent.red;
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
