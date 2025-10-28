import { Request, Response } from 'express';
import prisma from '../lib/prisma';
// import { Incidencia } from '@prisma/client';

export const getIncidencias = async (req: Request, res: Response) => {
  try {
    const incidencias = await prisma.incidencia.findMany({ orderBy: { fecha: 'desc' } });
    res.status(200).json(incidencias);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching incidencias', error: (error as Error).message });
  }
};

export const getIncidenciaById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    const incidencia = await prisma.incidencia.findUnique({ where: { id: id } });
    if (!incidencia) {
      return res.status(404).json({ message: 'Incidencia not found' });
    }
    res.status(200).json(incidencia);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching incidencia', error: (error as Error).message });
  }
};

export const createIncidencia = async (req: Request, res: Response) => {
  const { id, fecha, ...data } = req.body;
  try {
    const newIncidencia = await prisma.incidencia.create({
      data: {
        ...data,
        fecha: new Date(fecha),
      },
    });
    res.status(201).json(newIncidencia);
  } catch (error) {
    res.status(500).json({ message: 'Error creating incidencia', error: (error as Error).message });
  }
};

export const updateIncidencia = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { fecha, ...data } = req.body;
  try {
    const updatedIncidencia = await prisma.incidencia.update({
      where: { id: id },
      data: {
        ...data,
        fecha: fecha ? new Date(fecha) : undefined,
      },
    });
    res.status(200).json(updatedIncidencia);
  } catch (error) {
    res.status(500).json({ message: 'Error updating incidencia', error: (error as Error).message });
  }
};

export const deleteIncidencia = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.incidencia.delete({ where: { id: id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting incidencia', error: (error as Error).message });
  }
};