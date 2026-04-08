export interface User {
  id: number;
  companyId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'supervisor' | 'technician';
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}