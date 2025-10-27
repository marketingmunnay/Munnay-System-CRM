import { Request, Response } from 'express';
import prisma from '../lib/prisma';
// FIX: Removed `ParamsDictionary` import as it was causing type conflicts.

export const getPublicaciones = async (req: Request, res: Response) => {
  try {
    const publicaciones = await prisma.publicacion.findMany({
      orderBy: {
        fechaPost: 'desc',
      },
    });
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    (res as Response).status(200).json(publicaciones);
  } catch (error) {
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    (res as Response).status(500).json({ message: 'Error fetching publicaciones', error: (error as Error).message });
  }
};

export const getPublicacionById = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access `req.params.id` correctly (added explicit cast for clarity).
  const id = (req.params as any).id;
  try {
    const publicacion = await prisma.publicacion.findUnique({ where: { id: parseInt(id) } });
    if (!publicacion) {
      // FIX: Use `res.status` directly (added explicit cast for clarity).
      return (res as Response).status(404).json({ message: 'Publicacion not found' });
    }
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    (res as Response).status(200).json(publicacion);
  } catch (error) {
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    (res as Response).status(500).json({ message: 'Error fetching publicacion', error: (error as Error).message });
  }
};

export const createPublicacion = async (req: Request, res: Response) => {
  // FIX: Access `req.body` correctly (added explicit cast for clarity).
  const { id, fechaPost, ...data } = (req.body as any);
  try {
    const newPublicacion = await prisma.publicacion.create({
      data: {
        ...data,
        fechaPost: new Date(fechaPost),
      },
    });
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    (res as Response).status(201).json(newPublicacion);
  } catch (error) {
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    (res as Response).status(500).json({ message: 'Error creating publicacion', error: (error as Error).message });
  }
};

export const updatePublicacion = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access `req.params.id` correctly (added explicit cast for clarity).
  const id = (req.params as any).id;
  // FIX: Access `req.body` correctly (added explicit cast for clarity).
  const { fechaPost, ...data } = (req.body as any);
  try {
    const updatedPublicacion = await prisma.publicacion.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        fechaPost: fechaPost ? new Date(fechaPost) : undefined,
      },
    });
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    (res as Response).status(200).json(updatedPublicacion);
  } catch (error) {
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    (res as Response).status(500).json({ message: 'Error updating publicacion', error: (error as Error).message });
  }
};

export const deletePublicacion = async (req: Request<{ id: string }>, res: Response) => {
    // FIX: Access `req.params.id` correctly (added explicit cast for clarity).
    const id = (req.params as any).id;
    try {
        await prisma.publicacion.delete({ where: { id: parseInt(id) } });
        // FIX: Use `res.status` directly (added explicit cast for clarity).
        (res as Response).status(204).send();
    } catch (error) {
        // FIX: Use `res.status` directly (added explicit cast for clarity).
        (res as Response).status(500).json({ message: 'Error deleting publicacion', error: (error as Error).message });
    }
};