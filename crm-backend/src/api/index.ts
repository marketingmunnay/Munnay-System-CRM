import { Router } from 'express';
import leadsRouter from './leads.routes';
import rolesRouter from './roles.routes';
import campaignsRouter from './campaigns.routes';
import expensesRouter from './expenses.routes';
import publicacionesRouter from './publicaciones.routes';
import seguidoresRouter from './seguidores.routes';
import ventasRouter from './ventas.routes';
import incidenciasRouter from './incidencias.routes';
import proveedoresRouter from './proveedores.routes';
import usersRouter from './users.routes';
import configRouter from './config.routes';
import goalsRouter from './goals.routes';
import comprobantesRouter from './comprobantes.routes'; // Assumed name for consistency

const router = Router();

router.use('/leads', leadsRouter);
router.use('/roles', rolesRouter);
router.use('/campaigns', campaignsRouter);
router.use('/expenses', expensesRouter);
router.use('/publicaciones', publicacionesRouter);
router.use('/seguidores', seguidoresRouter);
router.use('/ventas-extra', ventasRouter);
router.use('/incidencias', incidenciasRouter);
router.use('/proveedores', proveedoresRouter);
router.use('/users', usersRouter);
router.use('/config', configRouter);
router.use('/goals', goalsRouter);
// FIX: Add comprobantes router to be handled by the API.
router.use('/config/comprobantes', comprobantesRouter);


export default router;