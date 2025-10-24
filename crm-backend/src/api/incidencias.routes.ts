import { Router } from 'express';
import { getIncidencias, createIncidencia, getIncidenciaById, updateIncidencia, deleteIncidencia } from '../controllers/incidencias.controller';

const router = Router();

router.get('/', getIncidencias);
router.post('/', createIncidencia);
router.get('/:id', getIncidenciaById);
router.put('/:id', updateIncidencia);
router.delete('/:id', deleteIncidencia);

export default router;