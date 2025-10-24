import { Router } from 'express';
import leadsRouter from './leads.routes';

const router = Router();

router.use('/leads', leadsRouter);
// router.use('/users', usersRouter);
// router.use('/campaigns', campaignsRouter);
// ... etc

export default router;
