import express from 'express';
import { getShifts, saveShift, deleteShift, generateRecurringShifts } from '../controllers/shifts.controller';

const router = express.Router();

router.get('/', getShifts);
router.post('/', saveShift);
router.delete('/:id', deleteShift);
router.post('/recurring', generateRecurringShifts);

export default router;
