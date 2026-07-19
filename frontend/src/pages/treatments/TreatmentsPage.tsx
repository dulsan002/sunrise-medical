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

interface Treatment {
  treatmentId: number;
  treatmentCode: string;
  treatmentName: string;
  treatmentType: string;
  description: string;
  estimatedDurationMinutes: number;
  standardCharge: number;
  status: string;
}

const TreatmentsPage: React.FC = () => {
  const { hasPermission, permissions } = useAuth();
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);

  // Form states
  const [treatmentName, setTreatmentName] = useState('');
  const [treatmentType, setTreatmentType] = useState('PREVENTIVE');
  const [description, setDescription] = useState('');
  const [estimatedDurationMinutes, setEstimatedDurationMinutes] = useState('');
  const [standardCharge, setStandardCharge] = useState('');
  const [status, setStatus] = useState('ACTIVE');

  const canCreate = hasPermission('TREATMENTS', 'create');
  const canRead = hasPermission('TREATMENTS', 'read');
  const canUpdate = hasPermission('TREATMENTS', 'update');
  const canDelete = hasPermission('TREATMENTS', 'delete');

  useEffect(() => {
    fetchTreatments();
  }, []);

  const fetchTreatments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/treatments');
      setTreatments(response.data);
    } catch (err: any) {
      console.error('Error fetching treatments:', err);
      setError('Failed to load treatments.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setError(null);
    setSelectedTreatment(null);
    setTreatmentName('');
    setTreatmentType('PREVENTIVE');
    setDescription('');
    setEstimatedDurationMinutes('');
    setStandardCharge('');
    setStatus('ACTIVE');
    setOpenDialog(true);
  };

  const handleOpenEdit = (treatment: Treatment) => {
    setError(null);
    setSelectedTreatment(treatment);
    setTreatmentName(treatment.treatmentName);
    setTreatmentType(treatment.treatmentType);
    setDescription(treatment.description || '');
    setEstimatedDurationMinutes(String(treatment.estimatedDurationMinutes));
    setStandardCharge(String(treatment.standardCharge));
    setStatus(treatment.status);
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        treatmentName,
        treatmentType,
        description,
        estimatedDurationMinutes: Number(estimatedDurationMinutes),
        standardCharge: Number(standardCharge),
        status
      };

      if (selectedTreatment) {
        await axiosInstance.put(`/treatments/${selectedTreatment.treatmentId}`, payload);
      } else {
        await axiosInstance.post('/treatments', payload);
      }
      setOpenDialog(false);
      fetchTreatments();
    } catch (err: any) {
      console.error('Error saving treatment:', err);
      setError(err.response?.data?.message || 'Failed to save treatment.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this treatment from the catalog?')) return;
    try {
      await axiosInstance.delete(`/treatments/${id}`);
      fetchTreatments();
    } catch (err: any) {
      console.error('Error deleting treatment:', err);
      setError('Failed to delete treatment.');
    }
  };

  const columns: GridColDef[] = [
    { field: 'treatmentCode', headerName: 'Code', width: 100 },
    { field: 'treatmentName', headerName: 'Treatment Name', flex: 1, minWidth: 150 },
    { field: 'treatmentType', headerName: 'Type', width: 120 },
    { field: 'description', headerName: 'Description', flex: 1, minWidth: 180 },
    { field: 'estimatedDurationMinutes', headerName: 'Mins', width: 80, type: 'number' },
    { field: 'standardCharge', headerName: 'Standard Charge (Rs)', width: 150, type: 'number' },
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
              onClick={() => handleOpenEdit(params.row as Treatment)}
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
              onClick={() => handleDelete(params.row.treatmentId)}
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
        <Typography color="text.secondary">You do not have permission to view treatments catalog.</Typography>
      </Box>
    );
  }

  return (
    <Box className="animate-fade-in" sx={{ p: 3, maxWidth: '100%', px: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
          Treatments Catalog
        </Typography>
        {canCreate && (
          <Button variant="contained" color="primary" onClick={handleOpenAdd}>
            + Add Treatment
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
          rows={treatments}
          columns={columns}
          getRowId={(row) => row.treatmentId}
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
          {selectedTreatment ? 'Edit Treatment Details' : 'Add New Treatment'}
        </DialogTitle>
        <DialogContent dividers>
          {error && openDialog && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField 
              label="Treatment Name" 
              value={treatmentName} 
              onChange={(e) => setTreatmentName(e.target.value)} 
              fullWidth 
              variant="outlined" 
            />
            <TextField
              select
              label="Treatment Type"
              value={treatmentType}
              onChange={(e) => setTreatmentType(e.target.value)}
              fullWidth
            >
              <MenuItem value="PREVENTIVE">Preventive</MenuItem>
              <MenuItem value="RESTORATIVE">Restorative</MenuItem>
              <MenuItem value="ORTHODONTIC">Orthodontic</MenuItem>
              <MenuItem value="SURGICAL">Surgical</MenuItem>
              <MenuItem value="COSMETIC">Cosmetic</MenuItem>
            </TextField>
            <Stack direction="row" spacing={2}>
              <TextField 
                label="Estimated Duration (minutes)" 
                type="number" 
                value={estimatedDurationMinutes} 
                onChange={(e) => setEstimatedDurationMinutes(e.target.value)} 
                fullWidth 
              />
              <TextField 
                label="Standard Charge (Rs.)" 
                type="number" 
                value={standardCharge} 
                onChange={(e) => setStandardCharge(e.target.value)} 
                fullWidth 
              />
            </Stack>
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
            <TextField 
              label="Description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              fullWidth 
              multiline 
              rows={3} 
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit">Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">Save Treatment</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TreatmentsPage;
