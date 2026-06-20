import { Router } from 'express';
import { guestLogin, guestSchema, login, loginSchema, me, signup, signupSchema } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { authRateLimiter } from '../middleware/rateLimiter.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/signup', authRateLimiter, validateBody(signupSchema), asyncHandler(signup));
router.post('/login', authRateLimiter, validateBody(loginSchema), asyncHandler(login));
router.post('/guest', authRateLimiter, validateBody(guestSchema), asyncHandler(guestLogin));
router.get('/me', requireAuth, me);

export default router;
