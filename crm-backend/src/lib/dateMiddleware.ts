// Middleware para serializar fechas correctamente
// Este middleware se ejecuta antes de enviar la respuesta al cliente

import { Request, Response, NextFunction } from 'express';

// Función para convertir fechas de un objeto a formato ISO string
function serializeDates(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (obj instanceof Date) {
    return obj.toISOString().split('T')[0]; // Devolver solo la parte de la fecha YYYY-MM-DD
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => serializeDates(item));
  }
  
  if (typeof obj === 'object') {
    const serialized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        serialized[key] = serializeDates(obj[key]);
      }
    }
    return serialized;
  }
  
  return obj;
}

export const dateSerializationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  
  res.json = function(obj: any) {
    const serializedObj = serializeDates(obj);
    return originalJson.call(this, serializedObj);
  };
  
  next();
};