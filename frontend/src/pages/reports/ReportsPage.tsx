import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, Grid, Paper, Card, CardContent, CircularProgress, Stack, Button } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PrintIcon from '@mui/icons-material/Print';
import axiosInstance from '../../api/axiosConfig';
import { ThemeContext } from '../../context/ThemeContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

const ReportsPage: React.FC = () => {
  const { mode } = useContext(ThemeContext);
  const axisColor = mode === 'dark' ? '#9CA3AF' : '#475569';
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    activeTreatmentsCount: 0,
  });
  const [appointmentStatusData, setAppointmentStatusData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [treatmentData, setTreatmentData] = useState<any[]>([]);
  const [dentistData, setDentistData] = useState<any[]>([]);
  const [commonTreatmentData, setCommonTreatmentData] = useState<any[]>([]);

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const [patRes, appRes, trtRes, billRes] = await Promise.all([
        axiosInstance.get('/patients'),
        axiosInstance.get('/appointments'),
        axiosInstance.get('/treatments'),
        axiosInstance.get('/bills')
      ]);

      const patients = patRes.data;
      const appointments = appRes.data;
      const treatments = trtRes.data;
      const bills = billRes.data;

      // 1. Compute basic counts
      const totalPatients = patients.length;
      const totalAppointments = appointments.length;
      const totalRevenue = bills
        .filter((b: any) => b.paymentStatus === 'PAID')
        .reduce((sum: number, b: any) => sum + b.finalTotal, 0);
      const activeTreatmentsCount = treatments.filter((t: any) => t.status === 'ACTIVE').length;

      setStats({
        totalPatients,
        totalAppointments,
        totalRevenue,
        activeTreatmentsCount
      });

      // 2. Appointment status breakdown
      const statusCounts: Record<string, number> = {};
      appointments.forEach((a: any) => {
        statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
      });
      setAppointmentStatusData(Object.keys(statusCounts).map(status => ({
        name: status,
        value: statusCounts[status]
      })));

      // 3. Revenue Trend (last 6 months / entries)
      // Group bills by month/year
      const monthlyRev: Record<string, number> = {};
      bills
        .filter((b: any) => b.paymentStatus === 'PAID' && b.paymentDate)
        .forEach((b: any) => {
          const date = new Date(b.paymentDate);
          const monthKey = date.toLocaleString('default', { month: 'short', year: '2-digit' });
          monthlyRev[monthKey] = (monthlyRev[monthKey] || 0) + b.finalTotal;
        });

      // Convert to array sorted by date (mock sorted or simple keys)
      setRevenueData(Object.keys(monthlyRev).map(month => ({
        month,
        revenue: monthlyRev[month]
      })));

      // 4. Treatments standard charge comparison
      setTreatmentData(treatments.map((t: any) => ({
        name: t.treatmentName.substring(0, 15),
        charge: t.standardCharge
      })));

      // 5. Appointments per Dentist (Client Requirement)
      const dentistAppCounts: Record<string, number> = {};
      appointments.forEach((a: any) => {
        const dentistName = a.dentistName || 'Unknown Dentist';
        dentistAppCounts[dentistName] = (dentistAppCounts[dentistName] || 0) + 1;
      });
      setDentistData(Object.keys(dentistAppCounts).map(dentist => ({
        name: dentist,
        appointments: dentistAppCounts[dentist]
      })));

      // 6. Most Common Treatments (Client Requirement)
      const treatmentAppCounts: Record<string, number> = {};
      appointments.forEach((a: any) => {
        const treatmentName = a.treatmentName || 'Unknown Treatment';
        treatmentAppCounts[treatmentName] = (treatmentAppCounts[treatmentName] || 0) + 1;
      });
      const sortedCommon = Object.keys(treatmentAppCounts)
        .map(treatment => ({
          name: treatment.substring(0, 15),
          count: treatmentAppCounts[treatment]
        }))
        .sort((a, b) => b.count - a.count);
      setCommonTreatmentData(sortedCommon);

    } catch (err) {
      console.error('Error computing report metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="animate-fade-in" sx={{ p: 3, maxWidth: '100%', px: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
          Clinic Analytics & Reports
        </Typography>
        <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>
          Print Report
        </Button>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'background.paper' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'primary.dark', color: 'primary.main', display: 'flex' }}>
                <PeopleIcon />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Total Patients Registered</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.totalPatients}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'background.paper' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'success.dark', color: 'success.main', display: 'flex' }}>
                <AccountBalanceWalletIcon />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Net Revenue Collected</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Rs. {stats.totalRevenue.toFixed(2)}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'background.paper' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'warning.dark', color: 'warning.main', display: 'flex' }}>
                <DateRangeIcon />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Total Appointments</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.totalAppointments}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'background.paper' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'info.dark', color: 'info.main', display: 'flex' }}>
                <TrendingUpIcon />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Active Treatment Catalog</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.activeTreatmentsCount}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={4}>
        
        {/* Revenue Trend Line Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, fontFamily: "'Outfit', sans-serif" }}>
              Revenue Performance Trend
            </Typography>
            <Box sx={{ height: 300 }}>
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <XAxis dataKey="month" stroke={axisColor} fontSize={12} />
                    <YAxis stroke={axisColor} fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#222', borderColor: '#444', color: '#fff' }} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" name="Revenue (Rs.)" stroke="#00C49F" strokeWidth={3} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Stack alignItems="center" justifyContent="center" height="100%">
                  <Typography variant="body2" color="text.secondary">No paid billing data available for trend analysis.</Typography>
                </Stack>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Appointment Status Pie Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, fontFamily: "'Outfit', sans-serif" }}>
              Appointments Status Split
            </Typography>
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {appointmentStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={appointmentStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {appointmentStatusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">No appointment records found.</Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Treatment Charges Bar Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, fontFamily: "'Outfit', sans-serif" }}>
              Treatment Standard Charges Comparison
            </Typography>
            <Box sx={{ height: 300 }}>
              {treatmentData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={treatmentData}>
                    <XAxis dataKey="name" stroke={axisColor} fontSize={10} />
                    <YAxis stroke={axisColor} fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#222', borderColor: '#444', color: '#fff' }} />
                    <Legend />
                    <Bar dataKey="charge" name="Standard Fee (Rs)" fill="#0088FE" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">No treatment data available.</Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Appointments per Dentist */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, fontFamily: "'Outfit', sans-serif" }}>
              Number of Appointments per Dentist
            </Typography>
            <Box sx={{ height: 300 }}>
              {dentistData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dentistData}>
                    <XAxis dataKey="name" stroke={axisColor} fontSize={10} />
                    <YAxis stroke={axisColor} fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#222', borderColor: '#444', color: '#fff' }} />
                    <Legend />
                    <Bar dataKey="appointments" name="Appointments Count" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">No dentist appointment data available.</Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Most Common Treatments */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, fontFamily: "'Outfit', sans-serif" }}>
              Most Common Treatments (By Appointment Booking Volume)
            </Typography>
            <Box sx={{ height: 300 }}>
              {commonTreatmentData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={commonTreatmentData}>
                    <XAxis dataKey="name" stroke={axisColor} fontSize={10} />
                    <YAxis stroke={axisColor} fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#222', borderColor: '#444', color: '#fff' }} />
                    <Legend />
                    <Bar dataKey="count" name="Bookings Count" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">No appointment treatment data available.</Typography>
              )}
            </Box>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};

export default ReportsPage;
