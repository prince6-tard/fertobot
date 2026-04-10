import React, { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Fullscreen as FullscreenIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';
import { format } from 'date-fns';
import { SensorReading } from '../../types';
import { colors } from '../../utils/theme';

interface LiveChartsProps {
  readings: SensorReading[];
}

interface ChartPanelProps {
  children?: React.ReactNode;
  chartType: string;
  activeChart: string;
}

const ChartPanel: React.FC<ChartPanelProps> = ({ children, chartType, activeChart }) => {
  return <div style={{ display: chartType === activeChart ? 'block' : 'none' }}><Box sx={{ mt: 0 }}>{children}</Box></div>;
};

const chartOptions = [
  { value: 'moisture', label: 'Moisture & Climate', icon: '💧' },
  { value: 'npk', label: 'NPK Nutrients', icon: '🌱' },
  { value: 'ph', label: 'pH Trends', icon: '⚖️' },
  { value: 'nutrients', label: 'Current Nutrients', icon: '🧪' },
];

const LiveCharts: React.FC<LiveChartsProps> = ({ readings }) => {
  const [activeChart, setActiveChart] = useState('moisture');
  const theme = useTheme();

  const liveData = useMemo(() => {
    return [...readings]
      .filter((reading) => reading.timestamp)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map((reading) => ({
        timestamp: new Date(reading.timestamp).toISOString(),
        soilMoisture: Number(reading.soilMoisture ?? 0),
        temperature: Number(reading.temperature ?? 0),
        humidity: Number(reading.humidity ?? 0),
        nitrogen: Number(reading.nitrogen ?? 0),
        phosphorus: Number(reading.phosphorus ?? 0),
        potassium: Number(reading.potassium ?? 0),
        pH: Number(reading.pH ?? 0),
        conductivity: Number(reading.conductivity ?? 0),
        waterTankLevel: Number(reading.waterTankLevel ?? 0),
        batteryLevel: Number(reading.batteryLevel ?? 0),
        signalStrength: Number(reading.signalStrength ?? 0),
      }));
  }, [readings]);

  const latestReading = liveData[liveData.length - 1];

  const formatTooltipValue = (value: number, name: string) => {
    switch (name) {
      case 'soilMoisture':
        return [`${value.toFixed(1)}%`, 'Soil Moisture'];
      case 'temperature':
        return [`${value.toFixed(1)}°C`, 'Temperature'];
      case 'humidity':
        return [`${value.toFixed(1)}%`, 'Humidity'];
      case 'nitrogen':
        return [`${value.toFixed(1)} ppm`, 'Nitrogen'];
      case 'phosphorus':
        return [`${value.toFixed(1)} ppm`, 'Phosphorus'];
      case 'potassium':
        return [`${value.toFixed(1)} ppm`, 'Potassium'];
      case 'pH':
        return [`${value.toFixed(2)}`, 'pH Level'];
      case 'conductivity':
        return [`${value.toFixed(1)}`, 'Conductivity'];
      default:
        return [value.toFixed(1), name];
    }
  };

  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      value: number;
      dataKey: string;
      color: string;
    }>;
    label?: string;
  }

  const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) {
      return null;
    }

    return (
      <Box
        sx={{
          backgroundColor: 'white',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          p: 2,
          boxShadow: theme.shadows[3],
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          {label ? format(new Date(label), 'MMM dd, HH:mm') : 'Live reading'}
        </Typography>
        {payload.map((entry, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: entry.color }} />
            <Typography variant="caption">
              {formatTooltipValue(entry.value, entry.dataKey)[1]}: <strong>{formatTooltipValue(entry.value, entry.dataKey)[0]}</strong>
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  if (liveData.length === 0) {
    return (
      <Card sx={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary">
            No live chart data available yet.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3, p: 3, pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Chart Type</InputLabel>
              <Select value={activeChart} onChange={(event) => setActiveChart(event.target.value)} label="Chart Type" sx={{ borderRadius: 2 }}>
                {chartOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Refresh Data">
                <IconButton size="small" sx={{ backgroundColor: colors.neutral[100], borderRadius: 1.5 }}>
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Fullscreen">
                <IconButton size="small" sx={{ backgroundColor: colors.neutral[100], borderRadius: 1.5 }}>
                  <FullscreenIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export Data">
                <IconButton size="small" sx={{ backgroundColor: colors.neutral[100], borderRadius: 1.5 }}>
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        {latestReading && (
          <Box sx={{ px: 3, pb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Latest reading: {format(new Date(latestReading.timestamp), 'MMM dd, HH:mm')}
            </Typography>
          </Box>
        )}

        <ChartPanel chartType="moisture" activeChart={activeChart}>
          <Box sx={{ width: '100%' }}>
            <Box sx={{ height: 220, mb: 6, width: '100%' }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 200, pl: 3 }}>
                Soil Moisture, Temperature, and Humidity
              </Typography>
              <ResponsiveContainer width="95%" height="100%" minWidth={0}>
                <AreaChart data={liveData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.neutral[200]} />
                  <XAxis dataKey="timestamp" stroke={colors.neutral[600]} fontSize={12} tickFormatter={(value) => format(new Date(value), 'MM/dd')} />
                  <YAxis stroke={colors.neutral[600]} fontSize={12} domain={[0, 100]} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="soilMoisture" stroke={colors.sensor.moisture} fill={`${colors.sensor.moisture}40`} strokeWidth={2} name="Soil Moisture" />
                  <Area type="monotone" dataKey="humidity" stroke={colors.sensor.humidity} fill={`${colors.sensor.humidity}20`} strokeWidth={2} name="Humidity" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </ChartPanel>

        <ChartPanel chartType="npk" activeChart={activeChart}>
          <Box sx={{ height: 220, mb: 6, width: '100%' }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, pl: 3 }}>
              N-P-K Levels
            </Typography>
            <ResponsiveContainer width="95%" height="100%" minWidth={0}>
              <LineChart data={liveData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.neutral[200]} />
                <XAxis dataKey="timestamp" stroke={colors.neutral[600]} fontSize={12} tickFormatter={(value) => format(new Date(value), 'MM/dd')} />
                <YAxis stroke={colors.neutral[600]} fontSize={12} label={{ value: 'ppm', angle: -90, position: 'insideLeft' }} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="nitrogen" stroke={colors.sensor.nitrogen} strokeWidth={3} name="Nitrogen" dot={false} />
                <Line type="monotone" dataKey="phosphorus" stroke={colors.sensor.phosphorus} strokeWidth={3} name="Phosphorus" dot={false} />
                <Line type="monotone" dataKey="potassium" stroke={colors.sensor.potassium} strokeWidth={3} name="Potassium" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </ChartPanel>

        <ChartPanel chartType="ph" activeChart={activeChart}>
          <Box sx={{ width: '100%' }}>
            <Box sx={{ height: 220, mb: 6, width: '100%' }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, pl: 3 }}>
                pH Level Trends
              </Typography>
              <ResponsiveContainer width="95%" height="100%" minWidth={0}>
                <LineChart data={liveData} margin={{ top: 5, right: 5, left: 15, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.neutral[200]} />
                  <XAxis dataKey="timestamp" stroke={colors.neutral[600]} fontSize={12} tickFormatter={(value) => format(new Date(value), 'HH:mm')} interval="preserveStartEnd" />
                  <YAxis stroke={colors.neutral[600]} fontSize={12} domain={[0, 14]} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="pH" stroke={colors.sensor.pH} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </ChartPanel>

        <ChartPanel chartType="nutrients" activeChart={activeChart}>
          <Box sx={{ width: '100%' }}>
            <Box sx={{ height: 220, mb: 6, width: '100%' }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, pl: 3 }}>
                Current Sensor Values
              </Typography>
              <ResponsiveContainer width="95%" height="100%" minWidth={0}>
                <BarChart
                  data={latestReading ? [
                    { name: 'Nitrogen', value: latestReading.nitrogen },
                    { name: 'Phosphorus', value: latestReading.phosphorus },
                    { name: 'Potassium', value: latestReading.potassium },
                    { name: 'Conductivity', value: latestReading.conductivity },
                    { name: 'Water Tank', value: latestReading.waterTankLevel },
                  ] : []}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.neutral[200]} />
                  <XAxis dataKey="name" stroke={colors.neutral[600]} fontSize={12} />
                  <YAxis stroke={colors.neutral[600]} fontSize={12} />
                  <RechartsTooltip />
                  <Bar dataKey="value" fill={colors.secondary[500]} name="Current Value" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </ChartPanel>
      </CardContent>
    </Card>
  );
};

export default LiveCharts;