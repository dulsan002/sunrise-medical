import React, { useEffect, useState, useContext } from 'react';
import { 
  Box, Typography, Paper, TextField, Button, Grid, Stack, Alert, 
  Switch, FormControlLabel, Divider, Avatar, IconButton
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useAuth } from '../../hooks/useAuth';
import { ThemeContext } from '../../context/ThemeContext';
import axiosInstance from '../../api/axiosConfig';

interface ClinicSetting {
  settingId: number;
  settingKey: string;
  settingValue: string;
  category: string;
  description: string;
}

const SettingsPage: React.FC = () => {
  const { role, fullName, updateProfileData } = useAuth();
  const { mode, toggleTheme } = useContext(ThemeContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Editable fields
  const [clinicName, setClinicName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [clinicPhone, setClinicPhone] = useState('');
  const [clinicEmail, setClinicEmail] = useState('');
  const [operatingHours, setOperatingHours] = useState('');

  // Billing Policies
  const [billingConsultationFee, setBillingConsultationFee] = useState('2000.00');
  const [billingTaxPercentage, setBillingTaxPercentage] = useState('10.00');
  const [billingDiscountPercentage, setBillingDiscountPercentage] = useState('5.00');
  const [billingDiscountThreshold, setBillingDiscountThreshold] = useState('5000.00');

  // User Profile fields
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userFullName, setUserFullName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userTelephone, setUserTelephone] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [password, setPassword] = useState('');
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const isAdmin = role === 'ADMIN';

  useEffect(() => {
    fetchSettings();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axiosInstance.get('/users/me');
      const data = response.data;
      setUsername(data.username);
      setUserRole(data.role);
      setUserFullName(data.fullName);
      setUserEmail(data.email);
      setUserTelephone(data.telephone || '');
      setProfileImageUrl(data.profileImageUrl || '');
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/settings/clinic');
      const data: ClinicSetting[] = response.data;

      // Map to state variables
      const nameObj = data.find(s => s.settingKey === 'clinic_name');
      const addrObj = data.find(s => s.settingKey === 'clinic_address');
      const phoneObj = data.find(s => s.settingKey === 'clinic_phone');
      const emailObj = data.find(s => s.settingKey === 'clinic_email');
      const hoursObj = data.find(s => s.settingKey === 'operating_hours');

      const feeObj = data.find(s => s.settingKey === 'billing_consultation_fee');
      const taxObj = data.find(s => s.settingKey === 'billing_tax_percentage');
      const discPctObj = data.find(s => s.settingKey === 'billing_discount_percentage');
      const discThreshObj = data.find(s => s.settingKey === 'billing_discount_threshold');

      if (nameObj) setClinicName(nameObj.settingValue);
      if (addrObj) setClinicAddress(addrObj.settingValue);
      if (phoneObj) setClinicPhone(phoneObj.settingValue);
      if (emailObj) setClinicEmail(emailObj.settingValue);
      if (hoursObj) setOperatingHours(hoursObj.settingValue);
      
      if (feeObj) setBillingConsultationFee(feeObj.settingValue);
      if (taxObj) setBillingTaxPercentage(taxObj.settingValue);
      if (discPctObj) setBillingDiscountPercentage(discPctObj.settingValue);
      if (discThreshObj) setBillingDiscountThreshold(discThreshObj.settingValue);

    } catch (err) {
      console.error('Failed to load clinic settings:', err);
      setError('Could not load clinic configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSetting = async (key: string, value: string) => {
    try {
      await axiosInstance.put(`/settings/clinic?key=${encodeURIComponent(key)}&value=${encodeURIComponent(value)}`);
    } catch (err) {
      console.error(`Failed to update setting ${key}:`, err);
      throw err;
    }
  };

  const handleSaveChanges = async () => {
    try {
      setError(null);
      setSuccess(null);
      
      await Promise.all([
        handleSaveSetting('clinic_name', clinicName),
        handleSaveSetting('clinic_address', clinicAddress),
        handleSaveSetting('clinic_phone', clinicPhone),
        handleSaveSetting('clinic_email', clinicEmail),
        handleSaveSetting('operating_hours', operatingHours),
        handleSaveSetting('billing_consultation_fee', billingConsultationFee),
        handleSaveSetting('billing_tax_percentage', billingTaxPercentage),
        handleSaveSetting('billing_discount_percentage', billingDiscountPercentage),
        handleSaveSetting('billing_discount_threshold', billingDiscountThreshold)
      ]);

      setSuccess('Clinic settings saved successfully.');
      fetchSettings();
    } catch (err) {
      setError('Failed to save some or all clinic settings.');
    }
  };

  const handleSaveProfile = async () => {
    try {
      setProfileError(null);
      setProfileSuccess(null);
      
      const payload = {
        username,
        fullName: userFullName,
        email: userEmail,
        telephone: userTelephone,
        role: userRole,
        profileImageUrl,
        password: password || undefined
      };
      
      await axiosInstance.put('/users/me', payload);
      setProfileSuccess('Profile updated successfully.');
      setPassword('');
      updateProfileData(userFullName, profileImageUrl);
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axiosInstance.post('/users/me/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setProfileImageUrl(response.data);
        updateProfileData(userFullName, response.data);
        setProfileSuccess('Profile image uploaded successfully.');
      } catch (err: any) {
        setProfileError(err.response?.data?.message || 'Failed to upload image.');
      }
    }
  };

  return (
    <Box className="animate-fade-in" sx={{ p: 3, maxWidth: '100%', px: { xs: 2, md: 4 } }}>
      <Typography variant="h4" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, mb: 3 }}>
        System Settings
      </Typography>

      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}

      <Grid container spacing={4}>
        
        {/* Theme & Display Options */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="h6" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, mb: 2 }}>
              Appearance Settings
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <FormControlLabel
              control={<Switch checked={mode === 'dark'} onChange={toggleTheme} color="primary" />}
              label="Enable Dark Mode UI theme"
            />
          </Paper>
        </Grid>

        {/* Clinic General Configurations */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="h6" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, mb: 2 }}>
              Sunrise Clinic Details
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Stack spacing={2.5}>
              <TextField 
                label="Clinic Legal Name" 
                value={clinicName} 
                onChange={(e) => setClinicName(e.target.value)} 
                fullWidth 
                disabled={!isAdmin}
              />
              <TextField 
                label="Physical Address" 
                value={clinicAddress} 
                onChange={(e) => setClinicAddress(e.target.value)} 
                fullWidth 
                multiline 
                rows={2}
                disabled={!isAdmin}
              />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Contact Telephone" 
                    value={clinicPhone} 
                    onChange={(e) => setClinicPhone(e.target.value)} 
                    fullWidth 
                    disabled={!isAdmin}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Official Clinic Email" 
                    value={clinicEmail} 
                    onChange={(e) => setClinicEmail(e.target.value)} 
                    fullWidth 
                    disabled={!isAdmin}
                  />
                </Grid>
              </Grid>
              <TextField 
                label="Operating hours schedule" 
                value={operatingHours} 
                onChange={(e) => setOperatingHours(e.target.value)} 
                fullWidth 
                disabled={!isAdmin}
              />

              {isAdmin && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button variant="contained" color="primary" onClick={handleSaveChanges} disabled={loading}>
                    Save All Settings
                  </Button>
                </Box>
              )}
              
              {!isAdmin && (
                <Typography variant="caption" color="text.secondary">
                  * Only clinic administrators are authorized to modify business configurations.
                </Typography>
              )}
            </Stack>
          </Paper>
        </Grid>

        {/* Billing Policies */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="h6" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, mb: 2 }}>
              Billing Policies
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Stack spacing={2.5}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Consultation Fee (Rs)" 
                    type="number"
                    value={billingConsultationFee} 
                    onChange={(e) => setBillingConsultationFee(e.target.value)} 
                    fullWidth 
                    disabled={!isAdmin}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Standard Tax (%)" 
                    type="number"
                    value={billingTaxPercentage} 
                    onChange={(e) => setBillingTaxPercentage(e.target.value)} 
                    fullWidth 
                    disabled={!isAdmin}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Discount Threshold (Subtotal > Rs)" 
                    type="number"
                    value={billingDiscountThreshold} 
                    onChange={(e) => setBillingDiscountThreshold(e.target.value)} 
                    fullWidth 
                    disabled={!isAdmin}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Automatic Discount (%)" 
                    type="number"
                    value={billingDiscountPercentage} 
                    onChange={(e) => setBillingDiscountPercentage(e.target.value)} 
                    fullWidth 
                    disabled={!isAdmin}
                  />
                </Grid>
              </Grid>

              {isAdmin && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button variant="contained" color="primary" onClick={handleSaveChanges} disabled={loading}>
                    Save All Settings
                  </Button>
                </Box>
              )}
            </Stack>
          </Paper>
        </Grid>

        {/* User Account Details */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="h6" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, mb: 2 }}>
              My Account Information
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {profileSuccess && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setProfileSuccess(null)}>{profileSuccess}</Alert>}
            {profileError && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setProfileError(null)}>{profileError}</Alert>}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} alignItems={{ xs: 'center', sm: 'flex-start' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, position: 'relative' }}>
                <Avatar 
                  src={profileImageUrl || undefined} 
                  sx={{ width: 120, height: 120, fontSize: '3rem', bgcolor: 'primary.main' }}
                >
                  {!profileImageUrl && userFullName ? userFullName.charAt(0) : ''}
                </Avatar>
                
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="icon-button-file"
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="icon-button-file">
                  <IconButton 
                    color="primary" 
                    aria-label="upload picture" 
                    component="span"
                    sx={{
                      position: 'absolute',
                      bottom: 25,
                      right: -10,
                      backgroundColor: 'background.paper',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                  >
                    <PhotoCameraIcon />
                  </IconButton>
                </label>

                <Typography variant="body2" color="text.secondary">
                  Role: {userRole}
                </Typography>
              </Box>

              <Stack spacing={2.5} sx={{ flexGrow: 1, width: '100%' }}>
                <TextField 
                  label="Profile Image URL (Or click camera icon to upload)" 
                  placeholder="https://example.com/avatar.jpg"
                  value={profileImageUrl} 
                  onChange={(e) => setProfileImageUrl(e.target.value)} 
                  fullWidth 
                />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      label="Username" 
                      value={username} 
                      disabled
                      fullWidth 
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      label="Full Name" 
                      value={userFullName} 
                      onChange={(e) => setUserFullName(e.target.value)} 
                      fullWidth 
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      label="Email" 
                      type="email"
                      value={userEmail} 
                      onChange={(e) => setUserEmail(e.target.value)} 
                      fullWidth 
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      label="Telephone" 
                      value={userTelephone} 
                      onChange={(e) => setUserTelephone(e.target.value)} 
                      fullWidth 
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField 
                      label="Change Password (leave blank to keep current)" 
                      type="password"
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      fullWidth 
                    />
                  </Grid>
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Button variant="contained" color="primary" onClick={handleSaveProfile}>
                    Save Profile Changes
                  </Button>
                </Box>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};

export default SettingsPage;
