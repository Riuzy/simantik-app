import bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { AppError } from '../../../middlewares/error-handler';
import {
  CreateUserDTO,
  UpdateUserDTO,
  ResetPasswordDTO,
  ChangeRoleDTO,
  UserListResponseDTO,
  UserFilters,
} from '../types/user.dto';

export class UserService {
  constructor(private repository: UserRepository) {}

  private hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async create(dto: CreateUserDTO) {
    const existingUser = await this.repository.findByEmail(dto.email);
    if (existingUser) {
      throw new AppError(409, 'User with this email already exists');
    }

    const role = await this.repository.findRoleById(dto.roleId);
    if (!role) {
      throw new AppError(400, 'Invalid role');
    }

    const hashedPassword = await this.hashPassword(dto.temporaryPassword);

    const user = await this.repository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      phoneNumber: dto.phoneNumber || null,
      jobTitle: dto.jobTitle || null,
      avatar: dto.avatar || null,
      roleId: dto.roleId,
      mustChangePassword: true,
    });

    return user;
  }

  async getById(id: string) {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    return user;
  }

  async update(id: string, dto: UpdateUserDTO) {
    if (dto.roleId) {
      const role = await this.repository.findRoleById(dto.roleId);
      if (!role) {
        throw new AppError(400, 'Invalid role');
      }
    }

    const user = await this.repository.update(id, dto);
    return user;
  }

  async softDelete(id: string) {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    await this.repository.softDelete(id);
  }

  async list(
    page: number,
    limit: number,
    filters: UserFilters
  ): Promise<UserListResponseDTO> {
    const result = await this.repository.list(page, limit, filters);
    return {
      data: result.items,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }

  async resetPassword(userId: string, dto: ResetPasswordDTO) {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const hashedPassword = await this.hashPassword(dto.temporaryPassword);

    await this.repository.updatePassword(userId, hashedPassword, true);
  }

  async activateUser(userId: string) {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    await this.repository.update(userId, { isActive: true });
  }

  async deactivateUser(userId: string) {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    await this.repository.update(userId, { isActive: false });
  }

  async changeRole(userId: string, dto: ChangeRoleDTO) {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const role = await this.repository.findRoleById(dto.roleId);
    if (!role) {
      throw new AppError(400, 'Invalid role');
    }

    return this.repository.update(userId, { roleId: dto.roleId });
  }

  async getAllRoles() {
    return this.repository.findAllRoles();
  }
}