import { Request, Response } from 'express';

// Cache simple del tipo de cambio (actualizado cada 4 horas)
let tipoCambioCache: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 1000 * 60 * 60 * 4; // 4 horas

export const getTipoCambio = async (req: Request, res: Response) => {
  try {
    // Verificar cache
    const now = Date.now();
    if (tipoCambioCache && (now - tipoCambioCache.timestamp) < CACHE_DURATION) {
      console.log('Returning cached tipo de cambio');
      return res.status(200).json(tipoCambioCache.data);
    }

    const fecha = new Date().toISOString().split('T')[0];

    // Usar exchangerate-api.com (gratuito, sin API key, actualizado diariamente)
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      
      if (!response.ok) {
        throw new Error(`Exchange rate API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.result === 'success' && data.rates && data.rates.PEN) {
        const rateBase = data.rates.PEN;
        
        // Calcular spread típico bancario (0.3% aproximado)
        const spread = rateBase * 0.003;
        const compra = rateBase - spread; // Tipo de cambio de compra (banco compra dólares)
        const venta = rateBase + spread;  // Tipo de cambio de venta (banco vende dólares)

        const tipoCambio = {
          fecha,
          compra: parseFloat(compra.toFixed(4)),
          venta: parseFloat(venta.toFixed(4)),
          disponible: true,
          fuente: 'exchangerate-api.com',
          actualizadoEn: data.time_last_update_utc || fecha,
        };

        console.log('Tipo de cambio USD-PEN obtenido:', tipoCambio);
        
        // Guardar en cache
        tipoCambioCache = { data: tipoCambio, timestamp: now };
        
        return res.status(200).json(tipoCambio);
      }

      throw new Error('Invalid response format from exchange rate API');

    } catch (apiError) {
      console.error('Error consultando exchange rate API:', apiError);

      // Fallback: Intentar con una segunda API (fixer.io alternativo)
      try {
        const fallbackResponse = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=PEN');
        const fallbackData = await fallbackResponse.json();

        if (fallbackData.success && fallbackData.rates && fallbackData.rates.PEN) {
          const rateBase = fallbackData.rates.PEN;
          const spread = rateBase * 0.003;
          const compra = rateBase - spread;
          const venta = rateBase + spread;

          const tipoCambio = {
            fecha,
            compra: parseFloat(compra.toFixed(4)),
            venta: parseFloat(venta.toFixed(4)),
            disponible: true,
            fuente: 'exchangerate.host',
            actualizadoEn: fallbackData.date || fecha,
          };

          console.log('Tipo de cambio USD-PEN obtenido (fallback):', tipoCambio);
          tipoCambioCache = { data: tipoCambio, timestamp: now };
          return res.status(200).json(tipoCambio);
        }
      } catch (fallbackError) {
        console.error('Error con fallback API:', fallbackError);
      }

      // Si todo falla, retornar error
      const errorResponse = {
        fecha,
        compra: null,
        venta: null,
        disponible: false,
        mensaje: 'No se pudo obtener el tipo de cambio actual',
      };
      return res.status(200).json(errorResponse);
    }
    
  } catch (error) {
    console.error('Error general obteniendo tipo de cambio:', error);
    
    const errorResponse = {
      fecha: new Date().toISOString().split('T')[0],
      compra: null,
      venta: null,
      disponible: false,
      mensaje: 'Error al consultar tipo de cambio',
    };
    
    res.status(200).json(errorResponse);
  }
};
