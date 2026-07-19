import React, { useContext } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, Paper,
} from '@mui/material';
import {
  CalendarMonth, People, TrendingUp, Receipt,
} from '@mui/icons-material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { useAuth } from '../../hooks/useAuth';
import { ThemeContext } from '../../context/ThemeContext';

// Mock data — will be replaced with API calls
const kpiCards = [
  { title: "Today's Appointments", value: '12', subtitle: '4 confirmed, 2 pending', icon: <CalendarMonth />, gradient: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)' },
  { title: 'Monthly Revenue', value: 'LKR 832,500', subtitle: '+8.1% vs last month', icon: <TrendingUp />, gradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' },
  { title: 'Total Patients', value: '1,452', subtitle: '58 new this month', icon: <People />, gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' },
  { title: 'Pending Bills', value: '7', subtitle: 'LKR 45,200 outstanding', icon: <Receipt />, gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' },
];

const revenueData = [
  { month: 'Jan', revenue: 520000 }, { month: 'Feb', revenue: 610000 },
  { month: 'Mar', revenue: 580000 }, { month: 'Apr', revenue: 720000 },
  { month: 'May', revenue: 690000 }, { month: 'Jun', revenue: 832500 },
];

const appointmentStatusData = [
  { name: 'Completed', value: 45, color: '#10B981' },
  { name: 'Scheduled', value: 28, color: '#6366F1' },
  { name: 'Cancelled', value: 12, color: '#EF4444' },
  { name: 'No Show', value: 5, color: '#F59E0B' },
];

const todayAppointments = [
  { time: '09:00 AM', patient: 'Amara Perera', treatment: 'Root Canal', dentist: 'Dr. Emily Chen', status: 'CONFIRMED' },
  { time: '09:45 AM', patient: 'Kamal Silva', treatment: 'Checkup & Scale', dentist: 'Dr. Kavin Perera', status: 'IN_PROGRESS' },
  { time: '10:30 AM', patient: 'Nimal Fernando', treatment: 'Filling', dentist: 'Dr. Emily Chen', status: 'SCHEDULED' },
  { time: '11:15 AM', patient: 'Dilini Jayawardena', treatment: 'Extraction', dentist: 'Dr. Kavin Perera', status: 'SCHEDULED' },
  { time: '01:00 PM', patient: 'Roshan De Silva', treatment: 'Consultation', dentist: 'Dr. Emily Chen', status: 'CONFIRMED' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'CONFIRMED': return 'success';
    case 'IN_PROGRESS': return 'info';
    case 'SCHEDULED': return 'primary';
    case 'CANCELLED': return 'error';
    case 'NO_SHOW': return 'warning';
    default: return 'default';
  }
};

const DashboardPage: React.FC = () => {
  const { fullName, role } = useAuth();
  const { mode } = useContext(ThemeContext);
  const axisColor = mode === 'dark' ? '#9CA3AF' : '#475569';

  return (
    <Box className="animate-fade-in" sx={{ px: { xs: 2, md: 4 } }}>
      {/* Welcome Banner */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h1" sx={{ fontSize: '1.75rem', mb: 0.5 }}>
          Welcome back, {fullName}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's an overview of your clinic's activity today.
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {kpiCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ position: 'relative', overflow: 'hidden' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {card.title}
                    </Typography>
                    <Typography variant="h2" sx={{ fontSize: '1.75rem', fontWeight: 700 }}>
                      {card.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.7rem' }}>
                      {card.subtitle}
                    </Typography>
                  </Box>
                  <Box sx={{
                    width: 44, height: 44, borderRadius: '12px',
                    background: card.gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}>
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Revenue Chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h3" sx={{ mb: 2 }}>Monthly Revenue Growth</Typography>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" stroke={axisColor} fontSize={12} />
                  <YAxis stroke={axisColor} fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '0.8rem' }}
                    formatter={(value: number) => [`LKR ${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#14B8A6" strokeWidth={2.5} dot={{ fill: '#14B8A6', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Appointment Status Pie */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h3" sx={{ mb: 2 }}>Appointment Status</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={appointmentStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                    {appointmentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '0.8rem' }} />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {appointmentStatusData.map((d) => (
                  <Box key={d.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: d.color }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      {d.name} ({d.value})
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Today's Appointments Table */}
      {(role === 'ADMIN' || role === 'RECEPTIONIST') && (
        <Card>
          <CardContent>
            <Typography variant="h3" sx={{ mb: 2 }}>Today's Appointments</Typography>
            <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: 'transparent' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Patient</TableCell>
                    <TableCell>Treatment</TableCell>
                    <TableCell>Dentist</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {todayAppointments.map((appt, i) => (
                    <TableRow key={i} hover sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}>
                      <TableCell>{appt.time}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{appt.patient}</TableCell>
                      <TableCell>{appt.treatment}</TableCell>
                      <TableCell>{appt.dentist}</TableCell>
                      <TableCell>
                        <Chip
                          label={appt.status.replace('_', ' ')}
                          color={getStatusColor(appt.status) as 'success' | 'info' | 'primary' | 'error' | 'warning' | 'default'}
                          size="small"
                          sx={{ fontSize: '0.65rem', height: '22px' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default DashboardPage;
