import * as express from 'express'; // FIX: Import express as a namespace
import prisma from '../lib/prisma';

export const getVentas = async (req: express.Request, res: express.Response) => { // FIX: Use express.Request and express.Response
  try {
    const ventas = await prisma.ventaExtra.findMany({ orderBy: { fechaVenta: 'desc' } });
    // FIX: Use `res.status` directly.
    res.status(200).json(ventas);
  } catch (error) {
    console.error("Error fetching ventas:", error);
    // FIX: Use `res.status` directly.
    res.status(500).json({ message: 'Error fetching ventas', error: (error as Error).message });
  }
};

export const getVentaById = async (req: express.Request<{ id: string }>, res: express.Response) => { // FIX: Use express.Request and express.Response
  // FIX: Access `req.params.id` correctly.
  const id = req.params.id;
  try {
    const venta = await prisma.ventaExtra.findUnique({ where: { id: parseInt(id) } });
    if (!venta) {
      // FIX: Use `res.status` directly.
      return res.status(404).json({ message: 'Venta not found' });
    }
    // FIX: Use `res.status` directly.
    res.status(200).json(venta);
  } catch (error) {
    console.error(`Error fetching venta ${id}:`, error);
    // FIX: Use `res.status` directly.
    res.status(500).json({ message: 'Error fetching venta', error: (error as Error).message });
  }
};

export const createVenta = async (req: express.Request, res: express.Response) => { // FIX: Use express.Request and express.Response
  // FIX: Access `req.body` correctly.
  const { id, fechaVenta, ...data } = req.body as any;
  try {
    const newVenta = await prisma.ventaExtra.create({
      data: {
        ...data,
        fechaVenta: new Date(fechaVenta),
      },
    });
    // FIX: Use `res.status` directly.
    res.status(201).json(newVenta);
  } catch (error) {
    console.error("Error creating venta:", error);
    // FIX: Use `res.status` directly.
    res.status(500).json({ message: 'Error creating venta', error: (error as Error).message });
  }
};

export const updateVenta = async (req: express.Request<{ id: string }>, res: express.Response) => { // FIX: Use express.Request and express.Response
  // FIX: Access `req.params.id` correctly.
  const id = req.params.id;
  // FIX: Access `req.body` correctly.
  const { fechaVenta, ...data } = req.body as any;
  try {
    const updatedVenta = await prisma.ventaExtra.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        fechaVenta: fechaVenta ? new Date(fechaVenta) : undefined,
      },
    });
    // FIX: Use `res.status` directly.
    res.status(200).json(updatedVenta);
  } catch (error) {
    console.error(`Error updating venta ${id}:`, error);
    // FIX: Use `res.status` directly.
    res.status(500).json({ message: 'Error updating venta', error: (error as Error).message });
  }
};

export const deleteVenta = async (req: express.Request<{ id: string }>, res: express.Response) => { // FIX: Use express.Request and express.Response
  // FIX: Access `req.params.id` correctly.
  const id = req.params.id;
  try {
    // Delete related comprobantes first if not set up with cascading deletes
    await prisma.comprobanteElectronico.deleteMany({ where: { ventaId: parseInt(id), ventaType: 'venta_extra' } });

    await prisma.ventaExtra.delete({ where: { id: parseInt(id) } });
    // FIX: Use `res.status` directly.
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting venta ${id}:`, error);
    // FIX: Use `res.status` directly.
    res.status(500).json({ message: 'Error deleting venta', error: (error as Error).message });
  }
};