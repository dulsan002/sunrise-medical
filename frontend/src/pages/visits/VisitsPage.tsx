import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Chip, Alert, TextField, Button, 
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, 
  IconButton, Stack, Autocomplete 
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../hooks/useAuth';
import axiosInstance from '../../api/axiosConfig';

interface Visit {
  visitId: number;
  visitNumber: string;
  appointmentNumber: string;
  patientName: string;
  dentistName: string;
  visitDate: string;
  diagnosis: string;
  prescription: string;
  dentistNotes: string;
  treatmentStatus: string;
  followUpDate?: string;
}

interface AppointmentDropdown {
  appointmentId: number;
  label: string;
}

const VisitsPage: React.FC = () => {
  const { hasPermission, permissions } = useAuth();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [appointments, setAppointments] = useState<AppointmentDropdown[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);

  // Form states
  const [appointmentId, setAppointmentId] = useState<number | ''>('');
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [dentistNotes, setDentistNotes] = useState('');
  const [treatmentStatus, setTreatmentStatus] = useState('COMPLETED');
  const [followUpDate, setFollowUpDate] = useState('');

  const canCreate = hasPermission('VISITS', 'create');
  const canRead = hasPermission('VISITS', 'read');
  const canUpdate = hasPermission('VISITS', 'update');
  const canDelete = hasPermission('VISITS', 'delete');

  useEffect(() => {
    fetchVisits();
    fetchAppointments();
  }, []);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/visits');
      setVisits(response.data);
    } catch (err: any) {
      console.error('Error fetching visits:', err);
      setError('Failed to load visit records.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await axiosInstance.get('/appointments');
      // Let's filter scheduled or confirmed appointments to add a clinical visit
      const filtered = response.data
        .filter((app: any) => app.status !== 'CANCELLED' && app.status !== 'NO_SHOW')
        .map((app: any) => ({
          appointmentId: app.appointmentId,
          label: `${app.appointmentNumber} - ${app.patientName} (${app.treatmentName})`
        }));
      setAppointments(filtered);
    } catch (err) {
      console.error('Error fetching appointments for dropdown:', err);
    }
  };

  const handleOpenAdd = () => {
    setError(null);
    setSelectedVisit(null);
    setAppointmentId('');
    setDiagnosis('');
    setPrescription('');
    setDentistNotes('');
    setTreatmentStatus('COMPLETED');
    setFollowUpDate('');
    setOpenDialog(true);
  };

  const handleOpenEdit = (visit: Visit) => {
    setError(null);
    setSelectedVisit(visit);
    setDiagnosis(visit.diagnosis || '');
    setPrescription(visit.prescription || '');
    setDentistNotes(visit.dentistNotes || '');
    setTreatmentStatus(visit.treatmentStatus);
    setFollowUpDate(visit.followUpDate || '');
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        appointmentId: selectedVisit ? undefined : appointmentId,
        diagnosis,
        prescription,
        dentistNotes,
        treatmentStatus,
        followUpDate: followUpDate || null
      };

      if (selectedVisit) {
        await axiosInstance.put(`/visits/${selectedVisit.visitId}`, payload);
      } else {
        if (!appointmentId) {
          setError('Appointment selection is required.');
          return;
        }
        await axiosInstance.post('/visits', payload);
      }
      setOpenDialog(false);
      fetchVisits();
    } catch (err: any) {
      console.error('Error saving visit:', err);
      setError(err.response?.data?.message || 'Failed to save visit record.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this clinical record?')) return;
    try {
      await axiosInstance.delete(`/visits/${id}`);
      fetchVisits();
    } catch (err: any) {
      console.error('Error deleting visit:', err);
      setError('Failed to delete visit record.');
    }
  };

  const filteredVisits = visits.filter((v) => 
    v.visitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: GridColDef[] = [
    { field: 'visitNumber', headerName: 'Visit No', width: 110 },
    { field: 'visitDate', headerName: 'Date', width: 110 },
    { field: 'patientName', headerName: 'Patient Name', flex: 1, minWidth: 150 },
    { field: 'dentistName', headerName: 'Dentist', flex: 1, minWidth: 150 },
    { field: 'diagnosis', headerName: 'Diagnosis', flex: 1.5, minWidth: 200 },
    {
      field: 'treatmentStatus',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => {
        let color: 'success' | 'warning' | 'info' | 'default' = 'default';
        if (params.value === 'COMPLETED') color = 'success';
        if (params.value === 'IN_PROGRESS') color = 'warning';
        if (params.value === 'FOLLOW_UP_REQUIRED') color = 'info';

        return (
          <Chip 
            label={params.value} 
            color={color} 
            size="small"
            variant="filled"
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          {canUpdate && (
            <IconButton 
              size="small" 
              onClick={() => handleOpenEdit(params.row as Visit)}
              sx={{ 
                color: 'primary.main',
                backgroundColor: 'rgba(13, 148, 136, 0.08)',
                '&:hover': {
                  backgroundColor: 'rgba(13, 148, 136, 0.15)',
                },
                borderRadius: '8px',
                p: 0.75
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          {canDelete && (
            <IconButton 
              size="small" 
              onClick={() => handleDelete(params.row.visitId)}
              sx={{ 
                color: 'error.main',
                backgroundColor: 'rgba(220, 38, 38, 0.08)',
                '&:hover': {
                  backgroundColor: 'rgba(220, 38, 38, 0.15)',
                },
                borderRadius: '8px',
                p: 0.75
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      )
    }
  ];

  if (permissions.length > 0 && !canRead) {
    return (
      <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Typography variant="h5" color="error" sx={{ mb: 2, fontWeight: 600 }}>Access Denied</Typography>
        <Typography color="text.secondary">You do not have permission to view visit records.</Typography>
      </Box>
    );
  }

  return (
    <Box className="animate-fade-in" sx={{ p: 3, maxWidth: '100%', px: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
          Patient Visits & Charts
        </Typography>
        {canCreate && (
          <Button variant="contained" color="primary" onClick={handleOpenAdd}>
            + Record Visit
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)' }}>
        <SearchIcon sx={{ color: 'text.secondary' }} />
        <TextField
          variant="standard"
          placeholder="Search by Visit Number, Patient Name or Diagnosis..."
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{ disableUnderline: true }}
        />
      </Paper>
      
      {error && !openDialog && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper 
        elevation={0} 
        sx={{ 
          height: 600, 
          width: '100%', 
          borderRadius: 3, 
          border: '1px solid rgba(255,255,255,0.1)',
          overflow: 'hidden',
          backgroundColor: 'background.paper',
        }}
      >
        <DataGrid
          rows={filteredVisits}
          columns={columns}
          getRowId={(row) => row.visitId}
          loading={loading}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell:focus': { outline: 'none' },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'rgba(255,255,255,0.02)',
            },
          }}
        />
      </Paper>

      {/* Add / Edit Dialog */}
      <Dialog open={openDialog} onClose={() => { setOpenDialog(false); setError(null); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
          {selectedVisit ? 'Edit Visit Notes' : 'Record New Visit'}
        </DialogTitle>
        <DialogContent dividers>
          {error && openDialog && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <Stack spacing={2} sx={{ mt: 1 }}>
            
            {/* Appointment - select only on Create */}
            {!selectedVisit && (
              <Autocomplete
                options={appointments}
                getOptionLabel={(option) => option.label}
                value={appointments.find((a) => a.appointmentId === appointmentId) || null}
                onChange={(_, newValue) => setAppointmentId(newValue ? newValue.appointmentId : '')}
                fullWidth
                renderInput={(params) => <TextField {...params} label="Select Appointment" />}
              />
            )}

            <TextField 
              label="Diagnosis" 
              value={diagnosis} 
              onChange={(e) => setDiagnosis(e.target.value)} 
              fullWidth 
              multiline 
              rows={2} 
            />

            <TextField 
              label="Prescription & Dosage" 
              value={prescription} 
              onChange={(e) => setPrescription(e.target.value)} 
              fullWidth 
              multiline 
              rows={2} 
            />

            <TextField 
              label="Dentist Clinical Notes" 
              value={dentistNotes} 
              onChange={(e) => setDentistNotes(e.target.value)}
              fullWidth 
              multiline 
              rows={2} 
            />

            <Stack direction="row" spacing={2}>
              <TextField
                select
                label="Treatment Status"
                value={treatmentStatus}
                onChange={(e) => setTreatmentStatus(e.target.value)}
                fullWidth
              >
                <MenuItem value="PLANNED">Planned</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="FOLLOW_UP_REQUIRED">Follow up required</MenuItem>
              </TextField>
              <TextField 
                label="Follow-up Date" 
                type="date" 
                value={followUpDate} 
                onChange={(e) => setFollowUpDate(e.target.value)} 
                fullWidth 
                InputLabelProps={{ shrink: true }} 
              />
            </Stack>

          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit">Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">Save Record</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VisitsPage;
