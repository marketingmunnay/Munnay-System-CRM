import { Request, Response } from 'express';
import prisma from '../lib/prisma';
// FIX: Removed `ParamsDictionary` import as it was causing type conflicts.

export const getSeguidores = async (req: Request, res: Response) => {
  try {
    const seguidores = await prisma.seguidor.findMany({
        orderBy: {
            fecha: 'desc',
        }
    });
    // FIX: Use `res.status` directly.
    (res as Response).status(200).json(seguidores);
  } catch (error) {
    // FIX: Use `res.status` directly.
    (res as Response).status(500).json({ message: 'Error fetching seguidores', error: (error as Error).message });
  }
};

export const getSeguidorById = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access `req.params.id` correctly.
  const id = (req as Request<{ id: string }>).params.id;
  try {
    const seguidor = await prisma.seguidor.findUnique({ where: { id: parseInt(id) } });
    if (!seguidor) {
      // FIX: Use `res.status` directly.
      return (res as Response).status(404).json({ message: 'Seguidor not found' });
    }
    // FIX: Use `res.status` directly.
    (res as Response).status(200).json(seguidor);
  } catch (error) {
    // FIX: Use `res.status` directly.
    (res as Response).status(500).json({ message: 'Error fetching seguidor', error: (error as Error).message });
  }
};

export const createSeguidor = async (req: Request, res: Response) => {
  // FIX: Access `req.body` correctly.
  const { id, fecha, ...data } = req.body as any;
  try {
    const newSeguidor = await prisma.seguidor.create({
      data: {
        ...data,
        fecha: new Date(fecha),
      },
    });
    // FIX: Use `res.status` directly.
    (res as Response).status(201).json(newSeguidor);
  } catch (error) {
    // FIX: Use `res.status` directly.
    (res as Response).status(500).json({ message: 'Error creating seguidor', error: (error as Error).message });
  }
};

export const updateSeguidor = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access `req.params.id` correctly.
  const id = (req as Request<{ id: string }>).params.id;
  // FIX: Access `req.body` correctly.
  const { fecha, ...data } = req.body as any;
  try {
    const updatedSeguidor = await prisma.seguidor.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        fecha: fecha ? new Date(fecha) : undefined,
      },
    });
    // FIX: Use `res.status` directly.
    (res as Response).status(200).json(updatedSeguidor);
  } catch (error) {
    // FIX: Use `res.status` directly.
    (res as Response).status(500).json({ message: 'Error updating seguidor', error: (error as Error).message });
  }
};

export const deleteSeguidor = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access `req.params.id` correctly.
  const id = (req as Request<{ id: string }>).params.id;
  try {
    await prisma.seguidor.delete({ where: { id: parseInt(id) } });
    // FIX: Use `res.status` directly.
    (res as Response).status(204).send();
  } catch (error) {
    // FIX: Use `res.status` directly.
    (res as Response).status(500).json({ message: 'Error deleting seguidor', error: (error as Error).message });
  }
};