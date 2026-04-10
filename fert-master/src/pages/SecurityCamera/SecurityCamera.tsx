import React, { useState } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
  Badge,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Switch,
  Alert,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  LinearProgress,
  Snackbar,
} from '@mui/material';
import {
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  NotificationsActive as AlertIcon,
  Fullscreen as FullscreenIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  MoreVert as MoreVertIcon,
  RecordVoiceOver as RecordIcon,
  WifiOff as OfflineIcon,
  CheckCircle as OnlineIcon,
  Schedule as ScheduleIcon,
  FiberManualRecord as RecordingIcon,
} from '@mui/icons-material';
import { colors } from '../../utils/theme';
import { MotionNotificationService } from '../../services/motionNotificationService';

interface Camera {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'recording';
  lastMotion?: string;
  recording: boolean;
  nightVision: boolean;
  resolution: string;
  battery?: number;
}

interface SecurityAlert {
  id: string;
  type: 'motion' | 'offline' | 'low_battery' | 'tampering';
  camera: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  acknowledged: boolean;
}



const SecurityCamera: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [fullscreenCamera, setFullscreenCamera] = useState<Camera | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [motionAlert, setMotionAlert] = useState<{
    open: boolean;
    message: string;
    camera: string;
  }>({
    open: false,
    message: '',
    camera: '',
  });

  // Initialize motion service
  const motionService = new MotionNotificationService();
  
  // Test function to simulate motion detection
  const testMotionAlert = async () => {
    try {
      console.log('Testing motion detection...');
      await motionService.sendMotionAlert('cam-001', 'newgen iedc field area');
      setMotionAlert({
        open: true,
        message: 'Test motion alert sent! Check the Alerts Panel in the Dashboard.',
        camera: 'cam-001'
      });
    } catch (error) {
      console.error('Failed to send test motion alert:', error);
    }
  };
  
  const [cameras] = useState<Camera[]>([
    {
      id: 'cam-001',
      name: 'newgen iedc camera',
      location: 'field monitoring',
      status: 'offline',
      lastMotion: '2025-12-03T14:37:00',
      recording: false,
      nightVision: true,
      resolution: '1080p',
      battery: 15,
    },
  ]);

  const [alerts] = useState<SecurityAlert[]>([
    {
      id: 'alert-001',
      type: 'offline',
      camera: 'newgen iedc camera',
      timestamp: '2025-12-03T14:37:00',
      severity: 'high',
      acknowledged: false,
    },
    {
      id: 'alert-002',
      type: 'low_battery',
      camera: 'newgen iedc camera',
      timestamp: '2025-12-03T14:35:00',
      severity: 'high',
      acknowledged: false,
    },
  ]);

  const getStatusIcon = (status: Camera['status']) => {
    switch (status) {
      case 'online': return <OnlineIcon sx={{ color: 'success.main' }} />;
      case 'offline': return <OfflineIcon sx={{ color: 'error.main' }} />;
      case 'recording': return <RecordingIcon sx={{ color: 'error.main' }} />;
    }
  };

  const getStatusColor = (status: Camera['status']) => {
    switch (status) {
      case 'online': return 'success';
      case 'offline': return 'error';
      case 'recording': return 'warning';
    }
  };

  const getSeverityColor = (severity: SecurityAlert['severity']) => {
    switch (severity) {
      case 'low': return 'info';
      case 'medium': return 'warning';
      case 'high': return 'error';
    }
  };

  const getAlertIcon = (type: SecurityAlert['type']) => {
    switch (type) {
      case 'motion': return <AlertIcon />;
      case 'offline': return <OfflineIcon />;
      case 'low_battery': return <WarningIcon />;
      case 'tampering': return <SecurityIcon />;
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, camera: Camera) => {
    setAnchorEl(event.currentTarget);
    setSelectedCamera(camera);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCamera(null);
  };

  const simulateMotionDetection = async (camera: Camera) => {
    try {
      const success = await motionService.sendMotionAlert(camera.id, camera.location);
      if (success) {
        setMotionAlert({
          open: true,
          message: `Motion detected`,
          camera: camera.name,
        });
        console.log('🚨 MOTION DETECTED:', {
          cameraId: camera.id,
          cameraName: camera.name,
          location: camera.location,
          timestamp: new Date().toISOString(),
          message: `Motion detected by ${camera.name} at ${camera.location}`
        });
      }
    } catch (error) {
      console.error('Motion detection failed:', error);
    }
  };

  const handleCloseMotionAlert = () => {
    setMotionAlert({ open: false, message: '', camera: '' });
  };

  const CameraCard = ({ camera }: { camera: Camera }) => (
    <Card 
      elevation={0}
      sx={{ 
        borderRadius: 1,
        border: '1px solid',
        borderColor: colors.neutral[200],
        height: '100%',
        position: 'relative'
      }}
    >
      {/* Video Feed Area */}
      <Box 
        sx={{ 
          height: 200, 
          bgcolor: colors.neutral[900], 
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'linear-gradient(45deg, #424242 25%, transparent 25%), linear-gradient(-45deg, #424242 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #424242 75%), linear-gradient(-45deg, transparent 75%, #424242 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <VideocamOffIcon sx={{ fontSize: 48, color: 'rgba(255, 152, 0, 0.8)', mb: 1 }} />
          <Typography variant="body2" sx={{ color: 'white', fontSize: '0.875rem' }}>
            camera offline
          </Typography>
        </Box>
        
        {/* Status Badge */}
        <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
          <Chip 
            icon={<WarningIcon sx={{ fontSize: 14, color: 'rgba(255, 152, 0, 0.8)' }} />}
            label="OFFLINE"
            sx={{ 
              fontSize: '0.75rem', 
              backgroundColor: 'rgba(255, 152, 0, 0.1)',
              color: 'rgba(255, 152, 0, 0.9)',
              border: '1px solid rgba(255, 152, 0, 0.3)'
            }}
            size="small"
          />
        </Box>

        {/* Battery Level */}
        <Box sx={{ position: 'absolute', bottom: 8, left: 8 }}>
          <Chip 
            label="15%"
            size="small"
            sx={{ 
              fontSize: '0.75rem',
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              color: 'rgba(244, 67, 54, 0.9)',
              border: '1px solid rgba(244, 67, 54, 0.3)'
            }}
          />
        </Box>
      </Box>

      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 500, mb: 0.5, fontSize: '1rem', lineHeight: 1.5 }}>
              {camera.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', lineHeight: 1.5, mb: 1 }}>
              {camera.location}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.5 }}>
              {camera.resolution} • {camera.nightVision ? 'night vision' : 'day only'}
            </Typography>
          </Box>
          <IconButton size="small" onClick={(e) => handleMenuClick(e, camera)}>
            <MoreVertIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Metrics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center', p: 2, backgroundColor: colors.neutral[50], borderRadius: 1 }}>
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 500, color: colors.neutral[700] }}>
                15%
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>battery</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center', p: 2, backgroundColor: colors.neutral[50], borderRadius: 1 }}>
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 500, color: colors.neutral[700] }}>
                0
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>events</Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Action Button */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<WarningIcon sx={{ fontSize: 16 }} />}
            disabled
            fullWidth
            sx={{ 
              py: 1.5,
              fontSize: '0.875rem',
              textTransform: 'none',
              borderRadius: 1,
              borderColor: colors.neutral[300],
              color: colors.neutral[500],
            }}
          >
            probe disconnected - no feed
          </Button>
        </Box>

        {/* Status Info */}
        <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${colors.neutral[200]}` }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            last motion: 3.12.2025 14:37 • camera offline 2 days ago
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  const TabPanel = ({ children, value, index }: any) => (
    <Box hidden={value !== index} sx={{ pt: 2 }}>
      {value === index && children}
    </Box>
  );

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);

  return (
    <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden', padding: '16px' }}>
      {/* Compact Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 500, fontSize: '1.25rem', lineHeight: 1.4 }}>
              newgen iedc security • 1 camera
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
              offline • probe disconnected • no recording
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              size="small"
              variant="outlined"
              onClick={testMotionAlert}
              startIcon={<SecurityIcon sx={{ fontSize: 16 }} />}
              sx={{
                fontSize: '0.875rem',
                textTransform: 'none',
                borderRadius: 1,
                borderColor: colors.neutral[300],
                color: colors.neutral[700]
              }}
            >
              test motion
            </Button>
            <Badge badgeContent={unacknowledgedAlerts.length} color="error">
              <Button 
                size="small"
                variant="outlined"
                startIcon={<AlertIcon sx={{ fontSize: 16 }} />}
                sx={{
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  borderRadius: 1,
                  borderColor: colors.neutral[300],
                  color: colors.neutral[700]
                }}
              >
                alerts
              </Button>
            </Badge>
          </Box>
        </Box>

        {/* Compact Security Metrics */}
        <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: colors.neutral[200], p: 2 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon sx={{ fontSize: 18, color: 'rgba(255, 152, 0, 0.8)' }} />
                <Box>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255, 152, 0, 0.9)' }}>offline</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>status</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VideocamOffIcon sx={{ fontSize: 18, color: colors.neutral[600] }} />
                <Box>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>no feed</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>video</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RecordIcon sx={{ fontSize: 18, color: colors.neutral[600] }} />
                <Box>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>0 events</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>today</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon sx={{ fontSize: 18, color: colors.neutral[600] }} />
                <Box>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>15%</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>battery</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Card>
      </Box>



      {/* Navigation Tabs */}
      <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: colors.neutral[200], mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ 
            '& .MuiTab-root': { 
              textTransform: 'none', 
              fontSize: '0.875rem',
              color: colors.neutral[600],
              '&.Mui-selected': { color: colors.neutral[800] }
            }
          }}
        >
          <Tab label="camera" />
          <Tab 
            label={(
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                alerts
                {unacknowledgedAlerts.length > 0 && (
                  <Badge 
                    badgeContent={unacknowledgedAlerts.length} 
                    color="error" 
                    sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', minWidth: 12, height: 12 } }}
                  />
                )}
              </Box>
            )}
          />
          <Tab label="recordings" />
        </Tabs>
      </Card>

      {/* Camera Feeds Tab */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          {cameras.map((camera) => (
            <Grid item xs={12} key={camera.id}>
              <CameraCard camera={camera} />
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Alerts Tab */}
      <TabPanel value={activeTab} index={1}>
        <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: colors.neutral[200] }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, borderBottom: `1px solid ${colors.neutral[200]}` }}>
              <Typography variant="h6" sx={{ fontWeight: 500, fontSize: '1rem' }}>
                security alerts
              </Typography>
            </Box>
            <List sx={{ py: 0 }}>
              {alerts.map((alert, index) => (
                <React.Fragment key={alert.id}>
                  <ListItem sx={{ py: 3, opacity: alert.acknowledged ? 0.6 : 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                      <Chip
                        icon={getAlertIcon(alert.type)}
                        label={alert.type.replace('_', ' ')}
                        sx={{
                          fontSize: '0.75rem',
                          backgroundColor: alert.severity === 'high' ? 'rgba(244, 67, 54, 0.1)' : colors.neutral[100],
                          color: alert.severity === 'high' ? 'rgba(244, 67, 54, 0.9)' : colors.neutral[700],
                          border: `1px solid ${alert.severity === 'high' ? 'rgba(244, 67, 54, 0.3)' : colors.neutral[300]}`
                        }}
                        size="small"
                      />
                    </Box>
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '0.875rem', lineHeight: 1.5 }}>
                          {alert.camera} • {alert.type.replace('_', ' ')}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.5 }}>
                          {new Date(alert.timestamp).toLocaleString()}
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      {!alert.acknowledged && (
                        <Button 
                          size="small" 
                          variant="outlined"
                          sx={{
                            fontSize: '0.75rem',
                            textTransform: 'none',
                            borderRadius: 1,
                            borderColor: colors.neutral[300],
                            color: colors.neutral[700]
                          }}
                        >
                          acknowledge
                        </Button>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < alerts.length - 1 && <Divider sx={{ borderColor: colors.neutral[200] }} />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Recordings Tab */}
      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: colors.neutral[200] }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 500, mb: 1, color: colors.neutral[700] }}>
                  0
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  today's recordings
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: colors.neutral[200] }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 500, mb: 1, color: colors.neutral[700] }}>
                  0%
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  storage used
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: colors.neutral[200] }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 500, mb: 1, color: colors.neutral[700] }}>
                  none
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  oldest recording
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: colors.neutral[200] }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 500, mb: 1, color: 'rgba(255, 152, 0, 0.8)' }}>
                  offline
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  2 days ago
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Camera Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <SettingsIcon sx={{ mr: 1 }} /> Settings
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <DownloadIcon sx={{ mr: 1 }} /> Download
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ScheduleIcon sx={{ mr: 1 }} /> Schedule
        </MenuItem>
      </Menu>

      {/* Fullscreen Dialog */}
      <Dialog 
        open={Boolean(fullscreenCamera)} 
        onClose={() => setFullscreenCamera(null)}
        maxWidth="lg"
        fullWidth
        sx={{ '& .MuiDialog-paper': { m: { xs: 1, sm: 4 } } }}
      >
        <DialogTitle sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}>
          {fullscreenCamera?.name} - Live Feed
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Box 
            sx={{ 
              height: { xs: 250, sm: 400 }, 
              bgcolor: 'grey.900', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1,
            }}
          >
            <Box sx={{ textAlign: 'center', color: 'white' }}>
              <VideocamIcon sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h6">Live Video Stream</Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Full-screen camera feed would appear here
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFullscreenCamera(null)}>Close</Button>
          <Button variant="contained" startIcon={<DownloadIcon />}>
            Record Clip
          </Button>
        </DialogActions>
      </Dialog>

      {/* Motion Detection Alert */}
      <Snackbar
        open={motionAlert.open}
        autoHideDuration={8000}
        onClose={handleCloseMotionAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseMotionAlert} 
          severity="error" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          🚨 {motionAlert.message} - {motionAlert.camera}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default SecurityCamera;