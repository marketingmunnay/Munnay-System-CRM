import { Router } from 'express';
import { getVentas, createVenta, getVentaById, updateVenta, deleteVenta } from '../controllers/ventas.controller';

const router = Router();

router.get('/', getVentas);
router.post('/', createVenta);
router.get('/:id', getVentaById);
router.put('/:id', updateVenta);
router.delete('/:id', deleteVenta);

export default router;