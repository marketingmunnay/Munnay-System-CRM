import * as express from 'express';
import prisma from '../lib/prisma';

export const getSeguidores = async (req: express.Request, res: express.Response) => {
  try {
    const seguidores = await prisma.seguidor.findMany({
        orderBy: {
            fecha: 'desc',
        }
    });
    res.status(200).json(seguidores);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching seguidores', error: (error as Error).message });
  }
};

export const getSeguidorById = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  try {
    const seguidor = await prisma.seguidor.findUnique({ where: { id: parseInt(id) } });
    if (!seguidor) return res.status(404).json({ message: 'Seguidor not found' });
    res.status(200).json(seguidor);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching seguidor', error: (error as Error).message });
  }
};

export const createSeguidor = async (req: express.Request, res: express.Response) => {
  const { id, fecha, ...data } = req.body;
  try {
    const newSeguidor = await prisma.seguidor.create({
      data: {
        ...data,
        fecha: new Date(fecha),
      },
    });
    res.status(201).json(newSeguidor);
  } catch (error) {
    res.status(500).json({ message: 'Error creating seguidor', error: (error as Error).message });
  }
};

export const updateSeguidor = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const { fecha, ...data } = req.body;
  try {
    const updatedSeguidor = await prisma.seguidor.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        fecha: fecha ? new Date(fecha) : undefined,
      },
    });
    res.status(200).json(updatedSeguidor);
  } catch (error) {
    res.status(500).json({ message: 'Error updating seguidor', error: (error as Error).message });
  }
};

export const deleteSeguidor = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  try {
    await prisma.seguidor.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting seguidor', error: (error as Error).message });
  }
};