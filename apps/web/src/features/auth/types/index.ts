import { UserRole } from '../../../constants/permissions';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  phoneNumber: string | null;
  jobTitle: string | null;
  bio: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  role: {
    id: string;
    name: UserRole;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  mustChangePassword: boolean;
  user?: User;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
