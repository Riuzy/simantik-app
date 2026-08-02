import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { HttpError } from '../lib/errors';
import { logger } from '../lib/logger';

export { HttpError as AppError } from '../lib/errors';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || [],
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const message = err.code === 'P2025' ? 'Resource not found' : 'Database error';
    const status = err.code === 'P2025' ? 404 : 400;
    res.status(status).json({ success: false, message, errors: [{ code: err.code }] });
    return;
  }

  logger.error({ err, reqId: req.id }, 'Unhandled error');
  res.status(500).json({ success: false, message: 'Internal server error', errors: [] });
}
