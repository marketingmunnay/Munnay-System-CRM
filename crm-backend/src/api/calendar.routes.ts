import { Router } from 'express';
import { getResources, getAppointments, createAppointment, deleteAppointment } from '../controllers/calendar.controller';

const router = Router();

router.get('/resources', getResources);
router.get('/appointments', getAppointments);
router.post('/appointments', createAppointment);
router.delete('/appointments/:id', deleteAppointment);

export default router;
