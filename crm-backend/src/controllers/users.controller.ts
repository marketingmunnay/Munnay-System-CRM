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
        email: true,
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
  // Exclude id, password, addresses, emergencyContacts, createdAt, updatedAt, reconocimientosRecibidos
  const { id: _, password, addresses, emergencyContacts, createdAt, updatedAt, reconocimientosRecibidos, ...userData } = req.body;
  
  console.log('=== UPDATE USER REQUEST ===');
  console.log('User ID:', id);
  console.log('Body recibido:', JSON.stringify(req.body, null, 2));
  
  try {
    // Helper function to clean numeric fields
    const parseNumericField = (value: any) => {
      if (value === undefined || value === null || value === '') return undefined;
      const parsed = parseFloat(value);
      return isNaN(parsed) ? undefined : parsed;
    };
    
    // Helper function to clean date fields
    const parseDateField = (value: any) => {
      if (!value) return undefined;
      try {
        return new Date(value);
      } catch {
        return undefined;
      }
    };
    
    let updateData: any = {
        ...userData,
        rolId: userData.rolId ? parseInt(userData.rolId) : undefined, // Ensure rolId is integer
        birthDate: parseDateField(userData.birthDate),
        startDate: parseDateField(userData.startDate),
        endDate: parseDateField(userData.endDate),
        salary: parseNumericField(userData.salary),
        bonuses: parseNumericField(userData.bonuses),
        afpPercentage: parseNumericField(userData.afpPercentage),
    };
    
    // Remove undefined, null, and empty string values to avoid Prisma errors
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined || updateData[key] === null || updateData[key] === '') {
        delete updateData[key];
      }
    });
    
    // Only update password if provided
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    console.log('Update data procesado:', JSON.stringify(updateData, null, 2));

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

    console.log('Ejecutando prisma.user.update...');
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: updateData,
      include: { // Include to return the updated relations
        addresses: true,
        emergencyContacts: true,
        reconocimientosRecibidos: true,
      } as any
    });
    console.log('Usuario actualizado exitosamente:', updatedUser.id);
    const { password: _, ...userWithoutPassword } = updatedUser as any;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    console.error('Error stack:', (error as Error).stack);
    console.error('Error message:', (error as Error).message);
    
    // Detalles específicos para debugging
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('Prisma error code:', (error as any).code);
      console.error('Prisma error meta:', (error as any).meta);
    }
    
    res.status(500).json({ 
      message: 'Error updating user', 
      error: (error as Error).message,
      details: error instanceof Error ? error.stack : 'Unknown error'
    });
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