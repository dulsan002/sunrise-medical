import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Chip, Alert, Button, IconButton, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, 
  MenuItem, Stack 
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../hooks/useAuth';
import axiosInstance from '../../api/axiosConfig';

interface Dentist {
  dentistId: number;
  dentistCode: string;
  fullName: string;
  specialization: string;
  qualifications: string;
  licenseNumber: string;
  telephone: string;
  email: string;
  joinedDate: string;
  status: string;
  consultationFee: number;
}

const DentistsPage: React.FC = () => {
  const { hasPermission, permissions } = useAuth();
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDentist, setSelectedDentist] = useState<Dentist | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [joinedDate, setJoinedDate] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [consultationFee, setConsultationFee] = useState('');

  const canCreate = hasPermission('DENTISTS', 'create');
  const canRead = hasPermission('DENTISTS', 'read');
  const canUpdate = hasPermission('DENTISTS', 'update');
  const canDelete = hasPermission('DENTISTS', 'delete');

  useEffect(() => {
    fetchDentists();
  }, []);

  const fetchDentists = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/dentists');
      setDentists(response.data);
    } catch (err: any) {
      console.error('Error fetching dentists:', err);
      setError('Failed to load dentists.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setError(null);
    setSelectedDentist(null);
    setFullName('');
    setSpecialization('');
    setQualifications('');
    setLicenseNumber('');
    setTelephone('');
    setEmail('');
    setJoinedDate('');
    setStatus('ACTIVE');
    setConsultationFee('');
    setOpenDialog(true);
  };

  const handleOpenEdit = (dentist: Dentist) => {
    setError(null);
    setSelectedDentist(dentist);
    setFullName(dentist.fullName);
    setSpecialization(dentist.specialization);
    setQualifications(dentist.qualifications);
    setLicenseNumber(dentist.licenseNumber);
    setTelephone(dentist.telephone);
    setEmail(dentist.email);
    setJoinedDate(dentist.joinedDate);
    setStatus(dentist.status);
    setConsultationFee(String(dentist.consultationFee));
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        fullName,
        specialization,
        qualifications,
        licenseNumber,
        telephone,
        email,
        joinedDate,
        status,
        consultationFee: Number(consultationFee)
      };

      if (selectedDentist) {
        await axiosInstance.put(`/dentists/${selectedDentist.dentistId}`, payload);
      } else {
        await axiosInstance.post('/dentists', payload);
      }
      setOpenDialog(false);
      fetchDentists();
    } catch (err: any) {
      console.error('Error saving dentist:', err);
      setError(err.response?.data?.message || 'Failed to save dentist.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this dentist profile?')) return;
    try {
      await axiosInstance.delete(`/dentists/${id}`);
      fetchDentists();
    } catch (err: any) {
      console.error('Error deleting dentist:', err);
      setError('Failed to delete dentist.');
    }
  };

  const columns: GridColDef[] = [
    { field: 'dentistCode', headerName: 'Code', width: 100 },
    { field: 'fullName', headerName: 'Full Name', flex: 1, minWidth: 150 },
    { field: 'specialization', headerName: 'Specialization', flex: 1, minWidth: 120 },
    { field: 'licenseNumber', headerName: 'License No', width: 130 },
    { field: 'telephone', headerName: 'Telephone', width: 130 },
    { field: 'consultationFee', headerName: 'Fee (Rs)', width: 100, type: 'number' },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => {
        const isActive = params.value === 'ACTIVE';
        return (
          <Chip 
            label={params.value} 
            color={isActive ? 'success' : 'default'} 
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
              onClick={() => handleOpenEdit(params.row as Dentist)}
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
              onClick={() => handleDelete(params.row.dentistId)}
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
        <Typography color="text.secondary">You do not have permission to view dentists records.</Typography>
      </Box>
    );
  }

  return (
    <Box className="animate-fade-in" sx={{ p: 3, maxWidth: '100%', px: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
          Dentists Directory
        </Typography>
        {canCreate && (
          <Button variant="contained" color="primary" onClick={handleOpenAdd}>
            + Add Dentist
          </Button>
        )}
      </Box>
      
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
          rows={dentists}
          columns={columns}
          getRowId={(row) => row.dentistId}
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
          {selectedDentist ? 'Edit Dentist Details' : 'Register New Dentist'}
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
              label="Specialization" 
              value={specialization} 
              onChange={(e) => setSpecialization(e.target.value)} 
              fullWidth 
            />
            <TextField 
              label="Qualifications" 
              value={qualifications} 
              onChange={(e) => setQualifications(e.target.value)} 
              placeholder="e.g. BDS, MDS"
              fullWidth 
            />
            <Stack direction="row" spacing={2}>
              <TextField 
                label="License Number" 
                value={licenseNumber} 
                onChange={(e) => setLicenseNumber(e.target.value)} 
                fullWidth 
              />
              <TextField 
                label="Joined Date" 
                type="date" 
                value={joinedDate} 
                onChange={(e) => setJoinedDate(e.target.value)} 
                fullWidth 
                InputLabelProps={{ shrink: true }} 
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField 
                label="Telephone" 
                value={telephone} 
                onChange={(e) => setTelephone(e.target.value)} 
                fullWidth 
              />
              <TextField 
                label="Email Address" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                fullWidth 
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField 
                label="Consultation Fee (Rs.)" 
                type="number" 
                value={consultationFee} 
                onChange={(e) => setConsultationFee(e.target.value)} 
                fullWidth 
              />
              <TextField
                select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                fullWidth
              >
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="ON_LEAVE">On Leave</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
              </TextField>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit">Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">Save Profile</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DentistsPage;
