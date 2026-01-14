
import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const { range, module, search } = req.query;

    let startDate = new Date();
    // Default to 'semana' if not provided
    const rangeValue = (range as string) || 'semana';

    if (rangeValue === 'hoy') {
      startDate.setHours(0, 0, 0, 0);
    } else if (rangeValue === 'semana') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (rangeValue === 'mes') {
      startDate.setMonth(startDate.getMonth() - 1);
    }

    const where: any = {
      fecha: {
        gte: startDate,
      },
    };

    if (module && module !== 'todos') {
      where.modulo = module as string;
    }

    if (search) {
      where.OR = [
        { usuario: { contains: search as string, mode: 'insensitive' } },
        { detalles: { contains: search as string, mode: 'insensitive' } },
        { modulo: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: {
        fecha: 'desc',
      },
      take: 100, // Limit logs to prevent massive payloads
    });

    res.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Error recuperando logs de auditoría' });
  }
};

export const createAuditLog = async (data: {
  usuarioId: number;
  usuario: string; // Denormalized name
  accion: string;
  modulo: string;
  detalles: string;
  metadata?: any;
  ip?: string;
  userAgent?: string;
}) => {
  try {
    await prisma.auditLog.create({
      data: {
        ...data,
      },
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw, we don't want to block main actions if logging fails
  }
};
