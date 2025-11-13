import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; 
// import { Address, EmergencyContact, User } from '@prisma/client';

export const getUsers = async (req: Request, res: Response) => {
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

export const getUserById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    const user = await prisma.user.findUnique({ where: { id: id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { password, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: (error as Error).message });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const { id, password, addresses, emergencyContacts, ...userData } = req.body;
  
  console.log('=== CREATE USER REQUEST ===');
  console.log('Body recibido:', JSON.stringify(req.body, null, 2));
  
  // Validar campos requeridos
  if (!userData.nombres) {
    return res.status(400).json({ message: 'Field "nombres" is required' });
  }
  if (!userData.apellidos) {
    return res.status(400).json({ message: 'Field "apellidos" is required' });
  }
  if (!userData.usuario) {
    return res.status(400).json({ message: 'Field "usuario" is required' });
  }
  if (!password) {
    return res.status(400).json({ message: 'Field "password" is required' });
  }
  if (!userData.rolId) {
    return res.status(400).json({ message: 'Field "rolId" is required' });
  }
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('Datos a crear:', {
      ...userData,
      password: '[HASHED]',
      addresses: addresses,
      emergencyContacts: emergencyContacts
    });
    
    const newUser = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword, // Store hashed password
        rolId: parseInt(userData.rolId), // Ensure rolId is an integer
        birthDate: userData.birthDate ? new Date(userData.birthDate) : null,
        startDate: userData.startDate ? new Date(userData.startDate) : null,
        endDate: userData.endDate ? new Date(userData.endDate) : null,
        salary: userData.salary ? parseFloat(userData.salary) : null,
        bonuses: userData.bonuses ? parseFloat(userData.bonuses) : null,
        afpPercentage: userData.afpPercentage ? parseFloat(userData.afpPercentage) : null,
        addresses: {
          create: (addresses as any[])?.map(addr => ({
            direccion: addr.direccion,
            distrito: addr.distrito,
            ciudad: addr.ciudad,
            referencia: addr.referencia,
          })) || [],
        },
        emergencyContacts: {
          create: (emergencyContacts as any[])?.map(contact => ({
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
    
    console.log('Usuario creado exitosamente:', newUser.id);
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error("Error creating user:", error);
    console.error("Error stack:", (error as Error).stack);
    res.status(500).json({ 
      message: 'Error creating user', 
      error: (error as Error).message,
      details: error instanceof Error ? error.stack : 'Unknown error'
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { id: _, password, addresses, emergencyContacts, ...userData } = req.body; // Exclude id from update data
  try {
    let updateData: any = {
        ...userData,
        birthDate: userData.birthDate ? new Date(userData.birthDate) : (userData.birthDate === null ? null : undefined),
        startDate: userData.startDate ? new Date(userData.startDate) : (userData.startDate === null ? null : undefined),
        endDate: userData.endDate ? new Date(userData.endDate) : (userData.endDate === null ? null : undefined),
        salary: userData.salary ? parseFloat(userData.salary) : (userData.salary === null ? null : undefined),
        bonuses: userData.bonuses ? parseFloat(userData.bonuses) : (userData.bonuses === null ? null : undefined),
        afpPercentage: userData.afpPercentage ? parseFloat(userData.afpPercentage) : (userData.afpPercentage === null ? null : undefined),
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
        create: (addresses as any[])?.map(addr => ({
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
        create: (emergencyContacts as any[])?.map(contact => ({
          nombre: contact.nombre,
          parentesco: contact.parentesco,
          numero: contact.numero,
        })) || [],
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: updateData,
      include: { // Include to return the updated relations
        addresses: true,
        emergencyContacts: true,
        reconocimientosRecibidos: true,
      }
    });
    const { password: _, ...userWithoutPassword } = updatedUser;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    res.status(500).json({ message: 'Error updating user', error: (error as Error).message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    // Delete related records first due to cascade delete not automatically handling all relations, 
    // or if specific logic is needed (e.g., if a user has given/received recognitions and these should not be deleted).
    // For this simplified example, we'll assume cascade delete is enough for addresses and emergency contacts.
    // If not, explicit deleteMany should be added here.
    
    // For Recognitions, need to disconnect first if not using full cascade on User deletion
    await prisma.reconocimiento.deleteMany({ where: { OR: [{ otorgadoPorId: id }, { recibidoPorId: id }] } });

    await prisma.user.delete({ where: { id: id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: (error as Error).message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { usuario, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { usuario } });
    if (!user) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const { password: _, ...userWithoutPassword } = user;

    // 🔑 Generar token JWT
    const token = jwt.sign(
      { id: user.id, rolId: user.rolId },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '1h' }
    );

    return res.json({
      message: 'Login exitoso',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};