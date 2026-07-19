import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, RolePermission } from '../types/auth';
import axiosInstance from '../api/axiosConfig';

interface AuthContextType extends AuthState {
  login: (token: string, role: 'RECEPTIONIST' | 'DENTIST' | 'ADMIN', fullName: string, profileImageUrl?: string | null) => void;
  logout: () => void;
  hasPermission: (resource: string, action: 'create' | 'read' | 'update' | 'delete') => boolean;
  refreshPermissions: () => Promise<void>;
  updateProfileData: (fullName: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    role: null,
    fullName: null,
    profileImageUrl: null,
    isAuthenticated: false,
    loading: true,
    permissions: [],
  });

  const fetchPermissions = async (token: string): Promise<RolePermission[]> => {
    try {
      const response = await axiosInstance.get('/role-permissions/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (err) {
      console.error('Failed to fetch user permissions:', err);
      return [];
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('sdcms_token');
      const role = localStorage.getItem('sdcms_role') as 'RECEPTIONIST' | 'DENTIST' | 'ADMIN' | null;
      const fullName = localStorage.getItem('sdcms_name');
      const profileImageUrl = localStorage.getItem('sdcms_profile_image');

      if (token && role && fullName) {
        const perms = await fetchPermissions(token);
        setAuthState({
          token,
          role,
          fullName,
          profileImageUrl,
          isAuthenticated: true,
          loading: false,
          permissions: perms,
        });
      } else {
        setAuthState({
          token: null,
          role: null,
          fullName: null,
          profileImageUrl: null,
          isAuthenticated: false,
          loading: false,
          permissions: [],
        });
      }
    };

    initializeAuth();
  }, []);

  const login = async (token: string, role: 'RECEPTIONIST' | 'DENTIST' | 'ADMIN', fullName: string, profileImageUrl?: string | null) => {
    localStorage.setItem('sdcms_token', token);
    localStorage.setItem('sdcms_role', role);
    localStorage.setItem('sdcms_name', fullName);
    if (profileImageUrl) {
      localStorage.setItem('sdcms_profile_image', profileImageUrl);
    } else {
      localStorage.removeItem('sdcms_profile_image');
    }

    const perms = await fetchPermissions(token);

    setAuthState({
      token,
      role,
      fullName,
      profileImageUrl: profileImageUrl || null,
      isAuthenticated: true,
      loading: false,
      permissions: perms,
    });
  };

  const logout = () => {
    localStorage.removeItem('sdcms_token');
    localStorage.removeItem('sdcms_role');
    localStorage.removeItem('sdcms_name');
    localStorage.removeItem('sdcms_profile_image');

    setAuthState({
      token: null,
      role: null,
      fullName: null,
      profileImageUrl: null,
      isAuthenticated: false,
      loading: false,
      permissions: [],
    });
  };

  const hasPermission = (resource: string, action: 'create' | 'read' | 'update' | 'delete'): boolean => {
    if (!authState.isAuthenticated || authState.permissions.length === 0) {
      return false;
    }
    const perm = authState.permissions.find(
      p => p.resource.toUpperCase() === resource.toUpperCase()
    );
    if (!perm) return false;

    switch (action) {
      case 'create': return perm.canCreate;
      case 'read': return perm.canRead;
      case 'update': return perm.canUpdate;
      case 'delete': return perm.canDelete;
      default: return false;
    }
  };

  const refreshPermissions = async () => {
    if (authState.token) {
      const perms = await fetchPermissions(authState.token);
      setAuthState(prev => ({
        ...prev,
        permissions: perms,
      }));
    }
  };

  const updateProfileData = (fullName: string, profileImageUrl?: string | null) => {
    localStorage.setItem('sdcms_name', fullName);
    if (profileImageUrl) {
      localStorage.setItem('sdcms_profile_image', profileImageUrl);
    } else {
      localStorage.removeItem('sdcms_profile_image');
    }
    setAuthState(prev => ({
      ...prev,
      fullName,
      profileImageUrl: profileImageUrl || null,
    }));
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, hasPermission, refreshPermissions, updateProfileData }}>
      {children}
    </AuthContext.Provider>
  );
};
