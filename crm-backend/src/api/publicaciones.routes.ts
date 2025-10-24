import { Router } from 'express';
import { getPublicaciones, createPublicacion, getPublicacionById, updatePublicacion, deletePublicacion } from '../controllers/publicaciones.controller';

const router = Router();

router.get('/', getPublicaciones);
router.post('/', createPublicacion);
router.get('/:id', getPublicacionById);
router.put('/:id', updatePublicacion);
router.delete('/:id', deletePublicacion);

export default router;