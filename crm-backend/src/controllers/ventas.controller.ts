import { Request, Response } from 'express';
import prisma from '../lib/prisma';
// import { VentaExtra } from '@prisma/client';

export const getVentas = async (req: Request, res: Response) => {
  try {
    const ventas = await prisma.ventaExtra.findMany({ orderBy: { fechaVenta: 'desc' } });
    res.status(200).json(ventas);
  } catch (error) {
    console.error("Error fetching ventas:", error);
    res.status(500).json({ message: 'Error fetching ventas', error: (error as Error).message });
  }
};

export const getVentaById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    const venta = await prisma.ventaExtra.findUnique({ where: { id: id } });
    if (!venta) {
      return res.status(404).json({ message: 'Venta not found' });
    }
    res.status(200).json(venta);
  }  catch (error) {
    console.error(`Error fetching venta ${id}:`, error);
    res.status(500).json({ message: 'Error fetching venta', error: (error as Error).message });
  }
};

export const createVenta = async (req: Request, res: Response) => {
  const { id, fechaVenta, ...data } = req.body;
  
  // Extract inventory specific fields
  const { productoId, entregado, fechaEntrega, categoria, ...cleanData } = data;

  try {
    // Inventory Logic: If it is a Product Sale and marked as Delivered
    if (productoId && entregado) {
       const config = await prisma.configuracionProducto.findUnique({
          where: { productoId: parseInt(productoId) }
       });
       
       if (config) {
          if (config.stockActual <= 0) {
             return res.status(400).json({ message: 'No hay stock disponible para entregar este producto inmediatamente.' });
          }
          
          // Deduct Stock
          await prisma.movimientoInventario.create({
            data: {
              configuracionProductoId: config.id,
              tipoMovimiento: 'salida',
              cantidad: 1,
              stockAnterior: config.stockActual,
              stockNuevo: config.stockActual - 1,
              precioVenta: data.montoPagado || 0, // Or precio total
              motivo: `Venta Extra (Recepción) ${data.codigoVenta || ''}`,
              referencia: 'VentaExtra',
              creadoPor: 'Sistema' // TODO: Get user from req
            }
          });

          await prisma.configuracionProducto.update({
             where: { id: config.id },
             data: { stockActual: config.stockActual - 1 }
          });
       }
    }

    const newVenta = await prisma.ventaExtra.create({
      data: {
        ...cleanData,
        categoria: categoria || 'Venta', // Asegurar que categoria siempre tenga valor
        fechaVenta: new Date(fechaVenta),
        // CAMPOS COMENTADOS PORQUE NO EXISTEN EN LA BD DE PRODUCCIÓN AÚN
        // entregado: entregado || false,
        // fechaEntrega: fechaEntrega ? new Date(fechaEntrega) : (entregado ? new Date() : null),
        // productoId: productoId ? parseInt(productoId) : null
      },
    });
    res.status(201).json(newVenta);
  } catch (error) {
    console.error("Error creating venta:", error);
    res.status(500).json({ message: 'Error creating venta', error: (error as Error).message });
  }
};

export const updateVenta = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { id: _, fechaVenta, ...data } = req.body; // Exclude id from update data
  
  // Clean data to remove fields not present in current DB schema
  const { productoId, entregado, fechaEntrega, ...cleanData } = data;

  try {
    const updatedVenta = await prisma.ventaExtra.update({
      where: { id: id },
      data: {
        ...cleanData,
        fechaVenta: fechaVenta ? new Date(fechaVenta) : undefined,
      },
    });
    res.status(200).json(updatedVenta);
  } catch (error) {
    console.error(`Error updating venta ${id}:`, error);
    res.status(500).json({ message: 'Error updating venta', error: (error as Error).message });
  }
};

export const deleteVenta = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    // Delete related comprobantes where ventaExtraId matches
    await prisma.comprobanteElectronico.deleteMany({ where: { ventaExtraId: id } });

    await prisma.ventaExtra.delete({ where: { id: id } });
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting venta ${id}:`, error);
    res.status(500).json({ message: 'Error deleting venta', error: (error as Error).message });
  }
};