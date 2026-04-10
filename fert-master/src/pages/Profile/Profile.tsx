import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Switch,
  IconButton,
  Badge,
  Grid,
} from '@mui/material';
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Help as HelpIcon,
  Logout as LogoutIcon,
  Edit as EditIcon,
  Sensors as SensorsIcon,
  Badge as BadgeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { colors } from '../../utils/theme';



const Profile: React.FC = () => {
  return (
    <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden', padding: '16px' }}>
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        {/* Profile Header */}
        <Card elevation={0} sx={{ mb: 3, borderRadius: 1, border: '1px solid', borderColor: colors.neutral[200] }}>
          <CardContent sx={{ textAlign: 'center', py: 3, px: 3 }}>
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: colors.neutral[600],
                  fontSize: '2rem',
                }}
              >
                <PersonIcon sx={{ fontSize: '2.5rem' }} />
              </Avatar>
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: colors.neutral[300],
                  '&:hover': { bgcolor: colors.neutral[50] },
                }}
                size="small"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
            
            <Typography variant="h5" sx={{ fontWeight: 500, mb: 1, fontSize: '1.25rem', lineHeight: 1.4 }}>
              iedc administrator
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                newgen iedc • fertobot v1 • research project
              </Typography>
            </Box>

            {/* Compact Stats */}
            <Card elevation={0} sx={{ backgroundColor: colors.neutral[50], borderRadius: 1, p: 2 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 500, color: colors.neutral[700] }}>
                      1
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      probe
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 500, color: colors.neutral[700] }}>
                      0.5
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      hectares
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 500, color: 'rgba(255, 152, 0, 0.8)' }}>
                      offline
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      status
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Card>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card elevation={0} sx={{ mb: 3, borderRadius: 1, border: '1px solid', borderColor: colors.neutral[200] }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 500, mb: 2, fontSize: '1rem' }}>
              contact information
            </Typography>
            
            <List dense sx={{ '& .MuiListItem-root': { py: 1.5 } }}>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon sx={{ color: colors.neutral[600] }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                      admin@newgeniedc.edu
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      institutional email
                    </Typography>
                  }
                />
                <IconButton size="small" sx={{ color: colors.neutral[600] }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <PhoneIcon sx={{ color: colors.neutral[600] }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                      +91 xxx xxx xxxx
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      mobile phone
                    </Typography>
                  }
                />
                <IconButton size="small" sx={{ color: colors.neutral[600] }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Settings & Preferences */}
        <Card elevation={0} sx={{ mb: 3, borderRadius: 1, border: '1px solid', borderColor: colors.neutral[200] }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 500, mb: 2, fontSize: '1rem' }}>
              settings & preferences
            </Typography>
            
            <List sx={{ '& .MuiListItem-root': { py: 1.5 } }}>
              <ListItem>
                <ListItemIcon>
                  <NotificationsIcon sx={{ color: colors.neutral[600] }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                      push notifications
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      alerts for probe status changes
                    </Typography>
                  }
                />
                <Switch 
                  defaultChecked 
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
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Badge badgeContent={2} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem' } }}>
                    <BadgeIcon sx={{ color: colors.neutral[600] }} />
                  </Badge>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                      alert badges
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      show notification counts on icons
                    </Typography>
                  }
                />
                <Switch 
                  defaultChecked 
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
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <LanguageIcon sx={{ color: colors.neutral[600] }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                      language
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      english (india)
                    </Typography>
                  }
                />
                <IconButton size="small" sx={{ color: colors.neutral[600] }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card elevation={0} sx={{ mb: 3, borderRadius: 1, border: '1px solid', borderColor: colors.neutral[200] }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 500, mb: 2, fontSize: '1rem' }}>
              account
            </Typography>
            
            <List>
              <ListItem 
                button 
                sx={{ 
                  borderRadius: 1, 
                  '&:hover': { backgroundColor: colors.neutral[50] },
                  py: 1.5
                }}
              >
                <ListItemIcon>
                  <SecurityIcon sx={{ color: colors.neutral[600] }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                      security & privacy
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      password, 2fa, data privacy
                    </Typography>
                  }
                />
              </ListItem>
              
              <ListItem 
                button 
                sx={{ 
                  borderRadius: 1, 
                  '&:hover': { backgroundColor: colors.neutral[50] },
                  py: 1.5
                }}
              >
                <ListItemIcon>
                  <HelpIcon sx={{ color: colors.neutral[600] }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                      help & support
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      documentation, faqs, contact support
                    </Typography>
                  }
                />
              </ListItem>

              <Divider sx={{ my: 1, borderColor: colors.neutral[200] }} />
              
              <ListItem 
                button 
                sx={{ 
                  color: 'rgba(244, 67, 54, 0.8)', 
                  borderRadius: 1,
                  '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.05)' },
                  py: 1.5
                }}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                      sign out
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" sx={{ fontSize: '0.75rem', opacity: 0.8 }}>
                      log out of your fertobot account
                    </Typography>
                  }
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* App Information */}
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: 1,
                backgroundColor: colors.neutral[600],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SensorsIcon sx={{ color: 'white', fontSize: 16 }} />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
              fertobot
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            version 1.0.0 • newgen iedc research project
          </Typography>
        </Box>
      </Box>
    </div>
  );
};

export default Profile;