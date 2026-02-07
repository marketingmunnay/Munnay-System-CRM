import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const ADMIN_ROLE_NAME = 'Administrador';

export interface AuthenticatedUserContext {
  id: number;
  rolId: number;
  rolNombre?: string | null;
}

export interface AuthenticatedRequest extends Request {
  authUser?: AuthenticatedUserContext;
}

const extractBearerToken = (req: Request): string | null => {
  const header = req.headers.authorization;
  if (!header) return null;
  const value = Array.isArray(header) ? header[0] : header;
  if (typeof value !== 'string') return null;
  if (!value.toLowerCase().startsWith('bearer ')) return null;
  const token = value.slice(7).trim();
  return token.length > 0 ? token : null;
};

const isAdminUser = (user?: AuthenticatedUserContext | null): boolean => {
  if (!user) return false;
  if (user.rolNombre && user.rolNombre.toLowerCase() === ADMIN_ROLE_NAME.toLowerCase()) {
    return true;
  }
  return user.rolId === 1; // Fallback mientras se parametriza el rol administrador
};

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      return res.status(401).json({ message: 'Token de autenticación requerido' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret_key') as { id: number; rolId?: number };

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        rolId: true,
        rol: { select: { nombre: true } },
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    req.authUser = {
      id: user.id,
      rolId: user.rolId,
      rolNombre: user.rol?.nombre ?? null,
    };

    next();
  } catch (error) {
    console.error('Autenticación fallida:', error);
    return res.status(401).json({ message: 'Token inválido' });
  }
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.authUser) {
    return res.status(401).json({ message: 'Autenticación requerida' });
  }

  if (!isAdminUser(req.authUser)) {
    return res.status(403).json({ message: 'Acceso restringido a administradores' });
  }

  next();
};

export const requireSelfOrAdmin = (paramKey = 'id') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.authUser) {
      return res.status(401).json({ message: 'Autenticación requerida' });
    }

    const rawValue = req.params[paramKey] ?? req.body[paramKey];
    const targetId = parseInt(rawValue, 10);

    if (Number.isNaN(targetId)) {
      return res.status(400).json({ message: `El parámetro ${paramKey} es inválido` });
    }

    if (req.authUser.id === targetId || isAdminUser(req.authUser)) {
      return next();
    }

    return res.status(403).json({ message: 'Solo puedes operar sobre tu propio perfil' });
  };
};

export const isAdmin = (user?: AuthenticatedUserContext | null): boolean => isAdminUser(user);
