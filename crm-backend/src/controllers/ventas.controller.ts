import * as express from 'express';
import prisma from '../lib/prisma';

export const getVentas = async (req: express.Request, res: express.Response) => {
  try {
    const ventas = await prisma.ventaExtra.findMany({ orderBy: { fechaVenta: 'desc' } });
    res.status(200).json(ventas);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ventas extra', error: (error as Error).message });
  }
};

export const getVentaById = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  try {
    const venta = await prisma.ventaExtra.findUnique({ where: { id: parseInt(id) } });
    if (!venta) return res.status(404).json({ message: 'Venta not found' });
    res.status(200).json(venta);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching venta extra', error: (error as Error).message });
  }
};

export const createVenta = async (req: express.Request, res: express.Response) => {
  const { id, fechaVenta, fechaPagoDeuda, ...data } = req.body;
  try {
    const newVenta = await prisma.ventaExtra.create({
      data: {
        ...data,
        fechaVenta: new Date(fechaVenta),
        fechaPagoDeuda: fechaPagoDeuda ? new Date(fechaPagoDeuda) : null,
      },
    });
    res.status(201).json(newVenta);
  } catch (error) {
    res.status(500).json({ message: 'Error creating venta extra', error: (error as Error).message });
  }
};

export const updateVenta = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const { fechaVenta, fechaPagoDeuda, ...data } = req.body;
  try {
    const updatedVenta = await prisma.ventaExtra.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        fechaVenta: fechaVenta ? new Date(fechaVenta) : undefined,
        fechaPagoDeuda: fechaPagoDeuda ? new Date(fechaPagoDeuda) : (fechaPagoDeuda === null ? null : undefined),
      },
    });
    res.status(200).json(updatedVenta);
  } catch (error) {
    res.status(500).json({ message: 'Error updating venta extra', error: (error as Error).message });
  }
};

export const deleteVenta = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  try {
    await prisma.ventaExtra.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting venta extra', error: (error as Error).message });
  }
};