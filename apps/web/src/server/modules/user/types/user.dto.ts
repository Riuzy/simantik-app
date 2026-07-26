import { z } from 'zod';
import {
  createUserBodySchema,
  updateUserBodySchema,
  resetPasswordBodySchema,
  changeRoleBodySchema,
  listUsersQuerySchema,
} from '../validators/user.validators';

export type CreateUserDTO = z.infer<typeof createUserBodySchema>;
export type UpdateUserDTO = z.infer<typeof updateUserBodySchema>;
export type ResetPasswordDTO = z.infer<typeof resetPasswordBodySchema>;
export type ChangeRoleDTO = z.infer<typeof changeRoleBodySchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

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
  updatedAt: Date;
  role: {
    id: string;
    name: string;
  };
}

export interface UserListDTO {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  jobTitle: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  role: {
    id: string;
    name: string;
  };
}

export interface PaginationDTO {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UserListResponseDTO {
  data: UserListDTO[];
  pagination: PaginationDTO;
}

export interface UserFilters {
  roleId?: string;
  isActive?: boolean;
  search?: string;
}