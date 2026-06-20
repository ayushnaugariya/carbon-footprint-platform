import { NextFunction, Request, Response } from 'express';
import { AppError } from './auth.middleware';
import { config } from '../config/env';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  const statusCode = err instanceof AppError ? err.statusCode : 500;

  // Never leak stack traces or internal error details in production responses.
  const body: Record<string, unknown> = {
    error: statusCode === 500 && config.nodeEnv === 'production' ? 'Internal server error' : err.message
  };

  if (config.nodeEnv !== 'production') {
    body.stack = err.stack;
  }

  if (statusCode === 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(statusCode).json(body);
}
