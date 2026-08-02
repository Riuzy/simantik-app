import { Response } from 'express';

interface ApiResponseBody<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
  errors?: unknown[];
  timestamp: string;
  path?: string;
}

export class ApiResponse {
  static success<T>(res: Response, data: T, message = 'Success', statusCode = 200): void {
    const body: ApiResponseBody<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
    res.status(statusCode).json(body);
  }

  static created<T>(res: Response, data: T, message = 'Created successfully'): void {
    ApiResponse.success(res, data, message, 201);
  }

  static noContent(res: Response): void {
    res.status(204).send();
  }

  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    totalPages: number,
  ): void {
    const body: ApiResponseBody<T[]> = {
      success: true,
      message: 'Success',
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(body);
  }

  static error(
    res: Response,
    message: string,
    statusCode = 500,
    errors?: unknown[],
  ): void {
    const body: ApiResponseBody = {
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    };
    res.status(statusCode).json(body);
  }
}
