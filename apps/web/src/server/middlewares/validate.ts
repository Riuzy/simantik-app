import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

type RequestPart = 'body' | 'query' | 'params';

type ValidationSchemas = {
  [K in RequestPart]?: ZodSchema;
};

export function validate(schemas: ValidationSchemas) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      for (const [part, schema] of Object.entries(schemas) as [RequestPart, ZodSchema][]) {
        const parsed = await schema.parseAsync(req[part]);
        (req as any)[part] = parsed;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
