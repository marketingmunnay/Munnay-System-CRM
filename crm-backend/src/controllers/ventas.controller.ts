import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getVentas = async (req: Request, res: Response) => {
  try {
    const ventas = await prisma.ventaExtra.findMany({ orderBy: { fechaVenta: 'desc' } });
    // FIX: Add .status() method to the response object.
    res.status(200).json(ventas);
  } catch (error) {
    console.error("Error fetching ventas:", error);
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error fetching ventas', error: (error as Error).message });
  }
};

export const getVentaById = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access params from the request object directly.
  const { id } = req.params;
  try {
    const venta = await prisma.ventaExtra.findUnique({ where: { id: parseInt(id) } });
    if (!venta) {
      // FIX: Add .status() method to the response object.
      return res.status(404).json({ message: 'Venta not found' });
    }
    // FIX: Add .status() method to the response object.
    res.status(200).json(venta);
  } catch (error) {
    console.error(`Error fetching venta ${id}:`, error);
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error fetching venta', error: (error as Error).message });
  }
};

export const createVenta = async (req: Request<any, any, any>, res: Response) => {
  // FIX: Access body from the request object directly.
  const { id, fechaVenta, ...data } = req.body;
  try {
    const newVenta = await prisma.ventaExtra.create({
      data: {
        ...data,
        fechaVenta: new Date(fechaVenta),
      },
    });
    // FIX: Add .status() method to the response object.
    res.status(201).json(newVenta);
  } catch (error) {
    console.error("Error creating venta:", error);
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error creating venta', error: (error as Error).message });
  }
};

export const updateVenta = async (req: Request<{ id: string }, any, any>, res: Response) => {
  // FIX: Access params from the request object directly.
  const { id } = req.params;
  // FIX: Access body from the request object directly.
  const { fechaVenta, ...data } = req.body;
  try {
    const updatedVenta = await prisma.ventaExtra.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        fechaVenta: fechaVenta ? new Date(fechaVenta) : undefined,
      },
    });
    // FIX: Add .status() method to the response object.
    res.status(200).json(updatedVenta);
  } catch (error) {
    console.error(`Error updating venta ${id}:`, error);
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error updating venta', error: (error as Error).message });
  }
};

export const deleteVenta = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access params from the request object directly.
  const { id } = req.params;
  try {
    // Delete related comprobantes first if not set up with cascading deletes
    await prisma.comprobanteElectronico.deleteMany({ where: { ventaId: parseInt(id), ventaType: 'venta_extra' } });

    await prisma.ventaExtra.delete({ where: { id: parseInt(id) } });
    // FIX: Add .status() method to the response object.
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting venta ${id}:`, error);
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error deleting venta', error: (error as Error).message });
  }
};