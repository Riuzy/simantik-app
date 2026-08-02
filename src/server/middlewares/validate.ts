import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

type RequestPart = 'body' | 'query' | 'params';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      id?: string;
      validated: Partial<Record<'body' | 'query' | 'params', unknown>>;
    }
  }
}

export function validate(schemas: { body?: ZodSchema; query?: ZodSchema; params?: ZodSchema }) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      req.validated = req.validated || {};
      if (req.validated.body === undefined && !schemas.body) {
        req.validated.body = req.body;
      }
      if (req.validated.query === undefined && !schemas.query) {
        req.validated.query = req.query;
      }
      if (req.validated.params === undefined && !schemas.params) {
        req.validated.params = req.params;
      }

      for (const part of ['body', 'query', 'params'] as RequestPart[]) {
        const schema = schemas[part];
        if (!schema) continue;
        const parsed = await schema.parseAsync(req[part]);
        req.validated[part] = parsed;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
