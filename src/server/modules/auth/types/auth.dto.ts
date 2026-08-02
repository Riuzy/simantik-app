export interface LoginDTO {
  email: string;
  password: string;
}

export interface RefreshTokenDTO {
  refreshToken: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponseDTO {
  user?: UserResponseDTO;
  accessToken: string;
  refreshToken: string;
  mustChangePassword: boolean;
}

export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}

export interface JWTPayload {
  id: string;
  email: string;
}
