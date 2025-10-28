import * as express from 'express'; // FIX: Import express as a namespace
import prisma from '../lib/prisma';
import { Seguidor } from '@prisma/client'; // Import Seguidor type from Prisma client

export const getSeguidores = async (req: express.Request, res: express.Response) => { // FIX: Use express.Request and express.Response
  try {
    const seguidores = await prisma.seguidor.findMany({
        orderBy: {
            fecha: 'desc',
        }
    });
    // FIX: Use `res.status` directly.
    res.status(200).json(seguidores);
  } catch (error) {
    // FIX: Use `res.status` directamente.
    res.status(500).json({ message: 'Error fetching seguidores', error: (error as Error).message });
  }
};

export const getSeguidorById = async (req: express.Request<{ id: string }>, res: express.Response) => { // FIX: Use express.Request and express.Response
  const id = parseInt(req.params.id); // FIX: Access `req.params.id` correctly.
  try {
    const seguidor = await prisma.seguidor.findUnique({ where: { id: id } });
    if (!seguidor) {
      // FIX: Use `res.status` directly.
      return res.status(404).json({ message: 'Seguidor not found' });
    }
    // FIX: Use `res.status` directamente.
    res.status(200).json(seguidor);
  } catch (error) {
    // FIX: Use `res.status` directamente.
    res.status(500).json({ message: 'Error fetching seguidor', error: (error as Error).message });
  }
};

export const createSeguidor = async (req: express.Request<any, any, Seguidor>, res: express.Response) => { // FIX: Use express.Request and express.Response
  const { id, fecha, ...data } = req.body; // FIX: Access `req.body` correctly.
  try {
    const newSeguidor = await prisma.seguidor.create({
      data: {
        ...data,
        fecha: new Date(fecha),
      },
    });
    // FIX: Use `res.status` directamente.
    res.status(201).json(newSeguidor);
  } catch (error) {
    // FIX: Use `res.status` directamente.
    res.status(500).json({ message: 'Error creating seguidor', error: (error as Error).message });
  }
};

export const updateSeguidor = async (req: express.Request<{ id: string }, any, Seguidor>, res: express.Response) => { // FIX: Use express.Request and express.Response
  const id = parseInt(req.params.id); // FIX: Access `req.params.id` correctly.
  const { fecha, ...data } = req.body; // FIX: Access `req.body` correctly.
  try {
    const updatedSeguidor = await prisma.seguidor.update({
      where: { id: id },
      data: {
        ...data,
        fecha: fecha ? new Date(fecha) : undefined,
      },
    });
    // FIX: Use `res.status` directamente.
    res.status(200).json(updatedSeguidor);
  } catch (error) {
    // FIX: Use `res.status` directamente.
    res.status(500).json({ message: 'Error updating seguidor', error: (error as Error).message });
  }
};

export const deleteSeguidor = async (req: express.Request<{ id: string }>, res: express.Response) => { // FIX: Use express.Request and express.Response
  const id = parseInt(req.params.id); // FIX: Access `req.params.id` correctly.
  try {
    await prisma.seguidor.delete({ where: { id: id } });
    // FIX: Use `res.status` directamente.
    res.status(204).send();
  } catch (error) {
    // FIX: Use `res.status` directamente.
    res.status(500).json({ message: 'Error deleting seguidor', error: (error as Error).message });
  }
};