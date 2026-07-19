import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import PatientsPage from './pages/patients/PatientsPage';
import DentistsPage from './pages/dentists/DentistsPage';
import TreatmentsPage from './pages/treatments/TreatmentsPage';
import AppointmentsPage from './pages/appointments/AppointmentsPage';
import BillingPage from './pages/billing/BillingPage';
import VisitsPage from './pages/visits/VisitsPage';
import ReportsPage from './pages/reports/ReportsPage';
import SearchPage from './pages/search/SearchPage';
import UsersPage from './pages/users/UsersPage';
import SettingsPage from './pages/settings/SettingsPage';
import HelpPage from './pages/help/HelpPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes with MainLayout */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />

              {/* Placeholder routes — pages to be built */}
              <Route path="/appointments" element={<AppointmentsPage />} />
              <Route path="/patients" element={<PatientsPage />} />
              <Route path="/dentists" element={<DentistsPage />} />
              <Route path="/treatments" element={<TreatmentsPage />} />
              <Route path="/visits" element={<VisitsPage />} />
              <Route path="/billing" element={<BillingPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/help" element={<HelpPage />} />
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
