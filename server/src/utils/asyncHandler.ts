import { NextFunction, Request, Response } from 'express';

type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<void> | void;

/**
 * Express 4 does not automatically forward rejected promises from async
 * route handlers to the error middleware. This wrapper catches them and
 * calls next(err) so AppError (and any unexpected error) is always handled
 * centrally instead of crashing the process or hanging the request.
 */
export function asyncHandler(handler: AsyncRouteHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
