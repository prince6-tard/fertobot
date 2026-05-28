import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, TextField, Button, Typography, Alert, CircularProgress,
  InputAdornment, IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const API_URL = import.meta.env.VITE_API_URL || 'https://fertobot-production.up.railway.app';

const ACCENT = '#A8FF3E';
const TEAL   = '#00E5C6';
const BG     = '#060C08';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || `Server error ${res.status}`);
        return;
      }
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      navigate('/dashboard');
    } catch {
      setError('Cannot reach server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      background: [
        `radial-gradient(ellipse 80% 55% at 50% 110%, rgba(168,255,62,0.08) 0%, transparent 55%)`,
        `radial-gradient(ellipse 60% 40% at 15% -5%, rgba(0,229,198,0.06) 0%, transparent 50%)`,
        `radial-gradient(ellipse 50% 35% at 85% 15%, rgba(168,255,62,0.04) 0%, transparent 45%)`,
        BG,
      ].join(', '),
    }}>
      {/* Grid texture */}
      <Box sx={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(168,255,62,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(168,255,62,0.025) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }} />

      {/* Decorative rings */}
      {[480, 680, 900].map((sz, i) => (
        <Box key={sz} sx={{
          position: 'absolute', bottom: `-${160 + i * 80}px`, left: '50%',
          transform: 'translateX(-50%)',
          width: sz, height: sz, borderRadius: '50%',
          border: `1px solid rgba(168,255,62,${0.05 - i * 0.015})`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Card */}
      <Box sx={{
        width: '100%', maxWidth: 400, mx: 2.5,
        p: { xs: 3.5, sm: 4.5 },
        backgroundColor: '#0A1410',
        border: '1px solid rgba(168,255,62,0.12)',
        borderRadius: '20px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(168,255,62,0.04)',
        position: 'relative', zIndex: 1,
        backdropFilter: 'blur(16px)',
      }}>
        {/* Inner glow */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(168,255,62,0.15), transparent)', borderRadius: '20px 20px 0 0', pointerEvents: 'none' }} />

        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{
            width: 62, height: 62, borderRadius: '18px', mx: 'auto', mb: 2.5,
            background: 'linear-gradient(135deg, #A8FF3E 0%, #5AC800 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(168,255,62,0.35), 0 0 0 1px rgba(168,255,62,0.2)',
            fontSize: '1.7rem', lineHeight: 1, position: 'relative', overflow: 'hidden',
          }}>
            🌿
            <Box sx={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.5) 4px, rgba(255,255,255,0.5) 5px)' }} />
          </Box>
          <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.7rem', color: '#E2F0E8', letterSpacing: '-0.03em', mb: 0.3 }}>
            FertoBot
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.6 }}>
            <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: ACCENT, animation: 'pulse-dot 2s ease-in-out infinite' }} />
            <Typography sx={{ fontSize: '0.62rem', color: '#4A6E55', fontFamily: '"DM Mono", monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Precision Agriculture OS
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{
            mb: 2.5, borderRadius: '10px',
            backgroundColor: 'rgba(255,69,101,0.08)',
            border: '1px solid rgba(255,69,101,0.2)',
            color: '#FF4565',
            '& .MuiAlert-icon': { color: '#FF4565' },
            fontFamily: '"Figtree", sans-serif',
          }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth required autoComplete="email"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(168,255,62,0.03)',
                '& fieldset': { borderColor: 'rgba(168,255,62,0.1)' },
                '&:hover fieldset': { borderColor: 'rgba(168,255,62,0.25)' },
                '&.Mui-focused fieldset': { borderColor: ACCENT },
              },
              '& .MuiInputLabel-root': { color: '#4A6E55', fontFamily: '"Figtree", sans-serif', '&.Mui-focused': { color: ACCENT } },
              '& .MuiOutlinedInput-input': { color: '#D8EDE0', fontFamily: '"Figtree", sans-serif' },
            }}
          />
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth required autoComplete="current-password"
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(168,255,62,0.03)',
                '& fieldset': { borderColor: 'rgba(168,255,62,0.1)' },
                '&:hover fieldset': { borderColor: 'rgba(168,255,62,0.25)' },
                '&.Mui-focused fieldset': { borderColor: ACCENT },
              },
              '& .MuiInputLabel-root': { color: '#4A6E55', fontFamily: '"Figtree", sans-serif', '&.Mui-focused': { color: ACCENT } },
              '& .MuiOutlinedInput-input': { color: '#D8EDE0', fontFamily: '"Figtree", sans-serif' },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(p => !p)} edge="end" sx={{ color: '#4A6E55', '&:hover': { color: ACCENT } }}>
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{
            py: 1.75, borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem',
            fontFamily: '"Syne", sans-serif', letterSpacing: '0.01em',
            background: `linear-gradient(135deg, ${ACCENT} 0%, #7ACC1C 100%)`,
            color: '#060C08',
            boxShadow: `0 8px 24px rgba(168,255,62,0.3)`,
            '&:hover': {
              background: 'linear-gradient(135deg, #C4FF75 0%, #A8FF3E 100%)',
              boxShadow: '0 12px 32px rgba(168,255,62,0.45)',
            },
            '&:disabled': { background: '#1A2D22', color: '#3E5A48', boxShadow: 'none' },
          }}>
            {loading ? <CircularProgress size={22} sx={{ color: '#3E5A48' }} /> : 'Access Field Station'}
          </Button>
        </form>

        <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(168,255,62,0.06)' }}>
          <Typography sx={{
            color: '#3E5A48', display: 'block', textAlign: 'center',
            fontFamily: '"DM Mono", monospace', fontSize: '0.62rem', letterSpacing: '0.06em',
          }}>
            demo@fertobot.com · demo1234
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
