import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getPublicaciones = async (req: Request, res: Response) => {
  try {
    const publicaciones = await prisma.publicacion.findMany({
      orderBy: {
        fechaPost: 'desc',
      },
    });
    // FIX: Add .status() method to the response object.
    res.status(200).json(publicaciones);
  } catch (error) {
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error fetching publicaciones', error: (error as Error).message });
  }
};

export const getPublicacionById = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access params from the request object directly.
  const { id } = req.params;
  try {
    const publicacion = await prisma.publicacion.findUnique({ where: { id: parseInt(id) } });
    if (!publicacion) {
      // FIX: Add .status() method to the response object.
      return res.status(404).json({ message: 'Publicacion not found' });
    }
    // FIX: Add .status() method to the response object.
    res.status(200).json(publicacion);
  } catch (error) {
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error fetching publicacion', error: (error as Error).message });
  }
};

export const createPublicacion = async (req: Request<any, any, any>, res: Response) => {
  // FIX: Access body from the request object directly.
  const { id, fechaPost, ...data } = req.body;
  try {
    const newPublicacion = await prisma.publicacion.create({
      data: {
        ...data,
        fechaPost: new Date(fechaPost),
      },
    });
    // FIX: Add .status() method to the response object.
    res.status(201).json(newPublicacion);
  } catch (error) {
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error creating publicacion', error: (error as Error).message });
  }
};

export const updatePublicacion = async (req: Request<{ id: string }, any, any>, res: Response) => {
  // FIX: Access params from the request object directly.
  const { id } = req.params;
  // FIX: Access body from the request object directly.
  const { fechaPost, ...data } = req.body;
  try {
    const updatedPublicacion = await prisma.publicacion.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        fechaPost: fechaPost ? new Date(fechaPost) : undefined,
      },
    });
    // FIX: Add .status() method to the response object.
    res.status(200).json(updatedPublicacion);
  } catch (error) {
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error updating publicacion', error: (error as Error).message });
  }
};

export const deletePublicacion = async (req: Request<{ id: string }>, res: Response) => {
    // FIX: Access params from the request object directly.
    const { id } = req.params;
    try {
        await prisma.publicacion.delete({ where: { id: parseInt(id) } });
        // FIX: Add .status() method to the response object.
        res.status(204).send();
    } catch (error) {
        // FIX: Add .status() method to the response object.
        res.status(500).json({ message: 'Error deleting publicacion', error: (error as Error).message });
    }
};