import { Router } from 'express';
import { getRecommendations } from '../controllers/insights.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(requireAuth);
router.get('/recommendations', asyncHandler(getRecommendations));

export default router;
