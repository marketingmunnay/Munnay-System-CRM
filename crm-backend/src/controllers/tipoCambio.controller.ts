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
    let tipoCambio = {
      fecha,
      compra: 3.75,
      venta: 3.78,
    };

    // Intentar múltiples fuentes en orden de preferencia
    
    // 1. Intentar con exchangerate-api.com (gratuita, precisa, actualizada cada 24h)
    try {
      const response1 = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      if (response1.ok) {
        const data = await response1.json();
        if (data.rates && data.rates.PEN) {
          const rate = data.rates.PEN;
          tipoCambio = {
            fecha,
            compra: parseFloat((rate - 0.02).toFixed(3)), // Aproximar compra ligeramente menor
            venta: parseFloat(rate.toFixed(3)),
          };
          console.log('Tipo de cambio obtenido de exchangerate-api.com:', tipoCambio);
          tipoCambioCache = { data: tipoCambio, timestamp: now };
          return res.status(200).json(tipoCambio);
        }
      }
    } catch (error) {
      console.warn('exchangerate-api.com no disponible, intentando siguiente fuente...');
    }

    // 2. Intentar con API de SUNAT (puede ser inestable)
    try {
      const mes = String(new Date().getMonth() + 1).padStart(2, '0');
      const anho = new Date().getFullYear();
      const response2 = await fetch(
        `https://e-consulta.sunat.gob.pe/cl-at-ittipcam/tcS01Alias?mes=${mes}&anho=${anho}`,
        { headers: { 'Accept': 'application/json' } }
      );
      
      if (response2.ok) {
        const data = await response2.json();
        if (Array.isArray(data) && data.length > 0) {
          const latest = data[data.length - 1];
          tipoCambio = {
            fecha: latest.fecha || fecha,
            compra: parseFloat(latest.compra) || 3.75,
            venta: parseFloat(latest.venta) || 3.78,
          };
          console.log('Tipo de cambio obtenido de SUNAT:', tipoCambio);
          tipoCambioCache = { data: tipoCambio, timestamp: now };
          return res.status(200).json(tipoCambio);
        }
      }
    } catch (error) {
      console.warn('SUNAT no disponible, intentando siguiente fuente...');
    }

    // 3. Intentar con fixer.io como backup (alternativa)
    try {
      const response3 = await fetch('https://api.fixer.io/latest?base=USD&symbols=PEN');
      if (response3.ok) {
        const data = await response3.json();
        if (data.rates && data.rates.PEN) {
          const rate = data.rates.PEN;
          tipoCambio = {
            fecha,
            compra: parseFloat((rate - 0.02).toFixed(3)),
            venta: parseFloat(rate.toFixed(3)),
          };
          console.log('Tipo de cambio obtenido de fixer.io:', tipoCambio);
          tipoCambioCache = { data: tipoCambio, timestamp: now };
          return res.status(200).json(tipoCambio);
        }
      }
    } catch (error) {
      console.warn('fixer.io no disponible');
    }

    // 4. Si todo falla, usar valor por defecto actualizado manualmente
    console.warn('Todas las APIs fallaron, usando tipo de cambio por defecto');
    tipoCambio = {
      fecha,
      compra: 3.75,
      venta: 3.78,
    };

    tipoCambioCache = { data: tipoCambio, timestamp: now };
    res.status(200).json(tipoCambio);
    
  } catch (error) {
    console.error('Error general obteniendo tipo de cambio:', error);
    
    const fallback = {
      fecha: new Date().toISOString().split('T')[0],
      compra: 3.75,
      venta: 3.78,
    };
    
    res.status(200).json(fallback);
  }
};
