import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Layout from './components/Layout/Layout';
import PWAInstallButton from './components/PWA/PWAInstallButton';
import PWAUpdatePrompt from './components/PWA/PWAUpdatePrompt';
import Dashboard from './pages/Dashboard/Dashboard';
import ProbeManagement from './pages/ProbeManagement/ProbeManagement';
import ProbeDetail from './pages/ProbeDetail/ProbeDetail';
import SprinklerControl from './pages/SprinklerControl/SprinklerControl';
import SecurityCamera from './pages/SecurityCamera/SecurityCamera';
import Profile from './pages/Profile/Profile';
import VoiceChatbot from './pages/VoiceChatbot/VoiceChatbot';

function App() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Register service worker and listen for updates
    if ('serviceWorker' in navigator) {
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          });

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available
                  setUpdateAvailable(true);
                }
              });
            }
          });

          // Handle controlled updates
          let refreshing = false;
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
              refreshing = true;
              window.location.reload();
            }
          });
        } catch (error) {
          console.log('SW registration failed:', error);
        }
      };

      registerSW();

      // Also listen for the VitePWA update event
      const handlePWAUpdate = (event: any) => {
        setUpdateAvailable(true);
      };

      window.addEventListener('vite-plugin-pwa:needRefresh', handlePWAUpdate);
      
      return () => {
        window.removeEventListener('vite-plugin-pwa:needRefresh', handlePWAUpdate);
      };
    }
  }, []);

  const handleUpdate = () => {
    setUpdateAvailable(false);
    // Skip waiting and activate the new service worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    } else {
      // Fallback: Force reload
      window.location.reload();
    }
  };

  const handleCloseUpdate = () => {
    setUpdateAvailable(false);
  };
  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      touchAction: 'pan-x pan-y',
      userSelect: 'none',
      WebkitTouchCallout: 'none',
      WebkitUserSelect: 'none',
      KhtmlUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none',
      '& *': {
        WebkitTapHighlightColor: 'transparent',
      }
    }}>
      <PWAInstallButton variant="banner" />
      <PWAUpdatePrompt 
        open={updateAvailable}
        onUpdate={handleUpdate}
        onClose={handleCloseUpdate}
      />
      <Layout>
        <Routes>
          {/* Main Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Probe Management */}
          <Route path="/probes" element={<ProbeManagement />} />
          <Route path="/probes/:probeId" element={<ProbeDetail />} />
          {/* Irrigation & Sprinkler Control */}
          <Route path="/irrigation" element={<SprinklerControl />} />
          {/* Security & Camera */}
          <Route path="/security" element={<SecurityCamera />} />
          {/* Voice Chatbot */}
          <Route path="/voice-chatbot" element={<VoiceChatbot />} />
          {/* User Profile */}
          <Route path="/profile" element={<Profile />} />
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </Box>
  );
}

export default App;