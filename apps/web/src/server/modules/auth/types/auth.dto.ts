import { z } from 'zod';
import {
  loginBodySchema,
  refreshTokenBodySchema,
  changePasswordBodySchema,
} from '../validators/auth.validators';

export type LoginDTO = z.infer<typeof loginBodySchema>;
export type RefreshTokenDTO = z.infer<typeof refreshTokenBodySchema>;
export type ChangePasswordDTO = z.infer<typeof changePasswordBodySchema>;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  phoneNumber: string | null;
  jobTitle: string | null;
  bio: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  role: {
    id: string;
    name: string;
  };
}

export interface AuthResponseDTO {
  accessToken: string;
  refreshToken: string;
  mustChangePassword: boolean;
  user?: UserResponseDTO;
}

export interface JWTPayload {
  id: string;
  email: string;
  roleId: string;
}