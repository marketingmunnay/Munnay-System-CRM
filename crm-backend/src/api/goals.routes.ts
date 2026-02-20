import { Router } from 'express';
import { getGoals, createGoal, getGoalById, updateGoal, deleteGoal, getGoalProgress, getMyGoals } from '../controllers/goals.controller';
import { requireRole } from '../middlewares/requireRole';
import { requireAdmin, requireAuth, requireSelfOrAdmin } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

// Solo admin puede ver todas las metas
router.get('/', requireRole('Admin'), getGoals);
// Endpoint para metas propias
router.get('/me', getMyGoals);
router.post('/', requireAdmin, createGoal);
router.get('/progress/:userId', requireSelfOrAdmin('userId'), getGoalProgress);
router.get('/:id', requireAdmin, getGoalById);
router.put('/:id', requireAdmin, updateGoal);
router.delete('/:id', requireAdmin, deleteGoal);

export default router;