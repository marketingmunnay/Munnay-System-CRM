import express from 'express'; // FIX: Use named import for express
import prisma from '../lib/prisma';

export const getVentas = async (req: express.Request, res: express.Response) => { // FIX: Explicitly type req and res
  try {
    const ventas = await prisma.ventaExtra.findMany({ orderBy: { fechaVenta: 'desc' } });
    res.status(200).json(ventas);
  }<ctrl63>