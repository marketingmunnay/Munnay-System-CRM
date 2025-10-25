import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getIncidencias = async (req: Request, res: Response) => {
  try {
    const incidencias = await prisma.incidencia.findMany({ orderBy: { fecha: 'desc' } });
    // FIX: Add .status() method to the response object.
    res.status(200).json(incidencias);
  } catch (error) {
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error fetching incidencias', error: (error as Error).message });
  }
};

export const getIncidenciaById = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access params from the request object directly.
  const { id } = req.params;
  try {
    const incidencia = await prisma.incidencia.findUnique({ where: { id: parseInt(id) } });
    if (!incidencia) {
      // FIX: Add .status() method to the response object.
      return res.status(404).json({ message: 'Incidencia not found' });
    }
    // FIX: Add .status() method to the response object.
    res.status(200).json(incidencia);
  } catch (error) {
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error fetching incidencia', error: (error as Error).message });
  }
};

export const createIncidencia = async (req: Request<any, any, any>, res: Response) => {
  // FIX: Access body from the request object directly.
  const { id, fecha, ...data } = req.body;
  try {
    const newIncidencia = await prisma.incidencia.create({
      data: {
        ...data,
        fecha: new Date(fecha),
      },
    });
    // FIX: Add .status() method to the response object.
    res.status(201).json(newIncidencia);
  } catch (error) {
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error creating incidencia', error: (error as Error).message });
  }
};

export const updateIncidencia = async (req: Request<{ id: string }, any, any>, res: Response) => {
  // FIX: Access params from the request object directly.
  const { id } = req.params;
  // FIX: Access body from the request object directly.
  const { fecha, ...data } = req.body;
  try {
    const updatedIncidencia = await prisma.incidencia.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        fecha: fecha ? new Date(fecha) : undefined,
      },
    });
    // FIX: Add .status() method to the response object.
    res.status(200).json(updatedIncidencia);
  } catch (error) {
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error updating incidencia', error: (error as Error).message });
  }
};

export const deleteIncidencia = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access params from the request object directly.
  const { id } = req.params;
  try {
    await prisma.incidencia.delete({ where: { id: parseInt(id) } });
    // FIX: Add .status() method to the response object.
    res.status(204).send();
  } catch (error) {
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error deleting incidencia', error: (error as Error).message });
  }
};