import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../../../config';
import { prisma } from '../../../lib/prisma';
import { HttpError } from '../../../lib/errors';
import { AuthRepository } from '../repositories/auth.repository';
import type { LoginDTO, AuthResponseDTO, UserResponseDTO, AuthTokens, JWTPayload } from '../types/auth.dto';

export class AuthService {
  constructor(private repository: AuthRepository) {}

  private generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, config.jwtSecret, { expiresIn: '15m' });
  }

  private generateRefreshToken(userId: string, tokenVersion: number): string {
    return jwt.sign({ id: userId, tokenVersion }, config.jwtSecret, { expiresIn: '7d' });
  }

  async login(dto: LoginDTO): Promise<AuthResponseDTO> {
    const user = await this.repository.findByEmail(dto.email);
    if (!user) throw new HttpError(401, 'Invalid credentials');

    if (!user.isActive) throw new HttpError(403, 'Account is disabled');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new HttpError(401, 'Invalid credentials');

    await this.repository.updateLastLogin(user.id);

    const accessToken = this.generateAccessToken({ id: user.id, email: user.email, roleId: user.roleId });
    const refreshToken = this.generateRefreshToken(user.id, (user as any).tokenVersion || 0);

    if ((user as any).mustChangePassword) {
      return { accessToken, refreshToken, mustChangePassword: true };
    }

    return { accessToken, refreshToken, mustChangePassword: false, user: this.mapUser(user) };
  }

  async refresh(dto: { refreshToken: string }): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(dto.refreshToken, config.jwtSecret) as { id: string; tokenVersion: number };
      const user = await this.repository.findById(decoded.id);
      if (!user || !user.isActive) throw new Error();
      if ((user as any).tokenVersion !== decoded.tokenVersion) throw new Error();

      return {
        accessToken: this.generateAccessToken({ id: user.id, email: user.email, roleId: user.roleId }),
        refreshToken: this.generateRefreshToken(user.id, (user as any).tokenVersion || 0),
      };
    } catch {
      throw new HttpError(401, 'Invalid refresh token');
    }
  }

  async getCurrentUser(userId: string): Promise<UserResponseDTO> {
    const user = await this.repository.findById(userId);
    if (!user) throw new HttpError(404, 'User not found');
    return this.mapUser(user);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.repository.findById(userId);
    if (!user) throw new HttpError(404, 'User not found');

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new HttpError(401, 'Current password is incorrect');

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.repository.updatePassword(userId, hashed, false);
  }

  private mapUser(user: any): UserResponseDTO {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      phoneNumber: user.phoneNumber,
      jobTitle: user.jobTitle,
      bio: user.bio,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      role: user.role,
    };
  }
}
