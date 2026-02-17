import { Router } from 'express';
import { getGoals, createGoal, getGoalById, updateGoal, deleteGoal, getGoalProgress } from '../controllers/goals.controller';
import { requireAdmin, requireAuth, requireSelfOrAdmin } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', requireAuth, getGoals);
router.post('/', requireAdmin, createGoal);
router.get('/progress/:userId', requireSelfOrAdmin('userId'), getGoalProgress);
router.get('/:id', requireAdmin, getGoalById);
router.put('/:id', requireAdmin, updateGoal);
router.delete('/:id', requireAdmin, deleteGoal);

export default router;