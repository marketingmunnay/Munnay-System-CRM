// FIX: Use value import for Express types to resolve compilation errors in handlers
import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = await prisma.role.findMany();
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching roles', error: (error as Error).message });
  }
};

export const getRoleById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const role = await prisma.role.findUnique({ where: { id: parseInt(id) } });
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.status(200).json(role);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching role', error: (error as Error).message });
  }
};

export const createRole = async (req: Request, res: Response) => {
  const { id, ...roleData } = req.body;
  try {
    const newRole = await prisma.role.create({
      data: roleData,
    });
    res.status(201).json(newRole);
  } catch (error) {
    res.status(500).json({ message: 'Error creating role', error: (error as Error).message });
  }
};

export const updateRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { ...roleData } = req.body;
  try {
    const updatedRole = await prisma.role.update({
      where: { id: parseInt(id) },
      data: roleData,
    });
    res.status(200).json(updatedRole);
  } catch (error) {
    res.status(500).json({ message: 'Error updating role', error: (error as Error).message });
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.role.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting role', error: (error as Error).message });
  }
};