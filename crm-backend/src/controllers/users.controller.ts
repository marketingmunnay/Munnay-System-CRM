import * as express from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';

export const getUsers = async (req: express.Request, res: express.Response) => {
  try {
    const users = await prisma.user.findMany({
      // Exclude password from the result
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        usuario: true,
        rolId: true,
        avatarUrl: true,
        position: true,
        documentType: true,
        documentNumber: true,
        phone: true,
        birthDate: true,
        startDate: true,
        addresses: true,
        emergencyContacts: true,
        reconocimientosRecibidos: true,
        salary: true,
        contractType: true,
        maritalStatus: true,
        sex: true,
      },
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: (error as Error).message });
  }
};

export const getUserById = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { password, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: (error as Error).message });
  }
};

export const createUser = async (req: express.Request, res: express.Response) => {
  const { id, password, ...data } = req.body;
  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        startDate: data.startDate ? new Date(data.startDate) : null,
      },
    });
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: (error as Error).message });
  }
};

export const updateUser = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const { password, ...data } = req.body;
  try {
    let updateData: any = {
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate) : (data.birthDate === null ? null : undefined),
        startDate: data.startDate ? new Date(data.startDate) : (data.startDate === null ? null : undefined),
    };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
    });
    const { password: _, ...userWithoutPassword } = updatedUser;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: (error as Error).message });
  }
};

export const deleteUser = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  try {
    // Delete related records first due to cascade delete not automatically handling all relations, 
    // or if specific logic is needed (e.g., if a user has given/received recognitions and these should not be deleted).
    // For this simplified example, we'll assume cascade delete is enough for addresses and emergency contacts.
    // If not, explicit deleteMany should be added here.
    
    // For Recognitions, need to disconnect first if not using full cascade on User deletion
    await prisma.reconocimiento.deleteMany({ where: { OR: [{ otorgadoPorId: parseInt(id) }, { recibidoPorId: parseInt(id) }] } });

    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: (error as Error).message });
  }
};