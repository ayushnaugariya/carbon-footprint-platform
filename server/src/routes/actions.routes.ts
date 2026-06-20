import { Router } from 'express';
import { completeAction, completeActionSchema, getCatalog, listCompleted } from '../controllers/actions.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';

const router = Router();

router.get('/catalog', getCatalog);
router.use(requireAuth);
router.post('/complete', validateBody(completeActionSchema), completeAction);
router.get('/', listCompleted);

export default router;
