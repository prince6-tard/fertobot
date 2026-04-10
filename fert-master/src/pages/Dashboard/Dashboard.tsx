import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Mic as MicIcon,
} from '@mui/icons-material';
import PWAInstallButton from '../../components/PWA/PWAInstallButton';
import SummaryCards from '../../components/Dashboard/SummaryCards';
import LiveCharts from '../../components/Dashboard/LiveCharts';
import RecommendationsPanel from '../../components/Dashboard/RecommendationsPanel';
import AlertsPanel from '../../components/Dashboard/AlertsPanel';
import WeatherWidget from '../../components/Dashboard/WeatherWidget';
import ConnectivityStatus from '../../components/Dashboard/ConnectivityStatus';
import { fetchDashboardOverview, DashboardOverview } from '../../services/dashboardService';
import { DashboardCard, Recommendation } from '../../types';
import { colors } from '../../utils/theme';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notificationDialog, setNotificationDialog] = useState(false);

  const loadOverview = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchDashboardOverview();
      setOverview(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load dashboard data');
      setOverview(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOverview();
  }, []);

  const handleNavigation = (path: string) => {
    try {
      navigate(path);
    } catch (navigationError) {
      console.error('Navigation error:', navigationError);
      window.location.href = path;
    }
  };

  const latestReading = overview?.recentReadings[0] ?? null;

  const summaryCards: DashboardCard[] = useMemo(() => {
    if (!overview) {
      return [];
    }

    const latest = latestReading;

    return [
      { id: 'moisture', title: 'Soil Moisture', value: latest ? Number(latest.soilMoisture.toFixed(1)) : overview.summary.averageMoisture, unit: '%', status: 'normal', icon: 'moisture', color: colors.sensor.moisture },
      { id: 'temperature', title: 'Temperature', value: latest ? Number(latest.temperature.toFixed(1)) : overview.summary.averageTemperature, unit: '°C', status: 'normal', icon: 'temperature', color: colors.sensor.temperature },
      { id: 'humidity', title: 'Humidity', value: latest ? Number(latest.humidity.toFixed(0)) : overview.summary.averageHumidity, unit: '%', status: 'normal', icon: 'humidity', color: colors.sensor.humidity },
      { id: 'npk', title: 'N-P-K Levels', value: latest ? `${latest.nitrogen.toFixed(0)}-${latest.phosphorus.toFixed(0)}-${latest.potassium.toFixed(0)}` : '-', unit: 'ppm', status: 'normal', icon: 'npk', color: colors.sensor.nitrogen },
      { id: 'ph', title: 'pH Level', value: latest ? Number(latest.pH.toFixed(2)) : 0, status: 'normal', icon: 'ph', color: colors.sensor.pH },
      { id: 'water_tank', title: 'Water Tank', value: latest ? Number(latest.waterTankLevel.toFixed(0)) : 0, unit: '%', status: 'normal', icon: 'water_tank', color: colors.primary[500] },
    ];
  }, [overview, latestReading]);

  const recommendations: Recommendation[] = useMemo(() => {
    if (!overview || !latestReading) {
      return [];
    }

    const generated: Recommendation[] = [];

    if (latestReading.soilMoisture < 35) {
      generated.push({
        id: 'moisture-irrigation',
        type: 'irrigation',
        priority: 'high',
        title: 'Irrigation suggested',
        description: `Soil moisture is ${latestReading.soilMoisture.toFixed(1)}%, which is below the live threshold.`,
        actionRequired: true,
        timestamp: latestReading.timestamp,
        estimatedImpact: 'Restore moisture before crop stress increases',
        icon: 'irrigation',
        color: colors.neutral[600],
      });
    }

    if (latestReading.pH < 6 || latestReading.pH > 7.5) {
      generated.push({
        id: 'ph-warning',
        type: 'warning',
        priority: 'medium',
        title: 'pH out of range',
        description: `Latest pH reading is ${latestReading.pH.toFixed(2)}. Review soil balance if this persists.`,
        actionRequired: true,
        timestamp: latestReading.timestamp,
        estimatedImpact: 'Avoid nutrient lockout and stress',
        icon: 'warning',
        color: colors.neutral[600],
      });
    }

    if (latestReading.batteryLevel < 25) {
      generated.push({
        id: 'battery-warning',
        type: 'warning',
        priority: 'high',
        title: 'Probe battery low',
        description: `Battery is at ${latestReading.batteryLevel.toFixed(0)}%. Plan maintenance soon.`,
        actionRequired: true,
        timestamp: latestReading.timestamp,
        estimatedImpact: 'Prevent data interruption',
        icon: 'warning',
        color: colors.neutral[600],
      });
    }

    if (overview.summary.offlineProbes > 0) {
      generated.push({
        id: 'offline-probes',
        type: 'warning',
        priority: 'critical',
        title: 'Probe connectivity issue',
        description: `${overview.summary.offlineProbes} live probe(s) are offline. Check power, network, and device placement.`,
        actionRequired: true,
        timestamp: new Date(),
        estimatedImpact: 'Restore monitoring continuity',
        icon: 'warning',
        color: colors.neutral[600],
      });
    }

    return generated;
  }, [overview, latestReading]);

  const recentNotifications = useMemo(() => {
    if (!overview) {
      return [];
    }

    return overview.alerts.slice(0, 5).map((alert) => ({
      id: alert.id,
      title: alert.title,
      message: alert.message,
      time: alert.timestamp.toLocaleString(),
      severity: alert.severity === 'critical' || alert.severity === 'error' ? 'warning' : 'info',
    }));
  }, [overview]);

  return (
    <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      <Box sx={{ mb: 0.5, width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 500, mb: 0.125 }}>Farm Overview</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.5 }}>powered by live probe data</Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Badge badgeContent={overview?.alerts.length ?? 0} color="error" sx={{ '& .MuiBadge-badge': { top: 9, right: 10, width: 17, height: 17, fontSize: '0.75rem', lineHeight: 1.5 } }}>
              <IconButton onClick={() => setNotificationDialog(true)}><NotificationsIcon /></IconButton>
            </Badge>
            <IconButton onClick={() => handleNavigation('/voice-chatbot')} aria-label="Voice Chatbot"><MicIcon /></IconButton>
            <IconButton onClick={loadOverview}><RefreshIcon /></IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, backgroundColor: 'rgba(255, 152, 0, 0.05)', px: 1.5, py: 0.75, borderRadius: 1, border: '1px solid rgba(255, 152, 0, 0.15)' }}>
              <WarningIcon sx={{ fontSize: 16, color: 'rgba(255, 152, 0, 0.8)' }} />
              <Box>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255, 152, 0, 0.9)', lineHeight: 1.5, mb: 0.25 }}>
                  {overview?.summary.offlineProbes ? `${overview.summary.offlineProbes} probe(s) offline` : 'All probes live'}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.secondary', display: 'block', lineHeight: 1.5 }}>
                  {overview?.generatedAt ? overview.generatedAt.toLocaleString() : 'Waiting for live data'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading && !overview && (
        <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: colors.neutral[200], borderRadius: 1, textAlign: 'center', mb: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Loading live dashboard data...</Typography>
        </Paper>
      )}

      <div style={{ marginBottom: '16px' }}><WeatherWidget latestReading={latestReading} /></div>
      <div style={{ marginBottom: '16px' }}><ConnectivityStatus probes={overview?.probes ?? []} /></div>
      <div style={{ marginBottom: '24px' }}><SummaryCards cards={summaryCards} /></div>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2, width: '100%', maxWidth: '100%', boxSizing: 'border-box', '& > *': { width: '100%', maxWidth: '100%', boxSizing: 'border-box' } }}>
        <div><AlertsPanel alerts={overview?.alerts ?? []} /></div>
        <div><RecommendationsPanel recommendations={recommendations} /></div>
        <div><LiveCharts readings={overview?.recentReadings ?? []} /></div>
      </Box>

      <Dialog open={notificationDialog} onClose={() => setNotificationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><NotificationsIcon />Recent Notifications</Box></DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <List>
            {recentNotifications.length > 0 ? recentNotifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: notification.severity === 'warning' ? 'warning.main' : 'info.main' }}>
                      {notification.severity === 'warning' ? <WarningIcon /> : <CheckCircleIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={notification.title}
                    secondary={(
                      <>
                        <Typography variant="body2" color="text.secondary">{notification.message}</Typography>
                        <Typography variant="caption" color="text.secondary">{notification.time}</Typography>
                      </>
                    )}
                  />
                </ListItem>
                {index < recentNotifications.length - 1 && <Divider />}
              </React.Fragment>
            )) : (
              <Box sx={{ p: 3, textAlign: 'center' }}><Typography variant="body2" color="text.secondary">No live notifications yet.</Typography></Box>
            )}
          </List>
        </DialogContent>
        <DialogActions><Button onClick={() => setNotificationDialog(false)}>Close</Button></DialogActions>
      </Dialog>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}><PWAInstallButton /></Box>
    </div>
  );
};

export default Dashboard;