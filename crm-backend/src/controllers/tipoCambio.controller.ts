import { Request, Response } from 'express';

// Cache simple del tipo de cambio
let tipoCambioCache: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hora

export const getTipoCambio = async (req: Request, res: Response) => {
  try {
    // Verificar cache
    const now = Date.now();
    if (tipoCambioCache && (now - tipoCambioCache.timestamp) < CACHE_DURATION) {
      return res.status(200).json(tipoCambioCache.data);
    }

    // Obtener fecha actual en formato requerido
    const today = new Date();
    const fecha = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const mes = String(today.getMonth() + 1).padStart(2, '0');
    const anho = today.getFullYear();

    // Consultar API de SUNAT usando fetch
    const url = `https://e-consulta.sunat.gob.pe/cl-at-ittipcam/tcS01Alias?mes=${mes}&anho=${anho}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    // Tipo de cambio por defecto
    let tipoCambio = {
      fecha,
      compra: 3.75,
      venta: 3.78,
    };

    if (response.ok) {
      try {
        const data = await response.json();
        
        // Si es un array, tomar el último elemento (más reciente)
        if (Array.isArray(data) && data.length > 0) {
          const latest = data[data.length - 1];
          tipoCambio = {
            fecha: latest.fecha || fecha,
            compra: parseFloat(latest.compra) || 3.75,
            venta: parseFloat(latest.venta) || 3.78,
          };
        } else if (data.compra && data.venta) {
          tipoCambio = {
            fecha: data.fecha || fecha,
            compra: parseFloat(data.compra),
            venta: parseFloat(data.venta),
          };
        }
      } catch (parseError) {
        console.warn('Error parseando respuesta de SUNAT, usando valores por defecto');
      }
    }

    // Actualizar cache
    tipoCambioCache = { data: tipoCambio, timestamp: now };

    res.status(200).json(tipoCambio);
  } catch (error) {
    console.error('Error obteniendo tipo de cambio de SUNAT:', error);
    
    // Retornar tipo de cambio aproximado en caso de error
    const fallback = {
      fecha: new Date().toISOString().split('T')[0],
      compra: 3.75,
      venta: 3.78,
    };
    
    res.status(200).json(fallback);
  }
};
