import { Router } from 'express';
import { getExpenses, createExpense, getExpenseById, updateExpense, deleteExpense, bulkImportExpenses } from '../controllers/expenses.controller';

const router = Router();

router.get('/', getExpenses);
router.post('/', createExpense);
router.post('/bulk', bulkImportExpenses);
router.get('/:id', getExpenseById);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router;