export interface User {
  username: string;
  fullName: string;
  role: 'RECEPTIONIST' | 'DENTIST' | 'ADMIN';
}

export interface RolePermission {
  id?: number;
  role: string;
  resource: string;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export interface AuthState {
  token: string | null;
  role: 'RECEPTIONIST' | 'DENTIST' | 'ADMIN' | null;
  fullName: string | null;
  profileImageUrl: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  permissions: RolePermission[];
}
