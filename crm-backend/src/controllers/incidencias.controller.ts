import * as express from 'express'; // FIX: Import express as a namespace
import prisma from '../lib/prisma';

export const getIncidencias = async (req: express.Request, res: express.Response) => { // FIX: Use express.Request and express.Response
  try {
    const incidencias = await prisma.incidencia.findMany({ orderBy: { fecha: 'desc' } });
    // FIX: Use `res.status` directly.
    res.status(200).json(incidencias);
  } catch (error) {
    // FIX: Use `res.status` directly.
    res.status(500).json({ message: 'Error fetching incidencias', error: (error as Error).message });
  }
};

export const getIncidenciaById = async (req: express.Request<{ id: string }>, res: express.Response) => { // FIX: Use express.Request and express.Response
  // FIX: Access `req.params.id` correctly.
  const id = req.params.id;
  try {
    const incidencia = await prisma.incidencia.findUnique({ where: { id: parseInt(id) } });
    if (!incidencia) {
      // FIX: Use `res.status` directly.
      return res.status(404).json({ message: 'Incidencia not found' });
    }
    // FIX: Use `res.status` directly.
    res.status(200).json(incidencia);
  } catch (error) {
    // FIX: Use `res.status` directly.
    res.status(500).json({ message: 'Error fetching incidencia', error: (error as Error).message });
  }
};

export const createIncidencia = async (req: express.Request, res: express.Response) => { // FIX: Use express.Request and express.Response
  // FIX: Access `req.body` correctly.
  const { id, fecha, ...data } = req.body as any;
  try {
    const newIncidencia = await prisma.incidencia.create({
      data: {
        ...data,
        fecha: new Date(fecha),
      },
    });
    // FIX: Use `res.status` directly.
    res.status(201).json(newIncidencia);
  } catch (error) {
    // FIX: Use `res.status` directamente.
    res.status(500).json({ message: 'Error creating incidencia', error: (error as Error).message });
  }
};

export const updateIncidencia = async (req: express.Request<{ id: string }>, res: express.Response) => { // FIX: Use express.Request and express.Response
  // FIX: Access `req.params.id` correctly.
  const id = req.params.id;
  // FIX: Access `req.body` correctly.
  const { fecha, ...data } = req.body as any;
  try {
    const updatedIncidencia = await prisma.incidencia.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        fecha: fecha ? new Date(fecha) : undefined,
      },
    });
    // FIX: Use `res.status` directamente.
    res.status(200).json(updatedIncidencia);
  } catch (error) {
    // FIX: Use `res.status` directamente.
    res.status(500).json({ message: 'Error updating incidencia', error: (error as Error).message });
  }
};

export const deleteIncidencia = async (req: express.Request<{ id: string }>, res: express.Response) => { // FIX: Use express.Request and express.Response
  // FIX: Access `req.params.id` correctly.
  const id = req.params.id;
  try {
    await prisma.incidencia.delete({ where: { id: parseInt(id) } });
    // FIX: Use `res.status` directamente.
    res.status(204).send();
  } catch (error) {
    // FIX: Use `res.status` directamente.
    res.status(500).json({ message: 'Error deleting incidencia', error: (error as Error).message });
  }
};