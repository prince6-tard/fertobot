import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Fab,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Switch,
  LinearProgress,
  Menu,
  Badge,
  Slider,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  GroupWork as GroupIcon,
  Sensors as SensorIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Battery0Bar as BatteryLowIcon,
  Battery3Bar as BatteryMedIcon,
  BatteryFull as BatteryFullIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Warning as WarningIcon,
  CheckCircle as OnlineIcon,
  Error as OfflineIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
  MoreVert as MoreVertIcon,
  Settings as SettingsIcon,
  Timeline as TimelineIcon,
  WaterDrop as WaterDropIcon,
  Thermostat as ThermostatIcon,
} from '@mui/icons-material';
import ProbeGrid from '../../components/ProbeManagement/ProbeGrid';
import GroupManagement from '../../components/ProbeManagement/GroupManagement';
import ProbeDetailModal from '../../components/ProbeManagement/ProbeDetailModal';
import { Probe, ProbeGroup } from '../../types';
import { colors } from '../../utils/theme';

// Mock data - showing only the disconnected probe from Dashboard
const mockProbes: Probe[] = [
  {
    id: 'probe-001',
    uuid: 'uuid-001',
    name: 'probe 001',
    groupId: 'group-001',
    status: 'offline',
    batteryLevel: 15,
    wifiStrength: 0,
    lastActive: new Date('2025-12-03T14:37:00'),
    location: { fieldName: 'newgen iedc', latitude: 40.7128, longitude: -74.0060 },
    currentReading: {
      timestamp: new Date('2025-12-03T14:37:00'),
      soilMoisture: 78,
      temperature: 12.8,
      humidity: 82,
      pH: 6.5,
      conductivity: 0,
      nitrogen: 45,
      phosphorus: 38,
      potassium: 42,
      waterTankLevel: 92,
      batteryLevel: 15,
      signalStrength: 0,
      microNutrients: {
        iron: 12.5,
        zinc: 8.2,
        manganese: 15.8,
        copper: 3.1,
        boron: 0.8,
        molybdenum: 0.5,
      },
      macroNutrients: {
        calcium: 85,
        magnesium: 22,
        sulfur: 18,
      },
    },
    isBluetoothConnected: false,
    waterTankLevel: 92,
  },
];

const mockGroups: ProbeGroup[] = [
  {
    id: 'group-001',
    name: 'iedc sensors',
    description: 'newgen iedc monitoring probes',
    color: colors.neutral[600],
    probeIds: ['probe-001'],
  },
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const ProbeManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [probes, setProbes] = useState(mockProbes);
  const [groups, setGroups] = useState(mockGroups);
  const [selectedProbe, setSelectedProbe] = useState<Probe | null>(null);
  const [isProbeModalOpen, setIsProbeModalOpen] = useState(false);
  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [filter, setFilter] = useState<'all' | 'online' | 'offline' | 'maintenance'>('all');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleProbeClick = (probe: Probe) => {
    setSelectedProbe(probe);
    setIsProbeModalOpen(true);
  };

  const handleRefreshProbe = (probeId: string) => {
    // In a real app, this would trigger an API call to refresh the probe data
    console.log('Refreshing probe:', probeId);
  };

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      const newGroup: ProbeGroup = {
        id: `group-${Date.now()}`,
        name: newGroupName,
        description: newGroupDescription,
        color: colors.neutral[600],
        probeIds: [],
      };
      setGroups([...groups, newGroup]);
      setNewGroupName('');
      setNewGroupDescription('');
      setIsAddGroupDialogOpen(false);
    }
  };

  const filteredProbes = probes.filter(probe => {
    if (filter === 'all') return true;
    return probe.status === filter;
  });

  const onlineCount = probes.filter(p => p.status === 'online').length;
  const offlineCount = probes.filter(p => p.status === 'offline').length;
  const maintenanceCount = probes.filter(p => p.status === 'maintenance').length;
  
  // Additional state for enhanced features
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProbeId, setSelectedProbeId] = useState<string | null>(null);
  const [calibrationDialog, setCalibrationDialog] = useState(false);
  const [alertDialog, setAlertDialog] = useState(false);

  // Calculate additional metrics
  const avgBattery = Math.round(probes.reduce((acc, p) => acc + p.batteryLevel, 0) / probes.length);
  const lowBatteryCount = probes.filter(p => p.batteryLevel < 30).length;
  const avgWifiStrength = Math.round(probes.filter(p => p.wifiStrength > 0).reduce((acc, p) => acc + p.wifiStrength, 0) / probes.filter(p => p.wifiStrength > 0).length);

  const getBatteryIcon = (level: number) => {
    if (level < 30) return <BatteryLowIcon sx={{ fontSize: 16, color: colors.neutral[600] }} />;
    if (level < 70) return <BatteryMedIcon sx={{ fontSize: 16, color: colors.neutral[600] }} />;
    return <BatteryFullIcon sx={{ fontSize: 16, color: colors.neutral[600] }} />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <OnlineIcon sx={{ fontSize: 16, color: colors.neutral[600] }} />;
      case 'offline': return <OfflineIcon sx={{ fontSize: 16, color: colors.neutral[600] }} />;
      case 'maintenance': return <WarningIcon sx={{ fontSize: 16, color: colors.neutral[600] }} />;
      default: return <OfflineIcon sx={{ fontSize: 16, color: colors.neutral[600] }} />;
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, probeId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedProbeId(probeId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProbeId(null);
  };

  // Enhanced Probe Card Component (currently unused in grid)
  const EnhancedProbeCard = ({ probe }: { probe: Probe }) => (
    <Card 
      elevation={0}
      sx={{ 
        width: '100%',
        maxWidth: '100%',
        position: 'relative',
        borderRadius: 1,
        border: '1px solid',
        borderColor: colors.neutral[200]
      }}
    >
      <CardContent sx={{ width: '100%', p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, width: '100%' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, fontSize: '1.125rem', lineHeight: 1.5 }}>
              {probe.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', lineHeight: 1.5, mb: 1 }}>
              {probe.location.fieldName}
            </Typography>
            <Chip 
              icon={getStatusIcon(probe.status)}
              label={probe.status.toUpperCase()}
              sx={{ 
                fontSize: '0.75rem', 
                lineHeight: 1.5,
                backgroundColor: colors.neutral[100],
                color: colors.neutral[700],
                borderRadius: 1
              }}
              size="small"
            />
          </Box>
          <IconButton 
            size="small"
            onClick={(e) => handleMenuClick(e, probe.id)}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>

        {/* Metrics Grid */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {getBatteryIcon(probe.batteryLevel)}
              <Box>
                <Typography variant="h6" sx={{ fontSize: '1rem', lineHeight: 1.5, fontWeight: 500 }}>
                  {probe.batteryLevel}%
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.5 }}>
                  Battery
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {probe.wifiStrength > 0 ? 
                <WifiIcon sx={{ fontSize: 16, color: colors.neutral[600] }} /> : 
                <WifiOffIcon sx={{ fontSize: 16, color: colors.neutral[600] }} />
              }
              <Box>
                <Typography variant="h6" sx={{ fontSize: '1rem', lineHeight: 1.5, fontWeight: 500 }}>
                  {probe.wifiStrength}%
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.5 }}>
                  WiFi Signal
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {getStatusIcon(probe.status)}
              <Box>
                <Typography variant="h6" sx={{ fontSize: '1rem', lineHeight: 1.5, fontWeight: 500, textTransform: 'capitalize' }}>
                  {probe.status}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.5 }}>
                  Status
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <WaterDropIcon sx={{ fontSize: 16, color: colors.neutral[600] }} />
              <Box>
                <Typography variant="h6" sx={{ fontSize: '1rem', lineHeight: 1.5, fontWeight: 500 }}>
                  {probe.waterTankLevel}%
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.5 }}>
                  Water Tank
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Current Reading Summary */}
        {probe.currentReading && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, fontSize: '1rem', lineHeight: 1.5 }}>
              Current Readings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={6} sm={3}>
                <Card elevation={0} sx={{ p: 2, backgroundColor: colors.neutral[50], borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <WaterDropIcon sx={{ fontSize: 16, color: colors.neutral[600] }} />
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.5 }}>
                      Soil Moisture
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontSize: '1rem', lineHeight: 1.5, fontWeight: 500 }}>
                    {probe.currentReading.soilMoisture}%
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card elevation={0} sx={{ p: 2, backgroundColor: colors.neutral[50], borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <ThermostatIcon sx={{ fontSize: 16, color: colors.neutral[600] }} />
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.5 }}>
                      Temperature
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontSize: '1rem', lineHeight: 1.5, fontWeight: 500 }}>
                    {probe.currentReading.temperature}°C
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card elevation={0} sx={{ p: 2, backgroundColor: colors.neutral[50], borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.5, mb: 1, display: 'block' }}>
                    pH Level
                  </Typography>
                  <Typography variant="h6" sx={{ fontSize: '1rem', lineHeight: 1.5, fontWeight: 500 }}>
                    {probe.currentReading.pH}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card elevation={0} sx={{ p: 2, backgroundColor: colors.neutral[50], borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.5, mb: 1, display: 'block' }}>
                    Nitrogen
                  </Typography>
                  <Typography variant="h6" sx={{ fontSize: '1rem', lineHeight: 1.5, fontWeight: 500 }}>
                    {probe.currentReading.nitrogen}%
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Status Bar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: `1px solid ${colors.neutral[200]}` }}>
          <Box>
            <Typography variant="body2" sx={{ fontSize: '0.875rem', lineHeight: 1.5, fontWeight: 500 }}>
              Last Connected: 2 days ago
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.5 }}>
              {probe.lastActive.toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleProbeClick(probe)}
              startIcon={<TimelineIcon sx={{ fontSize: 16 }} />}
              sx={{ 
                fontSize: '0.875rem',
                lineHeight: 1.5,
                textTransform: 'none',
                borderRadius: 1,
                borderColor: colors.neutral[300],
                color: colors.neutral[700],
                '&:hover': {
                  borderColor: colors.neutral[400],
                  backgroundColor: colors.neutral[50]
                }
              }}
            >
              View Details
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={() => handleRefreshProbe(probe.id)}
              startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
              sx={{ 
                fontSize: '0.875rem',
                lineHeight: 1.5,
                textTransform: 'none',
                borderRadius: 1,
                backgroundColor: colors.neutral[600],
                '&:hover': {
                  backgroundColor: colors.neutral[700]
                }
              }}
            >
              Refresh
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden', padding: '16px' }}>
      {/* Compact Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 500, fontSize: '1.25rem', lineHeight: 1.4 }}>
              probe 001 • newgen iedc
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
              disconnected 2 days ago • low battery (15%)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
              onClick={() => handleRefreshProbe('probe-001')}
              sx={{
                fontSize: '0.875rem',
                textTransform: 'none',
                borderRadius: 1,
                borderColor: colors.neutral[300],
                color: colors.neutral[700]
              }}
            >
              reconnect
            </Button>
          </Box>
        </Box>

        {/* Compact Metrics Bar */}
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
                <BatteryLowIcon sx={{ fontSize: 18, color: colors.neutral[600] }} />
                <Box>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>15%</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>battery</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WifiOffIcon sx={{ fontSize: 18, color: colors.neutral[600] }} />
                <Box>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>0%</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>signal</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WaterDropIcon sx={{ fontSize: 18, color: colors.neutral[600] }} />
                <Box>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>92%</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>tank</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Card>
      </Box>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Last Sensor Readings */}
        <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: colors.neutral[200] }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 500, mb: 2, fontSize: '1rem' }}>
              last readings (2 days ago)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: colors.neutral[50], borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ fontSize: '1.125rem', fontWeight: 500, color: colors.neutral[700] }}>78%</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>soil moisture</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: colors.neutral[50], borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ fontSize: '1.125rem', fontWeight: 500, color: colors.neutral[700] }}>12.8°C</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>temperature</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: colors.neutral[50], borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ fontSize: '1.125rem', fontWeight: 500, color: colors.neutral[700] }}>6.5</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>ph level</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: colors.neutral[50], borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ fontSize: '1.125rem', fontWeight: 500, color: colors.neutral[700] }}>45%</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>nitrogen</Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: colors.neutral[200] }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 500, mb: 2, fontSize: '1rem' }}>
              diagnostics & actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  sx={{
                    py: 1.5,
                    textTransform: 'none',
                    borderRadius: 1,
                    borderColor: colors.neutral[300],
                    color: colors.neutral[700],
                    '&:hover': { borderColor: colors.neutral[400] }
                  }}
                >
                  force reconnect
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  onClick={() => setCalibrationDialog(true)}
                  sx={{
                    py: 1.5,
                    textTransform: 'none',
                    borderRadius: 1,
                    borderColor: colors.neutral[300],
                    color: colors.neutral[700],
                    '&:hover': { borderColor: colors.neutral[400] }
                  }}
                >
                  calibrate sensors
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<WaterDropIcon />}
                  sx={{
                    py: 1.5,
                    textTransform: 'none',
                    borderRadius: 1,
                    borderColor: colors.neutral[300],
                    color: colors.neutral[700],
                    '&:hover': { borderColor: colors.neutral[400] }
                  }}
                >
                  check connections
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<TimelineIcon />}
                  onClick={() => handleProbeClick(probes[0])}
                  sx={{
                    py: 1.5,
                    textTransform: 'none',
                    borderRadius: 1,
                    borderColor: colors.neutral[300],
                    color: colors.neutral[700],
                    '&:hover': { borderColor: colors.neutral[400] }
                  }}
                >
                  view details
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Recent Activity & Issues */}
        <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: colors.neutral[200] }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 500, mb: 2, fontSize: '1rem' }}>
              recent activity
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, backgroundColor: colors.neutral[50], borderRadius: 1 }}>
                <WarningIcon sx={{ fontSize: 18, color: 'rgba(255, 152, 0, 0.8)' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>connection lost</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>3.12.2025 14:37 • 2 days ago</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>critical</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, backgroundColor: colors.neutral[50], borderRadius: 1 }}>
                <BatteryLowIcon sx={{ fontSize: 18, color: colors.neutral[600] }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>battery low (15%)</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>requires replacement</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>urgent</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, backgroundColor: colors.neutral[50], borderRadius: 1 }}>
                <WifiOffIcon sx={{ fontSize: 18, color: colors.neutral[600] }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>no wifi signal</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>check antenna connections</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>minor</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Floating Action Button for Quick Add */}
      <Fab
        aria-label="add probe"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: colors.neutral[600],
          color: 'white',
          '&:hover': {
            backgroundColor: colors.neutral[700]
          }
        }}
        onClick={() => {
          // In a real app, this would open a "Add New Probe" dialog
          console.log('Add new probe');
        }}
      >
        <AddIcon />
      </Fab>

      {/* Probe Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleMenuClose(); setCalibrationDialog(true); }}>
          <SettingsIcon sx={{ mr: 1 }} /> Calibrate
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <TimelineIcon sx={{ mr: 1 }} /> View History
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EditIcon sx={{ mr: 1 }} /> Edit Settings
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <DeleteIcon sx={{ mr: 1 }} /> Remove
        </MenuItem>
      </Menu>

      {/* Calibration Dialog */}
      <Dialog open={calibrationDialog} onClose={() => setCalibrationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Probe Calibration</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Calibrate your probe sensors for accurate readings
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Calibration Type</InputLabel>
                <Select defaultValue="">
                  <MenuItem value="ph">pH Calibration</MenuItem>
                  <MenuItem value="moisture">Moisture Calibration</MenuItem>
                  <MenuItem value="nutrients">Nutrient Calibration</MenuItem>
                  <MenuItem value="full">Full Calibration</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCalibrationDialog(false)}>Cancel</Button>
          <Button variant="contained">Start Calibration</Button>
        </DialogActions>
      </Dialog>

      {/* Alert Dialog */}
      <Dialog open={alertDialog} onClose={() => setAlertDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>System Alerts</DialogTitle>
        <DialogContent>
          <List>
            {probes.filter(p => p.batteryLevel < 30 || p.status === 'offline').map((probe) => (
              <ListItem key={probe.id}>
                <ListItemText
                  primary={probe.name}
                  secondary={
                    probe.batteryLevel < 30 ? 
                      `Low battery: ${probe.batteryLevel}%` : 
                      `Probe offline since ${probe.lastActive.toLocaleString()}`
                  }
                />
                <ListItemSecondaryAction>
                  <Chip 
                    label={probe.batteryLevel < 30 ? 'Low Battery' : 'Offline'}
                    color="error"
                    size="small"
                  />
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlertDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Probe Detail Modal */}
      {selectedProbe && (
        <ProbeDetailModal
          probe={selectedProbe}
          open={isProbeModalOpen}
          onClose={() => {
            setIsProbeModalOpen(false);
            setSelectedProbe(null);
          }}
          onRefresh={() => handleRefreshProbe(selectedProbe!.id)}
        />
      )}

      {/* Add Group Dialog */}
      <Dialog 
        open={isAddGroupDialogOpen} 
        onClose={() => setIsAddGroupDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            fullWidth
            variant="outlined"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newGroupDescription}
            onChange={(e) => setNewGroupDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddGroupDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddGroup} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProbeManagement;