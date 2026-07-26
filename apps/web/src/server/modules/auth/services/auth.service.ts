import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRepository } from '../repositories/auth.repository';
import { AppError } from '../../../middlewares/error-handler';
import {
  LoginDTO,
  RefreshTokenDTO,
  ChangePasswordDTO,
  AuthTokens,
  AuthResponseDTO,
  UserResponseDTO,
  JWTPayload,
} from '../types/auth.dto';
import { config } from '../../../config';

export class AuthService {
  constructor(private repository: AuthRepository) {}

  private generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: '15m',
    });
  }

  private generateRefreshToken(userId: string, tokenVersion: number): string {
    const payload = { id: userId, tokenVersion };
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: '7d',
    });
  }

  private hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async login(dto: LoginDTO): Promise<AuthResponseDTO> {
    const user = await this.repository.findByEmail(dto.email);
    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }

    if (!user.isActive) {
      throw new AppError(403, 'Account is disabled');
    }

    const isValidPassword = await this.comparePassword(dto.password, user.password);
    if (!isValidPassword) {
      throw new AppError(401, 'Invalid credentials');
    }

    await this.repository.updateLastLogin(user.id);

    const accessToken = this.generateAccessToken({
      id: user.id,
      email: user.email,
      roleId: user.roleId,
    });

    const refreshToken = this.generateRefreshToken(user.id, (user as unknown as { tokenVersion: number }).tokenVersion || 0);

    const mustChangePassword = (user as unknown as { mustChangePassword: boolean }).mustChangePassword || false;

    if (mustChangePassword) {
      return {
        accessToken,
        refreshToken,
        mustChangePassword: true,
      };
    }

    return {
      accessToken,
      refreshToken,
      mustChangePassword: false,
      user: this.mapUserToDTO(user),
    };
  }

  async refreshToken(dto: RefreshTokenDTO): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(dto.refreshToken, config.jwtSecret) as {
        id: string;
        tokenVersion: number;
      };

      const user = await this.repository.findById(decoded.id);
      if (!user) {
        throw new AppError(401, 'Invalid refresh token');
      }

      if (!user.isActive) {
        throw new AppError(403, 'Account is disabled');
      }

      if ((user as unknown as { tokenVersion: number }).tokenVersion !== decoded.tokenVersion) {
        throw new AppError(401, 'Invalid refresh token');
      }

      const accessToken = this.generateAccessToken({
        id: user.id,
        email: user.email,
        roleId: user.roleId,
      });

      const refreshToken = this.generateRefreshToken(user.id, (user as unknown as { tokenVersion: number }).tokenVersion || 0);

      return { accessToken, refreshToken };
    } catch {
      throw new AppError(401, 'Invalid refresh token');
    }
  }

  async getCurrentUser(userId: string): Promise<UserResponseDTO> {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return this.mapUserToDTO(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDTO): Promise<void> {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const isValidPassword = await this.comparePassword(dto.currentPassword, user.password);
    if (!isValidPassword) {
      throw new AppError(401, 'Current password is incorrect');
    }

    const hashedPassword = await this.hashPassword(dto.newPassword);
    await this.repository.updatePassword(userId, hashedPassword, false);
  }

  private mapUserToDTO(user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    phoneNumber: string | null;
    jobTitle: string | null;
    bio: string | null;
    isActive: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    role: {
      id: string;
      name: string;
    };
  }): UserResponseDTO {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      phoneNumber: user.phoneNumber,
      jobTitle: user.jobTitle,
      bio: user.bio,
      isActive: user.isActive,
      mustChangePassword: (user as unknown as { mustChangePassword: boolean }).mustChangePassword || false,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      role: user.role,
    };
  }
}