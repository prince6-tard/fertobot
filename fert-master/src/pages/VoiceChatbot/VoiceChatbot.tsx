import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Mic, MicOff } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { ElevenLabsService } from '../../services/elevenLabsService';

// Hardcoded for now based on user input
const AGENT_ID = 'agent_8401kc0pqhv4fmnr13frj0r4erer';

const VoiceChatbot: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState("Tap microphone to connect");

  const serviceRef = useRef<ElevenLabsService | null>(null);

  useEffect(() => {
    serviceRef.current = new ElevenLabsService(AGENT_ID);
    return () => {
      serviceRef.current?.stop();
    };
  }, []);

  const handleConnectionToggle = async () => {
    if (isConnected) {
      serviceRef.current?.stop();
      setIsConnected(false);
      setIsSpeaking(false);
      setStatus("Disconnected. Tap to reconnect.");
    } else {
      setStatus("Connecting...");
      try {
        await serviceRef.current?.start(
          () => {
            // onConnect
            setIsConnected(true);
            setStatus("Listening...");
          },
          () => {
            // onDisconnect
            setIsConnected(false);
            setIsSpeaking(false);
            setStatus("Disconnected");
          },
          (error) => {
            // onError
            console.error("Connection error:", error);
            setStatus("Connection failed.");
            setIsConnected(false);
          },
          (mode) => {
            // onModeChange
            setIsSpeaking(mode.mode === 'speaking');
            setStatus(mode.mode === 'speaking' ? "Fertobot is speaking..." : "Listening...");
          }
        );
      } catch (error) {
        console.error("Failed to start:", error);
        setStatus("Failed to start.");
        setIsConnected(false);
      }
    }
  };

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: 'black',
        overflow: 'hidden',
        position: 'relative',
        py: 4
      }}
    >


      {/* Header / Status */}
      <Box sx={{ zIndex: 1, textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" sx={{ opacity: 0.7, letterSpacing: 1.5, textTransform: 'uppercase', fontSize: '0.9rem' }}>
          Fertobot Assistant
        </Typography>
      </Box>

      {/* Main Visualizer Area */}
      <Box sx={{ zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <AnimatePresence mode='wait'>
          {isConnected ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: 60 }}>
              {/* Dynamic visualizer simulation */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: isSpeaking ? [30, 80, 30] : [20, 30, 20], // Higher amplitude when speaking
                  }}
                  transition={{
                    duration: 0.4 + Math.random() * 0.2,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeInOut"
                  }}
                  style={{
                    width: 8,
                    borderRadius: 4,
                    backgroundColor: '#4caf50'
                  }}
                />
              ))}
            </Box>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <Typography variant="h4" fontWeight="bold" textAlign="center" sx={{ maxWidth: '80%', mx: 'auto', color: '#333' }}>
                {status}
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Subtext */}
        <Typography variant="body1" sx={{ mt: 3, opacity: 0.6, minHeight: 24 }}>
          {isConnected ? (isSpeaking ? "Speaking..." : "Listening...") : " "}
        </Typography>
      </Box>

      {/* Control Area */}
      <Box sx={{ zIndex: 1, mb: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ position: 'relative' }}>
          {/* Pulsing Ring when NOT connected to invite click */}
          {!isConnected && (
            <Box
              component={motion.div}
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              sx={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                borderRadius: '50%',
                border: '2px solid rgba(0,0,0,0.1)',
              }}
            />
          )}

          <IconButton
            onClick={handleConnectionToggle}
            sx={{
              width: 80,
              height: 80,
              bgcolor: isConnected ? '#f44336' : '#2196f3', // Red to stop, Blue to start
              color: 'white',
              '&:hover': {
                bgcolor: isConnected ? '#d32f2f' : '#1976d2',
              },
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}
          >
            {isConnected ? <MicOff sx={{ fontSize: 32 }} /> : <Mic sx={{ fontSize: 32 }} />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default VoiceChatbot;
