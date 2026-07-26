import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { HttpException } from '../lib/exceptions';
import { logger } from '../lib/logger';

// Re-export for backward compatibility with modules
export { HttpException as AppError } from '../lib/exceptions';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
): void => {
  if (err instanceof HttpException) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || [],
      timestamp: new Date().toISOString(),
      path: req.path,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      })),
      timestamp: new Date().toISOString(),
      path: req.path,
    });
    return;
  }

  logger.error({ err, reqId: (req as unknown as Record<string, unknown>).id }, 'Unhandled error');

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    errors: [],
    timestamp: new Date().toISOString(),
    path: req.path,
  });
};
