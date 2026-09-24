import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, TextField, Button, Typography, Alert, CircularProgress,
  InputAdornment, IconButton, Grid, Paper
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const API_URL = import.meta.env.VITE_API_URL || '';

const ACCENT = '#1A7F37';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail]               = useState('demo@fertobot.com');
  const [password, setPassword]         = useState('demo1234');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const loginAsDemo = () => {
      const demoUser = {
        id: 'demo-farmer-1',
        name: 'Priyanshu (Farmer)',
        email: email || 'demo@fertobot.com',
        role: 'farmer',
      };
      localStorage.setItem('token', 'demo-fertobot-session-token');
      localStorage.setItem('user', JSON.stringify(demoUser));
      navigate('/dashboard');
    };

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        navigate('/dashboard');
        return;
      }

      // If backend responded with 404 (e.g. Railway is down/unreachable), allow demo fallback
      if (res.status === 404 && (email === 'demo@fertobot.com' || !email || password === 'demo1234')) {
        loginAsDemo();
        return;
      }

      const data = await res.json().catch(() => ({}));
      setError(data.message || `Server error ${res.status}`);
    } catch {
      // If server is offline or unreachable, allow demo access so the user is never blocked
      if (email === 'demo@fertobot.com' || !email || password === 'demo1234') {
        loginAsDemo();
        return;
      }
      setError('Cannot reach server. Please try again or use the demo login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container sx={{ minHeight: '100vh', bgcolor: '#F5F8F6' }}>
      {/* Left Side: Branding / Image */}
      <Grid item xs={12} md={5} lg={6} sx={{
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #115926 0%, #1A7F37 100%)',
        color: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
        p: 6,
      }}>
        {/* Background Pattern */}
        <Box sx={{
          position: 'absolute', inset: 0, opacity: 0.1,
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.5) 10px, rgba(255,255,255,0.5) 11px)',
        }} />
        
        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 480 }}>
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                bgcolor: '#FFFFFF',
                borderRadius: '20px',
                px: 3,
                py: 2,
                display: 'inline-flex',
                alignItems: 'center',
                boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
                mb: 2,
              }}
            >
              <Box
                component="img"
                src="/images/fertobot-logo.png"
                alt="FertoBot Logo"
                sx={{ width: 220, height: 'auto', display: 'block' }}
              />
            </Box>
            <Typography sx={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.95)', fontWeight: 600, letterSpacing: '0.02em' }}>
              Farms That Think.
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 400, lineHeight: 1.6 }}>
            Precision agriculture OS designed to optimize yield, monitor soil health, and automate irrigation seamlessly.
          </Typography>
        </Box>
      </Grid>

      {/* Right Side: Login Form */}
      <Grid item xs={12} md={7} lg={6} sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 3, sm: 6 },
      }}>
        <Paper elevation={0} sx={{
          width: '100%', maxWidth: 420,
          p: { xs: 4, sm: 5 },
          borderRadius: 4,
          boxShadow: '0 12px 40px rgba(0,0,0,0.06)',
          bgcolor: '#FFFFFF',
        }}>
          
          <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Box
              component="img"
              src="/images/fertobot-logo.png"
              alt="FertoBot Logo"
              sx={{ width: 190, height: 'auto', display: 'block', mb: 0.75 }}
            />
            <Typography sx={{ fontSize: '0.82rem', color: '#6B7280', fontWeight: 600 }}>
              Farms That Think.
            </Typography>
          </Box>

          <Typography variant="h4" sx={{ mb: 1, color: '#111827', display: { xs: 'none', md: 'block' } }}>
            Welcome back
          </Typography>
          <Typography variant="body1" sx={{ color: '#6B7280', mb: 4 }}>
            Sign in to access your field station.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              fullWidth required autoComplete="email"
              sx={{ mb: 2.5 }}
            />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth required autoComplete="current-password"
              sx={{ mb: 4 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(p => !p)} edge="end" sx={{ color: '#9CA3AF' }}>
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{
              py: 1.5,
              fontSize: '1rem',
            }}>
              {loading ? <CircularProgress size={24} sx={{ color: '#FFFFFF' }} /> : 'Sign In'}
            </Button>
          </form>

          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <Typography sx={{
              color: '#6B7280', display: 'block', textAlign: 'center',
              fontFamily: '"DM Mono", monospace', fontSize: '0.75rem', letterSpacing: '0.05em',
            }}>
              demo@fertobot.com · demo1234
            </Typography>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}
