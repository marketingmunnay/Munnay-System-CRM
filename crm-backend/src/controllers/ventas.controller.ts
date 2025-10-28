import * as express from 'express';
import prisma from '../lib/prisma';
import { VentaExtra } from '@prisma/client';

export const getVentas = async (req: express.Request, res: express.Response) => {
  try {
    const ventas = await prisma.ventaExtra.findMany({ orderBy: { fechaVenta: 'desc' } });
    res.status(200).json(ventas);
  } catch (error) {
    console.error("Error fetching ventas:", error);
    res.status(500).json({ message: 'Error fetching ventas', error: (error as Error).message });
  }
};

export const getVentaById = async (req: express.Request<{ id: string }>, res: express.Response) => {
  // FIX: Access `req.params.id` correctly.
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

export const createVenta = async (req: express.Request<any, any, VentaExtra>, res: express.Response) => {
  const { id, fechaVenta, ...data } = req.body;
  try {
    const newVenta = await prisma.ventaExtra.create({
      data: {
        ...data,
        fechaVenta: new Date(fechaVenta),
      },
    });
    res.status(201).json(newVenta);
  } catch (error) {
    console.error("Error creating venta:", error);
    res.status(500).json({ message: 'Error creating venta', error: (error as Error).message });
  }
};

export const updateVenta = async (req: express.Request<{ id: string }, any, VentaExtra>, res: express.Response) => {
  // FIX: Access `req.params.id` correctly.
  const id = parseInt(req.params.id);
  const { fechaVenta, ...data } = req.body;
  try {
    const updatedVenta = await prisma.ventaExtra.update({
      where: { id: id },
      data: {
        ...data,
        fechaVenta: fechaVenta ? new Date(fechaVenta) : undefined,
      },
    });
    res.status(200).json(updatedVenta);
  } catch (error) {
    console.error(`Error updating venta ${id}:`, error);
    res.status(500).json({ message: 'Error updating venta', error: (error as Error).message });
  }
};

export const deleteVenta = async (req: express.Request<{ id: string }>, res: express.Response) => {
  // FIX: Access `req.params.id` correctly.
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