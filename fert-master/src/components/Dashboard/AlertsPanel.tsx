import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Chip,
  Button,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { Alert } from '../../types';

// Extend Alert interface for component-specific properties
interface ExtendedAlert extends Alert {
  cameraId?: string;
}
import { colors } from '../../utils/theme';

const getSeverityIcon = (severity: string, type?: string) => {
  if (type === 'security') {
    return <SecurityIcon sx={{ fontSize: 16, color: 'rgba(255, 152, 0, 0.8)' }} />;
  }
  switch (severity) {
    case 'error': return <ErrorIcon sx={{ fontSize: 16, color: 'rgba(244, 67, 54, 0.8)' }} />;
    case 'warning': return <WarningIcon sx={{ fontSize: 16, color: 'rgba(255, 152, 0, 0.8)' }} />;
    case 'info': return <InfoIcon sx={{ fontSize: 16, color: colors.neutral[600] }} />;
    default: return <InfoIcon sx={{ fontSize: 16, color: colors.neutral[600] }} />;
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
  
  // Poll for motion events from external API
  useEffect(() => {
    let isActive = true;
    let lastPollTime = 0;
    
    const pollMotionEvents = async () => {
      try {
        // Poll the motion API for new events since last check
        const response = await fetch(`https://fertobot.vercel.app/api/motion?since=${lastPollTime}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok && isActive) {
          const result = await response.json();
          
          // Check if there's new motion detected
          if (result.ok && result.hasNewMotion && result.motion) {
            const motion = result.motion;
            
            // Create new alert for detected motion
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
              // Avoid duplicate alerts by checking if this exact motion event already exists
              const existingAlert = prevAlerts.find(alert => 
                alert.id === newAlert.id || (
                  alert.type === 'security' && 
                  alert.title === 'Motion Detected' &&
                  alert.cameraId === motion.device &&
                  Math.abs(alert.timestamp.getTime() - motion.timestamp) < 2000
                )
              );
              
              if (!existingAlert) {
                console.log('New motion alert added via polling:', newAlert);
                return [newAlert, ...prevAlerts];
              }
              console.log('Duplicate motion alert prevented via polling');
              return prevAlerts;
            });
            
            // Update last poll time
            lastPollTime = motion.timestamp;
          }
        }
      } catch (error) {
        console.log('Motion polling error:', error);
      }
    };
    
    // Poll every 10 seconds for motion events (more responsive)
    const pollInterval = setInterval(pollMotionEvents, 10000);
    
    // Initial poll
    pollMotionEvents();
    
    return () => {
      isActive = false;
      clearInterval(pollInterval);
    };
  }, []);
  
  // Listen for direct motion notifications (when external API calls our service)
  useEffect(() => {
    const handleMotionDetection = (event: CustomEvent) => {
      const { deviceId, location, timestamp } = event.detail;
      
      const eventTimestamp = timestamp ? new Date(timestamp) : new Date();
      const newAlert: ExtendedAlert = {
        id: `motion-${eventTimestamp.getTime()}-${deviceId}`,
        type: 'security',
        severity: 'warning',
        title: 'Motion Detected',
        message: `Motion detected at ${location || 'newgen iedc field area'}`,
        timestamp: eventTimestamp,
        acknowledged: false,
        cameraId: deviceId || 'cam-001',
      };
      
      setAlerts(prevAlerts => {
        // Avoid duplicate alerts by checking if this exact motion event already exists
        const existingAlert = prevAlerts.find(alert => 
          alert.id === newAlert.id || (
            alert.type === 'security' && 
            alert.title === 'Motion Detected' &&
            alert.cameraId === deviceId &&
            Math.abs(alert.timestamp.getTime() - eventTimestamp.getTime()) < 2000
          )
        );
        
        if (!existingAlert) {
          console.log('New motion alert added via event:', newAlert);
          return [newAlert, ...prevAlerts];
        }
        console.log('Duplicate motion alert prevented via event');
        return prevAlerts;
      });
    };
    
    // Listen for custom motion events
    window.addEventListener('motionDetected', handleMotionDetection as EventListener);
    
    return () => {
      window.removeEventListener('motionDetected', handleMotionDetection as EventListener);
    };
  }, []);
  
  const handleAcknowledge = (alertId: string) => {
    setAlerts(prevAlerts =>
      prevAlerts.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Compact Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2,
        pb: 1,
        borderBottom: '1px solid',
        borderColor: colors.neutral[200],
      }}>
        <Typography variant="h6" sx={{ fontWeight: 200 }}>
          Alerts ({unacknowledgedAlerts.length})
        </Typography>
        
        {unacknowledgedAlerts.length > 0 && (
          <Button 
            size="small" 
            variant="outlined"
            onClick={() => setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })))}
            sx={{ fontSize: '0.875rem', lineHeight: 1.5, borderRadius: 2 }}
          >
            Clear All
          </Button>
        )}
      </Box>

      {/* Active Alerts */}
      {unacknowledgedAlerts.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {unacknowledgedAlerts.map((alert) => (
            <Paper 
              key={alert.id}
              elevation={0} 
              sx={{ 
                p: 2, 
                border: '1px solid', 
                borderColor: colors.neutral[200], 
                borderRadius: 1,
                backgroundColor: colors.neutral[25],
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getSeverityIcon(alert.severity, alert.type)}
                  <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                    {alert.title}
                  </Typography>
                  <Chip 
                    label={alert.type} 
                    size="small" 
                    sx={{ 
                      height: 20, 
                      fontSize: '0.75rem',
                      lineHeight: 1.5,
                      backgroundColor: alert.type === 'security' ? 'rgba(255, 152, 0, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                      color: alert.type === 'security' ? 'rgba(255, 152, 0, 0.9)' : 'rgba(244, 67, 54, 0.9)',
                      border: `1px solid ${alert.type === 'security' ? 'rgba(255, 152, 0, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`,
                    }} 
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {getTimeAgo(alert.timestamp)}
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.875rem', lineHeight: 1.5 }}>
                {alert.message}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    size="small" 
                    variant="contained"
                    onClick={() => handleAcknowledge(alert.id)}
                    sx={{ 
                      fontSize: '0.875rem', 
                      lineHeight: 1.5, 
                      borderRadius: 1,
                      backgroundColor: colors.neutral[600],
                      '&:hover': { backgroundColor: colors.neutral[700] }
                    }}
                  >
                    acknowledge
                  </Button>
                  {alert.type === 'security' && (
                    <Button 
                      size="small" 
                      variant="outlined"
                      sx={{ 
                        fontSize: '0.875rem', 
                        lineHeight: 1.5, 
                        borderRadius: 1,
                        borderColor: colors.neutral[300],
                        color: colors.neutral[700],
                        '&:hover': { borderColor: colors.neutral[400] }
                      }}
                    >
                      view camera
                    </Button>
                  )}
                </Box>
                
                {alert.probeId && (
                  <Typography variant="caption" sx={{ color: colors.neutral[600], fontWeight: 500 }}>
                    {alert.probeId}
                  </Typography>
                )}
                {alert.cameraId && (
                  <Typography variant="caption" sx={{ color: colors.neutral[600], fontWeight: 500 }}>
                    {alert.cameraId}
                  </Typography>
                )}
              </Box>
            </Paper>
          ))}
        </Box>
      ) : (
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
          <CheckIcon sx={{ fontSize: 32, color: colors.neutral[500], mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            No active alerts - all systems normal
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default AlertsPanel;