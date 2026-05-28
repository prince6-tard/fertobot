import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, IconButton, TextField, CircularProgress, alpha } from '@mui/material';
import { Mic, MicOff, Send } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  time: string;
}

const QUICK_QUESTIONS = [
  'Meri fasal ki condition kya hai?',
  'Aaj paani dena hai kya?',
  'Kitna fertilizer daalna hai?',
  'Battery kitni hai?',
  'Koi warning hai kya?',
];

const AMBER = '#F4A261';
const LIVE_GREEN = '#52D080';

// Extend window for webkit prefix
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

const now = () =>
  new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

const VoiceChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'Namaskar! Main FertoBot assistant hoon 🌱 Aapki khet ki poori jaankari mere paas hai. Poochho kya jaanna hai!',
      time: now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceModeEnabled, setVoiceModeEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const [history, setHistory] = useState<{ role: 'user' | 'model'; text: string }[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const shouldRestartRef = useRef(false);
  // Stable ref so onend/onerror closures always call the latest startListening
  const startListeningRef = useRef<() => void>(() => {});

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimText]);

  const speak = useCallback((text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1;

    // Prefer a Hindi voice if available
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(v => v.lang.startsWith('hi'));
    if (hindiVoice) utterance.voice = hindiVoice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsListening(false);
      // Kill the mic immediately so it can't hear the bot's output
      try { recognitionRef.current?.abort(); } catch { /* ignore */ }
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      // Small delay so the mic doesn't catch the tail-end reverb
      if (shouldRestartRef.current) {
        setTimeout(() => {
          if (shouldRestartRef.current) startListeningRef.current();
        }, 350);
      }
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      if (shouldRestartRef.current) setTimeout(() => { if (shouldRestartRef.current) startListeningRef.current(); }, 350);
    };
    window.speechSynthesis.speak(utterance);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    setMessages(prev => [...prev, { role: 'user', text: text.trim(), time: now() }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), history }),
      });
      const data = await res.json();
      const reply = data?.data?.reply || 'Kuch gadbad ho gayi, dobara try karein.';

      setMessages(prev => [...prev, { role: 'assistant', text: reply, time: now() }]);
      setHistory(prev => [
        ...prev,
        { role: 'user', text: text.trim() },
        { role: 'model', text: reply },
      ]);

      // Speak the reply if voice mode is active
      if (shouldRestartRef.current) {
        speak(reply);
      }
    } catch {
      const errMsg = 'Network error. Dobara try karein.';
      setMessages(prev => [...prev, { role: 'assistant', text: errMsg, time: now() }]);
      if (shouldRestartRef.current) speak(errMsg);
    } finally {
      setLoading(false);
    }
  }, [loading, history, speak]);

  const startListening = useCallback(() => {
    setVoiceError('');
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setVoiceError('Aapka browser voice support nahi karta. Chrome use karein.');
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    // en-IN accepts Hinglish (English+Hindi mix) better than hi-IN alone
    recognition.lang = 'en-IN';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    const scheduleRestart = (delayMs = 250) => {
      if (shouldRestartRef.current && !window.speechSynthesis.speaking) {
        setTimeout(() => {
          if (shouldRestartRef.current && !window.speechSynthesis.speaking) {
            // Always create a fresh instance — ended instances can't be restarted
            startListeningRef.current();
          }
        }, delayMs);
      }
    };

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t;
        else interim += t;
      }
      setInterimText(interim);
      if (final.trim()) {
        setInterimText('');
        sendMessage(final.trim());
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText('');
      // Restart mic unless the bot is about to speak (speak() will restart after)
      scheduleRestart(250);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      setInterimText('');
      if (event.error === 'not-allowed') {
        setVoiceError('Microphone permission denied. Browser settings mein allow karein.');
        shouldRestartRef.current = false;
        return;
      }
      // no-speech, audio-capture, network, aborted → try again
      scheduleRestart(400);
    };

    try {
      recognition.start();
    } catch {
      // start() can throw if called too quickly after a previous instance ended
      scheduleRestart(500);
    }
  }, [sendMessage]);

  // Keep ref in sync with the latest callback so closures never go stale
  useEffect(() => {
    startListeningRef.current = startListening;
  }, [startListening]);

  const handleVoiceToggle = useCallback(() => {
    if (shouldRestartRef.current) {
      // Turn off voice mode
      shouldRestartRef.current = false;
      setVoiceModeEnabled(false);
      window.speechSynthesis.cancel();
      recognitionRef.current?.abort();
      setIsListening(false);
      setIsSpeaking(false);
      setInterimText('');
    } else {
      // Turn on voice mode
      shouldRestartRef.current = true;
      setVoiceModeEnabled(true);
      startListening();
    }
  }, [startListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldRestartRef.current = false;
      recognitionRef.current?.abort();
      window.speechSynthesis.cancel();
    };
  }, []);

  const voiceModeOn = voiceModeEnabled;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 76px)', bgcolor: '#0D1F14', overflow: 'hidden' }}>

      {/* Header */}
      <Box
        sx={{
          px: 2, py: 1.5,
          display: 'flex', alignItems: 'center', gap: 1.5,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backgroundColor: '#132B1A',
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            width: 38, height: 38, borderRadius: '10px',
            background: 'linear-gradient(135deg, #F5A055, #D4703A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', flexShrink: 0,
            boxShadow: '0 4px 12px rgba(244,162,97,0.3)',
          }}
        >
          🌱
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#F0EDE6', fontFamily: '"Plus Jakarta Sans", sans-serif', lineHeight: 1.2 }}>
            FertoBot Assistant
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', color: '#8FA89C', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
            Hindi mein poochho — live khet data se jawab milega
          </Typography>
        </Box>

        {/* Status badge */}
        {(isListening || isSpeaking) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
            <Box
              sx={{
                width: 7, height: 7, borderRadius: '50%',
                backgroundColor: isSpeaking ? AMBER : LIVE_GREEN,
                boxShadow: `0 0 8px ${isSpeaking ? AMBER : LIVE_GREEN}`,
                animation: 'pulse 1s infinite',
              }}
            />
            <Typography sx={{ fontSize: '0.68rem', color: '#8FA89C', fontFamily: '"DM Mono", monospace' }}>
              {isSpeaking ? 'Bol raha hoon...' : 'Sun raha hoon...'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 1.5,
          py: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.25,
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.1)', borderRadius: 2 },
        }}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.18 }}
              style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
            >
              {msg.role === 'user' ? (
                <Box
                  sx={{
                    maxWidth: '78%',
                    px: 2, py: 1.25,
                    backgroundColor: alpha(AMBER, 0.15),
                    border: `1px solid ${alpha(AMBER, 0.25)}`,
                    borderRadius: '16px 16px 4px 16px',
                    boxShadow: `0 2px 12px ${alpha(AMBER, 0.08)}`,
                  }}
                >
                  <Typography sx={{ fontSize: '0.875rem', lineHeight: 1.5, color: '#F0EDE6', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                    {msg.text}
                  </Typography>
                  <Typography sx={{ fontSize: '0.6rem', color: alpha(AMBER, 0.5), mt: 0.4, textAlign: 'right', fontFamily: '"DM Mono", monospace' }}>
                    {msg.time}
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    maxWidth: '82%',
                    px: 2, py: 1.25,
                    backgroundColor: '#1A3520',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '16px 16px 16px 4px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                  }}
                >
                  <Typography sx={{ fontSize: '0.6rem', color: '#4A6555', mb: 0.4, fontFamily: '"DM Mono", monospace', letterSpacing: '0.05em' }}>
                    FERTOBOT
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem', lineHeight: 1.55, color: '#D4E3DC', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                    {msg.text}
                  </Typography>
                  <Typography sx={{ fontSize: '0.6rem', color: '#4A6555', mt: 0.4, textAlign: 'right', fontFamily: '"DM Mono", monospace' }}>
                    {msg.time}
                  </Typography>
                </Box>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Interim voice transcript */}
        {interimText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', justifyContent: 'flex-end' }}
          >
            <Box
              sx={{
                maxWidth: '78%',
                px: 2, py: 1.25,
                backgroundColor: alpha(AMBER, 0.07),
                border: `1px dashed ${alpha(AMBER, 0.3)}`,
                borderRadius: '16px 16px 4px 16px',
              }}
            >
              <Typography sx={{ fontSize: '0.875rem', lineHeight: 1.5, color: alpha('#F0EDE6', 0.6), fontStyle: 'italic', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                {interimText}
              </Typography>
            </Box>
          </motion.div>
        )}

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex' }}>
            <Box
              sx={{
                px: 2, py: 1.25,
                backgroundColor: '#1A3520',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '16px 16px 16px 4px',
                display: 'flex', alignItems: 'center', gap: 1,
              }}
            >
              <CircularProgress size={12} sx={{ color: AMBER }} />
              <Typography sx={{ fontSize: '0.75rem', color: '#8FA89C', fontFamily: '"DM Mono", monospace' }}>
                soch raha hoon...
              </Typography>
            </Box>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </Box>

      {/* Listening indicator */}
      <AnimatePresence>
        {isListening && !isSpeaking && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.22 }}
          >
            <Box
              sx={{
                mx: 1.5, mb: 1,
                px: 2, py: 1.5,
                backgroundColor: '#0E2617',
                border: `1px solid ${alpha(LIVE_GREEN, 0.25)}`,
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                boxShadow: `0 0 24px ${alpha(LIVE_GREEN, 0.1)}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', height: 32 }}>
                {[0, 1, 2, 3, 4, 5, 6].map(i => (
                  <Box
                    key={i}
                    sx={{
                      width: 4,
                      borderRadius: 2,
                      backgroundColor: LIVE_GREEN,
                      boxShadow: `0 0 6px ${LIVE_GREEN}`,
                      animation: `listenWave 1.1s ease-in-out ${i * 0.1}s infinite`,
                    }}
                  />
                ))}
              </Box>
              <Typography sx={{ fontSize: '0.7rem', color: LIVE_GREEN, fontFamily: '"DM Mono", monospace', letterSpacing: '0.06em' }}>
                sun raha hoon...
              </Typography>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice error */}
      {voiceError && (
        <Box sx={{ mx: 1.5, mb: 1, px: 2, py: 1, backgroundColor: alpha('#FF6B6B', 0.1), border: '1px solid rgba(255,107,107,0.2)', borderRadius: '12px' }}>
          <Typography sx={{ fontSize: '0.72rem', color: '#FF8A8A', fontFamily: '"DM Mono", monospace' }}>
            {voiceError}
          </Typography>
        </Box>
      )}

      {/* Quick Questions */}
      <Box
        sx={{
          px: 1.5, py: 1,
          display: 'flex', gap: 0.75,
          overflowX: 'auto',
          flexShrink: 0,
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {QUICK_QUESTIONS.map(q => (
          <Box
            key={q}
            onClick={() => sendMessage(q)}
            sx={{
              whiteSpace: 'nowrap',
              px: 1.5, py: 0.6,
              backgroundColor: '#1A3520',
              color: '#8FA89C',
              borderRadius: '20px',
              fontSize: '0.72rem',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontWeight: 500,
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.07)',
              flexShrink: 0,
              transition: 'all 0.15s ease',
              '&:hover': {
                backgroundColor: alpha(AMBER, 0.1),
                color: AMBER,
                borderColor: alpha(AMBER, 0.3),
              },
              '&:active': { transform: 'scale(0.96)' },
            }}
          >
            {q}
          </Box>
        ))}
      </Box>

      {/* Input area */}
      <Box
        sx={{
          px: 1.5, py: 1.25,
          backgroundColor: '#132B1A',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', gap: 1, alignItems: 'flex-end',
          flexShrink: 0,
        }}
      >
        {/* Voice button */}
        <IconButton
          onClick={handleVoiceToggle}
          sx={{
            width: 42, height: 42, borderRadius: '12px', flexShrink: 0,
            backgroundColor: voiceModeOn ? AMBER : '#1A3520',
            color: voiceModeOn ? '#0D1F14' : '#8FA89C',
            border: `1px solid ${voiceModeOn ? 'transparent' : 'rgba(255,255,255,0.08)'}`,
            boxShadow: voiceModeOn ? `0 4px 16px ${alpha(AMBER, 0.4)}` : 'none',
            '&:hover': {
              backgroundColor: voiceModeOn ? '#F5A055' : alpha(AMBER, 0.1),
              color: voiceModeOn ? '#0D1F14' : AMBER,
            },
            animation: isListening ? 'pulse 1s infinite' : 'none',
          }}
        >
          {voiceModeOn ? <MicOff sx={{ fontSize: 18 }} /> : <Mic sx={{ fontSize: 18 }} />}
        </IconButton>

        <TextField
          fullWidth
          multiline
          maxRows={3}
          size="small"
          placeholder="Hindi mein likho ya bolne ke liye mic dabao..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage(input);
            }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              fontSize: '0.875rem',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              backgroundColor: '#1A3520',
              '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
              '&:hover fieldset': { borderColor: alpha(AMBER, 0.3) },
              '&.Mui-focused fieldset': { borderColor: AMBER },
            },
            '& .MuiInputBase-input::placeholder': { color: '#4A6555', opacity: 1 },
          }}
        />

        <IconButton
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          sx={{
            width: 42, height: 42, borderRadius: '12px', flexShrink: 0,
            background: input.trim() && !loading
              ? 'linear-gradient(135deg, #F5A055, #D4703A)'
              : '#1A3520',
            color: input.trim() && !loading ? '#0D1F14' : '#4A6555',
            border: `1px solid ${input.trim() && !loading ? 'transparent' : 'rgba(255,255,255,0.06)'}`,
            boxShadow: input.trim() && !loading ? `0 4px 16px ${alpha(AMBER, 0.35)}` : 'none',
            '&:disabled': { background: '#1A3520', color: '#4A6555' },
          }}
        >
          <Send sx={{ fontSize: 17 }} />
        </IconButton>
      </Box>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.75; transform: scale(1.08); }
        }
        @keyframes listenWave {
          0%, 100% { height: 6px; opacity: 0.5; }
          50% { height: 28px; opacity: 1; }
        }
      `}</style>
    </Box>
  );
};

export default VoiceChatbot;
