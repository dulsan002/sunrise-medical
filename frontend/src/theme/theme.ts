import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#14B8A6', light: '#5EEAD4', dark: '#0D9488' },
    secondary: { main: '#6366F1', light: '#A5B4FC', dark: '#4F46E5' },
    success: { main: '#10B981' },
    warning: { main: '#F59E0B' },
    error: { main: '#EF4444' },
    background: { default: '#0B0F19', paper: '#111827' },
    text: { primary: '#F9FAFB', secondary: '#9CA3AF' },
    divider: '#1F2937',
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: { fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.875rem' },
    h2: { fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '1.5rem' },
    h3: { fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '1.25rem' },
    h4: { fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '1.125rem' },
    body1: { fontSize: '0.875rem', fontWeight: 400 },
    body2: { fontSize: '0.75rem', fontWeight: 500 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, padding: '8px 20px', transition: 'all 150ms cubic-bezier(0.4,0,0.2,1)' },
        containedPrimary: { background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)', '&:hover': { background: 'linear-gradient(135deg, #5EEAD4 0%, #14B8A6 100%)' } },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { backgroundImage: 'none', border: '1px solid #1F2937', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)' },
      },
    },
    MuiTextField: {
      styleOverrides: { root: { '& .MuiOutlinedInput-root': { borderRadius: 8 } } },
    },
    MuiTableCell: {
      styleOverrides: { head: { fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' } },
    },
  },
});

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0D9488', light: '#14B8A6', dark: '#0F766E' },
    secondary: { main: '#4F46E5', light: '#6366F1', dark: '#4338CA' },
    success: { main: '#16A34A' },
    warning: { main: '#D97706' },
    error: { main: '#DC2626' },
    background: { default: '#F8FAFC', paper: '#FFFFFF' },
    text: { primary: '#0F172A', secondary: '#64748B' },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: { fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.875rem' },
    h2: { fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '1.5rem' },
    h3: { fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '1.25rem' },
    h4: { fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '1.125rem' },
    body1: { fontSize: '0.875rem', fontWeight: 400 },
    body2: { fontSize: '0.75rem', fontWeight: 500 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, padding: '8px 20px', transition: 'all 150ms cubic-bezier(0.4,0,0.2,1)' },
        containedPrimary: { background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)', color: '#fff', '&:hover': { background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)' } },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { backgroundImage: 'none', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' },
      },
    },
    MuiTextField: {
      styleOverrides: { root: { '& .MuiOutlinedInput-root': { borderRadius: 8 } } },
    },
    MuiTableCell: {
      styleOverrides: { head: { fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' } },
    },
  },
});
