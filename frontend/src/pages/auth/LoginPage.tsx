import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, TextField, Button, Typography, CircularProgress, Alert,
  InputAdornment, IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import axiosInstance from '../../api/axiosConfig';
import { useAuth } from '../../hooks/useAuth';
import { ThemeContext } from '../../context/ThemeContext';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const { mode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axiosInstance.post('/auth/login', { username, password });
      const { token, role, fullName, profileImageUrl } = response.data;
      await login(token, role, fullName, profileImageUrl);
      navigate('/dashboard');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string }; status?: number } };
        if (axiosErr.response?.status === 423) {
          setError('Account locked. Contact your administrator.');
        } else {
          setError(axiosErr.response?.data?.message || 'Invalid username or password');
        }
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: mode === 'dark'
          ? 'linear-gradient(135deg, #0B0F19 0%, #111827 50%, #0B0F19 100%)'
          : 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 50%, #F8FAFC 100%)',
        p: 2,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 420,
          p: 5,
          borderRadius: '16px',
          border: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          overflow: 'visible',
        }}
        className="animate-fade-in"
      >
        {/* Brand Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{
            width: 56, height: 56, borderRadius: '14px', mx: 'auto', mb: 2,
            background: 'linear-gradient(135deg, #14B8A6 0%, #6366F1 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', fontWeight: 700, color: '#fff',
            boxShadow: '0 8px 24px rgba(20,184,166,0.3)',
          }}>
            SD
          </Box>
          <Typography variant="h1" sx={{ fontSize: '1.5rem', mb: 0.5 }}>
            Sunrise Dental
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Clinic Management System
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            id="login-username"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            required
            autoFocus
            sx={{ mb: 2 }}
          />
          <TextField
            id="login-password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            sx={{ mb: 3 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            id="login-submit"
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading || !username || !password}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <LoginIcon />}
            sx={{ py: 1.5, fontSize: '0.95rem' }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 3, fontSize: '0.7rem' }}>
          © 2026 Sunrise Dental Clinic — All Rights Reserved
        </Typography>
      </Card>
    </Box>
  );
};

export default LoginPage;
