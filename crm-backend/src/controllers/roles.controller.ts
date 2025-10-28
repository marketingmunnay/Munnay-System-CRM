import * as express from 'express'; // FIX: Import express as a namespace
import prisma from '../lib/prisma';
import { Role } from '@prisma/client'; // Import Role type from Prisma client

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
  const id = parseInt(req.params.id); // FIX: Access `req.params.id` correctly.
  try {
    const role = await prisma.role.findUnique({ where: { id: id } });
    if (!role) {
      // FIX: Use `res.status` directly.
      return res.status(404).json({ message: 'Role not found' });
    }
    // FIX: Use `res.status` directly.
    res.status(200).json(role);
  } catch (error) {
    // FIX: Use `res.status` directamente.
    res.status(500).json({ message: 'Error fetching role', error: (error as Error).message });
  }
};

export const createRole = async (req: express.Request<any, any, Role>, res: express.Response) => { // FIX: Use express.Request and express.Response
  const roleData: Role = req.body; // FIX: Access `req.body` correctly.
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

export const updateRole = async (req: express.Request<{ id: string }, any, Role>, res: express.Response) => { // FIX: Use express.Request and express.Response
  const id = parseInt(req.params.id); // FIX: Access `req.params.id` correctly.
  const roleData: Role = req.body; // FIX: Access `req.body` correctly.
  try {
    const updatedRole = await prisma.role.update({
      where: { id: id },
      data: roleData,
    });
    // FIX: Use `res.status` directly.
    res.status(200).json(updatedRole);
  } catch (error) {
    // FIX: Use `res.status` directamente.
    res.status(500).json({ message: 'Error updating role', error: (error as Error).message });
  }
};

export const deleteRole = async (req: express.Request<{ id: string }>, res: express.Response) => { // FIX: Use express.Request and express.Response
    const id = parseInt(req.params.id); // FIX: Access `req.params.id` correctly.
    try {
        await prisma.role.delete({ where: { id: id } });
        // FIX: Use `res.status` directamente.
        res.status(204).send();
    } catch (error) {
        // FIX: Use `res.status` directamente.
        res.status(500).json({ message: 'Error deleting role', error: (error as Error).message });
    }
};