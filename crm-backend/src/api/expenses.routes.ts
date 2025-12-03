import { Router } from 'express';
import { getExpenses, createExpense, getExpenseById, updateExpense, deleteExpense } from '../controllers/expenses.controller';

const router = Router();

router.get('/', getExpenses);
router.post('/', createExpense);
router.get('/:id', getExpenseById);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router;