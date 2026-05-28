import React, { useState, useEffect } from 'react';
import { Typography, Box, Chip, Button, alpha } from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { Alert } from '../../types';

interface ExtendedAlert extends Alert {
  cameraId?: string;
}

const getSeverityConfig = (severity: string, type?: string) => {
  if (type === 'security') return { color: '#FFB74D', Icon: SecurityIcon, bg: 'rgba(255,183,77,0.07)' };
  switch (severity) {
    case 'error': return { color: '#EF5350', Icon: ErrorIcon, bg: 'rgba(239,83,80,0.07)' };
    case 'warning': return { color: '#FFB74D', Icon: WarningIcon, bg: 'rgba(255,183,77,0.07)' };
    default: return { color: '#4FC3F7', Icon: InfoIcon, bg: 'rgba(79,195,247,0.07)' };
  }
};

const getTimeAgo = (timestamp: Date) => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return 'Just now';
};

interface AlertsPanelProps {
  alerts: Alert[];
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts: liveAlerts }) => {
  const [alerts, setAlerts] = useState<ExtendedAlert[]>(liveAlerts);
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);

  useEffect(() => {
    setAlerts(liveAlerts.map((alert) => ({ ...alert, acknowledged: Boolean(alert.acknowledged) })));
  }, [liveAlerts]);

  useEffect(() => {
    let isActive = true;
    let lastPollTime = 0;

    const pollMotionEvents = async () => {
      try {
        const response = await fetch(`/api/device/motion?since=${lastPollTime}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok && isActive) {
          const result = await response.json();
          if (result.ok && result.hasNewMotion && result.motion) {
            const motion = result.motion;
            const newAlert: ExtendedAlert = {
              id: `motion-${motion.timestamp}-${motion.device}`,
              type: 'security',
              severity: 'warning',
              title: 'Motion Detected',
              message: motion.message || `Motion detected at ${motion.location}`,
              timestamp: new Date(motion.timestamp),
              acknowledged: false,
              cameraId: motion.device || 'cam-001',
            };
            setAlerts(prevAlerts => {
              const existingAlert = prevAlerts.find(a =>
                a.id === newAlert.id || (a.type === 'security' && a.title === 'Motion Detected' && a.cameraId === motion.device && Math.abs(a.timestamp.getTime() - motion.timestamp) < 2000)
              );
              return existingAlert ? prevAlerts : [newAlert, ...prevAlerts];
            });
            lastPollTime = motion.timestamp;
          }
        }
      } catch { /* silent */ }
    };

    const pollInterval = setInterval(pollMotionEvents, 10000);
    pollMotionEvents();
    return () => { isActive = false; clearInterval(pollInterval); };
  }, []);

  useEffect(() => {
    const handleMotionDetection = (event: CustomEvent) => {
      const { deviceId, location, timestamp } = event.detail;
      const eventTimestamp = timestamp ? new Date(timestamp) : new Date();
      const newAlert: ExtendedAlert = {
        id: `motion-${eventTimestamp.getTime()}-${deviceId}`,
        type: 'security', severity: 'warning', title: 'Motion Detected',
        message: `Motion detected at ${location || 'newgen iedc field area'}`,
        timestamp: eventTimestamp, acknowledged: false, cameraId: deviceId || 'cam-001',
      };
      setAlerts(prevAlerts => {
        const existingAlert = prevAlerts.find(a =>
          a.id === newAlert.id || (a.type === 'security' && a.title === 'Motion Detected' && a.cameraId === deviceId && Math.abs(a.timestamp.getTime() - eventTimestamp.getTime()) < 2000)
        );
        return existingAlert ? prevAlerts : [newAlert, ...prevAlerts];
      });
    };
    window.addEventListener('motionDetected', handleMotionDetection as EventListener);
    return () => window.removeEventListener('motionDetected', handleMotionDetection as EventListener);
  }, []);

  const handleAcknowledge = (alertId: string) => {
    setAlerts(prevAlerts => prevAlerts.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, pb: 1, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <Typography
          sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#F0EDE6', fontFamily: '"Plus Jakarta Sans", sans-serif' }}
        >
          Alerts
          <Box component="span" sx={{ ml: 1, px: 0.9, py: 0.2, borderRadius: '6px', fontSize: '0.7rem', backgroundColor: unacknowledgedAlerts.length > 0 ? 'rgba(239,83,80,0.15)' : 'rgba(82,208,128,0.12)', color: unacknowledgedAlerts.length > 0 ? '#EF5350' : '#52D080', border: `1px solid ${unacknowledgedAlerts.length > 0 ? 'rgba(239,83,80,0.3)' : 'rgba(82,208,128,0.2)'}`, fontFamily: '"DM Mono", monospace' }}>
            {unacknowledgedAlerts.length}
          </Box>
        </Typography>
        {unacknowledgedAlerts.length > 0 && (
          <Button
            size="small"
            onClick={() => setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })))}
            sx={{ fontSize: '0.7rem', color: '#8FA89C', '&:hover': { color: '#F4A261' }, minHeight: 'unset', p: '4px 8px' }}
          >
            Clear all
          </Button>
        )}
      </Box>

      {/* Alert list */}
      {unacknowledgedAlerts.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {unacknowledgedAlerts.map((alert) => {
            const { color, Icon, bg } = getSeverityConfig(alert.severity, alert.type);
            return (
              <Box
                key={alert.id}
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  border: `1px solid ${alpha(color, 0.25)}`,
                  borderLeft: `3px solid ${color}`,
                  backgroundColor: bg,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    right: -15, top: -15,
                    width: 80, height: 80,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(color, 0.1)} 0%, transparent 70%)`,
                    pointerEvents: 'none',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.75 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Icon sx={{ fontSize: 15, color }} />
                    <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#F0EDE6', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                      {alert.title}
                    </Typography>
                    <Chip
                      label={alert.type}
                      size="small"
                      sx={{ height: 18, fontSize: '0.6rem', backgroundColor: alpha(color, 0.15), color, border: `1px solid ${alpha(color, 0.3)}`, '& .MuiChip-label': { px: 0.75 } }}
                    />
                  </Box>
                  <Typography sx={{ fontSize: '0.6rem', color: '#8FA89C', fontFamily: '"DM Mono", monospace', flexShrink: 0, ml: 1 }}>
                    {getTimeAgo(alert.timestamp)}
                  </Typography>
                </Box>

                <Typography sx={{ fontSize: '0.75rem', color: '#8FA89C', mb: 1, lineHeight: 1.5 }}>
                  {alert.message}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Button
                    size="small"
                    onClick={() => handleAcknowledge(alert.id)}
                    sx={{
                      fontSize: '0.68rem', minHeight: 'unset', px: 1.25, py: 0.4,
                      backgroundColor: alpha(color, 0.15),
                      color,
                      border: `1px solid ${alpha(color, 0.3)}`,
                      borderRadius: '8px',
                      '&:hover': { backgroundColor: alpha(color, 0.25) },
                    }}
                  >
                    Acknowledge
                  </Button>
                  {alert.type === 'security' && (
                    <Button
                      size="small"
                      sx={{ fontSize: '0.68rem', minHeight: 'unset', px: 1.25, py: 0.4, color: '#8FA89C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', '&:hover': { color: '#F0EDE6' } }}
                    >
                      View camera
                    </Button>
                  )}
                  {(alert.probeId || alert.cameraId) && (
                    <Typography sx={{ fontSize: '0.6rem', color: alpha(color, 0.7), fontFamily: '"DM Mono", monospace', ml: 'auto' }}>
                      {alert.probeId ?? alert.cameraId}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      ) : (
        <Box
          sx={{
            p: 2.5,
            textAlign: 'center',
            borderRadius: '12px',
            border: '1px solid rgba(82,208,128,0.18)',
            background: 'linear-gradient(135deg, #132B1A 0%, rgba(82,208,128,0.05) 100%)',
          }}
        >
          <CheckIcon sx={{ fontSize: 28, color: '#52D080', mb: 0.75, opacity: 0.85 }} />
          <Typography sx={{ fontSize: '0.78rem', color: '#8FA89C' }}>
            No active alerts — all systems normal
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AlertsPanel;
