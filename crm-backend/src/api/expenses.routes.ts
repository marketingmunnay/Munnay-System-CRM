import { Router } from 'express';
import { getExpenses, createExpense, getExpenseById, updateExpense, deleteExpense, uploadComprobante, uploadComprobanteMiddleware } from '../controllers/expenses.controller';

const router = Router();

router.get('/', getExpenses);
router.post('/', createExpense);
// Upload comprobante (file) — returns { url, mimeType, name, size }
router.post('/upload', uploadComprobanteMiddleware, uploadComprobante);
router.get('/:id', getExpenseById);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router;