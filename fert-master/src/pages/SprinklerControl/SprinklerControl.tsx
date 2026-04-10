import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Switch,
  Button,
  Chip,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Water as WaterIcon,
  Schedule as ScheduleIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Opacity as OpacityIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { colors } from '../../utils/theme';

interface IrrigationZone {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'scheduled';
  duration: number; // minutes
  flowRate: number; // L/min
  lastRun: string;
  nextScheduled?: string;
  moistureLevel: number;
  progress?: number;
}

interface Schedule {
  id: string;
  zoneId: string;
  time: string;
  duration: number;
  days: string[];
  enabled: boolean;
}

interface DashboardProbe {
  _id: string;
  uuid: string;
  name: string;
  status: 'online' | 'offline' | 'maintenance' | 'error';
  battery?: {
    level?: number;
  };
  lastReading?: {
    soilMoisture?: number;
    waterTankLevel?: number;
  };
}



const SprinklerControl: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [scheduleDialog, setScheduleDialog] = useState(false);
  const [editingZone, setEditingZone] = useState<IrrigationZone | null>(null);
  const [isSendingCommand, setIsSendingCommand] = useState(false);
  const [commandFeedback, setCommandFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const [zones, setZones] = useState<IrrigationZone[]>([
    {
      id: 'zone-001',
      name: 'newgen iedc field',
      status: 'inactive',
      duration: 30,
      flowRate: 0,
      lastRun: '2025-12-03T14:37:00',
      moistureLevel: 78, // matching probe 001 last reading
      progress: 0,
    },
  ]);

  const [schedules] = useState<Schedule[]>([
    {
      id: 'sched-001',
      zoneId: 'zone-001',
      time: '06:00',
      duration: 30,
      days: ['Mon', 'Wed', 'Fri'],
      enabled: false, // disabled due to probe offline
    },
  ]);

  useEffect(() => {
    const loadZonesFromLiveProbes = async () => {
      try {
        const response = await fetch('/api/dashboard/overview');
        if (!response.ok) {
          return;
        }

        const payload = await response.json();
        const probes = (payload?.data?.probes || []) as DashboardProbe[];

        if (!Array.isArray(probes) || probes.length === 0) {
          return;
        }

        const mappedZones: IrrigationZone[] = probes.map((probe) => ({
          id: probe._id,
          name: probe.name || probe.uuid,
          status: probe.status === 'online' ? 'inactive' : 'scheduled',
          duration: 30,
          flowRate: 0,
          lastRun: new Date().toISOString(),
          moistureLevel: Number(probe.lastReading?.soilMoisture ?? 0),
          progress: 0,
        }));

        setZones(mappedZones);
      } catch (_error) {
        // Keep static fallback zone for UI if live probes fail to load.
      }
    };

    void loadZonesFromLiveProbes();
  }, []);

  const handleZoneToggle = async (zoneId: string, turnOn: boolean) => {
    try {
      setIsSendingCommand(true);
      setCommandFeedback(null);

      const response = await fetch('/api/irrigation/control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          probeId: zoneId,
          pump: turnOn,
          relay: turnOn ? 'on' : 'off',
          durationMs: turnOn ? 300000 : 0,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || 'Control command failed');
      }

      setCommandFeedback({
        type: 'success',
        message: turnOn ? 'Pump ON command sent to probe' : 'Pump OFF command sent to probe',
      });
    } catch (error) {
      setCommandFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to send control command',
      });
    } finally {
      setIsSendingCommand(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const ZoneCard = ({ zone }: { zone: IrrigationZone }) => (
    <Card 
      elevation={0}
      sx={{ 
        borderRadius: 1,
        border: '1px solid',
        borderColor: colors.neutral[200],
        height: '100%'
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 500, mb: 0.5, fontSize: '1rem', lineHeight: 1.5 }}>
              {zone.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {zone.status === 'active' ? (
                <PlayIcon sx={{ fontSize: 16, color: 'rgba(76, 175, 80, 0.8)' }} />
              ) : zone.status === 'scheduled' ? (
                <ScheduleIcon sx={{ fontSize: 16, color: 'rgba(255, 152, 0, 0.8)' }} />
              ) : (
                <StopIcon sx={{ fontSize: 16, color: colors.neutral[500] }} />
              )}
              <Typography variant="body2" sx={{ 
                fontSize: '0.875rem', 
                fontWeight: 500,
                color: zone.status === 'active' ? 'rgba(76, 175, 80, 0.9)' : 
                       zone.status === 'scheduled' ? 'rgba(255, 152, 0, 0.9)' : colors.neutral[600]
              }}>
                {zone.status}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => setEditingZone(zone)}>
            <SettingsIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Progress Bar for Active Zone */}
        {zone.status === 'active' && zone.progress && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>running</Typography>
              <Typography variant="body2" sx={{ fontSize: '0.875rem', color: colors.neutral[600] }}>{zone.progress}%</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={zone.progress} 
              sx={{ 
                height: 6, 
                borderRadius: 1,
                backgroundColor: colors.neutral[200],
                '& .MuiLinearProgress-bar': { backgroundColor: 'rgba(76, 175, 80, 0.8)' }
              }}
            />
          </Box>
        )}

        {/* Horizontal Metrics */}
        <Grid container spacing={2} sx={{ mb: 1 }}>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center', p: 2, backgroundColor: colors.neutral[50], borderRadius: 1 }}>
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 500, color: colors.neutral[700] }}>
                {zone.moistureLevel}%
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>moisture</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center', p: 2, backgroundColor: colors.neutral[50], borderRadius: 1 }}>
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 500, color: colors.neutral[700] }}>
                {zone.flowRate}l/min
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>flow rate</Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
          <Button
            variant="contained"
            startIcon={<PlayIcon sx={{ fontSize: 16 }} />}
            onClick={() => handleZoneToggle(zone.id, true)}
            disabled={isSendingCommand}
            fullWidth
            sx={{ 
              py: 1.5,
              fontSize: '0.875rem',
              textTransform: 'none',
              borderRadius: 1,
              backgroundColor: colors.primary[500],
            }}
          >
            start pump
          </Button>
          <Button
            variant="outlined"
            startIcon={<StopIcon sx={{ fontSize: 16 }} />}
            onClick={() => handleZoneToggle(zone.id, false)}
            disabled={isSendingCommand}
            fullWidth
            sx={{
              py: 1.5,
              fontSize: '0.875rem',
              textTransform: 'none',
              borderRadius: 1,
              borderColor: colors.neutral[300],
              color: colors.neutral[700],
            }}
          >
            stop pump
          </Button>
        </Box>

        {/* Status Info */}
        <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${colors.neutral[200]}` }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            last irrigation: 3.12.2025 14:37 • probe disconnected 2 days ago
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

  return (
    <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden', padding: '16px' }}>
      {commandFeedback && (
        <Alert severity={commandFeedback.type} sx={{ mb: 2 }}>
          {commandFeedback.message}
        </Alert>
      )}

      {/* Compact Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 500, fontSize: '1.25rem', lineHeight: 1.4 }}>
              newgen iedc irrigation • 1 zone
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
              disconnected • probe 001 offline • tank 92%
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon sx={{ fontSize: 16 }} />}
              onClick={() => setScheduleDialog(true)}
              sx={{
                fontSize: '0.875rem',
                textTransform: 'none',
                borderRadius: 1,
                borderColor: colors.neutral[300],
                color: colors.neutral[700]
              }}
            >
              add zone
            </Button>
          </Box>
        </Box>

        {/* Compact System Metrics */}
        <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: colors.neutral[200], p: 2 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon sx={{ fontSize: 18, color: 'rgba(255, 152, 0, 0.8)' }} />
                <Box>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255, 152, 0, 0.9)' }}>offline</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>system</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <OpacityIcon sx={{ fontSize: 18, color: colors.neutral[600] }} />
                <Box>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>0 l/min</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>flow rate</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon sx={{ fontSize: 18, color: colors.neutral[600] }} />
                <Box>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>0 bar</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>pressure</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WaterIcon sx={{ fontSize: 18, color: colors.neutral[600] }} />
                <Box>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>92%</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>tank level</Typography>
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
          <Tab label="zones" />
          <Tab label="schedules" />
          <Tab label="usage" />
        </Tabs>
      </Card>

      {/* Zone Control Tab */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          {zones.map((zone) => (
            <Grid item xs={12} key={zone.id}>
              <ZoneCard zone={zone} />
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Schedules Tab */}
      <TabPanel value={activeTab} index={1}>
        <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: colors.neutral[200] }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, borderBottom: `1px solid ${colors.neutral[200]}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 500, fontSize: '1rem' }}>
                  irrigation schedules
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                  onClick={() => setScheduleDialog(true)}
                  size="small"
                  sx={{
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    borderRadius: 1,
                    borderColor: colors.neutral[300],
                    color: colors.neutral[700]
                  }}
                >
                  add schedule
                </Button>
              </Box>
            </Box>
            <List sx={{ py: 0 }}>
              {schedules.map((schedule, index) => {
                const zone = zones.find(z => z.id === schedule.zoneId);
                return (
                  <React.Fragment key={schedule.id}>
                    <ListItem sx={{ py: 3 }}>
                      <ListItemText
                        primary={
                          <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '0.875rem', lineHeight: 1.5 }}>
                            {zone?.name} • {schedule.time}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.5 }}>
                            {schedule.duration}min • {schedule.days.join(', ')}
                          </Typography>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Switch 
                            checked={schedule.enabled} 
                            size="small"
                            sx={{ 
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: colors.neutral[600]
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: colors.neutral[400]
                              }
                            }}
                          />
                          <IconButton size="small" sx={{ color: colors.neutral[600] }}>
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          <IconButton size="small" sx={{ color: colors.neutral[600] }}>
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < schedules.length - 1 && <Divider sx={{ borderColor: colors.neutral[200] }} />}
                  </React.Fragment>
                );
              })}
            </List>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Usage History Tab */}
      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: colors.neutral[200] }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 500, mb: 1, color: colors.neutral[700] }}>
                  0L
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  today's usage
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: colors.neutral[200] }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 500, mb: 1, color: colors.neutral[700] }}>
                  185L
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  this week
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: colors.neutral[200] }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 500, mb: 1, color: colors.neutral[700] }}>
                  1.2k L
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  this month
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

      {/* Schedule Dialog */}
      <Dialog 
        open={scheduleDialog} 
        onClose={() => setScheduleDialog(false)} 
        maxWidth="sm" 
        fullWidth
        sx={{ '& .MuiDialog-paper': { m: { xs: 2, sm: 4 } } }}
      >
        <DialogTitle sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}>Add New Schedule</DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Zone</InputLabel>
                <Select>
                  {zones.map(zone => (
                    <MenuItem key={zone.id} value={zone.id}>{zone.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Start Time"
                type="time"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Duration (min)"
                type="number"
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialog(false)}>Cancel</Button>
          <Button variant="contained">Add Schedule</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SprinklerControl;