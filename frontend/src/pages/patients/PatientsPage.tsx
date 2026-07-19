import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Chip, Alert, TextField, Button, 
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, 
  IconButton, Stack 
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../hooks/useAuth';
import axiosInstance from '../../api/axiosConfig';

interface Patient {
  patientId: number;
  patientCode: string;
  fullName: string;
  nic: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  telephone: string;
  email: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  medicalNotes: string;
  bloodGroup: string;
  status: string;
}

const PatientsPage: React.FC = () => {
  const { hasPermission, permissions } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [nic, setNic] = useState('');
  const [gender, setGender] = useState('MALE');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [bloodGroup, setBloodGroup] = useState('A_POSITIVE');
  const [status, setStatus] = useState('ACTIVE');

  const canCreate = hasPermission('PATIENTS', 'create');
  const canRead = hasPermission('PATIENTS', 'read');
  const canUpdate = hasPermission('PATIENTS', 'update');
  const canDelete = hasPermission('PATIENTS', 'delete');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/patients');
      setPatients(response.data);
    } catch (err: any) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setError(null);
    setSelectedPatient(null);
    setFullName('');
    setNic('');
    setGender('MALE');
    setDateOfBirth('');
    setAddress('');
    setTelephone('');
    setEmail('');
    setEmergencyContactName('');
    setEmergencyContactPhone('');
    setMedicalNotes('');
    setBloodGroup('A_POSITIVE');
    setStatus('ACTIVE');
    setOpenDialog(true);
  };

  const handleOpenEdit = (patient: Patient) => {
    setError(null);
    setSelectedPatient(patient);
    setFullName(patient.fullName);
    setNic(patient.nic);
    setGender(patient.gender);
    setDateOfBirth(patient.dateOfBirth);
    setAddress(patient.address);
    setTelephone(patient.telephone);
    setEmail(patient.email || '');
    setEmergencyContactName(patient.emergencyContactName);
    setEmergencyContactPhone(patient.emergencyContactPhone);
    setMedicalNotes(patient.medicalNotes || '');
    setBloodGroup(patient.bloodGroup || 'A_POSITIVE');
    setStatus(patient.status);
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        fullName,
        nic,
        gender,
        dateOfBirth,
        address,
        telephone,
        email,
        emergencyContactName,
        emergencyContactPhone,
        medicalNotes,
        bloodGroup,
        status
      };

      if (selectedPatient) {
        await axiosInstance.put(`/patients/${selectedPatient.patientId}`, payload);
      } else {
        await axiosInstance.post('/patients', payload);
      }
      setOpenDialog(false);
      fetchPatients();
    } catch (err: any) {
      console.error('Error saving patient:', err);
      let errMsg = 'Failed to save patient. Please verify values.';
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        errMsg = err.response.data.errors.map((e: any) => e.message).join(', ');
      } else if (err.response?.data?.message) {
        errMsg = err.response.data.message;
      }
      setError(errMsg);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) return;
    try {
      await axiosInstance.delete(`/patients/${id}`);
      fetchPatients();
    } catch (err: any) {
      console.error('Error deleting patient:', err);
      setError('Failed to delete patient.');
    }
  };

  const filteredPatients = patients.filter((pat) => 
    pat.patientCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pat.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pat.nic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: GridColDef[] = [
    { field: 'patientCode', headerName: 'Code', width: 100 },
    { field: 'fullName', headerName: 'Full Name', flex: 1, minWidth: 150 },
    { field: 'nic', headerName: 'NIC', width: 130 },
    { field: 'gender', headerName: 'Gender', width: 90 },
    { field: 'dateOfBirth', headerName: 'DOB', width: 110 },
    { field: 'telephone', headerName: 'Telephone', width: 120 },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => {
        const isActive = params.value === 'ACTIVE';
        return (
          <Chip 
            label={params.value} 
            color={isActive ? 'success' : 'error'} 
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
              onClick={() => handleOpenEdit(params.row as Patient)}
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
              onClick={() => handleDelete(params.row.patientId)}
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
        <Typography color="text.secondary">You do not have permission to view patients records.</Typography>
      </Box>
    );
  }

  return (
    <Box className="animate-fade-in" sx={{ p: 3, maxWidth: '100%', px: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
          Patients Registry
        </Typography>
        {canCreate && (
          <Button variant="contained" color="primary" onClick={handleOpenAdd}>
            + New Patient
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)' }}>
        <SearchIcon sx={{ color: 'text.secondary' }} />
        <TextField
          variant="standard"
          placeholder="Search by Patient Code, Name or NIC..."
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
          rows={filteredPatients}
          columns={columns}
          getRowId={(row) => row.patientId}
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
          {selectedPatient ? 'Edit Patient Details' : 'Register New Patient'}
        </DialogTitle>
        <DialogContent dividers>
          {error && openDialog && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField 
              label="Full Name" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              fullWidth 
              variant="outlined" 
            />
            <TextField 
              label="NIC" 
              value={nic} 
              onChange={(e) => setNic(e.target.value)} 
              fullWidth 
              variant="outlined" 
              placeholder="e.g. 199512345678 or 951234567v"
            />
            <Stack direction="row" spacing={2}>
              <TextField
                select
                label="Gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                fullWidth
              >
                <MenuItem value="MALE">Male</MenuItem>
                <MenuItem value="FEMALE">Female</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </TextField>
              <TextField 
                label="Date of Birth" 
                type="date" 
                value={dateOfBirth} 
                onChange={(e) => setDateOfBirth(e.target.value)} 
                fullWidth 
                InputLabelProps={{ shrink: true }} 
              />
            </Stack>
            <TextField 
              label="Address" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
              fullWidth 
              multiline 
              rows={2} 
            />
            <Stack direction="row" spacing={2}>
              <TextField 
                label="Telephone" 
                value={telephone} 
                onChange={(e) => setTelephone(e.target.value)} 
                fullWidth 
              />
              <TextField 
                label="Email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                fullWidth 
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField 
                label="Emergency Contact Name" 
                value={emergencyContactName} 
                onChange={(e) => setEmergencyContactName(e.target.value)} 
                fullWidth 
              />
              <TextField 
                label="Emergency Contact Phone" 
                value={emergencyContactPhone} 
                onChange={(e) => setEmergencyContactPhone(e.target.value)} 
                fullWidth 
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                select
                label="Blood Group"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                fullWidth
              >
                <MenuItem value="A_POSITIVE">A+</MenuItem>
                <MenuItem value="A_NEGATIVE">A-</MenuItem>
                <MenuItem value="B_POSITIVE">B+</MenuItem>
                <MenuItem value="B_NEGATIVE">B-</MenuItem>
                <MenuItem value="O_POSITIVE">O+</MenuItem>
                <MenuItem value="O_NEGATIVE">O-</MenuItem>
                <MenuItem value="AB_POSITIVE">AB+</MenuItem>
                <MenuItem value="AB_NEGATIVE">AB-</MenuItem>
              </TextField>
              <TextField
                select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                fullWidth
              >
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
              </TextField>
            </Stack>
            <TextField 
              label="Medical Notes / Allergies" 
              value={medicalNotes} 
              onChange={(e) => setMedicalNotes(e.target.value)} 
              fullWidth 
              multiline 
              rows={2} 
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit">Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">Save Details</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PatientsPage;
