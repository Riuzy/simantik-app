import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../lib/prisma';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    roleId: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as {
      id: string;
      email: string;
      roleId: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, roleId: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return next();
    }

    req.user = user;
    next();
  } catch {
    next();
  }
};

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
      timestamp: new Date().toISOString(),
      path: req.path,
    });
    return;
  }
  next();
};

export const requireRole = (...roleNames: string[]) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
        path: req.path,
      });
      return;
    }

    const userRole = await prisma.role.findUnique({
      where: { id: req.user.roleId },
      select: { name: true },
    });

    if (!userRole || !roleNames.includes(userRole.name)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        timestamp: new Date().toISOString(),
        path: req.path,
      });
      return;
    }

    next();
  };
};

export const requirePermission = (...permissionCodes: string[]) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
        path: req.path,
      });
      return;
    }

    const userRole = await prisma.role.findUnique({
      where: { id: req.user.roleId },
      select: {
        name: true,
        permissions: {
          include: {
            permission: {
              select: { code: true },
            },
          },
        },
      },
    });

    if (!userRole) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        timestamp: new Date().toISOString(),
        path: req.path,
      });
      return;
    }

    if (userRole.name === 'Manager') {
      return next();
    }

    const userPermissions = userRole.permissions.map(rp => rp.permission.code);
    const hasAll = permissionCodes.every(code => userPermissions.includes(code));

    if (!hasAll) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        timestamp: new Date().toISOString(),
        path: req.path,
      });
      return;
    }

    next();
  };
};
