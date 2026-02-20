import { Request, Response, NextFunction } from "express";

type Role =
  | "Recepcionista"
  | "Médico"
  | "Contabilidad"
  | "Admin"
  | "Profesional"
  | "Procedimientos"
  | "Call Center";

export function requireRole(...allowed: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = (req as any).user?.role as Role | undefined;
    if (!role) return res.status(401).json({ message: "No autenticado" });

    if (!allowed.includes(role)) {
      return res.status(403).json({ message: "Acceso restringido" });
    }
    next();
  };
}
