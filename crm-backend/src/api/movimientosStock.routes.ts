import { Router } from 'express';
import * as controller from '../controllers/movimientosStock.controller';

const router = Router();

// Obtener todos los movimientos de stock
router.get('/', controller.getMovimientosStock);

// Crear nuevo movimiento de stock
router.post('/', controller.createMovimientoStock);

// Obtener alertas de stock (crítico y mínimo)
router.get('/alertas', controller.getAlertasStock);

// Obtener movimientos de un producto específico
router.get('/producto/:id', controller.getMovimientosProducto);

export default router;
