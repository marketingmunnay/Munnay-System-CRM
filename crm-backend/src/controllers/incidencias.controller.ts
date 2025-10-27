import { Request, Response } from 'express';
import prisma from '../lib/prisma';
// FIX: Removed `ParamsDictionary` import as it was causing type conflicts.

export const getIncidencias = async (req: Request, res: Response) => {
  try {
    const incidencias = await prisma.incidencia.findMany({ orderBy: { fecha: 'desc' } });
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    res.status(200).json(incidencias);
  } catch (error) {
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    res.status(500).json({ message: 'Error fetching incidencias', error: (error as Error).message });
  }
};

export const getIncidenciaById = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access `req.params.id` correctly (added explicit cast for clarity).
  const id = (req.params as any).id;
  try {
    const incidencia = await prisma.incidencia.findUnique({ where: { id: parseInt(id) } });
    if (!incidencia) {
      // FIX: Use `res.status` directly (added explicit cast for clarity).
      return res.status(404).json({ message: 'Incidencia not found' });
    }
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    res.status(200).json(incidencia);
  } catch (error) {
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    res.status(500).json({ message: 'Error fetching incidencia', error: (error as Error).message });
  }
};

export const createIncidencia = async (req: Request, res: Response) => {
  // FIX: Access `req.body` correctly (added explicit cast for clarity).
  const { id, fecha, ...data } = (req.body as any);
  try {
    const newIncidencia = await prisma.incidencia.create({
      data: {
        ...data,
        fecha: new Date(fecha),
      },
    });
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    res.status(201).json(newIncidencia);
  } catch (error) {
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    res.status(500).json({ message: 'Error creating incidencia', error: (error as Error).message });
  }
};

export const updateIncidencia = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access `req.params.id` correctly (added explicit cast for clarity).
  const id = (req.params as any).id;
  // FIX: Access `req.body` correctly (added explicit cast for clarity).
  const { fecha, ...data } = (req.body as any);
  try {
    const updatedIncidencia = await prisma.incidencia.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        fecha: fecha ? new Date(fecha) : undefined,
      },
    });
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    res.status(200).json(updatedIncidencia);
  } catch (error) {
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    res.status(500).json({ message: 'Error updating incidencia', error: (error as Error).message });
  }
};

export const deleteIncidencia = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access `req.params.id` correctly (added explicit cast for clarity).
  const id = (req.params as any).id;
  try {
    await prisma.incidencia.delete({ where: { id: parseInt(id) } });
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    res.status(204).send();
  } catch (error) {
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    res.status(500).json({ message: 'Error deleting incidencia', error: (error as Error).message });
  }
};