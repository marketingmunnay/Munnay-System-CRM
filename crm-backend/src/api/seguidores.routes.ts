import { Router } from 'express';
import { getSeguidores, createSeguidor, getSeguidorById, updateSeguidor, deleteSeguidor } from '../controllers/seguidores.controller';

const router = Router();

router.get('/', getSeguidores);
router.post('/', createSeguidor);
router.get('/:id', getSeguidorById);
router.put('/:id', updateSeguidor);
router.delete('/:id', deleteSeguidor);

export default router;