import { Router } from 'express';
import { getExpenses, createExpense, getExpenseById, updateExpense, deleteExpense, bulkImportExpenses, getRawEgresoDates } from '../controllers/expenses.controller';

const router = Router();

router.get('/', getExpenses);
// Endpoint temporal para ver fechas crudas de los últimos 10 egresos
router.get('/raw-dates', getRawEgresoDates);
router.post('/', createExpense);
router.post('/bulk', bulkImportExpenses);
router.get('/:id', getExpenseById);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router;