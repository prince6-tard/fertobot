import React from 'react';
import { Box, Typography, LinearProgress, alpha } from '@mui/material';
import {
  WaterDrop as MoistureIcon,
  Thermostat as TemperatureIcon,
  Opacity as HumidityIcon,
  Science as NPKIcon,
  Tune as PHIcon,
  LocalDrink as WaterTankIcon,
  SignalWifi4Bar as ConnectivityIcon,
} from '@mui/icons-material';
import { DashboardCard } from '../../types';
import { colors } from '../../utils/theme';

const iconMap = {
  moisture: MoistureIcon,
  temperature: TemperatureIcon,
  humidity: HumidityIcon,
  npk: NPKIcon,
  ph: PHIcon,
  water_tank: WaterTankIcon,
  connectivity: ConnectivityIcon,
};

interface SummaryCardProps {
  data: DashboardCard;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ data }) => {
  const Icon = iconMap[data.icon as keyof typeof iconMap];
  const sensorColor = data.color;

  const tankPct = data.id === 'water_tank' && typeof data.value === 'number' ? data.value : null;
  const tankStatusColor =
    tankPct !== null
      ? tankPct < 30
        ? colors.status.error
        : tankPct < 60
        ? colors.status.warning
        : colors.status.success
      : null;

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: '14px',
        border: `1px solid ${alpha(sensorColor, 0.25)}`,
        overflow: 'hidden',
        background: `linear-gradient(145deg, #1A3A22 0%, ${alpha(sensorColor, 0.08)} 100%)`,
        boxShadow: `0 2px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)`,
        // Colored left accent bar
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: `linear-gradient(to bottom, ${sensorColor}, ${alpha(sensorColor, 0.5)})`,
          borderRadius: '14px 0 0 14px',
          boxShadow: `3px 0 12px ${alpha(sensorColor, 0.4)}`,
        },
        // Radial glow in corner
        '&::after': {
          content: '""',
          position: 'absolute',
          right: -10,
          bottom: -10,
          width: 70,
          height: 70,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(sensorColor, 0.15)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <Box sx={{ p: { xs: 1.5, sm: 1.75 }, pl: { xs: 2.25, sm: 2.5 } }}>
        {/* Label + Icon */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
          <Typography
            sx={{
              fontSize: '0.6rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: alpha(sensorColor, 0.85),
              fontFamily: '"Plus Jakarta Sans", sans-serif',
            }}
          >
            {data.title}
          </Typography>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: '9px',
              backgroundColor: alpha(sensorColor, 0.15),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${alpha(sensorColor, 0.3)}`,
              boxShadow: `0 0 10px ${alpha(sensorColor, 0.2)}`,
            }}
          >
            <Icon sx={{ fontSize: 16, color: sensorColor }} />
          </Box>
        </Box>

        {/* Value */}
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 0.25 }}>
          <Typography
            sx={{
              fontFamily: '"DM Mono", monospace',
              fontSize: { xs: '1.35rem', sm: '1.5rem' },
              fontWeight: 500,
              color: sensorColor,
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}
          >
            {data.value}
          </Typography>
          {data.unit && (
            <Typography
              sx={{
                fontFamily: '"DM Mono", monospace',
                fontSize: '0.65rem',
                fontWeight: 400,
                color: alpha(sensorColor, 0.65),
                lineHeight: 1,
              }}
            >
              {data.unit}
            </Typography>
          )}
        </Box>

        {/* Water tank progress bar */}
        {tankPct !== null && tankStatusColor && (
          <Box sx={{ mt: 1.25 }}>
            <LinearProgress
              variant="determinate"
              value={tankPct}
              sx={{
                height: 3,
                borderRadius: 2,
                backgroundColor: 'rgba(255,255,255,0.07)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 2,
                  backgroundColor: tankStatusColor,
                  boxShadow: `0 0 8px ${alpha(tankStatusColor, 0.5)}`,
                },
              }}
            />
            <Typography
              sx={{
                mt: 0.5,
                fontSize: '0.55rem',
                color: tankStatusColor,
                fontFamily: '"DM Mono", monospace',
                letterSpacing: '0.04em',
                opacity: 0.85,
              }}
            >
              {tankPct < 30 ? 'REFILL NEEDED' : tankPct < 60 ? 'MODERATE' : 'OPTIMAL'}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

interface SummaryCardsProps {
  cards: DashboardCard[];
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ cards }) => {
  if (cards.length === 0) {
    return (
      <Box
        sx={{
          p: 3,
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '14px',
          backgroundColor: '#132B1A',
          textAlign: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No live summary data available yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)',
          sm: 'repeat(3, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(6, 1fr)',
        },
        gap: { xs: 1, sm: 1.25 },
        width: '100%',
      }}
    >
      {cards.map(card => (
        <SummaryCard key={card.id} data={card} />
      ))}
    </Box>
  );
};

export default SummaryCards;
