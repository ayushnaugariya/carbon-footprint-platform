/**
 * Module augmentation for the Express Request type.
 *
 * Adds the `auth` property that is attached by the `requireAuth`
 * middleware after successful JWT verification. This gives TypeScript
 * project-wide type-safety for `req.auth` without scattered `as` casts.
 */
import type { JwtPayload } from '../services/authService';

declare global {
  namespace Express {
    interface Request {
      /** Populated by `requireAuth` middleware after successful JWT verification. */
      auth?: JwtPayload;
    }
  }
}

export {};
