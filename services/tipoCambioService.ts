// Servicio para obtener el tipo de cambio de SUNAT
export interface TipoCambio {
  fecha: string;
  compra: number;
  venta: number;
}

// Cache del tipo de cambio
let tipoCambioCache: { data: TipoCambio | null; timestamp: number } = {
  data: null,
  timestamp: 0,
};

const CACHE_DURATION = 1000 * 60 * 60; // 1 hora

export const getTipoCambioSunat = async (): Promise<TipoCambio> => {
  // Verificar si hay cache válido
  const now = Date.now();
  if (tipoCambioCache.data && (now - tipoCambioCache.timestamp) < CACHE_DURATION) {
    return tipoCambioCache.data;
  }

  try {
    // Intentar obtener del backend (que hará la consulta a SUNAT)
    const response = await fetch('/api/tipo-cambio');
    if (response.ok) {
      const data = await response.json();
      tipoCambioCache = { data, timestamp: now };
      return data;
    }
  } catch (error) {
    console.warn('Error obteniendo tipo de cambio de SUNAT:', error);
  }

  // Fallback: retornar tipo de cambio aproximado
  const fallbackTC: TipoCambio = {
    fecha: new Date().toISOString().split('T')[0],
    compra: 3.75,
    venta: 3.78,
  };
  
  tipoCambioCache = { data: fallbackTC, timestamp: now };
  return fallbackTC;
};

// Función para convertir dólares a soles
export const convertirDolaresASoles = (dolares: number, tipoCambio: number): number => {
  return dolares * tipoCambio;
};

// Función para convertir soles a dólares
export const convertirSolesADolares = (soles: number, tipoCambio: number): number => {
  return soles / tipoCambio;
};
