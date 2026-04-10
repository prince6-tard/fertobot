import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  GetApp as InstallIcon,
  Smartphone as PhoneIcon,
  Speed as SpeedIcon,
  CloudOff as OfflineIcon,
  Notifications as NotificationIcon,
  Home as HomeIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { pwaManager, isPWAInstalled } from '../../utils/pwa';

interface PWAInstallButtonProps {
  variant?: 'button' | 'fab' | 'banner';
  color?: 'primary' | 'secondary' | 'success';
  size?: 'small' | 'medium' | 'large';
}

const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'button',
  color = 'primary',
  size = 'medium'
}) => {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(isPWAInstalled());
  const [showUpdateSnackbar, setShowUpdateSnackbar] = useState(false);
  const [showInstallDialog, setShowInstallDialog] = useState(false);

  useEffect(() => {
    const handleInstallAvailable = () => {
      setCanInstall(true);
      if (variant === 'banner') {
        setShowInstallPrompt(true);
      }
    };

    const handleInstallCompleted = () => {
      setCanInstall(false);
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setShowInstallDialog(false);
    };

    const handleUpdateAvailable = () => {
      setShowUpdateSnackbar(true);
    };

    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('pwa-install-completed', handleInstallCompleted);
    window.addEventListener('pwa-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('pwa-install-completed', handleInstallCompleted);
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
    };
  }, [variant]);

  const handleInstallClick = () => {
    if (variant === 'banner') {
      setShowInstallDialog(true);
    } else {
      pwaManager.promptInstall();
    }
  };

  const handleConfirmInstall = () => {
    pwaManager.promptInstall();
    setShowInstallDialog(false);
  };

  const handleReload = () => {
    window.location.reload();
  };

  if (isInstalled || !canInstall) {
    return null;
  }

  if (variant === 'banner') {
    return (
      <AnimatePresence>
        {showInstallPrompt && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 9999,
              backgroundColor: '#1976d2',
              color: 'white',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PhoneIcon />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Install FertoBot
                </Typography>
                <Typography variant="caption">
                  Get the full app experience
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="contained"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                onClick={handleInstallClick}
              >
                Install
              </Button>
              <Button
                size="small"
                sx={{ color: 'white', minWidth: 'auto' }}
                onClick={() => setShowInstallPrompt(false)}
              >
                <CloseIcon fontSize="small" />
              </Button>
            </Box>
          </motion.div>
        )}
        
        <Dialog open={showInstallDialog} onClose={() => setShowInstallDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <InstallIcon color="primary" />
              Install FertoBot PWA
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Install FertoBot as a Progressive Web App to get the best experience with offline support and native app features.
            </Typography>
            
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Benefits of Installing
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <SpeedIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Faster Performance" 
                      secondary="Lightning fast load times and smooth interactions"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <OfflineIcon color="info" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Offline Support" 
                      secondary="Access your data even without internet connection"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <NotificationIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Push Notifications" 
                      secondary="Get real-time alerts about your farm status"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <HomeIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Home Screen Access" 
                      secondary="Launch directly from your device's home screen"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowInstallDialog(false)}>Maybe Later</Button>
            <Button variant="contained" onClick={handleConfirmInstall} startIcon={<InstallIcon />}>
              Install Now
            </Button>
          </DialogActions>
        </Dialog>
      </AnimatePresence>
    );
  }

  return (
    <>
      <Button
        variant="contained"
        color={color}
        size={size}
        startIcon={<InstallIcon />}
        onClick={handleInstallClick}
        sx={{
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 600,
        }}
      >
        Install App
      </Button>
      
      <Snackbar
        open={showUpdateSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowUpdateSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowUpdateSnackbar(false)}
          severity="info"
          variant="filled"
          action={
            <Button color="inherit" size="small" onClick={handleReload}>
              Reload
            </Button>
          }
        >
          New version available! Reload to update.
        </Alert>
      </Snackbar>
    </>
  );
};

export default PWAInstallButton;