import { Response } from 'express';

interface ApiResponseBody<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown[];
}

export class ApiResponse {
  static success<T>(res: Response, data: T, message = 'Success', statusCode = 200): void {
    res.status(statusCode).json({ success: true, message, data } satisfies ApiResponseBody<T>);
  }

  static created<T>(res: Response, data: T, message = 'Created'): void {
    ApiResponse.success(res, data, message, 201);
  }

  static noContent(res: Response): void {
    res.status(204).send();
  }

  static paginated<T>(res: Response, data: T[], page: number, limit: number, total: number, totalPages: number): void {
    ApiResponse.success(res, { items: data, pagination: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 } });
  }

  static error(res: Response, message: string, statusCode = 500, errors?: unknown[]): void {
    res.status(statusCode).json({ success: false, message, errors } satisfies ApiResponseBody);
  }
}
