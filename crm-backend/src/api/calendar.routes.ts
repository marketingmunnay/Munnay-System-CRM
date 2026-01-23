import { Router } from 'express';
import { 
    getAppointments, 
    createAppointment, 
    updateAppointment, 
    updateAppointmentStatus, 
    getResources,
    deleteAppointment,
    checkIn,
    startService,
    completeAppointment,
    noShow
} from '../controllers/calendar.controller';

const router = Router();

// Appointments
router.get('/appointments', getAppointments);
router.post('/appointments', createAppointment);
router.put('/appointments/:id', updateAppointment);
router.patch('/appointments/:id/status', updateAppointmentStatus);

// Lifecycle Actions (Fresha Style)
router.patch('/appointments/:id/check-in', checkIn);
router.patch('/appointments/:id/start-service', startService);
router.patch('/appointments/:id/complete', completeAppointment);
router.patch('/appointments/:id/no-show', noShow);

router.delete('/appointments/:id', deleteAppointment);

// Resources
router.get('/resources', getResources);

export default router;
