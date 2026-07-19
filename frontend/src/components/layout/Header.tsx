import React, { useContext, useEffect, useState } from 'react';
import { 
  AppBar, Toolbar, Typography, IconButton, Badge, Box, Tooltip, 
  Popover, List, ListItem, ListItemButton, Button, 
  Divider, Chip, Stack 
} from '@mui/material';
import { 
  Notifications, DarkMode, LightMode, DoneAll, 
  CalendarMonth, Receipt, Settings as SettingsIcon, Info 
} from '@mui/icons-material';
import { ThemeContext } from '../../context/ThemeContext';
import axiosInstance from '../../api/axiosConfig';

interface NotificationItem {
  notificationId: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const Header: React.FC = () => {
  const { mode, toggleTheme } = useContext(ThemeContext);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  
  // Popover State
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await axiosInstance.get('/notifications/unread-count');
      setUnreadCount(Number(res.data));
    } catch (err) {
      console.error('Failed to fetch unread notification count:', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications list:', err);
    }
  };

  const handleOpenNotifications = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications();
  };

  const handleCloseNotifications = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await axiosInstance.put(`/notifications/${id}/read`);
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.notificationId === id ? { ...n, isRead: true } : n)
      );
      fetchUnreadCount();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axiosInstance.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'APPOINTMENT':
        return <CalendarMonth color="primary" fontSize="small" />;
      case 'BILLING':
        return <Receipt color="success" fontSize="small" />;
      case 'SYSTEM':
        return <SettingsIcon color="warning" fontSize="small" />;
      default:
        return <Info color="action" fontSize="small" />;
    }
  };

  const open = Boolean(anchorEl);
  const popoverId = open ? 'notifications-popover' : undefined;

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px !important' }}>
        <Typography variant="h3" sx={{ fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>
          {/* Main App Title */}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Tooltip title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <IconButton onClick={toggleTheme} color="inherit" size="small">
              {mode === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Notifications">
            <IconButton color="inherit" size="small" onClick={handleOpenNotifications}>
              <Badge badgeContent={unreadCount} color="error" max={99}>
                <Notifications fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          <Popover
            id={popoverId}
            open={open}
            anchorEl={anchorEl}
            onClose={handleCloseNotifications}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                width: 360,
                maxHeight: 480,
                mt: 1.5,
                borderRadius: 3,
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0px 10px 30px rgba(0,0,0,0.2)',
                backgroundColor: 'background.paper',
                backgroundImage: 'none',
              }
            }}
          >
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                Notifications
              </Typography>
              {unreadCount > 0 && (
                <Button 
                  size="small" 
                  startIcon={<DoneAll fontSize="small" />} 
                  onClick={handleMarkAllAsRead}
                  sx={{ textTransform: 'none', fontSize: '0.75rem', py: 0.5 }}
                >
                  Mark all read
                </Button>
              )}
            </Box>
            
            <Divider />

            <List sx={{ p: 0, overflow: 'auto', maxHeight: 380 }}>
              {notifications.length === 0 ? (
                <ListItem sx={{ py: 4, justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No notifications available
                  </Typography>
                </ListItem>
              ) : (
                notifications.map((item) => (
                  <React.Fragment key={item.notificationId}>
                    <ListItemButton 
                      onClick={() => !item.isRead && handleMarkAsRead(item.notificationId)}
                      sx={{ 
                        py: 1.5,
                        px: 2,
                        backgroundColor: item.isRead ? 'transparent' : 'rgba(20, 184, 166, 0.04)',
                        borderLeft: item.isRead ? 'none' : '3px solid #14B8A6',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.02)'
                        }
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ width: '100%' }}>
                        <Box sx={{ mt: 0.25 }}>
                          {getNotificationIcon(item.type)}
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontWeight: item.isRead ? 500 : 700, 
                                fontSize: '0.85rem',
                                color: item.isRead ? 'text.primary' : 'primary.main' 
                              }}
                            >
                              {item.title}
                            </Typography>
                            {!item.isRead && (
                              <Chip label="NEW" size="small" sx={{ height: 16, fontSize: '0.6rem', fontWeight: 700, backgroundColor: '#14B8A6', color: '#fff' }} />
                            )}
                          </Stack>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.5, lineHeight: 1.4 }}>
                            {item.message}
                          </Typography>
                          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem', display: 'block', mt: 0.5 }}>
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(item.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Stack>
                    </ListItemButton>
                    <Divider />
                  </React.Fragment>
                ))
              )}
            </List>
          </Popover>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
