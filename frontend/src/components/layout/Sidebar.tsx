import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, Divider, Avatar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon, CalendarMonth, People, MedicalServices,
  LocalHospital, Receipt, Assessment, Settings, HelpOutline,
  AdminPanelSettings, Search as SearchIcon, Logout,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { ThemeContext } from '../../context/ThemeContext';

const DRAWER_WIDTH = 260;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
  resource?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon />, roles: ['ADMIN', 'RECEPTIONIST', 'DENTIST'] },
  { label: 'Appointments', path: '/appointments', icon: <CalendarMonth />, roles: ['ADMIN', 'RECEPTIONIST', 'DENTIST'], resource: 'APPOINTMENTS' },
  { label: 'Patients', path: '/patients', icon: <People />, roles: ['ADMIN', 'RECEPTIONIST', 'DENTIST'], resource: 'PATIENTS' },
  { label: 'Dentists', path: '/dentists', icon: <MedicalServices />, roles: ['ADMIN', 'RECEPTIONIST'], resource: 'DENTISTS' },
  { label: 'Treatments', path: '/treatments', icon: <LocalHospital />, roles: ['ADMIN', 'RECEPTIONIST', 'DENTIST'], resource: 'TREATMENTS' },
  { label: 'Patient Visits', path: '/visits', icon: <MedicalServices />, roles: ['ADMIN', 'DENTIST'], resource: 'VISITS' },
  { label: 'Billing', path: '/billing', icon: <Receipt />, roles: ['ADMIN', 'RECEPTIONIST'], resource: 'BILLING' },
  { label: 'Reports', path: '/reports', icon: <Assessment />, roles: ['ADMIN'] },
  { label: 'Search', path: '/search', icon: <SearchIcon />, roles: ['ADMIN', 'RECEPTIONIST', 'DENTIST'] },
  { label: 'User Management', path: '/users', icon: <AdminPanelSettings />, roles: ['ADMIN'], resource: 'USERS' },
  { label: 'Settings', path: '/settings', icon: <Settings />, roles: ['ADMIN'] },
  { label: 'Help Centre', path: '/help', icon: <HelpOutline />, roles: ['ADMIN', 'RECEPTIONIST', 'DENTIST'] },
];

const Sidebar: React.FC = () => {
  const { role, fullName, profileImageUrl, logout, hasPermission, permissions } = useAuth();
  const { mode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const filteredItems = navItems.filter((item) => {
    if (!role || !item.roles.includes(role)) return false;
    // If permissions haven't loaded yet, fall back to role-based visibility
    if (item.resource && permissions.length > 0) {
      return hasPermission(item.resource, 'read');
    }
    return true;
  });

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          background: mode === 'dark'
            ? 'linear-gradient(180deg, #0B0F19 0%, #111827 100%)'
            : 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
        },
      }}
    >
      {/* Brand Logo */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: '10px',
          background: 'linear-gradient(135deg, #14B8A6 0%, #6366F1 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem', fontWeight: 700, color: '#fff',
        }}>
          SD
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.2 }}>
            Sunrise Dental
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
            Clinic Management System
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Navigation Items */}
      <List sx={{ px: 1.5, pt: 1 }}>
        {filteredItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <ListItemButton
              key={item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: '8px', mb: 0.5, py: 1,
                backgroundColor: isActive ? 'primary.main' : 'transparent',
                color: isActive ? '#fff' : 'text.secondary',
                '& .MuiListItemIcon-root': { color: isActive ? '#fff' : 'text.secondary', minWidth: 36 },
                '&:hover': {
                  backgroundColor: isActive ? 'primary.dark' : (mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                },
                transition: 'all 150ms ease',
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: isActive ? 600 : 500 }} />
            </ListItemButton>
          );
        })}
      </List>

      {/* User Profile Footer */}
      <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Avatar src={profileImageUrl || undefined} sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.85rem', fontWeight: 700 }}>
            {!profileImageUrl && fullName ? String(fullName).charAt(0).toUpperCase() : ''}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {fullName || 'User'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              {role || 'N/A'}
            </Typography>
          </Box>
        </Box>
        <ListItemButton
          onClick={() => { logout(); navigate('/login'); }}
          sx={{ borderRadius: '8px', py: 0.75, color: 'error.main', '&:hover': { backgroundColor: 'rgba(239,68,68,0.1)' } }}
        >
          <ListItemIcon sx={{ color: 'error.main', minWidth: 36 }}><Logout fontSize="small" /></ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }} />
        </ListItemButton>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
