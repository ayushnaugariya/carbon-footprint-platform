import { NextFunction, Request, Response } from 'express';
import { AppError } from './auth.middleware';
import { config } from '../config/env';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  const statusCode = err instanceof AppError ? err.statusCode : 500;

  // In production, mask internal error details to avoid leaking stack traces or
  // implementation hints. Use the AppError message only for client-facing errors
  // (4xx); suppress it for unexpected server errors (5xx).
  const isClientError = statusCode >= 400 && statusCode < 500;
  const message =
    config.nodeEnv === 'production' && !isClientError ? 'Internal server error' : err.message;

  // Always log unexpected server errors with full context server-side.
  // Stack traces are NEVER sent in HTTP responses — not even in development —
  // since that would expose internal file paths and implementation details.
  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error('[Server Error]', err);
  }

  res.status(statusCode).json({ error: message });
}

