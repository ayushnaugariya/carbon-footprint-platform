import { Router } from 'express';
import { getHistory, getLatestWithInsights, submitFootprint } from '../controllers/footprint.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { footprintInputSchema } from '../types/footprint';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(requireAuth);
router.post('/', validateBody(footprintInputSchema), asyncHandler(submitFootprint));
router.get('/history', asyncHandler(getHistory));
router.get('/latest', asyncHandler(getLatestWithInsights));

export default router;
