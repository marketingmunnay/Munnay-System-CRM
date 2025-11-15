import { Request, Response } from 'express';
import prisma from '../lib/prisma';
// import { Role } from '@prisma/client';

export const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = await prisma.role.findMany();
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching roles', error: (error as Error).message });
  }
};

export const getRoleById = async (req: Request, res: Response) => {
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

export const createRole = async (req: Request, res: Response) => {
  const roleData = req.body;
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
  const id = parseInt(req.params.id);
  const { id: _, ...roleData } = req.body; // Exclude id from update data
  
  console.log('=== UPDATE ROLE REQUEST ===');
  console.log('Role ID:', id);
  console.log('Body recibido:', JSON.stringify(req.body, null, 2));
  console.log('roleData a actualizar:', JSON.stringify(roleData, null, 2));
  
  try {
    const updatedRole = await prisma.role.update({
      where: { id: id },
      data: roleData,
    });
    console.log('✅ Rol actualizado exitosamente:', updatedRole.id);
    res.status(200).json(updatedRole);
  } catch (error) {
    console.error('❌ Error updating role:', error);
    console.error('Error stack:', (error as Error).stack);
    res.status(500).json({ message: 'Error updating role', error: (error as Error).message });
  }
};

export const deleteRole = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    try {
        await prisma.role.delete({ where: { id: id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting role', error: (error as Error).message });
    }
};