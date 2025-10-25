import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = await prisma.role.findMany();
    // FIX: Add .status() method to the response object.
    res.status(200).json(roles);
  } catch (error) {
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error fetching roles', error: (error as Error).message });
  }
};

export const getRoleById = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access params from the request object directly.
  const { id } = req.params;
  try {
    const role = await prisma.role.findUnique({ where: { id: parseInt(id) } });
    if (!role) {
      // FIX: Add .status() method to the response object.
      return res.status(404).json({ message: 'Role not found' });
    }
    // FIX: Add .status() method to the response object.
    res.status(200).json(role);
  } catch (error) {
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error fetching role', error: (error as Error).message });
  }
};

export const createRole = async (req: Request<any, any, any>, res: Response) => {
  // FIX: Access body from the request object directly.
  const { id, ...roleData } = req.body;
  try {
    const newRole = await prisma.role.create({
      data: roleData,
    });
    // FIX: Add .status() method to the response object.
    res.status(201).json(newRole);
  } catch (error) {
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error creating role', error: (error as Error).message });
  }
};

export const updateRole = async (req: Request<{ id: string }, any, any>, res: Response) => {
  // FIX: Access params from the request object directly.
  const { id } = req.params;
  // FIX: Access body from the request object directly.
  const { ...roleData } = req.body;
  try {
    const updatedRole = await prisma.role.update({
      where: { id: parseInt(id) },
      data: roleData,
    });
    // FIX: Add .status() method to the response object.
    res.status(200).json(updatedRole);
  } catch (error) {
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error updating role', error: (error as Error).message });
  }
};

export const deleteRole = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access params from the request object directly.
  const { id } = req.params;
  try {
    await prisma.role.delete({
      where: { id: parseInt(id) },
    });
    // FIX: Add .status() method to the response object.
    res.status(204).send();
  } catch (error) {
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error deleting role', error: (error as Error).message });
  }
};