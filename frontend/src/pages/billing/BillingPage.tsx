import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Chip, Alert, TextField, Button, 
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, 
  IconButton, Stack, Autocomplete 
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../hooks/useAuth';
import axiosInstance from '../../api/axiosConfig';

interface Bill {
  billId: number;
  billNumber: string;
  appointmentNumber: string;
  patientName: string;
  dentistName: string;
  treatmentName: string;
  consultationFee: number;
  treatmentTotal: number;
  subTotal: number;
  discountAmount: number;
  taxAmount: number;
  finalTotal: number;
  paymentStatus: string;
  paymentMethod: string;
  paymentDate: string;
  remarks?: string;
}

interface AppointmentDropdown {
  appointmentId: number;
  label: string;
}

const BillingPage: React.FC = () => {
  const { hasPermission, permissions } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [appointments, setAppointments] = useState<AppointmentDropdown[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog States
  const [openGenDialog, setOpenGenDialog] = useState(false);
  const [openPayDialog, setOpenPayDialog] = useState(false);
  const [openPrintDialog, setOpenPrintDialog] = useState(false);
  
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  // Form Fields for Generating Bill
  const [appointmentId, setAppointmentId] = useState<number | ''>('');
  const [discountPercentage, setDiscountPercentage] = useState('0');
  const [taxPercentage, setTaxPercentage] = useState('0');
  const [remarks, setRemarks] = useState('');
  const [previewBillData, setPreviewBillData] = useState<Bill | null>(null);

  // Form Fields for Paying Bill
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  const canCreate = hasPermission('BILLING', 'create');
  const canRead = hasPermission('BILLING', 'read');
  const canUpdate = hasPermission('BILLING', 'update');
  const canDelete = hasPermission('BILLING', 'delete');

  useEffect(() => {
    fetchBills();
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (appointmentId && openGenDialog) {
      fetchPreviewBill(appointmentId);
    } else {
      setPreviewBillData(null);
    }
  }, [appointmentId, openGenDialog]);

  const fetchPreviewBill = async (appId: number) => {
    try {
      const response = await axiosInstance.get(`/bills/preview/${appId}`);
      setPreviewBillData(response.data);
    } catch (err) {
      console.error('Error fetching preview bill:', err);
      setPreviewBillData(null);
    }
  };

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/bills');
      setBills(response.data);
    } catch (err: any) {
      console.error('Error fetching bills:', err);
      setError('Failed to load bills.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await axiosInstance.get('/appointments');
      // Show appointments that are SCHEDULED or COMPLETED
      const filtered = response.data.map((app: any) => ({
        appointmentId: app.appointmentId,
        label: `${app.appointmentNumber} - ${app.patientName} (${app.treatmentName})`
      }));
      setAppointments(filtered);
    } catch (err) {
      console.error('Error fetching appointments for billing:', err);
    }
  };

  const handleOpenGen = () => {
    setAppointmentId('');
    setDiscountPercentage('0');
    setTaxPercentage('0');
    setRemarks('');
    setPreviewBillData(null);
    setOpenGenDialog(true);
  };

  const handleGenerate = async () => {
    try {
      if (!appointmentId) {
        setError('Please select an appointment.');
        return;
      }
      const payload = {
        appointmentId,
        discountPercentage: Number(discountPercentage),
        taxPercentage: Number(taxPercentage),
        remarks
      };
      await axiosInstance.post('/bills', payload);
      setOpenGenDialog(false);
      fetchBills();
    } catch (err: any) {
      console.error('Error generating bill:', err);
      setError(err.response?.data?.message || 'Failed to generate bill.');
    }
  };

  const handleOpenPay = (bill: Bill) => {
    setError(null);
    setSelectedBill(bill);
    setPaymentMethod('CASH');
    setOpenPayDialog(true);
  };

  const handlePay = async () => {
    try {
      if (!selectedBill) return;
      await axiosInstance.put(`/bills/${selectedBill.billNumber}/pay?paymentMethod=${paymentMethod}`);
      setOpenPayDialog(false);
      fetchBills();
    } catch (err: any) {
      console.error('Error paying bill:', err);
      setError('Failed to complete payment.');
    }
  };

  const handleOpenPrint = (bill: Bill) => {
    setSelectedBill(bill);
    setOpenPrintDialog(true);
  };

  const handlePrintAction = () => {
    window.print();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this invoice? This action is irreversible.')) return;
    try {
      await axiosInstance.delete(`/bills/${id}`);
      fetchBills();
    } catch (err: any) {
      console.error('Error deleting bill:', err);
      setError('Failed to delete invoice.');
    }
  };

  const filteredBills = bills.filter((bill) => 
    bill.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bill.patientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: GridColDef[] = [
    { field: 'billNumber', headerName: 'Invoice No', width: 110 },
    { field: 'patientName', headerName: 'Patient Name', flex: 1, minWidth: 150 },
    { field: 'appointmentNumber', headerName: 'Apt Number', width: 110 },
    { field: 'subTotal', headerName: 'Sub Total (Rs)', width: 110, type: 'number' },
    { field: 'finalTotal', headerName: 'Final Total (Rs)', width: 120, type: 'number' },
    {
      field: 'paymentStatus',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => {
        const isPaid = params.value === 'PAID';
        return (
          <Chip 
            label={params.value} 
            color={isPaid ? 'success' : 'warning'} 
            size="small"
            variant="filled"
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 160,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <IconButton 
            size="small" 
            onClick={() => handleOpenPrint(params.row as Bill)}
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
            <PrintIcon fontSize="small" />
          </IconButton>
          {canUpdate && params.row.paymentStatus !== 'PAID' && (
            <IconButton 
              size="small" 
              onClick={() => handleOpenPay(params.row as Bill)}
              sx={{ 
                color: 'success.main',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                '&:hover': {
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                },
                borderRadius: '8px',
                p: 0.75
              }}
            >
              <CheckCircleIcon fontSize="small" />
            </IconButton>
          )}
          {canDelete && (
            <IconButton 
              size="small" 
              onClick={() => handleDelete(params.row.billId)}
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
      ),
    }
  ];

  if (permissions.length > 0 && !canRead) {
    return (
      <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Typography variant="h5" color="error" sx={{ mb: 2, fontWeight: 600 }}>Access Denied</Typography>
        <Typography color="text.secondary">You do not have permission to view billing records.</Typography>
      </Box>
    );
  }

  return (
    <Box className="animate-fade-in" sx={{ p: 3, maxWidth: '100%', px: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
          Billing & Invoices
        </Typography>
        {canCreate && (
          <Button variant="contained" color="primary" onClick={handleOpenGen}>
            + Generate Bill
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)' }}>
        <SearchIcon sx={{ color: 'text.secondary' }} />
        <TextField
          variant="standard"
          placeholder="Search by Invoice No or Patient Name..."
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{ disableUnderline: true }}
        />
      </Paper>
      
      {error && (
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
          rows={filteredBills}
          columns={columns}
          getRowId={(row) => row.billId}
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

      {/* Generate Bill Dialog */}
      <Dialog open={openGenDialog} onClose={() => { setOpenGenDialog(false); setError(null); }} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
          Generate Invoice
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Autocomplete
              options={appointments}
              getOptionLabel={(option) => option.label}
              value={appointments.find((a) => a.appointmentId === appointmentId) || null}
              onChange={(_, newValue) => setAppointmentId(newValue ? newValue.appointmentId : '')}
              fullWidth
              renderInput={(params) => <TextField {...params} label="Select Appointment" />}
            />
            {previewBillData && (
              <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 600 }}>Invoice Preview</Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Consultation Fee</Typography>
                    <Typography variant="body2">Rs. {previewBillData.consultationFee.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Treatment</Typography>
                    <Typography variant="body2">Rs. {previewBillData.treatmentTotal.toFixed(2)}</Typography>
                  </Box>
                  <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'error.main' }}>
                    <Typography variant="body2">Discount</Typography>
                    <Typography variant="body2">- Rs. {previewBillData.discountAmount.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'info.main' }}>
                    <Typography variant="body2">Tax</Typography>
                    <Typography variant="body2">+ Rs. {previewBillData.taxAmount.toFixed(2)}</Typography>
                  </Box>
                  <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                    <Typography variant="body1">Final Total</Typography>
                    <Typography variant="body1" color="primary">Rs. {previewBillData.finalTotal.toFixed(2)}</Typography>
                  </Box>
                </Stack>
              </Paper>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', bgcolor: 'rgba(255,255,255,0.05)', p: 1.5, borderRadius: 1 }}>
              Note: The Consultation Fee (either the Dentist's specific fee or the clinic's default fee), standard tax, and automatic discounts will be calculated and applied automatically according to the Clinic Billing Policies configured in Settings.
            </Typography>
            <TextField
              label="Remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenGenDialog(false)} color="inherit">Cancel</Button>
          <Button onClick={handleGenerate} variant="contained" color="primary">Generate</Button>
        </DialogActions>
      </Dialog>

      {/* Pay Bill Dialog */}
      <Dialog open={openPayDialog} onClose={() => setOpenPayDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
          Process Payment
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body1">
              Invoice: <strong>{selectedBill?.billNumber}</strong>
            </Typography>
            <Typography variant="body1">
              Amount Due: <strong>Rs. {selectedBill?.finalTotal.toFixed(2)}</strong>
            </Typography>
            <TextField
              select
              label="Payment Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              fullWidth
            >
              <MenuItem value="CASH">Cash</MenuItem>
              <MenuItem value="CARD">Card</MenuItem>
              <MenuItem value="INSURANCE">Insurance</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenPayDialog(false)} color="inherit">Cancel</Button>
          <Button onClick={handlePay} variant="contained" color="success">Mark Paid</Button>
        </DialogActions>
      </Dialog>

      {/* Print Bill Dialog (sophisticated custom view) */}
      <Dialog open={openPrintDialog} onClose={() => setOpenPrintDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
          Print Invoice
        </DialogTitle>
        <DialogContent dividers id="printable-invoice">
          {selectedBill && (
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>SUNRISE DENTAL CLINIC</Typography>
                  <Typography variant="caption">102, Flower Road, Colombo 07</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>INVOICE</Typography>
                  <Typography variant="caption">No: {selectedBill.billNumber}</Typography>
                </Box>
              </Box>

              <Stack spacing={1} sx={{ mb: 3 }}>
                <Typography variant="body2"><strong>Patient Name:</strong> {selectedBill.patientName}</Typography>
                <Typography variant="body2"><strong>Dentist:</strong> {selectedBill.dentistName}</Typography>
                <Typography variant="body2"><strong>Appointment Ref:</strong> {selectedBill.appointmentNumber}</Typography>
                {selectedBill.paymentDate && (
                  <Typography variant="body2"><strong>Payment Date:</strong> {new Date(selectedBill.paymentDate).toLocaleString()}</Typography>
                )}
              </Stack>

              <Paper variant="outlined" sx={{ p: 2, mb: 3, backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Consultation Fee</Typography>
                    <Typography variant="body2">Rs. {selectedBill.consultationFee.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Treatment: {selectedBill.treatmentName}</Typography>
                    <Typography variant="body2">Rs. {selectedBill.treatmentTotal.toFixed(2)}</Typography>
                  </Box>
                  <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                    <Typography variant="body2">Sub Total</Typography>
                    <Typography variant="body2">Rs. {selectedBill.subTotal.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'error.main' }}>
                    <Typography variant="body2">Discount</Typography>
                    <Typography variant="body2">- Rs. {selectedBill.discountAmount.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'info.main' }}>
                    <Typography variant="body2">Tax</Typography>
                    <Typography variant="body2">+ Rs. {selectedBill.taxAmount.toFixed(2)}</Typography>
                  </Box>
                  <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                    <Typography variant="body1">Total Charge</Typography>
                    <Typography variant="body1" color="primary">Rs. {selectedBill.finalTotal.toFixed(2)}</Typography>
                  </Box>
                </Stack>
              </Paper>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip 
                  label={selectedBill.paymentStatus} 
                  color={selectedBill.paymentStatus === 'PAID' ? 'success' : 'warning'} 
                  variant="filled"
                />
                {selectedBill.paymentMethod && (
                  <Typography variant="caption">Paid via: {selectedBill.paymentMethod}</Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenPrintDialog(false)} color="inherit">Close</Button>
          <Button onClick={handlePrintAction} variant="contained" color="primary" startIcon={<PrintIcon />}>Print</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BillingPage;
