import * as express from 'express'; // FIX: Import express as a namespace
import prisma from '../lib/prisma';

// --- Proveedores ---
export const getProveedores = async (req: express.Request, res: express.Response) => { // FIX: Use express.Request and express.Response
  try {
    const proveedores = await prisma.proveedor.findMany();
    // FIX: Use `res.status` directly.
    res.status(200).json(proveedores);
  } catch (error) {
    // FIX: Use `res.status` directamente.
    res.status(500).json({ message: 'Error fetching proveedores', error: (error as Error).message });
  }
};

export const getProveedorById = async (req: express.Request<{ id: string }>, res: express.Response) => { // FIX: Use express.Request and express.Response
  // FIX: Access `req.params.id` correctly.
  const id = req.params.id;
  try {
    const proveedor = await prisma.proveedor.findUnique({ where: { id: parseInt(id) } });
    if (!proveedor) {
      // FIX: Use `res.status` directly.
      return res.status(404).json({ message: 'Proveedor not found' });
    }
    // FIX: Use `res.status` directly.
    res.status(200).json(proveedor);
  } catch (error) {
    // FIX: Use `res.status` directamente.
    res.status(500).json({ message: 'Error fetching proveedor', error: (error as Error).message });
  }
};

export const createProveedor = async (req: express.Request, res: express.Response) => { // FIX: Use express.Request and express.Response
  // FIX: Access `req.body` correctly.
  const data = req.body;
  try {
    const newProveedor = await prisma.proveedor.create({ data });
    // FIX: Use `res.status` directly.
    res.status(201).json(newProveedor);
  } catch (error) {
    // FIX: Use `res.status` directamente.
    res.status(500).json({ message: 'Error creating proveedor', error: (error as Error).message });
  }
};

export const updateProveedor = async (req: express.Request<{ id: string }>, res: express.Response) => { // FIX: Use express.Request and express.Response
  // FIX: Access `req.params.id` correctly.
  const id = req.params.id;
  try {
    const updatedProveedor = await prisma.proveedor.update({ where: { id: parseInt(id) }, data: req.body });
    // FIX: Use `res.status` directly.
    res.status(200).json(updatedProveedor);
  } catch (error) {
    // FIX: Use `res.status` directamente.
    res.status(500).json({ message: 'Error updating proveedor', error: (error as Error).message });
  }
};

export const deleteProveedor = async (req: express.Request<{ id: string }>, res: express.Response) => { // FIX: Use express.Request and express.Response
  // FIX: Access `req.params.id` correctly.
  const id = req.params.id;
  try {
    await prisma.proveedor.delete({ where: { id: parseInt(id) } });
    // FIX: Use `res.status` directly.
    res.status(204).send();
  } catch (error) {
    // FIX: Use `res.status` directamente.
    res.status(500).json({ message: 'Error deleting proveedor', error: (error as Error).message });
  }
};


// --- Tipos de Proveedor ---
export const getTiposProveedor = async (req: express.Request, res: express.Response) => { // FIX: Use express.Request and express.Response
  try {
    const tipos = await prisma.tipoProveedor.findMany();
    // FIX: Use `res.status` directly.
    res.status(200).json(tipos);
  } catch (error) {
    // FIX: Use `res.status` directamente.
    res.status(500).json({ message: 'Error fetching tipos de proveedor', error: (error as Error).message });
  }
};

export const createTipoProveedor = async (req: express.Request, res: express.Response) => { // FIX: Use express.Request and express.Response
  // FIX: Access `req.body` correctly.
  const data = req.body;
  try {
    const newTipo = await prisma.tipoProveedor.create({ data });
    // FIX: Use `res.status` directamente.
    res.status(201).json(newTipo);
  } catch (error) {
    // FIX: Use `res.status` directamente.
    res.status(500).json({ message: 'Error creating tipo de proveedor', error: (error as Error).message });
  }
};

export const updateTipoProveedor = async (req: express.Request<{ id: string }>, res: express.Response) => { // FIX: Use express.Request and express.Response
  // FIX: Access `req.params.id` correctly.
  const id = req.params.id;
  try {
    const updatedTipo = await prisma.tipoProveedor.update({ where: { id: parseInt(id) }, data: req.body });
    // FIX: Use `res.status` directamente.
    res.status(200).json(updatedTipo);
  } catch (error) {
    // FIX: Use `res.status` directamente.
    res.status(500).json({ message: 'Error updating tipo de proveedor', error: (error as Error).message });
  }
};

export const deleteTipoProveedor = async (req: express.Request<{ id: string }>, res: express.Response) => { // FIX: Use express.Request and express.Response
  // FIX: Access `req.params.id` correctly.
  const id = req.params.id;
  try {
    await prisma.tipoProveedor.delete({ where: { id: parseInt(id) } });
    // FIX: Use `res.status` directamente.
    res.status(204).send();
  } catch (error) {
    // FIX: Use `res.status` directamente.
    res.status(500).json({ message: 'Error deleting tipo de proveedor', error: (error as Error).message });
  }
};