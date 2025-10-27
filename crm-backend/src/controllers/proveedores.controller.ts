import { Request, Response } from 'express';
import prisma from '../lib/prisma';
// FIX: Removed `ParamsDictionary` import as it was causing type conflicts.

// --- Proveedores ---
export const getProveedores = async (req: Request, res: Response) => {
  try {
    const proveedores = await prisma.proveedor.findMany();
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    res.status(200).json(proveedores);
  } catch (error) {
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    res.status(500).json({ message: 'Error fetching proveedores', error: (error as Error).message });
  }
};

export const getProveedorById = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access `req.params.id` correctly (added explicit cast for clarity).
  const id = (req.params as any).id;
  try {
    const proveedor = await prisma.proveedor.findUnique({ where: { id: parseInt(id) } });
    if (!proveedor) {
      // FIX: Use `res.status` directly (added explicit cast for clarity).
      return res.status(404).json({ message: 'Proveedor not found' });
    }
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    res.status(200).json(proveedor);
  } catch (error) {
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    res.status(500).json({ message: 'Error fetching proveedor', error: (error as Error).message });
  }
};

export const createProveedor = async (req: Request, res: Response) => {
  // FIX: Access `req.body` correctly (added explicit cast for clarity).
  const data = (req.body as any);
  try {
    const newProveedor = await prisma.proveedor.create({ data });
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    res.status(201).json(newProveedor);
  } catch (error) {
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    res.status(500).json({ message: 'Error creating proveedor', error: (error as Error).message });
  }
};

export const updateProveedor = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access `req.params.id` correctly (added explicit cast for clarity).
  const id = (req.params as any).id;
  try {
    const updatedProveedor = await prisma.proveedor.update({ where: { id: parseInt(id) }, data: (req.body as any) });
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    res.status(200).json(updatedProveedor);
  } catch (error) {
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    res.status(500).json({ message: 'Error updating proveedor', error: (error as Error).message });
  }
};

export const deleteProveedor = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access `req.params.id` correctly (added explicit cast for clarity).
  const id = (req.params as any).id;
  try {
    await prisma.proveedor.delete({ where: { id: parseInt(id) } });
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    res.status(204).send();
  } catch (error) {
    // FIX: Use `res.status` directamente (added explicit cast for clarity).
    res.status(500).json({ message: 'Error deleting proveedor', error: (error as Error).message });
  }
};


// --- Tipos de Proveedor ---
export const getTiposProveedor = async (req: Request, res: Response) => {
  try {
    const tipos = await prisma.tipoProveedor.findMany();
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    res.status(200).json(tipos);
  } catch (error) {
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    res.status(500).json({ message: 'Error fetching tipos de proveedor', error: (error as Error).message });
  }
};

export const createTipoProveedor = async (req: Request, res: Response) => {
  // FIX: Access `req.body` correctly (added explicit cast for clarity).
  const data = (req.body as any);
  try {
    const newTipo = await prisma.tipoProveedor.create({ data });
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    res.status(201).json(newTipo);
  } catch (error) {
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    res.status(500).json({ message: 'Error creating tipo de proveedor', error: (error as Error).message });
  }
};

export const updateTipoProveedor = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access `req.params.id` correctly (added explicit cast for clarity).
  const id = (req.params as any).id;
  try {
    const updatedTipo = await prisma.tipoProveedor.update({ where: { id: parseInt(id) }, data: (req.body as any) });
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    res.status(200).json(updatedTipo);
  } catch (error) {
    // FIX: Use `res.status` directamente (added explicit cast for clarity).
    res.status(500).json({ message: 'Error updating tipo de proveedor', error: (error as Error).message });
  }
};

export const deleteTipoProveedor = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access `req.params.id` correctly (added explicit cast for clarity).
  const id = (req.params as any).id;
  try {
    await prisma.tipoProveedor.delete({ where: { id: parseInt(id) } });
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    res.status(204).send();
  } catch (error) {
    // FIX: Use `res.status` directamente (added explicit cast for clarity).
    res.status(500).json({ message: 'Error deleting tipo de proveedor', error: (error as Error).message });
  }
};