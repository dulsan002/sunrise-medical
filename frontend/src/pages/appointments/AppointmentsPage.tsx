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

interface Appointment {
  appointmentId: number;
  appointmentNumber: string;
  patientId: number;
  patientName: string;
  patientContact: string;
  dentistId: number;
  dentistName: string;
  treatmentId: number;
  treatmentName: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
}

interface DropdownItem {
  id: number;
  name: string;
}

const AppointmentsPage: React.FC = () => {
  const { hasPermission, permissions } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<DropdownItem[]>([]);
  const [dentists, setDentists] = useState<DropdownItem[]>([]);
  const [treatments, setTreatments] = useState<DropdownItem[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog States
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Form Fields
  const [patientId, setPatientId] = useState<number | ''>('');
  const [dentistId, setDentistId] = useState<number | ''>('');
  const [treatmentId, setTreatmentId] = useState<number | ''>('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [status, setStatus] = useState('SCHEDULED');
  const [notes, setNotes] = useState('');

  const canCreate = hasPermission('APPOINTMENTS', 'create');
  const canRead = hasPermission('APPOINTMENTS', 'read');
  const canUpdate = hasPermission('APPOINTMENTS', 'update');
  const canDelete = hasPermission('APPOINTMENTS', 'delete');

  useEffect(() => {
    fetchAppointments();
    fetchDropdowns();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/appointments');
      setAppointments(response.data);
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [patRes, denRes, trtRes] = await Promise.all([
        axiosInstance.get('/patients'),
        axiosInstance.get('/dentists'),
        axiosInstance.get('/treatments')
      ]);
      setPatients(patRes.data.map((p: any) => ({ id: p.patientId, name: `${p.fullName} (${p.patientCode})` })));
      setDentists(denRes.data.map((d: any) => ({ id: d.dentistId, name: d.fullName })));
      setTreatments(trtRes.data.map((t: any) => ({ id: t.treatmentId, name: `${t.treatmentName} (Rs. ${t.standardCharge})` })));
    } catch (err) {
      console.error('Error loading dropdown data:', err);
    }
  };

  const handleOpenAdd = () => {
    setError(null);
    setSelectedAppointment(null);
    setPatientId('');
    setDentistId('');
    setTreatmentId('');
    setAppointmentDate('');
    setStartTime('');
    setStatus('SCHEDULED');
    setNotes('');
    setOpenDialog(true);
  };

  const handleOpenEdit = (app: Appointment) => {
    setError(null);
    setSelectedAppointment(app);
    setPatientId(app.patientId);
    setDentistId(app.dentistId);
    setTreatmentId(app.treatmentId);
    setAppointmentDate(app.appointmentDate);
    // Format startTime (remove seconds if present)
    setStartTime(app.startTime.substring(0, 5));
    setStatus(app.status);
    setNotes(app.notes || '');
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      if (!dentistId || !treatmentId || !appointmentDate || !startTime) {
        setError('Please fill in all required fields.');
        return;
      }

      // Format start time to include seconds if needed (HH:mm:ss)
      const formattedTime = startTime.length === 5 ? `${startTime}:00` : startTime;

      if (selectedAppointment) {
        const payload = {
          dentistId,
          treatmentId,
          appointmentDate,
          startTime: formattedTime,
          status,
          notes
        };
        await axiosInstance.put(`/appointments/${selectedAppointment.appointmentId}`, payload);
      } else {
        if (!patientId) {
          setError('Patient selection is required.');
          return;
        }
        const payload = {
          patientId,
          dentistId,
          treatmentId,
          appointmentDate,
          startTime: formattedTime
        };
        await axiosInstance.post('/appointments', payload);
      }
      setOpenDialog(false);
      fetchAppointments();
    } catch (err: any) {
      console.error('Error saving appointment:', err);
      setError(err.response?.data?.message || 'Failed to save appointment. Verify details.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    try {
      await axiosInstance.delete(`/appointments/${id}`);
      fetchAppointments();
    } catch (err: any) {
      console.error('Error deleting appointment:', err);
      setError('Failed to delete appointment.');
    }
  };

  const filteredAppointments = appointments.filter((app) => 
    app.appointmentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.patientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: GridColDef[] = [
    { field: 'appointmentNumber', headerName: 'Apt Number', width: 110 },
    { field: 'appointmentDate', headerName: 'Date', width: 110 },
    { field: 'startTime', headerName: 'Start', width: 80 },
    { field: 'endTime', headerName: 'End', width: 80 },
    { field: 'patientName', headerName: 'Patient', flex: 1, minWidth: 140 },
    { field: 'dentistName', headerName: 'Dentist', flex: 1, minWidth: 140 },
    { field: 'treatmentName', headerName: 'Treatment', flex: 1, minWidth: 140 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        let color: 'success' | 'warning' | 'error' | 'default' = 'default';
        if (params.value === 'SCHEDULED' || params.value === 'CONFIRMED') color = 'warning';
        if (params.value === 'COMPLETED') color = 'success';
        if (params.value === 'CANCELLED' || params.value === 'NO_SHOW') color = 'error';

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
              onClick={() => handleOpenEdit(params.row as Appointment)}
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
              onClick={() => handleDelete(params.row.appointmentId)}
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
        <Typography color="text.secondary">You do not have permission to view appointments.</Typography>
      </Box>
    );
  }

  return (
    <Box className="animate-fade-in" sx={{ p: 3, maxWidth: '100%', px: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
          Appointments
        </Typography>
        {canCreate && (
          <Button variant="contained" color="primary" onClick={handleOpenAdd}>
            + New Appointment
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)' }}>
        <SearchIcon sx={{ color: 'text.secondary' }} />
        <TextField
          variant="standard"
          placeholder="Search by Appointment Number or Patient Name..."
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
          rows={filteredAppointments}
          columns={columns}
          getRowId={(row) => row.appointmentId}
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
          {selectedAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}
        </DialogTitle>
        <DialogContent dividers>
          {error && openDialog && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <Stack spacing={2} sx={{ mt: 1 }}>
            
            {/* Patient - can only select on Create */}
            <Autocomplete
              options={patients}
              getOptionLabel={(option) => option.name}
              value={patients.find((p) => p.id === patientId) || null}
              onChange={(_, newValue) => setPatientId(newValue ? newValue.id : '')}
              disabled={!!selectedAppointment}
              fullWidth
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Patient" 
                  helperText={selectedAppointment ? "Patient cannot be modified after booking" : ""} 
                />
              )}
            />

            <Autocomplete
              options={dentists}
              getOptionLabel={(option) => option.name}
              value={dentists.find((d) => d.id === dentistId) || null}
              onChange={(_, newValue) => setDentistId(newValue ? newValue.id : '')}
              fullWidth
              renderInput={(params) => <TextField {...params} label="Assign Dentist" />}
            />

            <Autocomplete
              options={treatments}
              getOptionLabel={(option) => option.name}
              value={treatments.find((t) => t.id === treatmentId) || null}
              onChange={(_, newValue) => setTreatmentId(newValue ? newValue.id : '')}
              fullWidth
              renderInput={(params) => <TextField {...params} label="Treatment Procedure" />}
            />

            <Stack direction="row" spacing={2}>
              <TextField 
                label="Appointment Date" 
                type="date" 
                value={appointmentDate} 
                onChange={(e) => setAppointmentDate(e.target.value)} 
                fullWidth 
                InputLabelProps={{ shrink: true }} 
              />
              <TextField 
                label="Start Time" 
                type="time" 
                value={startTime} 
                onChange={(e) => setStartTime(e.target.value)} 
                fullWidth 
                InputLabelProps={{ shrink: true }} 
              />
            </Stack>

            {selectedAppointment && (
              <TextField
                select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                fullWidth
              >
                <MenuItem value="SCHEDULED">Scheduled</MenuItem>
                <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
                <MenuItem value="NO_SHOW">No Show</MenuItem>
              </TextField>
            )}

            <TextField 
              label="Notes" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              fullWidth 
              multiline 
              rows={2} 
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit">Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">Confirm Appointment</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AppointmentsPage;
