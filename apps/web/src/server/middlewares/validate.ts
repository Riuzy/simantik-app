import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

type RequestPart = 'body' | 'query' | 'params';

declare global {
  namespace Express {
    interface Request {
      validated: Partial<Record<'body' | 'query' | 'params', unknown>>;
    }
  }
}

type ValidationSchemas = {
  [K in RequestPart]?: ZodSchema;
};

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

      for (const [part, schema] of Object.entries({ body: schemas.body, query: schemas.query, params: schemas.params }) as [string, ZodSchema][]) {
        if (!schema) continue;
        const parsed = await schema.parseAsync(req[part as 'body' | 'query' | 'params']);
        req.validated[part] = parsed;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}