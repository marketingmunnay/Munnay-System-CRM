// Servicio para obtener el tipo de cambio
export interface TipoCambio {
  fecha: string;
  compra: number | null;
  venta: number | null;
  disponible: boolean;
  mensaje?: string;
}

// Cache del tipo de cambio
let tipoCambioCache: { data: TipoCambio | null; timestamp: number } = {
  data: null,
  timestamp: 0,
};

const CACHE_DURATION = 1000 * 60 * 30; // 30 minutos

export const getTipoCambioSunat = async (): Promise<TipoCambio> => {
  // Verificar si hay cache válido
  const now = Date.now();
  if (tipoCambioCache.data && (now - tipoCambioCache.timestamp) < CACHE_DURATION) {
    return tipoCambioCache.data;
  }

  try {
    // Intentar obtener del backend
    const response = await fetch('/api/tipo-cambio');
    if (response.ok) {
      const data = await response.json();
      tipoCambioCache = { data, timestamp: now };
      return data;
    }
  } catch (error) {
    console.warn('Error obteniendo tipo de cambio:', error);
  }

  // Si falla, retornar no disponible
  const noDisponible: TipoCambio = {
    fecha: new Date().toISOString().split('T')[0],
    compra: null,
    venta: null,
    disponible: false,
    mensaje: 'No se pudo calcular el tipo de cambio',
  };
  
  tipoCambioCache = { data: noDisponible, timestamp: now };
  return noDisponible;
};

// Función para convertir dólares a soles
export const convertirDolaresASoles = (dolares: number, tipoCambio: number): number => {
  return dolares * tipoCambio;
};

// Función para convertir soles a dólares
export const convertirSolesADolares = (soles: number, tipoCambio: number): number => {
  return soles / tipoCambio;
};
