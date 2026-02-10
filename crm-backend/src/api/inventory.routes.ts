import { Router } from 'express';
import {
  // Configuración
  getConfiguracionProducto,
  crearConfiguracionProducto,
  actualizarConfiguracionProducto,
  
  // Movimientos
  registrarMovimiento,
  getMovimientos,
  
  // Pagos parciales
  crearPagoProducto,
  abonarPagoProducto,
  entregarProducto,
  getPagosProductos,
  
  // Alertas
  getAlertas,
  marcarAlertaVista,
  resolverAlerta,
  
  // Reportes
  getReporteInventario
} from '../controllers/inventory.controller';

const router = Router();

// ========================================
// CONFIGURACIÓN DE PRODUCTOS
// ========================================
router.get('/configuracion/:productoId', getConfiguracionProducto);
router.post('/configuracion', crearConfiguracionProducto);
router.put('/configuracion/:id', actualizarConfiguracionProducto);

// ========================================
// MOVIMIENTOS
// ========================================
router.post('/movimientos', registrarMovimiento);
router.get('/movimientos', getMovimientos);

// ========================================
// PAGOS PARCIALES Y PREPAGOS
// ========================================
router.post('/pagos', crearPagoProducto);
router.post('/pagos/:id/abonar', abonarPagoProducto);
router.post('/pagos/:id/entregar', entregarProducto);
router.get('/pagos', getPagosProductos);

// ========================================
// ALERTAS
// ========================================
router.get('/alertas', getAlertas);
router.patch('/alertas/:id/vista', marcarAlertaVista);
router.patch('/alertas/:id/resolver', resolverAlerta);

// ========================================
// REPORTES
// ========================================
router.get('/reporte', getReporteInventario);

export default router;
