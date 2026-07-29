import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../lib/prisma';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; roleId: string };
}

export async function authMiddleware(req: AuthRequest, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return next();

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; email: string; roleId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, roleId: true, isActive: true },
    });

    if (user && user.isActive) {
      req.user = user;
    }
    next();
  } catch {
    next();
  }
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required', errors: [] });
    return;
  }
  next();
}

export function requireRole(...roles: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required', errors: [] });
      return;
    }

    const role = await prisma.role.findUnique({ where: { id: req.user.roleId }, select: { name: true } });
    if (!role || !roles.includes(role.name)) {
      res.status(403).json({ success: false, message: 'Insufficient permissions', errors: [] });
      return;
    }
    next();
  };
}
