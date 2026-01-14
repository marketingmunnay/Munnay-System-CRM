import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// ========================================
// CONFIGURACIÓN DE PRODUCTOS
// ========================================

export const getConfiguracionProducto = async (req: Request, res: Response) => {
  const productoId = parseInt(req.params.productoId);
  
  try {
    const config = await prisma.configuracionProducto.findUnique({
      where: { productoId },
      include: {
        movimientos: {
          orderBy: { createdAt: 'desc' },
          take: 50
        },
        alertas: {
          where: { resuelto: false },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!config) {
      return res.status(404).json({ message: 'Configuración no encontrada' });
    }
    
    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener configuración', error: (error as Error).message });
  }
};

export const crearConfiguracionProducto = async (req: Request, res: Response) => {
  const { productoId, stockActual, stockMinimo, unidadMedida, equivalenciaBase, costoUnitario, aplicaIGV, igvPorcentaje, alertasActivas } = req.body;
  
  try {
    // Verificar que el producto existe
    const producto = await prisma.product.findUnique({ where: { id: productoId } });
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    // Verificar que no exista configuración previa
    const existente = await prisma.configuracionProducto.findUnique({ where: { productoId } });
    if (existente) {
      return res.status(400).json({ message: 'El producto ya tiene configuración de inventario' });
    }
    
    const config = await prisma.configuracionProducto.create({
      data: {
        productoId,
        stockActual: stockActual || 0,
        stockMinimo: stockMinimo || 5,
        unidadMedida: unidadMedida || 'unidades',
        equivalenciaBase: equivalenciaBase || 1,
        costoUnitario: costoUnitario || 0,
        aplicaIGV: aplicaIGV !== undefined ? aplicaIGV : true,
        igvPorcentaje: igvPorcentaje || 18,
        alertasActivas: alertasActivas !== undefined ? alertasActivas : true
      }
    });
    
    // Crear movimiento inicial
    await prisma.movimientoInventario.create({
      data: {
        configuracionProductoId: config.id,
        tipoMovimiento: 'entrada',
        cantidad: stockActual || 0,
        stockAnterior: 0,
        stockNuevo: stockActual || 0,
        costoUnitario: costoUnitario || 0,
        precioVenta: producto.precio,
        motivo: 'Stock inicial',
        creadoPor: req.body.usuario || 'Sistema'
      }
    });
    
    res.status(201).json(config);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear configuración', error: (error as Error).message });
  }
};

export const actualizarConfiguracionProducto = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { stockMinimo, unidadMedida, equivalenciaBase, costoUnitario, aplicaIGV, igvPorcentaje, alertasActivas } = req.body;
  
  try {
    const config = await prisma.configuracionProducto.update({
      where: { id },
      data: {
        ...(stockMinimo !== undefined && { stockMinimo }),
        ...(unidadMedida && { unidadMedida }),
        ...(equivalenciaBase !== undefined && { equivalenciaBase }),
        ...(costoUnitario !== undefined && { costoUnitario }),
        ...(aplicaIGV !== undefined && { aplicaIGV }),
        ...(igvPorcentaje !== undefined && { igvPorcentaje }),
        ...(alertasActivas !== undefined && { alertasActivas })
      }
    });
    
    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar configuración', error: (error as Error).message });
  }
};

// ========================================
// MOVIMIENTOS DE INVENTARIO
// ========================================

export const registrarMovimiento = async (req: Request, res: Response) => {
  const { configuracionProductoId, tipoMovimiento, cantidad, costoUnitario, precioVenta, motivo, referencia, creadoPor } = req.body;
  
  try {
    // Validar configuración existe
    const config = await prisma.configuracionProducto.findUnique({
      where: { id: configuracionProductoId }
    });
    
    if (!config) {
      return res.status(404).json({ message: 'Configuración de producto no encontrada' });
    }
    
    // Validar stock no negativo en salidas
    if (tipoMovimiento === 'salida' && config.stockActual < cantidad) {
      return res.status(400).json({ 
        message: 'Stock insuficiente', 
        stockActual: config.stockActual,
        cantidadSolicitada: cantidad
      });
    }
    
    // Calcular nuevo stock
    let nuevoStock = config.stockActual;
    if (tipoMovimiento === 'entrada') {
      nuevoStock += cantidad;
    } else if (tipoMovimiento === 'salida') {
      nuevoStock -= cantidad;
    } else if (tipoMovimiento === 'ajuste') {
      nuevoStock = cantidad; // El ajuste establece el stock directamente
    }
    
    // Registrar movimiento
    const movimiento = await prisma.movimientoInventario.create({
      data: {
        configuracionProductoId,
        tipoMovimiento,
        cantidad,
        stockAnterior: config.stockActual,
        stockNuevo: nuevoStock,
        costoUnitario: costoUnitario || 0,
        precioVenta: precioVenta || 0,
        motivo,
        referencia,
        creadoPor
      }
    });
    
    // Actualizar stock
    await prisma.configuracionProducto.update({
      where: { id: configuracionProductoId },
      data: { stockActual: nuevoStock }
    });
    
    // Verificar alertas de stock
    await verificarAlertas(configuracionProductoId);
    
    res.status(201).json(movimiento);
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar movimiento', error: (error as Error).message });
  }
};

export const getMovimientos = async (req: Request, res: Response) => {
  const configuracionProductoId = req.query.configuracionProductoId ? parseInt(req.query.configuracionProductoId as string) : undefined;
  
  try {
    const movimientos = await prisma.movimientoInventario.findMany({
      where: configuracionProductoId ? { configuracionProductoId } : {},
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    
    res.status(200).json(movimientos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener movimientos', error: (error as Error).message });
  }
};

// ========================================
// PAGOS PARCIALES Y PREPAGOS
// ========================================

export const crearPagoProducto = async (req: Request, res: Response) => {
  const { productoId, nHistoria, montoTotal, montoPagado, esPrepago, observaciones, entregarAhora } = req.body;
  
  try {
    // Validar producto existe
    const producto = await prisma.product.findUnique({ where: { id: productoId } });
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    // Validar configuración existe
    const config = await prisma.configuracionProducto.findUnique({ where: { productoId } });
    if (!config) {
      return res.status(400).json({ message: 'El producto no tiene configuración de inventario' });
    }
    
    const saldoPendiente = montoTotal - montoPagado;
    
    // Determinar estados
    let estadoPago: string;
    if (montoPagado === 0) {
      estadoPago = 'pendiente';
    } else if (montoPagado < montoTotal) {
      estadoPago = 'parcial';
    } else {
      estadoPago = 'completado';
    }
    
    let estadoProducto: string;
    let fechaEntrega: Date | null = null;

    if (esPrepago || config.stockActual === 0) {
      estadoProducto = 'pendiente_stock';
    } else if (estadoPago === 'completado') {
      if (entregarAhora) {
        estadoProducto = 'entregado';
        fechaEntrega = new Date();
      } else {
        estadoProducto = 'pendiente_entrega';
      }
    } else {
      estadoProducto = 'reservado';
    }
    
    const pagoProducto = await prisma.pagoProducto.create({
      data: {
        productoId,
        nHistoria,
        montoTotal,
        montoPagado,
        saldoPendiente,
        estadoPago,
        estadoProducto,
        esPrepago,
        observaciones,
        fechaEntrega // Add fechaEntrega
      }
    });
    
    // Si hay pago inicial, registrar en historial
    if (montoPagado > 0) {
      await prisma.historialPagoProducto.create({
        data: {
          pagoProductoId: pagoProducto.id,
          montoAbonado: montoPagado,
          metodoPago: req.body.metodoPago || 'Efectivo',
          registradoPor: req.body.usuario || 'Sistema',
          observaciones: 'Pago inicial'
        }
      });
    }
    
    // Si es prepago o no hay stock, no reservar físicamente
    // Si hay stock y es pago completo:
    if (!esPrepago && config.stockActual > 0 && estadoPago === 'completado') {
        if (entregarAhora) {
             // Entrega Inmediata: Descontar stock con movimiento 'salida'
            await prisma.movimientoInventario.create({
                data: {
                  configuracionProductoId: config.id,
                  tipoMovimiento: 'salida',
                  cantidad: 1,
                  stockAnterior: config.stockActual,
                  stockNuevo: config.stockActual - 1,
                  precioVenta: montoTotal,
                  motivo: `Venta directa a ${nHistoria}`,
                  referencia: pagoProducto.id.toString(),
                  creadoPor: req.body.usuario || 'Sistema'
                }
            });

            await prisma.configuracionProducto.update({
                where: { id: config.id },
                data: { stockActual: config.stockActual - 1 }
            });

            await verificarAlertas(config.id);

        } else {
             // Reserva Normal
            await prisma.movimientoInventario.create({
                data: {
                  configuracionProductoId: config.id,
                  tipoMovimiento: 'reserva',
                  cantidad: 1,
                  stockAnterior: config.stockActual,
                  stockNuevo: config.stockActual - 1,
                  precioVenta: montoTotal,
                  motivo: `Reserva para ${nHistoria}`,
                  referencia: pagoProducto.id.toString(),
                  creadoPor: req.body.usuario || 'Sistema'
                }
              });
              
              await prisma.configuracionProducto.update({
                where: { id: config.id },
                data: { stockActual: config.stockActual - 1 }
              });
              
              await verificarAlertas(config.id);
        }
    }
    
    res.status(201).json(pagoProducto);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear pago de producto', error: (error as Error).message });
  }
};

export const abonarPagoProducto = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { montoAbonado, metodoPago, registradoPor, observaciones } = req.body;
  
  try {
    const pagoProducto = await prisma.pagoProducto.findUnique({ where: { id } });
    if (!pagoProducto) {
      return res.status(404).json({ message: 'Pago de producto no encontrado' });
    }
    
    if (pagoProducto.estadoPago === 'completado') {
      return res.status(400).json({ message: 'El pago ya está completado' });
    }
    
    if (pagoProducto.estadoPago === 'cancelado') {
      return res.status(400).json({ message: 'El pago está cancelado' });
    }
    
    const nuevoMontoPagado = pagoProducto.montoPagado + montoAbonado;
    const nuevoSaldoPendiente = pagoProducto.montoTotal - nuevoMontoPagado;
    
    if (nuevoMontoPagado > pagoProducto.montoTotal) {
      return res.status(400).json({ message: 'El monto abonado excede el saldo pendiente' });
    }
    
    const nuevoEstadoPago = nuevoSaldoPendiente === 0 ? 'completado' : 'parcial';
    
    // Determinar nuevo estado del producto
    let nuevoEstadoProducto = pagoProducto.estadoProducto;
    if (nuevoEstadoPago === 'completado') {
      if (pagoProducto.esPrepago) {
        nuevoEstadoProducto = 'pendiente_stock';
      } else {
        const config = await prisma.configuracionProducto.findUnique({ 
          where: { productoId: pagoProducto.productoId } 
        });
        if (config && config.stockActual > 0) {
          nuevoEstadoProducto = 'pendiente_entrega';
          
          // Reservar stock si aún no se había reservado
          if (pagoProducto.estadoProducto !== 'pendiente_entrega') {
            await prisma.movimientoInventario.create({
              data: {
                configuracionProductoId: config.id,
                tipoMovimiento: 'reserva',
                cantidad: 1,
                stockAnterior: config.stockActual,
                stockNuevo: config.stockActual - 1,
                precioVenta: pagoProducto.montoTotal,
                motivo: `Reserva completada para ${pagoProducto.nHistoria}`,
                referencia: id.toString(),
                creadoPor: registradoPor || 'Sistema'
              }
            });
            
            await prisma.configuracionProducto.update({
              where: { id: config.id },
              data: { stockActual: config.stockActual - 1 }
            });
            
            await verificarAlertas(config.id);
          }
        } else {
          nuevoEstadoProducto = 'pendiente_stock';
        }
      }
    }
    
    // Registrar abono
    await prisma.historialPagoProducto.create({
      data: {
        pagoProductoId: id,
        montoAbonado,
        metodoPago,
        registradoPor,
        observaciones
      }
    });
    
    // Actualizar pago
    const pagoActualizado = await prisma.pagoProducto.update({
      where: { id },
      data: {
        montoPagado: nuevoMontoPagado,
        saldoPendiente: nuevoSaldoPendiente,
        estadoPago: nuevoEstadoPago,
        estadoProducto: nuevoEstadoProducto
      },
      include: {
        historialPagos: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    res.status(200).json(pagoActualizado);
  } catch (error) {
    res.status(500).json({ message: 'Error al abonar pago', error: (error as Error).message });
  }
};

export const entregarProducto = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { entregadoPor } = req.body;
  
  try {
    const pagoProducto = await prisma.pagoProducto.findUnique({ where: { id } });
    if (!pagoProducto) {
      return res.status(404).json({ message: 'Pago de producto no encontrado' });
    }
    
    // Validar que el pago esté completado
    if (pagoProducto.estadoPago !== 'completado') {
      return res.status(400).json({ 
        message: 'El producto no puede ser entregado sin pago completo',
        saldoPendiente: pagoProducto.saldoPendiente
      });
    }
    
    const config = await prisma.configuracionProducto.findUnique({ 
      where: { productoId: pagoProducto.productoId } 
    });
    
    if (!config) {
      return res.status(400).json({ message: 'Configuración de producto no encontrada' });
    }
    
    // Si el estado es "entregado", ya fue entregado
    if (pagoProducto.estadoProducto === 'entregado') {
      return res.status(400).json({ message: 'El producto ya fue entregado anteriormente' });
    }

    // Lógica diferenciada segun estado previo
    if (pagoProducto.estadoProducto === 'pendiente_stock') {
        // Estaba esperando stock. Verificamos disponibilidad actual.
        if (config.stockActual <= 0) {
            return res.status(400).json({ message: 'No hay stock físico para entregar este producto pendiente.' });
        }

        // Si hay Stock, procedemos a descontar y entregar
        await prisma.movimientoInventario.create({
            data: {
              configuracionProductoId: config.id,
              tipoMovimiento: 'salida',
              cantidad: 1,
              stockAnterior: config.stockActual,
              stockNuevo: config.stockActual - 1,
              precioVenta: pagoProducto.montoTotal,
              motivo: `Entrega de pendiente_stock a ${pagoProducto.nHistoria}`,
              referencia: id.toString(),
              creadoPor: entregadoPor || 'Sistema'
            }
          });
          
          await prisma.configuracionProducto.update({
            where: { id: config.id },
            data: { stockActual: config.stockActual - 1 }
          });
    } else {
        // Estado 'pendiente_entrega' o 'reservado' (si es que la lógica lo permite)
        // Se asume que en 'pendiente_entrega' el stock YA fue descontado/reservado.
        // Solo registramos la salida física (sin cambio de stock neto si ya estaba reservado)
        
        // NOTA: Si estaba reservado, el stock fisico ya bajó.
        // Registramos salida como confirmación.
        
        await prisma.movimientoInventario.create({
            data: {
              configuracionProductoId: config.id,
              tipoMovimiento: 'salida',
              cantidad: 1,
              stockAnterior: config.stockActual,
              stockNuevo: config.stockActual, // No cambia porque ya se descontó en reserva
              precioVenta: pagoProducto.montoTotal,
              motivo: `Entrega confirmada a ${pagoProducto.nHistoria}`,
              referencia: id.toString(),
              creadoPor: entregadoPor || 'Sistema'
            }
          });
    }
    
    // Actualizar estado
    const pagoActualizado = await prisma.pagoProducto.update({
      where: { id },
      data: {
        estadoProducto: 'entregado',
        fechaEntrega: new Date()
      }
    });
    
    res.status(200).json(pagoActualizado);
  } catch (error) {
    res.status(500).json({ message: 'Error al entregar producto', error: (error as Error).message });
  }
};

export const getPagosProductos = async (req: Request, res: Response) => {
  const { nHistoria, estadoPago, estadoProducto } = req.query;
  
  try {
    const pagos = await prisma.pagoProducto.findMany({
      where: {
        ...(nHistoria && { nHistoria: nHistoria as string }),
        ...(estadoPago && { estadoPago: estadoPago as string }),
        ...(estadoProducto && { estadoProducto: estadoProducto as string })
      },
      include: {
        historialPagos: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.status(200).json(pagos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener pagos de productos', error: (error as Error).message });
  }
};

// ========================================
// ALERTAS DE STOCK
// ========================================

async function verificarAlertas(configuracionProductoId: number) {
  const config = await prisma.configuracionProducto.findUnique({
    where: { id: configuracionProductoId }
  });
  
  if (!config || !config.alertasActivas) return;
  
  let tipoAlerta: string | null = null;
  let mensaje: string | null = null;
  
  if (config.stockActual === 0) {
    tipoAlerta = 'stock_cero';
    mensaje = `El producto está sin stock`;
  } else if (config.stockActual <= Math.floor(config.stockMinimo / 2)) {
    tipoAlerta = 'stock_critico';
    mensaje = `Stock crítico: solo quedan ${config.stockActual} ${config.unidadMedida}`;
  } else if (config.stockActual <= config.stockMinimo) {
    tipoAlerta = 'stock_bajo';
    mensaje = `Stock bajo: ${config.stockActual} ${config.unidadMedida} (mínimo: ${config.stockMinimo})`;
  }
  
  if (tipoAlerta && mensaje) {
    // Verificar si ya existe una alerta similar sin resolver
    const alertaExistente = await prisma.alertaStock.findFirst({
      where: {
        configuracionProductoId,
        tipoAlerta,
        resuelto: false
      }
    });
    
    if (!alertaExistente) {
      await prisma.alertaStock.create({
        data: {
          configuracionProductoId,
          tipoAlerta,
          mensaje,
          stockActual: config.stockActual,
          stockMinimo: config.stockMinimo
        }
      });
    }
  }
}

export const getAlertas = async (req: Request, res: Response) => {
  const { visto, resuelto } = req.query;
  
  try {
    const alertas = await prisma.alertaStock.findMany({
      where: {
        ...(visto !== undefined && { visto: visto === 'true' }),
        ...(resuelto !== undefined && { resuelto: resuelto === 'true' })
      },
      include: {
        configuracionProducto: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.status(200).json(alertas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener alertas', error: (error as Error).message });
  }
};

export const marcarAlertaVista = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  
  try {
    const alerta = await prisma.alertaStock.update({
      where: { id },
      data: { visto: true }
    });
    
    res.status(200).json(alerta);
  } catch (error) {
    res.status(500).json({ message: 'Error al marcar alerta como vista', error: (error as Error).message });
  }
};

export const resolverAlerta = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  
  try {
    const alerta = await prisma.alertaStock.update({
      where: { id },
      data: { 
        resuelto: true,
        resolvidoAt: new Date()
      }
    });
    
    res.status(200).json(alerta);
  } catch (error) {
    res.status(500).json({ message: 'Error al resolver alerta', error: (error as Error).message });
  }
};

// ========================================
// REPORTES
// ========================================

export const getReporteInventario = async (req: Request, res: Response) => {
  try {
    const configuraciones = await prisma.configuracionProducto.findMany({
      include: {
        alertas: {
          where: { resuelto: false }
        }
      }
    });
    
    const productos = await prisma.product.findMany();
    
    const reporte = await Promise.all(configuraciones.map(async (config) => {
      const producto = productos.find(p => p.id === config.productoId);
      
      // Calcular valor del inventario
      const valorInventario = config.stockActual * config.costoUnitario;
      const valorVenta = config.stockActual * (producto?.precio || 0);
      
      // Calcular IGV si aplica
      let precioSinIGV = producto?.precio || 0;
      let igvMonto = 0;
      if (config.aplicaIGV) {
        precioSinIGV = (producto?.precio || 0) / (1 + config.igvPorcentaje / 100);
        igvMonto = (producto?.precio || 0) - precioSinIGV;
      }
      
      return {
        productoId: config.productoId,
        productoNombre: producto?.nombre || '',
        stockActual: config.stockActual,
        stockMinimo: config.stockMinimo,
        unidadMedida: config.unidadMedida,
        costoUnitario: config.costoUnitario,
        precioVenta: producto?.precio || 0,
        precioSinIGV,
        igvMonto,
        aplicaIGV: config.aplicaIGV,
        valorInventario,
        valorVenta,
        alertasActivas: config.alertas.length,
        estadoStock: config.stockActual === 0 ? 'sin_stock' : config.stockActual <= config.stockMinimo ? 'stock_bajo' : 'normal'
      };
    }));
    
    const resumen = {
      totalProductos: reporte.length,
      totalValorInventario: reporte.reduce((sum, r) => sum + r.valorInventario, 0),
      totalValorVenta: reporte.reduce((sum, r) => sum + r.valorVenta, 0),
      productosSinStock: reporte.filter(r => r.estadoStock === 'sin_stock').length,
      productosStockBajo: reporte.filter(r => r.estadoStock === 'stock_bajo').length,
      alertasActivas: reporte.reduce((sum, r) => sum + r.alertasActivas, 0)
    };
    
    res.status(200).json({ reporte, resumen });
  } catch (error) {
    res.status(500).json({ message: 'Error al generar reporte', error: (error as Error).message });
  }
};
