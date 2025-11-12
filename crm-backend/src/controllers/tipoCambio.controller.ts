import { Request, Response } from 'express';

// Cache simple del tipo de cambio
let tipoCambioCache: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutos

export const getTipoCambio = async (req: Request, res: Response) => {
  try {
    // Verificar cache
    const now = Date.now();
    if (tipoCambioCache && (now - tipoCambioCache.timestamp) < CACHE_DURATION) {
      return res.status(200).json(tipoCambioCache.data);
    }

    const fecha = new Date().toISOString().split('T')[0];

    // Intentar múltiples fuentes en orden de preferencia
    
    // 1. Intentar con exchangerate-api.com (gratuita, precisa, actualizada cada 24h)
    try {
      const response1 = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
        signal: AbortSignal.timeout(5000) // 5 segundos timeout
      });
      
      if (response1.ok) {
        const data = await response1.json();
        if (data.rates && data.rates.PEN) {
          const rate = data.rates.PEN;
          const tipoCambio = {
            fecha,
            compra: parseFloat((rate - 0.02).toFixed(3)), // Aproximar compra ligeramente menor
            venta: parseFloat(rate.toFixed(3)),
            disponible: true,
          };
          console.log('Tipo de cambio obtenido de exchangerate-api.com:', tipoCambio);
          tipoCambioCache = { data: tipoCambio, timestamp: now };
          return res.status(200).json(tipoCambio);
        }
      }
    } catch (error) {
      console.warn('exchangerate-api.com no disponible, intentando siguiente fuente...');
    }

    // 2. Intentar con fixer.io como backup (alternativa)
    try {
      const response2 = await fetch('https://api.fixer.io/latest?base=USD&symbols=PEN', {
        signal: AbortSignal.timeout(5000) // 5 segundos timeout
      });
      
      if (response2.ok) {
        const data = await response2.json();
        if (data.rates && data.rates.PEN) {
          const rate = data.rates.PEN;
          const tipoCambio = {
            fecha,
            compra: parseFloat((rate - 0.02).toFixed(3)),
            venta: parseFloat(rate.toFixed(3)),
            disponible: true,
          };
          console.log('Tipo de cambio obtenido de fixer.io:', tipoCambio);
          tipoCambioCache = { data: tipoCambio, timestamp: now };
          return res.status(200).json(tipoCambio);
        }
      }
    } catch (error) {
      console.warn('fixer.io no disponible');
    }

    // Si todas las APIs fallan, retornar que no está disponible
    console.error('No se pudo obtener el tipo de cambio de ninguna fuente');
    const noDisponible = {
      fecha,
      compra: null,
      venta: null,
      disponible: false,
      mensaje: 'No se pudo calcular el tipo de cambio',
    };
    
    res.status(200).json(noDisponible);
    
  } catch (error) {
    console.error('Error general obteniendo tipo de cambio:', error);
    
    const errorResponse = {
      fecha: new Date().toISOString().split('T')[0],
      compra: null,
      venta: null,
      disponible: false,
      mensaje: 'No se pudo calcular el tipo de cambio',
    };
    
    res.status(200).json(errorResponse);
  }
};
