import * as express from 'express'; // FIX: Import express as a namespace
import prisma from '../lib/prisma';

export const getRoles = async (req: express.Request, res: express.Response) => { // FIX: Use express.Request and express.Response
  try {
    const roles = await prisma.role.findMany();
    // FIX: Use `res.status` directly.
    res.status(200).json(roles);
  } catch (error) {
    // FIX: Use `res.status` directly.
    res.status(500).json({ message: 'Error fetching roles', error: (error as Error).message });
  }
};

export const getRoleById = async (req: express.Request<{ id: string }>, res: express.Response) => { // FIX: Use express.Request and express.Response
  // FIX: Access `req.params.id` correctly.
  const id = req.params.id;
  try {
    const role = await prisma.role.findUnique({ where: { id: parseInt(id) } });
    if (!role) {
      // FIX: Use `res.status` directly.
      return res.status(404).json({ message: 'Role not found' });
    }
    // FIX: Use `res.status` directly.
    res.status(200).json(role);
  } catch (error) {
    // FIX: Use `res.status` directly.
    res.status(500).json({ message: 'Error fetching role', error: (error as Error).message });
  }
};

export const createRole = async (req: express.Request, res: express.Response) => { // FIX: Use express.Request and express.Response
  // FIX: Access `req.body` correctly.
  const roleData = req.body;
  try {
    const newRole = await prisma.role.create({
      data: roleData,
    });
    // FIX: Use `res.status` directly.
    res.status(201).json(newRole);
  } catch (error) {
    // FIX: Use `res.status` directly.
    res.status(500).json({ message: 'Error creating role', error: (error as Error).message });
  }
};

export const updateRole = async (req: express.Request<{ id: string }>, res: express.Response) => { // FIX: Use express.Request and express.Response
  // FIX: Access `req.params.id` correctly.
  const id = req.params.id;
  // FIX: Access `req.body` correctly.
  const roleData = req.body;
  try {
    const updatedRole = await prisma.role.update({
      where: { id: parseInt(id) },
      // FIX: Ensure `roleData` is passed directly to `data` property.
      data: roleData,
    });
    // FIX: Use `res.status` directly.
    res.status(200).json(updatedRole);
  } catch (error) {
    // FIX: Use `res.status` directly.
    res.status(500).json({ message: 'Error updating role', error: (error as Error).message });
  }
};

export const deleteRole = async (req: express.Request<{ id: string }>, res: express.Response) => { // FIX: Use express.Request and express.Response
  // FIX: Access `req.params.id` correctly.
  const id = req.params.id;
  try {
    await prisma.role.delete({
      where: { id: parseInt(id) },
    });
    // FIX: Use `res.status` directly.
    res.status(204).send();
  } catch (error) {
    // FIX: Use `res.status` directly.
    res.status(500).json({ message: 'Error deleting role', error: (error as Error).message });
  }
};