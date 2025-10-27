import { Request, Response } from 'express';
import prisma from '../lib/prisma';
// FIX: Removed `ParamsDictionary` import as it was causing type conflicts.

export const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = await prisma.role.findMany();
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    res.status(200).json(roles);
  } catch (error) {
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    res.status(500).json({ message: 'Error fetching roles', error: (error as Error).message });
  }
};

export const getRoleById = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access `req.params.id` correctly (added explicit cast for clarity).
  const id = (req.params as any).id;
  try {
    const role = await prisma.role.findUnique({ where: { id: parseInt(id) } });
    if (!role) {
      // FIX: Use `res.status` directly (added explicit cast for clarity).
      return res.status(404).json({ message: 'Role not found' });
    }
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    res.status(200).json(role);
  } catch (error) {
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    res.status(500).json({ message: 'Error fetching role', error: (error as Error).message });
  }
};

export const createRole = async (req: Request, res: Response) => {
  // FIX: Access `req.body` correctly (added explicit cast for clarity).
  const roleData = (req.body as any);
  try {
    const newRole = await prisma.role.create({
      data: roleData,
    });
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    res.status(201).json(newRole);
  } catch (error) {
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    res.status(500).json({ message: 'Error creating role', error: (error as Error).message });
  }
};

export const updateRole = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access `req.params.id` correctly (added explicit cast for clarity).
  const id = (req.params as any).id;
  // FIX: Access `req.body` correctly (added explicit cast for clarity).
  const roleData = (req.body as any);
  try {
    const updatedRole = await prisma.role.update({
      where: { id: parseInt(id) },
      // FIX: Ensure `roleData` is passed directly to `data` property.
      data: roleData,
    });
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    res.status(200).json(updatedRole);
  } catch (error) {
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    res.status(500).json({ message: 'Error updating role', error: (error as Error).message });
  }
};

export const deleteRole = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access `req.params.id` correctly (added explicit cast for clarity).
  const id = (req.params as any).id;
  try {
    await prisma.role.delete({
      where: { id: parseInt(id) },
    });
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    res.status(204).send();
  } catch (error) {
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    res.status(500).json({ message: 'Error deleting role', error: (error as Error).message });
  }
};