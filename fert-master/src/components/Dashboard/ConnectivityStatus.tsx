import React from 'react';
import { Typography, Box, Paper } from '@mui/material';
import { Probe } from '../../types';
import { colors } from '../../utils/theme';

interface ConnectivityStatusProps {
  probes: Probe[];
}

const ConnectivityStatus: React.FC<ConnectivityStatusProps> = ({ probes }) => {
  const onlineCount = probes.filter((probe) => probe.status === 'online').length;
  const totalCount = probes.length;
  const offlineCount = probes.filter((probe) => probe.status === 'offline').length;
  const maintenanceCount = probes.filter((probe) => probe.status === 'maintenance').length;
  const issuesCount = probes.filter((probe) => probe.status !== 'online').length;

  const criticalDevices = probes.filter(
    (probe) => probe.status === 'offline' || probe.batteryLevel < 20 || probe.wifiStrength === 0
  );

  if (totalCount === 0) {
    return (
      <Box sx={{ width: '100%' }}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: colors.neutral[200], borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            No live probe data available.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: colors.neutral[200], borderRadius: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 200, mb: 0.5 }}>
              Live probe status
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {onlineCount} online, {offlineCount} offline, {maintenanceCount} maintenance
            </Typography>
          </Box>

          <Typography
            variant="h6"
            sx={{ fontWeight: 200, color: onlineCount === totalCount ? colors.neutral[900] : colors.neutral[500] }}
          >
            {issuesCount === 0 ? 'Connected' : 'Attention needed'}
          </Typography>
        </Box>
      </Paper>

      {criticalDevices.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            textAlign: 'center',
            border: '1px solid',
            borderColor: colors.neutral[200],
            borderRadius: 1,
            backgroundColor: colors.neutral[25],
          }}
        >
          <Typography variant="body2" color="text.secondary">
            All devices are operating normally.
          </Typography>
        </Paper>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            border: '1px solid',
            borderColor: colors.neutral[200],
            borderRadius: 1,
            backgroundColor: colors.neutral[25],
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {criticalDevices.length} device(s) need attention.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ConnectivityStatus;