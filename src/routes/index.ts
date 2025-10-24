import express from 'express';
import authRouter from './auth';
import usersRouter from './users';
import rolesRouter from './roles';
import campaignsRouter from './campaigns';
import metaCampaignsRouter from './metaCampaigns';
import expensesRouter from './expenses';
import publicationsRouter from './publications';
import followersRouter from './followers';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/roles', rolesRouter);
router.use('/campaigns', campaignsRouter);
router.use('/meta-campaigns', metaCampaignsRouter);
router.use('/expenses', expensesRouter);

// Social media
router.use('/publications', publicationsRouter);
router.use('/followers', followersRouter);

export default router;