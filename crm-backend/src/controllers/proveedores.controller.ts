import { Request, Response } from 'express';
import prisma from '../lib/prisma';
// import { Proveedor, TipoProveedor } from '@prisma/client';

// --- Proveedores ---
export const getProveedores = async (req: Request, res: Response) => {
  try {
    const proveedores = await prisma.proveedor.findMany();
    res.status(200).json(proveedores);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching proveedores', error: (error as Error).message });
  }
};

export const getProveedorById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    const proveedor = await prisma.proveedor.findUnique({ where: { id: id } });
    if (!proveedor) {
      return res.status(404).json({ message: 'Proveedor not found' });
    }
    res.status(200).json(proveedor);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching proveedor', error: (error as Error).message });
  }
};

export const createProveedor = async (req: Request, res: Response) => {
  const data = req.body;
  try {
    const newProveedor = await prisma.proveedor.create({ data });
    res.status(201).json(newProveedor);
  } catch (error) {
    res.status(500).json({ message: 'Error creating proveedor', error: (error as Error).message });
  }
};

export const updateProveedor = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    const updatedProveedor = await prisma.proveedor.update({ where: { id: id }, data: req.body });
    res.status(200).json(updatedProveedor);
  } catch (error) {
    res.status(500).json({ message: 'Error updating proveedor', error: (error as Error).message });
  }
};

export const deleteProveedor = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.proveedor.delete({ where: { id: id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting proveedor', error: (error as Error).message });
  }
};


// --- Tipos de Proveedor ---
export const getTiposProveedor = async (req: Request, res: Response) => {
  try {
    const tipos = await prisma.tipoProveedor.findMany();
    res.status(200).json(tipos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tipos de proveedor', error: (error as Error).message });
  }
};

export const createTipoProveedor = async (req: Request, res: Response) => {
  const data = req.body;
  try {
    const newTipo = await prisma.tipoProveedor.create({ data });
    res.status(201).json(newTipo);
  } catch (error) {
    res.status(500).json({ message: 'Error creating tipo de proveedor', error: (error as Error).message });
  }
};

export const updateTipoProveedor = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    const updatedTipo = await prisma.tipoProveedor.update({ where: { id: id }, data: req.body });
    res.status(200).json(updatedTipo);
  } catch (error) {
    res.status(500).json({ message: 'Error updating tipo de proveedor', error: (error as Error).message });
  }
};

export const deleteTipoProveedor = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.tipoProveedor.delete({ where: { id: id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting tipo de proveedor', error: (error as Error).message });
  }
};