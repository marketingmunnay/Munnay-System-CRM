import * as express from 'express';
import prisma from '../lib/prisma';
import { Role } from '@prisma/client';

export const getRoles = async (req: express.Request, res: express.Response) => {
  try {
    const roles = await prisma.role.findMany();
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching roles', error: (error as Error).message });
  }
};

export const getRoleById = async (req: express.Request<{ id: string }>, res: express.Response) => {
  // FIX: Access `req.params.id` correctly.
  const id = parseInt(req.params.id);
  try {
    const role = await prisma.role.findUnique({ where: { id: id } });
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.status(200).json(role);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching role', error: (error as Error).message });
  }
};

export const createRole = async (req: express.Request<any, any, Role>, res: express.Response) => {
  const roleData: Role = req.body;
  try {
    const newRole = await prisma.role.create({
      data: roleData,
    });
    res.status(201).json(newRole);
  } catch (error) {
    res.status(500).json({ message: 'Error creating role', error: (error as Error).message });
  }
};

export const updateRole = async (req: express.Request<{ id: string }, any, Role>, res: express.Response) => {
  // FIX: Access `req.params.id` correctly.
  const id = parseInt(req.params.id);
  const roleData: Role = req.body;
  try {
    const updatedRole = await prisma.role.update({
      where: { id: id },
      data: roleData,
    });
    res.status(200).json(updatedRole);
  } catch (error) {
    res.status(500).json({ message: 'Error updating role', error: (error as Error).message });
  }
};

export const deleteRole = async (req: express.Request<{ id: string }>, res: express.Response) => {
    // FIX: Access `req.params.id` correctly.
    const id = parseInt(req.params.id);
    try {
        await prisma.role.delete({ where: { id: id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting role', error: (error as Error).message });
    }
};