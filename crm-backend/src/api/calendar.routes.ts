import { Router } from 'express';
import { 
    getAppointments, 
    createAppointment, 
    updateAppointment, 
    updateAppointmentStatus, 
    getResources,
    getAmbientes,
    deleteAppointment,
    checkIn,
    startService,
    completeAppointment,
    noShow,
    moveAppointment,
    createResource,
    updateResource,
    deleteResource
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

// Drag & Drop
router.patch('/appointments/move', moveAppointment);

// Resources
router.get('/resources', getResources);
router.get('/ambientes', getAmbientes);
router.post('/resources', createResource);
router.put('/resources/:id', updateResource);
router.delete('/resources/:id', deleteResource);

export default router;
