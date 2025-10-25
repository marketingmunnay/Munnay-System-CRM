import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getSeguidores = async (req: Request, res: Response) => {
  try {
    const seguidores = await prisma.seguidor.findMany({
        orderBy: {
            fecha: 'desc',
        }
    });
    // FIX: Add .status() method to the response object.
    res.status(200).json(seguidores);
  } catch (error) {
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error fetching seguidores', error: (error as Error).message });
  }
};

export const getSeguidorById = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access params from the request object directly.
  const { id } = req.params;
  try {
    const seguidor = await prisma.seguidor.findUnique({ where: { id: parseInt(id) } });
    if (!seguidor) {
      // FIX: Add .status() method to the response object.
      return res.status(404).json({ message: 'Seguidor not found' });
    }
    // FIX: Add .status() method to the response object.
    res.status(200).json(seguidor);
  } catch (error) {
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error fetching seguidor', error: (error as Error).message });
  }
};

export const createSeguidor = async (req: Request<any, any, any>, res: Response) => {
  // FIX: Access body from the request object directly.
  const { id, fecha, ...data } = req.body;
  try {
    const newSeguidor = await prisma.seguidor.create({
      data: {
        ...data,
        fecha: new Date(fecha),
      },
    });
    // FIX: Add .status() method to the response object.
    res.status(201).json(newSeguidor);
  } catch (error) {
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error creating seguidor', error: (error as Error).message });
  }
};

export const updateSeguidor = async (req: Request<{ id: string }, any, any>, res: Response) => {
  // FIX: Access params from the request object directly.
  const { id } = req.params;
  // FIX: Access body from the request object directly.
  const { fecha, ...data } = req.body;
  try {
    const updatedSeguidor = await prisma.seguidor.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        fecha: fecha ? new Date(fecha) : undefined,
      },
    });
    // FIX: Add .status() method to the response object.
    res.status(200).json(updatedSeguidor);
  } catch (error) {
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error updating seguidor', error: (error as Error).message });
  }
};

export const deleteSeguidor = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access params from the request object directly.
  const { id } = req.params;
  try {
    await prisma.seguidor.delete({ where: { id: parseInt(id) } });
    // FIX: Add .status() method to the response object.
    res.status(204).send();
  } catch (error) {
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error deleting seguidor', error: (error as Error).message });
  }
};