import * as express from 'express'; // FIX: Import express as a namespace
import prisma from '../lib/prisma';
import { Publicacion } from '@prisma/client'; // Import Publicacion type from Prisma client

export const getPublicaciones = async (req: express.Request, res: express.Response) => { // FIX: Use express.Request and express.Response
  try {
    const publicaciones = await prisma.publicacion.findMany({
      orderBy: {
        fechaPost: 'desc',
      },
    });
    // FIX: Use `res.status` directly.
    res.status(200).json(publicaciones);
  } catch (error) {
    // FIX: Use `res.status` directamente.
    res.status(500).json({ message: 'Error fetching publicaciones', error: (error as Error).message });
  }
};

export const getPublicacionById = async (req: express.Request<{ id: string }>, res: express.Response) => { // FIX: Use express.Request and express.Response
  const id = parseInt(req.params.id); // FIX: Access `req.params.id` correctly.
  try {
    const publicacion = await prisma.publicacion.findUnique({ where: { id: id } });
    if (!publicacion) {
      // FIX: Use `res.status` directly.
      return res.status(404).json({ message: 'Publicacion not found' });
    }
    // FIX: Use `res.status` directamente.
    res.status(200).json(publicacion);
  } catch (error) {
    // FIX: Use `res.status` directamente.
    res.status(500).json({ message: 'Error fetching publicacion', error: (error as Error).message });
  }
};

export const createPublicacion = async (req: express.Request<any, any, Publicacion>, res: express.Response) => { // FIX: Use express.Request and express.Response
  const { id, fechaPost, ...data } = req.body; // FIX: Access `req.body` correctly.
  try {
    const newPublicacion = await prisma.publicacion.create({
      data: {
        ...data,
        fechaPost: new Date(fechaPost),
      },
    });
    // FIX: Use `res.status` directamente.
    res.status(201).json(newPublicacion);
  } catch (error) {
    // FIX: Use `res.status` directamente.
    res.status(500).json({ message: 'Error creating publicacion', error: (error as Error).message });
  }
};

export const updatePublicacion = async (req: express.Request<{ id: string }, any, Publicacion>, res: express.Response) => { // FIX: Use express.Request and express.Response
  const id = parseInt(req.params.id); // FIX: Access `req.params.id` correctly.
  const { fechaPost, ...data } = req.body; // FIX: Access `req.body` correctly.
  try {
    const updatedPublicacion = await prisma.publicacion.update({
      where: { id: id },
      data: {
        ...data,
        fechaPost: fechaPost ? new Date(fechaPost) : undefined,
      },
    });
    // FIX: Use `res.status` directamente.
    res.status(200).json(updatedPublicacion);
  } catch (error) {
    // FIX: Use `res.status` directamente.
    res.status(500).json({ message: 'Error updating publicacion', error: (error as Error).message });
  }
};

export const deletePublicacion = async (req: express.Request<{ id: string }>, res: express.Response) => { // FIX: Use express.Request and express.Response
    const id = parseInt(req.params.id); // FIX: Access `req.params.id` correctly.
    try {
        await prisma.publicacion.delete({ where: { id: id } });
        // FIX: Use `res.status` directamente.
        res.status(204).send();
    } catch (error) {
        // FIX: Use `res.status` directamente.
        res.status(500).json({ message: 'Error deleting publicacion', error: (error as Error).message });
    }
};