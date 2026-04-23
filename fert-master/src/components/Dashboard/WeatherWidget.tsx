import React from 'react';
import { Typography, Box, alpha } from '@mui/material';
import {
  Thermostat as TempIcon,
  Opacity as HumidityIcon,
  WaterDrop as MoistureIcon,
  BatteryFull as BatteryIcon,
  Science as PHIcon,
  LocalDrink as TankIcon,
} from '@mui/icons-material';
import { SensorReading } from '../../types';

interface WeatherWidgetProps {
  latestReading: SensorReading | null;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ latestReading }) => {
  if (!latestReading) {
    return (
      <Box
        sx={{
          p: 2.5,
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.07)',
          backgroundColor: '#1A3520',
        }}
      >
        <Typography sx={{ fontSize: '0.8rem', color: '#8FA89C' }}>
          No live sensor reading available yet.
        </Typography>
      </Box>
    );
  }

  const stats = [
    { label: 'Humidity', value: `${latestReading.humidity.toFixed(0)}%`, color: '#4DD9AC', Icon: HumidityIcon },
    { label: 'Moisture', value: `${latestReading.soilMoisture.toFixed(0)}%`, color: '#4FC3F7', Icon: MoistureIcon },
    { label: 'pH', value: latestReading.pH.toFixed(2), color: '#80CBC4', Icon: PHIcon },
    { label: 'Tank', value: `${latestReading.waterTankLevel.toFixed(0)}%`, color: '#F4A261', Icon: TankIcon },
    { label: 'Battery', value: `${latestReading.batteryLevel.toFixed(0)}%`, color: '#52D080', Icon: BatteryIcon },
  ];

  return (
    <Box
      sx={{
        borderRadius: '16px',
        border: '1px solid rgba(79,195,247,0.18)',
        background: 'linear-gradient(135deg, #1A3520 0%, rgba(79,195,247,0.07) 100%)',
        overflow: 'hidden',
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          right: -30,
          top: -30,
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79,195,247,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
      }}
    >
      {/* Main reading row */}
      <Box sx={{ px: 2.5, pt: 2, pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography
            sx={{
              fontSize: '0.58rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#4FC3F7',
              fontFamily: '"DM Mono", monospace',
              mb: 0.75,
            }}
          >
            LIVE READING
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
            <TempIcon sx={{ fontSize: 18, color: '#FF8A65', mb: 0.5 }} />
            <Typography
              sx={{
                fontFamily: '"DM Mono", monospace',
                fontSize: '2.4rem',
                fontWeight: 500,
                color: '#F0EDE6',
                lineHeight: 1,
                letterSpacing: '-0.02em',
              }}
            >
              {latestReading.temperature.toFixed(1)}
            </Typography>
            <Typography sx={{ fontFamily: '"DM Mono", monospace', fontSize: '1.1rem', color: '#8FA89C', lineHeight: 1 }}>
              °C
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '0.7rem', color: '#8FA89C', mt: 0.75 }}>
            N {latestReading.nitrogen.toFixed(0)} · P {latestReading.phosphorus.toFixed(0)} · K {latestReading.potassium.toFixed(0)} ppm
          </Typography>
        </Box>

        {/* Stat pills */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'flex-end' }}>
          {stats.map(({ label, value, color, Icon }) => (
            <Box
              key={label}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                px: 1.25,
                py: 0.75,
                borderRadius: '10px',
                backgroundColor: alpha(color, 0.1),
                border: `1px solid ${alpha(color, 0.22)}`,
                minWidth: 52,
              }}
            >
              <Icon sx={{ fontSize: 14, color, mb: 0.25 }} />
              <Typography
                sx={{
                  fontFamily: '"DM Mono", monospace',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  color,
                  lineHeight: 1.2,
                }}
              >
                {value}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.52rem',
                  color: '#8FA89C',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  lineHeight: 1.2,
                }}
              >
                {label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Bottom accent bar */}
      <Box
        sx={{
          height: 3,
          background: 'linear-gradient(90deg, #4FC3F7, #4DD9AC, #52D080, #F4A261)',
          opacity: 0.5,
        }}
      />
    </Box>
  );
};

export default WeatherWidget;
