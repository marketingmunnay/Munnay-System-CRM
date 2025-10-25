import * as express from 'express';
import prisma from '../lib/prisma';

export const getPublicaciones = async (req: express.Request, res: express.Response) => {
  try {
    const publicaciones = await prisma.publicacion.findMany({
      orderBy: {
        fechaPost: 'desc',
      },
    });
    res.status(200).json(publicaciones);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching publicaciones', error: (error as Error).message });
  }
};

export const getPublicacionById = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  try {
    const publicacion = await prisma.publicacion.findUnique({ where: { id: parseInt(id) } });
    if (!publicacion) return res.status(404).json({ message: 'Publicacion not found' });
    res.status(200).json(publicacion);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching publicacion', error: (error as Error).message });
  }
};

export const createPublicacion = async (req: express.Request, res: express.Response) => {
  const { id, fechaPost, ...data } = req.body;
  try {
    const newPublicacion = await prisma.publicacion.create({
      data: {
        ...data,
        fechaPost: new Date(fechaPost),
      },
    });
    res.status(201).json(newPublicacion);
  } catch (error) {
    res.status(500).json({ message: 'Error creating publicacion', error: (error as Error).message });
  }
};

export const updatePublicacion = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const { fechaPost, ...data } = req.body;
  try {
    const updatedPublicacion = await prisma.publicacion.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        fechaPost: fechaPost ? new Date(fechaPost) : undefined,
      },
    });
    res.status(200).json(updatedPublicacion);
  } catch (error) {
    res.status(500).json({ message: 'Error updating publicacion', error: (error as Error).message });
  }
};

export const deletePublicacion = async (req: express.Request, res: express.Response) => {
    const { id } = req.params;
    try {
        await prisma.publicacion.delete({ where: { id: parseInt(id) } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting publicacion', error: (error as Error).message });
    }
};