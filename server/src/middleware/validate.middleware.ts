import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from './auth.middleware';

/**
 * Validates req.body against the given zod schema. On success, replaces
 * req.body with the parsed (and defaulted/coerced) value so downstream
 * handlers can trust its shape. On failure, forwards a 400 AppError with a
 * readable summary of every validation issue.
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
      return next(new AppError(`Validation failed: ${message}`, 400));
    }
    req.body = result.data;
    next();
  };
}
