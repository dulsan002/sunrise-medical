import React, { useState } from 'react';
import { Box, Typography, TextField, Paper, InputAdornment, Stack, Chip, Divider, List, ListItem, ListItemText, CircularProgress, Alert } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axiosInstance from '../../api/axiosConfig';

interface SearchResult {
  id: string | number;
  title: string;
  subtitle: string;
  type: 'Patient' | 'Dentist' | 'Appointment' | 'Bill' | 'Visit';
  detailsUrl: string;
}

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.trim().length < 2) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Perform parallel fetches
      const [patRes, denRes, appRes, billRes] = await Promise.all([
        axiosInstance.get('/patients'),
        axiosInstance.get('/dentists'),
        axiosInstance.get('/appointments'),
        axiosInstance.get('/bills')
      ]);

      const matched: SearchResult[] = [];
      const term = val.toLowerCase();

      // Filter Patients
      patRes.data.forEach((p: any) => {
        if (p.fullName.toLowerCase().includes(term) || p.patientCode.toLowerCase().includes(term) || p.nic.toLowerCase().includes(term)) {
          matched.push({
            id: `pat-${p.patientId}`,
            title: p.fullName,
            subtitle: `Patient Code: ${p.patientCode} | NIC: ${p.nic}`,
            type: 'Patient',
            detailsUrl: '/patients'
          });
        }
      });

      // Filter Dentists
      denRes.data.forEach((d: any) => {
        if (d.fullName.toLowerCase().includes(term) || d.specialization.toLowerCase().includes(term)) {
          matched.push({
            id: `den-${d.dentistId}`,
            title: d.fullName,
            subtitle: `Specialization: ${d.specialization} | License: ${d.licenseNumber}`,
            type: 'Dentist',
            detailsUrl: '/dentists'
          });
        }
      });

      // Filter Appointments
      appRes.data.forEach((a: any) => {
        if (a.appointmentNumber.toLowerCase().includes(term) || a.patientName.toLowerCase().includes(term)) {
          matched.push({
            id: `app-${a.appointmentId}`,
            title: `Appointment ${a.appointmentNumber}`,
            subtitle: `Patient: ${a.patientName} | Date: ${a.appointmentDate} | Status: ${a.status}`,
            type: 'Appointment',
            detailsUrl: '/appointments'
          });
        }
      });

      // Filter Bills
      billRes.data.forEach((b: any) => {
        if (b.billNumber.toLowerCase().includes(term) || b.patientName.toLowerCase().includes(term)) {
          matched.push({
            id: `bill-${b.billId}`,
            title: `Invoice ${b.billNumber}`,
            subtitle: `Patient: ${b.patientName} | Total: Rs. ${b.finalTotal.toFixed(2)} | Status: ${b.paymentStatus}`,
            type: 'Bill',
            detailsUrl: '/billing'
          });
        }
      });

      setResults(matched);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Global search failed to fetch latest records.');
    } finally {
      setLoading(false);
    }
  };

  const getChipColor = (type: string) => {
    switch (type) {
      case 'Patient': return 'primary';
      case 'Dentist': return 'secondary';
      case 'Appointment': return 'warning';
      case 'Bill': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box className="animate-fade-in" sx={{ p: 3, maxWidth: '100%', px: { xs: 2, md: 4 } }}>
      <Typography variant="h4" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, mb: 3 }}>
        Global Clinic Search
      </Typography>

      <Paper sx={{ p: 1.5, mb: 4, borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)' }}>
        <TextField
          fullWidth
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Type to search patients, dentists, appointments or invoices..."
          variant="standard"
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="start" sx={{ pl: 1 }}>
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: loading && <CircularProgress size={20} />
          }}
        />
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {results.length > 0 ? (
        <Paper sx={{ borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          <List disablePadding>
            {results.map((res, index) => (
              <React.Fragment key={res.id}>
                {index > 0 && <Divider />}
                <ListItem sx={{ py: 2, px: 3, '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' } }}>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{res.title}</Typography>
                        <Chip label={res.type} size="small" color={getChipColor(res.type)} variant="filled" />
                      </Stack>
                    }
                    secondary={res.subtitle}
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Paper>
      ) : (
        query.trim().length >= 2 && !loading && (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography color="text.secondary">No matching records found for "{query}".</Typography>
          </Paper>
        )
      )}
    </Box>
  );
};

export default SearchPage;
