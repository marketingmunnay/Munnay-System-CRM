import { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth';
import { normalizeRoleName } from '../middleware/auth';

type Role =
  | "Recepcionista"
  | "Médico"
  | "Contabilidad"
  | "Admin"
  | "Administrador"
  | "Profesional"
  | "Procedimientos"
  | "Call Center";

export function requireRole(...allowed: Role[]) {
  const allowedNormalized = allowed.map(role => normalizeRoleName(role));
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest & { user?: { role?: Role } };
    const roleFromAuth = authReq.authUser?.rolNombre;
    const legacyRole = authReq.user?.role;
    const normalizedRole = normalizeRoleName(roleFromAuth ?? legacyRole);

    if (!normalizedRole) {
      return res.status(401).json({ message: 'Autenticación requerida' });
    }

    if (!allowedNormalized.includes(normalizedRole)) {
      return res.status(403).json({ message: 'Acceso restringido' });
    }

    next();
  };
}
