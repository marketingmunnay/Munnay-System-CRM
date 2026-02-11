import express from 'express';
import { getShifts, saveShift, deleteShift, generateRecurringShifts, getShiftByUserAndDate } from '../controllers/shifts.controller';

const router = express.Router();

router.get('/', getShifts);
router.get('/user/:userId/date/:date', getShiftByUserAndDate);
router.post('/', saveShift);
router.delete('/:id', deleteShift);
router.post('/recurring', generateRecurringShifts);

export default router;
