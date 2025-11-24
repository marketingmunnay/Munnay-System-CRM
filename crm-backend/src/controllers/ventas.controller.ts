import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';
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
  const incoming = req.body || {};
  // Whitelist allowed VentaExtra fields to avoid Prisma 'Unknown argument' errors
  const allowed = [
    'codigoVenta',
    'fechaVenta',
    'pacienteId',
    'nHistoria',
    'nombrePaciente',
    'servicio',
    'categoria',
    'precio',
    'montoPagado',
    'metodoPago',
    'deuda',
    'fechaPagoDeuda',
    'vendedorId',
    'apoyoPorId',
  ];

  const data: Record<string, any> = {};
  for (const key of allowed) {
    if (incoming[key] !== undefined) data[key] = incoming[key];
  }

  // Cast common types
  if (data.precio !== undefined) data.precio = Number(data.precio);
  if (data.montoPagado !== undefined) data.montoPagado = Number(data.montoPagado);
  if (data.deuda !== undefined) data.deuda = Number(data.deuda);
  if (data.pacienteId !== undefined) data.pacienteId = Number(data.pacienteId);
  if (data.vendedorId !== undefined) data.vendedorId = Number(data.vendedorId);
  if (data.apoyoPorId !== undefined) data.apoyoPorId = Number(data.apoyoPorId);

  try {
    const payload = {
      ...data,
      fechaVenta: data.fechaVenta ? new Date(data.fechaVenta) : new Date(),
      fechaPagoDeuda: data.fechaPagoDeuda ? new Date(data.fechaPagoDeuda) : undefined,
    };

    const newVenta = await prisma.ventaExtra.create({
      // Cast to Prisma input to satisfy TypeScript; payload is validated at runtime by Prisma
      data: payload as unknown as Prisma.VentaExtraCreateInput,
    });
    res.status(201).json(newVenta);
  } catch (error) {
    console.error('Error creating venta:', error, 'payloadKeys:', Object.keys(incoming));
    // If Prisma complains about an unknown argument, return a 400 with guidance
    const message = (error as any)?.message || 'Error creating venta';
    if (typeof message === 'string' && message.includes('Unknown argument')) {
      return res.status(400).json({ message: 'Payload contains unexpected fields. Only the allowed VentaExtra fields are accepted.' });
    }
    res.status(500).json({ message: 'Error creating venta', error: message });
  }
};

export const updateVenta = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const incoming = req.body || {};
  // Whitelist allowed fields for update
  const allowed = [
    'codigoVenta',
    'fechaVenta',
    'pacienteId',
    'nHistoria',
    'nombrePaciente',
    'servicio',
    'categoria',
    'precio',
    'montoPagado',
    'metodoPago',
    'deuda',
    'fechaPagoDeuda',
    'vendedorId',
    'apoyoPorId',
  ];

  const data: Record<string, any> = {};
  for (const key of allowed) {
    if (incoming[key] !== undefined) data[key] = incoming[key];
  }

  if (data.precio !== undefined) data.precio = Number(data.precio);
  if (data.montoPagado !== undefined) data.montoPagado = Number(data.montoPagado);
  if (data.deuda !== undefined) data.deuda = Number(data.deuda);
  if (data.pacienteId !== undefined) data.pacienteId = Number(data.pacienteId);
  if (data.vendedorId !== undefined) data.vendedorId = Number(data.vendedorId);
  if (data.apoyoPorId !== undefined) data.apoyoPorId = Number(data.apoyoPorId);

  try {
    const payload = {
      ...data,
      fechaVenta: data.fechaVenta ? new Date(data.fechaVenta) : undefined,
      fechaPagoDeuda: data.fechaPagoDeuda ? new Date(data.fechaPagoDeuda) : undefined,
    };
    const updatedVenta = await prisma.ventaExtra.update({
      where: { id: id },
      data: payload as unknown as Prisma.VentaExtraUpdateInput,
    });
    res.status(200).json(updatedVenta);
  } catch (error) {
    console.error(`Error updating venta ${id}:`, error, 'payloadKeys:', Object.keys(incoming));
    const message = (error as any)?.message || 'Error updating venta';
    if (typeof message === 'string' && message.includes('Unknown argument')) {
      return res.status(400).json({ message: 'Payload contains unexpected fields. Only the allowed VentaExtra fields are accepted.' });
    }
    res.status(500).json({ message: 'Error updating venta', error: message });
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