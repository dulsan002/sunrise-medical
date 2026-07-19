import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Chip, Alert, TextField, Button, 
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, 
  IconButton, Stack, Tabs, Tab, TableContainer, Table, TableHead, 
  TableRow, TableCell, TableBody, Checkbox, CircularProgress
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SecurityIcon from '@mui/icons-material/Security';
import PeopleIcon from '@mui/icons-material/People';
import SaveIcon from '@mui/icons-material/Save';
import { useAuth } from '../../hooks/useAuth';
import axiosInstance from '../../api/axiosConfig';

interface User {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  telephone: string;
  role: string;
  isActive: boolean;
}

interface RolePermission {
  id?: number;
  role: string;
  resource: string;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

const UsersPage: React.FC = () => {
  const { role, refreshPermissions } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  
  // User Management States
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Role Permissions States
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [selectedRoleTab, setSelectedRoleTab] = useState('RECEPTIONIST');
  const [savingPerms, setSavingPerms] = useState(false);

  // Dialog States
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form Fields
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [userRole, setUserRole] = useState('RECEPTIONIST');
  const [isActive, setIsActive] = useState(true);

  const isAdmin = role === 'ADMIN';
  const rolesList = ['ADMIN', 'RECEPTIONIST', 'DENTIST'];

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/users');
      setUsers(response.data);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError('Failed to load user list.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/role-permissions');
      setPermissions(response.data);
    } catch (err: any) {
      console.error('Error fetching permissions:', err);
      setError('Failed to load role permissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setError(null);
    setSelectedUser(null);
    setUsername('');
    setFullName('');
    setEmail('');
    setTelephone('');
    setPassword('');
    setUserRole('RECEPTIONIST');
    setIsActive(true);
    setOpenDialog(true);
  };

  const handleOpenEdit = (user: User) => {
    setError(null);
    setSelectedUser(user);
    setUsername(user.username);
    setFullName(user.fullName);
    setEmail(user.email);
    setTelephone(user.telephone || '');
    setPassword('');
    setUserRole(user.role);
    setIsActive(user.isActive);
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        username,
        fullName,
        email,
        telephone,
        password: password || undefined,
        role: userRole,
        isActive
      };

      if (selectedUser) {
        await axiosInstance.put(`/users/${selectedUser.userId}`, payload);
      } else {
        if (!password) {
          setError('Password is required for new users.');
          return;
        }
        await axiosInstance.post('/users', payload);
      }
      setOpenDialog(false);
      fetchUsers();
    } catch (err: any) {
      console.error('Error saving user:', err);
      setError(err.response?.data?.message || 'Failed to save user. Verify details.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user account?')) return;
    try {
      await axiosInstance.delete(`/users/${id}`);
      fetchUsers();
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user.');
    }
  };

  const handlePermissionChange = (roleName: string, resourceName: string, action: 'canCreate' | 'canRead' | 'canUpdate' | 'canDelete') => {
    setPermissions(prev => prev.map(p => {
      if (p.role === roleName && p.resource === resourceName) {
        return { ...p, [action]: !p[action] };
      }
      return p;
    }));
  };

  const handleSavePermissions = async () => {
    try {
      setSavingPerms(true);
      setError(null);
      setSuccessMsg(null);
      const response = await axiosInstance.put('/role-permissions', permissions);
      setPermissions(response.data);
      await refreshPermissions();
      setSuccessMsg('Role permissions updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error('Error saving permissions:', err);
      setError('Failed to update role permissions.');
    } finally {
      setSavingPerms(false);
    }
  };

  if (!isAdmin) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error" sx={{ maxWidth: '600px', mx: 'auto', borderRadius: 3 }}>
          <strong>Access Denied</strong>: Only administrators are authorized to manage user accounts and access control.
        </Alert>
      </Box>
    );
  }

  const filteredUsers = users.filter((u) => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: GridColDef[] = [
    { field: 'username', headerName: 'Username', width: 130 },
    { field: 'fullName', headerName: 'Full Name', flex: 1, minWidth: 150 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 150 },
    { field: 'telephone', headerName: 'Telephone', width: 130 },
    { 
      field: 'role', 
      headerName: 'Role', 
      width: 130,
      renderCell: (params) => {
        let color: 'primary' | 'secondary' | 'default' = 'default';
        if (params.value === 'ADMIN') color = 'secondary';
        if (params.value === 'DENTIST') color = 'primary';
        return <Chip label={params.value} color={color} size="small" variant="filled" />;
      }
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value ? 'ACTIVE' : 'INACTIVE'} 
          color={params.value ? 'success' : 'default'} 
          size="small"
          variant="filled"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <IconButton 
            size="small" 
            onClick={() => handleOpenEdit(params.row as User)}
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
          <IconButton 
            size="small" 
            onClick={() => handleDelete(params.row.userId)}
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
        </Stack>
      )
    }
  ];

  return (
    <Box className="animate-fade-in" sx={{ p: 3, maxWidth: '100%', px: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
          User Accounts & Access Control
        </Typography>
        {activeTab === 0 && (
          <Button variant="contained" color="primary" onClick={handleOpenAdd}>
            + Register User
          </Button>
        )}
      </Box>

      {/* Tabs Menu */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => {
            setActiveTab(newValue);
            if (newValue === 1 && permissions.length === 0) {
              fetchPermissions();
            }
          }}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab 
            icon={<PeopleIcon />} 
            iconPosition="start" 
            label="User Accounts" 
            sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, textTransform: 'none', minHeight: 48 }} 
          />
          <Tab 
            icon={<SecurityIcon />} 
            iconPosition="start" 
            label="Role Permissions" 
            sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, textTransform: 'none', minHeight: 48 }} 
          />
        </Tabs>
      </Box>
      
      {error && !openDialog && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMsg && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMsg(null)}>
          {successMsg}
        </Alert>
      )}

      {/* User Accounts Tab */}
      {activeTab === 0 && (
        <>
          <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)' }}>
            <SearchIcon sx={{ color: 'text.secondary' }} />
            <TextField
              variant="standard"
              placeholder="Search by Username, Name or Email..."
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{ disableUnderline: true }}
            />
          </Paper>

          <Paper 
            elevation={0} 
            sx={{ 
              height: 550, 
              width: '100%', 
              borderRadius: 3, 
              border: '1px solid rgba(255,255,255,0.1)',
              overflow: 'hidden',
              backgroundColor: 'background.paper',
            }}
          >
            <DataGrid
              rows={filteredUsers}
              columns={columns}
              getRowId={(row) => row.userId}
              loading={loading && users.length === 0}
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
        </>
      )}

      {/* Role Permissions Tab */}
      {activeTab === 1 && (
        <Box sx={{ animation: 'fade-in 0.3s ease' }}>
          <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
            {rolesList.map((r) => (
              <Button
                key={r}
                variant={selectedRoleTab === r ? 'contained' : 'outlined'}
                onClick={() => setSelectedRoleTab(r)}
                sx={{ 
                  borderRadius: '10px', 
                  textTransform: 'none', 
                  px: 3, 
                  py: 1, 
                  fontFamily: "'Outfit', sans-serif", 
                  fontWeight: 600,
                  boxShadow: selectedRoleTab === r ? '0 4px 12px rgba(13,148,136,0.2)' : 'none'
                }}
              >
                {r} Permissions
              </Button>
            ))}
          </Box>

          <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '0.95rem' }}>Resource Name</TableCell>
                    <TableCell align="center" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '0.95rem' }}>Create</TableCell>
                    <TableCell align="center" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '0.95rem' }}>Read</TableCell>
                    <TableCell align="center" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '0.95rem' }}>Update</TableCell>
                    <TableCell align="center" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '0.95rem' }}>Delete</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading && permissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                        <CircularProgress size={30} />
                      </TableCell>
                    </TableRow>
                  ) : (
                    permissions
                      .filter(p => p.role === selectedRoleTab)
                      .map(perm => (
                        <TableRow key={perm.resource} hover>
                          <TableCell sx={{ fontWeight: 600, color: 'text.primary', py: 1.5 }}>
                            {perm.resource}
                          </TableCell>
                          <TableCell align="center">
                            <Checkbox
                              checked={perm.canCreate}
                              onChange={() => handlePermissionChange(perm.role, perm.resource, 'canCreate')}
                              color="primary"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Checkbox
                              checked={perm.canRead}
                              onChange={() => handlePermissionChange(perm.role, perm.resource, 'canRead')}
                              color="primary"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Checkbox
                              checked={perm.canUpdate}
                              onChange={() => handlePermissionChange(perm.role, perm.resource, 'canUpdate')}
                              color="primary"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Checkbox
                              checked={perm.canDelete}
                              onChange={() => handlePermissionChange(perm.role, perm.resource, 'canDelete')}
                              color="primary"
                            />
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={savingPerms ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              onClick={handleSavePermissions}
              disabled={savingPerms || loading}
              sx={{ borderRadius: '10px', px: 4, py: 1.25, fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}
            >
              {savingPerms ? 'Saving Changes...' : 'Save Permissions'}
            </Button>
          </Box>
        </Box>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={openDialog} onClose={() => { setOpenDialog(false); setError(null); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
          {selectedUser ? 'Edit User Account' : 'Register New User'}
        </DialogTitle>
        <DialogContent dividers>
          {error && openDialog && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField 
              label="Username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              fullWidth 
              variant="outlined" 
              disabled={!!selectedUser}
            />
            {!selectedUser && (
              <TextField 
                label="Password" 
                type="password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                fullWidth 
              />
            )}
            {selectedUser && (
              <TextField 
                label="Change Password (leave blank to keep current)" 
                type="password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                fullWidth 
              />
            )}
            <TextField 
              label="Full Name" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              fullWidth 
            />
            <TextField 
              label="Email Address" 
              type="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              fullWidth 
            />
            <TextField 
              label="Telephone" 
              value={telephone} 
              onChange={(e) => setTelephone(e.target.value)} 
              fullWidth 
            />
            <TextField
              select
              label="Role"
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              fullWidth
            >
              <MenuItem value="RECEPTIONIST">Receptionist</MenuItem>
              <MenuItem value="DENTIST">Dentist</MenuItem>
              <MenuItem value="ADMIN">Administrator</MenuItem>
            </TextField>
            <TextField
              select
              label="Account Status"
              value={isActive ? 'true' : 'false'}
              onChange={(e) => setIsActive(e.target.value === 'true')}
              fullWidth
            >
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit">Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">Save Account</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersPage;
