import React from 'react';
import { Typography, Box, Paper } from '@mui/material';
import {
  Opacity as HumidityIcon,
  WaterDrop as MoistureIcon,
  BatteryFull as BatteryIcon,
} from '@mui/icons-material';
import { SensorReading } from '../../types';
import { colors } from '../../utils/theme';

interface WeatherWidgetProps {
  latestReading: SensorReading | null;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ latestReading }) => {
  if (!latestReading) {
    return (
      <Box sx={{ width: '100%' }}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: colors.neutral[200], borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            No live sensor reading available yet.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: colors.neutral[200], borderRadius: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              Latest live reading
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 200, lineHeight: 1.2, mt: 0.5 }}>
              {latestReading.temperature.toFixed(1)}°C
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Soil moisture {latestReading.soilMoisture.toFixed(0)}% · pH {latestReading.pH.toFixed(2)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ textAlign: 'center' }}>
              <HumidityIcon sx={{ fontSize: 16, color: colors.neutral[600] }} />
              <Typography variant="caption" display="block" color="text.secondary">
                {latestReading.humidity.toFixed(0)}%
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <MoistureIcon sx={{ fontSize: 16, color: colors.neutral[600] }} />
              <Typography variant="caption" display="block" color="text.secondary">
                {latestReading.soilMoisture.toFixed(0)}%
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <BatteryIcon sx={{ fontSize: 16, color: colors.neutral[600] }} />
              <Typography variant="caption" display="block" color="text.secondary">
                {latestReading.batteryLevel.toFixed(0)}%
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(5, 1fr)' }, gap: 1.5 }}>
        <Paper elevation={0} sx={{ p: 1.5, border: '1px solid', borderColor: colors.neutral[200], borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">Temperature</Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>{latestReading.temperature.toFixed(1)}°C</Typography>
        </Paper>
        <Paper elevation={0} sx={{ p: 1.5, border: '1px solid', borderColor: colors.neutral[200], borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">Humidity</Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>{latestReading.humidity.toFixed(0)}%</Typography>
        </Paper>
        <Paper elevation={0} sx={{ p: 1.5, border: '1px solid', borderColor: colors.neutral[200], borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">Soil Moisture</Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>{latestReading.soilMoisture.toFixed(0)}%</Typography>
        </Paper>
        <Paper elevation={0} sx={{ p: 1.5, border: '1px solid', borderColor: colors.neutral[200], borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">Water Tank</Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>{latestReading.waterTankLevel.toFixed(0)}%</Typography>
        </Paper>
        <Paper elevation={0} sx={{ p: 1.5, border: '1px solid', borderColor: colors.neutral[200], borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">pH</Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>{latestReading.pH.toFixed(2)}</Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default WeatherWidget;