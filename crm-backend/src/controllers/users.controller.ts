import * as express from 'express'; // FIX: Import express as a namespace
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';
import { Address, EmergencyContact } from '../../types';

export const getUsers = async (req: express.Request, res: express.Response) => { // FIX: Use express.Request and express.Response
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
    // FIX: Use `res.status` directly.
    res.status(200).json(users);
  } catch (error) {
    // FIX: Use `res.status` directly.
    res.status(500).json({ message: 'Error fetching users', error: (error as Error).message });
  }
};

export const getUserById = async (req: express.Request<{ id: string }>, res: express.Response) => { // FIX: Use express.Request and express.Response
  // FIX: Access `req.params.id` correctly.
  const id = req.params.id;
  try {
    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!user) {
      // FIX: Use `res.status` directly.
      return res.status(404).json({ message: 'User not found' });
    }
    const { password, ...userWithoutPassword } = user;
    // FIX: Use `res.status` directly.
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    // FIX: Use `res.status` directly.
    res.status(500).json({ message: 'Error fetching user', error: (error as Error).message });
  }
};

export const createUser = async (req: express.Request, res: express.Response) => { // FIX: Use express.Request and express.Response
  // FIX: Access `req.body` correctly.
  const { id, password, addresses, emergencyContacts, ...userData } = req.body as any;
  if (!password) {
    // FIX: Use `res.status` directly.
    return res.status(400).json({ message: 'Password is required' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        birthDate: userData.birthDate ? new Date(userData.birthDate) : null,
        startDate: userData.startDate ? new Date(userData.startDate) : null,
        addresses: {
          create: (addresses as Address[])?.map(addr => ({
            direccion: addr.direccion,
            distrito: addr.distrito,
            ciudad: addr.ciudad,
            referencia: addr.referencia,
          })) || [],
        },
        emergencyContacts: {
          create: (emergencyContacts as EmergencyContact[])?.map(contact => ({
            nombre: contact.nombre,
            parentesco: contact.parentesco,
            numero: contact.numero,
          })) || [],
        },
      },
      include: { // Include to return the created relations
        addresses: true,
        emergencyContacts: true,
        reconocimientosRecibidos: true,
      }
    });
    const { password: _, ...userWithoutPassword } = newUser;
    // FIX: Use `res.status` directly.
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error("Error creating user:", error);
    // FIX: Use `res.status` directly.
    res.status(500).json({ message: 'Error creating user', error: (error as Error).message });
  }
};

export const updateUser = async (req: express.Request<{ id: string }>, res: express.Response) => { // FIX: Use express.Request and express.Response
  // FIX: Access `req.params.id` correctly.
  const id = req.params.id;
  // FIX: Access `req.body` correctly.
  const { password, addresses, emergencyContacts, ...userData } = req.body as any;
  try {
    let updateData: any = {
        ...userData,
        birthDate: userData.birthDate ? new Date(userData.birthDate) : (userData.birthDate === null ? null : undefined),
        startDate: userData.startDate ? new Date(userData.startDate) : (userData.startDate === null ? null : undefined),
    };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Handle nested updates for addresses and emergency contacts
    // For simplicity, we'll delete existing and create new ones.
    // A more robust solution would involve checking for changes and updating/deleting/creating selectively.
    if (addresses !== undefined) {
      updateData.addresses = {
        deleteMany: {}, // Delete all existing addresses for this user
        create: (addresses as Address[])?.map(addr => ({
          direccion: addr.direccion,
          distrito: addr.distrito,
          ciudad: addr.ciudad,
          referencia: addr.referencia,
        })) || [],
      };
    }

    if (emergencyContacts !== undefined) {
      updateData.emergencyContacts = {
        deleteMany: {}, // Delete all existing emergency contacts for this user
        create: (emergencyContacts as EmergencyContact[])?.map(contact => ({
          nombre: contact.nombre,
          parentesco: contact.parentesco,
          numero: contact.numero,
        })) || [],
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: { // Include to return the updated relations
        addresses: true,
        emergencyContacts: true,
        reconocimientosRecibidos: true,
      }
    });
    const { password: _, ...userWithoutPassword } = updatedUser;
    // FIX: Use `res.status` directly.
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    // FIX: Use `res.status` directamente.
    res.status(500).json({ message: 'Error updating user', error: (error as Error).message });
  }
};

export const deleteUser = async (req: express.Request<{ id: string }>, res: express.Response) => { // FIX: Use express.Request and express.Response
  // FIX: Access `req.params.id` correctly.
  const id = req.params.id;
  try {
    // Delete related records first due to cascade delete not automatically handling all relations, 
    // or if specific logic is needed (e.g., if a user has given/received recognitions and these should not be deleted).
    // For this simplified example, we'll assume cascade delete is enough for addresses and emergency contacts.
    // If not, explicit deleteMany should be added here.
    
    // For Recognitions, need to disconnect first if not using full cascade on User deletion
    await prisma.reconocimiento.deleteMany({ where: { OR: [{ otorgadoPorId: parseInt(id) }, { recibidoPorId: parseInt(id) }] } });

    await prisma.user.delete({ where: { id: parseInt(id) } });
    // FIX: Use `res.status` directly.
    res.status(204).send();
  } catch (error) {
    // FIX: Use `res.status` directamente.
    res.status(500).json({ message: 'Error deleting user', error: (error as Error).message });
  }
};