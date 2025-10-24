import { Router } from 'express';
import leadsRouter from './leads.routes';
import rolesRouter from './roles.routes';
import campaignsRouter from './campaigns.routes';
import expensesRouter from './expenses.routes';

const router = Router();

router.use('/leads', leadsRouter);
router.use('/roles', rolesRouter);
router.use('/campaigns', campaignsRouter);
router.use('/expenses', expensesRouter);
// router.use('/users', usersRouter);
// ... etc

export default router;