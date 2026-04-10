import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  LinearProgress,
  Tooltip,
  Badge,
  useTheme,
} from '@mui/material';
import {
  Sensors as SensorIcon,
  SignalWifi4Bar as WifiStrongIcon,
  SignalWifi2Bar as WifiWeakIcon,
  SignalWifiOff as WifiOffIcon,
  Battery90 as BatteryHighIcon,
  Battery50 as BatteryMediumIcon,
  Battery20 as BatteryLowIcon,
  Refresh as RefreshIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  WaterDrop as WaterIcon,
  Bluetooth as BluetoothIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Probe, ProbeGroup } from '../../types';
import { colors, getStatusColor } from '../../utils/theme';

interface ProbeGridProps {
  probes: Probe[];
  groups: ProbeGroup[];
  onProbeClick: (probe: Probe) => void;
  onRefreshProbe: (probeId: string) => void;
}

const getWifiIcon = (strength: number) => {
  if (strength === 0) return WifiOffIcon;
  if (strength < 50) return WifiWeakIcon;
  return WifiStrongIcon;
};

const getBatteryIcon = (level: number) => {
  if (level < 25) return BatteryLowIcon;
  if (level < 75) return BatteryMediumIcon;
  return BatteryHighIcon;
};

const getBatteryColor = (level: number) => {
  if (level < 20) return colors.status.error;
  if (level < 40) return colors.status.warning;
  return colors.status.success;
};

const getWifiColor = (strength: number) => {
  if (strength === 0) return colors.neutral[400];
  if (strength < 50) return colors.status.warning;
  return colors.status.success;
};

const getLastActiveText = (lastActive: Date) => {
  const now = new Date();
  const diff = now.getTime() - lastActive.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return lastActive.toLocaleDateString();
};

const getGroupInfo = (probe: Probe, groups: ProbeGroup[]) => {
  if (!probe.groupId) return null;
  return groups.find(g => g.id === probe.groupId);
};

interface ProbeCardProps {
  probe: Probe;
  groups: ProbeGroup[];
  index: number;
  onProbeClick: (probe: Probe) => void;
  onRefreshProbe: (probeId: string) => void;
}

const ProbeCard: React.FC<ProbeCardProps> = ({ 
  probe, 
  groups, 
  index, 
  onProbeClick, 
  onRefreshProbe 
}) => {
  const theme = useTheme();
  const WifiIcon = getWifiIcon(probe.wifiStrength);
  const BatteryIcon = getBatteryIcon(probe.batteryLevel);
  const groupInfo = getGroupInfo(probe, groups);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      style={{ width: '100%' }}
    >
      <Card
        sx={{
          width: '100%',
          cursor: 'pointer',
          position: 'relative',
          border: '1px solid',
          borderColor: colors.neutral[200],
          borderRadius: 1,
          '&:hover': {
            borderColor: colors.neutral[300],
            backgroundColor: colors.neutral[25],
          },
        }}
        onClick={() => onProbeClick(probe)}
        elevation={0}
      >
        {/* Status indicator */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: getStatusColor(probe.status === 'maintenance' ? 'warning' : probe.status),
            borderTopLeftRadius: theme.shape.borderRadius,
            borderTopRightRadius: theme.shape.borderRadius,
          }}
        />

        <CardContent sx={{ p: 4, width: '100%' }}>
          {/* Horizontal Layout for Full Width */}
          <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start', width: '100%' }}>
            
            {/* Left Section: Basic Info */}
            <Box sx={{ minWidth: '200px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <SensorIcon sx={{ fontSize: 24, color: colors.neutral[600] }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 500, fontSize: '1.125rem', lineHeight: 1.5 }}>
                    {probe.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                    {probe.location.fieldName}
                  </Typography>
                </Box>
              </Box>
              
              {/* Status and Last Active */}
              <Box sx={{ mb: 2 }}>
                <Chip
                  label="OFFLINE"
                  sx={{
                    fontSize: '0.75rem',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    color: 'rgba(255, 152, 0, 0.9)',
                    borderRadius: 1,
                    mb: 1
                  }}
                  size="small"
                />
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                  Disconnected 2 days ago
                </Typography>
              </Box>
              
              <Tooltip title="Refresh Data">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRefreshProbe(probe.id);
                  }}
                  sx={{ 
                    borderColor: colors.neutral[300],
                    color: colors.neutral[700],
                    '&:hover': {
                      backgroundColor: colors.neutral[100]
                    }
                  }}
                >
                  <RefreshIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Middle Section: Sensor Readings */}
            <Box sx={{ flex: 1, minWidth: '300px' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2, fontSize: '1rem', lineHeight: 1.5 }}>
                Last Readings (2 days ago)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Card elevation={0} sx={{ p: 2, backgroundColor: colors.neutral[50], borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.5 }}>
                      Moisture
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1rem', lineHeight: 1.5, fontWeight: 500, color: colors.neutral[700] }}>
                      {probe.currentReading.soilMoisture}%
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card elevation={0} sx={{ p: 2, backgroundColor: colors.neutral[50], borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.5 }}>
                      Temperature
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1rem', lineHeight: 1.5, fontWeight: 500, color: colors.neutral[700] }}>
                      {probe.currentReading.temperature.toFixed(1)}°C
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card elevation={0} sx={{ p: 2, backgroundColor: colors.neutral[50], borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.5 }}>
                      pH Level
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1rem', lineHeight: 1.5, fontWeight: 500, color: colors.neutral[700] }}>
                      {probe.currentReading.pH}
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card elevation={0} sx={{ p: 2, backgroundColor: colors.neutral[50], borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.5 }}>
                      Nitrogen
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1rem', lineHeight: 1.5, fontWeight: 500, color: colors.neutral[700] }}>
                      {probe.currentReading.nitrogen}%
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </Box>

            {/* Right Section: System Status */}
            <Box sx={{ minWidth: '250px' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2, fontSize: '1rem', lineHeight: 1.5 }}>
                System Status
              </Typography>
              
              {/* Battery */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', lineHeight: 1.5 }}>Battery</Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', lineHeight: 1.5, fontWeight: 500 }}>
                    {probe.batteryLevel}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={probe.batteryLevel}
                  sx={{
                    height: 6,
                    borderRadius: 1,
                    backgroundColor: colors.neutral[200],
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: colors.neutral[600],
                    },
                  }}
                />
              </Box>

              {/* WiFi */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', lineHeight: 1.5 }}>WiFi Signal</Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', lineHeight: 1.5, fontWeight: 500 }}>
                    {probe.wifiStrength}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={probe.wifiStrength}
                  sx={{
                    height: 6,
                    borderRadius: 1,
                    backgroundColor: colors.neutral[200],
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: colors.neutral[600],
                    },
                  }}
                />
              </Box>

              {/* Water Tank */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', lineHeight: 1.5 }}>Water Tank</Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', lineHeight: 1.5, fontWeight: 500 }}>
                    {probe.waterTankLevel}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={probe.waterTankLevel}
                  sx={{
                    height: 6,
                    borderRadius: 1,
                    backgroundColor: colors.neutral[200],
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: colors.neutral[600],
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ProbeGrid: React.FC<ProbeGridProps> = ({ 
  probes, 
  groups, 
  onProbeClick, 
  onRefreshProbe 
}) => {
  // Use full width for single probe, normal grid for multiple probes
  const gridItemProps = probes.length === 1 ? { xs: 12 } : { xs: 12, sm: 6, lg: 4 };
  
  return (
    <Grid container spacing={3}>
      {probes.map((probe, index) => (
        <Grid item {...gridItemProps} key={probe.id}>
          <ProbeCard
            probe={probe}
            groups={groups}
            index={index}
            onProbeClick={onProbeClick}
            onRefreshProbe={onRefreshProbe}
          />
        </Grid>
      ))}
      
      {probes.length === 0 && (
        <Grid item xs={12}>
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              color: 'text.secondary',
            }}
          >
            <SensorIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No probes found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your filters or add a new probe
            </Typography>
          </Box>
        </Grid>
      )}
    </Grid>
  );
};

export default ProbeGrid;