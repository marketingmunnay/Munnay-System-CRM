
import { Request, Response } from 'express';
// import prisma from '../lib/prisma';

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    // AuditLog table has been removed. Returning empty array.
    res.json([]);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Error recuperando logs de auditoría' });
  }
};

export const createAuditLog = async (data: {
  usuarioId: number;
  usuario: string; 
  accion: string;
  modulo: string;
  detalles: string;
  metadata?: any;
  ip?: string;
  userAgent?: string;
}) => {
  // No-op
};
