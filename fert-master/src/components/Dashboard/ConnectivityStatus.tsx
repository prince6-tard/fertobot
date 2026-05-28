import React from 'react';
import { Typography, Box, alpha } from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  SignalWifi4Bar as WifiIcon,
  SignalWifiOff as WifiOffIcon,
} from '@mui/icons-material';
import { Probe } from '../../types';

interface ConnectivityStatusProps {
  probes: Probe[];
}

const ConnectivityStatus: React.FC<ConnectivityStatusProps> = ({ probes }) => {
  const onlineCount = probes.filter((p) => p.status === 'online').length;
  const totalCount = probes.length;
  const offlineCount = probes.filter((p) => p.status === 'offline').length;
  const maintenanceCount = probes.filter((p) => p.status === 'maintenance').length;
  const issuesCount = probes.filter((p) => p.status !== 'online').length;
  const criticalDevices = probes.filter(
    (p) => p.status === 'offline' || p.batteryLevel < 20 || p.wifiStrength === 0
  );

  if (totalCount === 0) return null;

  const allGood = issuesCount === 0;
  const statusColor = allGood ? '#52D080' : '#FFB74D';
  const StatusIcon = allGood ? CheckIcon : WarningIcon;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1.25,
        borderRadius: '12px',
        border: `1px solid ${alpha(statusColor, 0.2)}`,
        backgroundColor: alpha(statusColor, 0.06),
      }}
    >
      <StatusIcon sx={{ fontSize: 16, color: statusColor, flexShrink: 0 }} />

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: statusColor, fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
          {allGood ? 'All probes connected' : `${issuesCount} probe${issuesCount > 1 ? 's' : ''} need attention`}
        </Typography>
        <Typography sx={{ fontSize: '0.65rem', color: '#8FA89C', fontFamily: '"DM Mono", monospace' }}>
          {onlineCount}/{totalCount} online
          {offlineCount > 0 && ` · ${offlineCount} offline`}
          {maintenanceCount > 0 && ` · ${maintenanceCount} maintenance`}
        </Typography>
      </Box>

      {/* Probe dots */}
      <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
        {probes.slice(0, 6).map((probe) => {
          const dotColor = probe.status === 'online' ? '#52D080' : probe.status === 'offline' ? '#EF5350' : '#FFB74D';
          return (
            <Box
              key={probe.id}
              title={`${probe.name}: ${probe.status}`}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: dotColor,
                boxShadow: `0 0 6px ${alpha(dotColor, 0.6)}`,
              }}
            />
          );
        })}
        {probes.length > 6 && (
          <Typography sx={{ fontSize: '0.6rem', color: '#8FA89C', fontFamily: '"DM Mono", monospace', alignSelf: 'center' }}>
            +{probes.length - 6}
          </Typography>
        )}
      </Box>

      {criticalDevices.length > 0 ? (
        <WifiOffIcon sx={{ fontSize: 14, color: '#EF5350', flexShrink: 0 }} />
      ) : (
        <WifiIcon sx={{ fontSize: 14, color: alpha('#52D080', 0.6), flexShrink: 0 }} />
      )}
    </Box>
  );
};

export default ConnectivityStatus;
