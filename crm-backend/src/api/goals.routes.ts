import { Router } from 'express';
import { getGoals, createGoal, getGoalById, updateGoal, deleteGoal } from '../controllers/goals.controller'; // FIX: Added missing exports

const router = Router();

router.get('/', getGoals);
router.post('/', createGoal);
router.get('/:id', getGoalById);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);

export default router;