import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Configuración de Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');
const MODEL_NAME = "gemini-2.0-flash";

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

    // Verificar que la API key esté configurada
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.error('API de Gemini no configurada');
      const noDisponible = {
        fecha,
        compra: null,
        venta: null,
        disponible: false,
        mensaje: 'API de Gemini no configurada',
      };
      return res.status(200).json(noDisponible);
    }

    // Consultar a Gemini AI el tipo de cambio actual
    try {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
      
      const prompt = `What is the current exchange rate from US Dollar (USD) to Peruvian Sol (PEN)? 
      Please provide ONLY the numeric values in this exact format:
      Compra: [buy rate number]
      Venta: [sell rate number]
      
      Example format:
      Compra: 3.75
      Venta: 3.77
      
      Provide only these two lines with numeric values, no additional text or explanation.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('Gemini AI response for tipo de cambio:', text);

      // Parsear la respuesta de Gemini
      const compraMatch = text.match(/Compra:\s*(\d+\.?\d*)/i);
      const ventaMatch = text.match(/Venta:\s*(\d+\.?\d*)/i);

      if (compraMatch && ventaMatch) {
        const compra = parseFloat(compraMatch[1]);
        const venta = parseFloat(ventaMatch[1]);

        if (!isNaN(compra) && !isNaN(venta) && compra > 0 && venta > 0) {
          const tipoCambio = {
            fecha,
            compra: parseFloat(compra.toFixed(4)),
            venta: parseFloat(venta.toFixed(4)),
            disponible: true,
          };
          console.log('Tipo de cambio obtenido de Gemini AI:', tipoCambio);
          tipoCambioCache = { data: tipoCambio, timestamp: now };
          return res.status(200).json(tipoCambio);
        }
      }

      // Si no se pudo parsear correctamente
      console.error('No se pudo parsear la respuesta de Gemini:', text);
      const noDisponible = {
        fecha,
        compra: null,
        venta: null,
        disponible: false,
        mensaje: 'No se pudo obtener el tipo de cambio',
      };
      return res.status(200).json(noDisponible);

    } catch (error) {
      console.error('Error consultando a Gemini AI:', error);
      const errorResponse = {
        fecha,
        compra: null,
        venta: null,
        disponible: false,
        mensaje: 'No se pudo calcular el tipo de cambio',
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
      mensaje: 'No se pudo calcular el tipo de cambio',
    };
    
    res.status(200).json(errorResponse);
  }
};
