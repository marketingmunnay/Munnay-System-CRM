const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = DAY * 30;
const YEAR = DAY * 365;

// Configuración de zona horaria para Perú
const PERU_TIMEZONE = 'America/Lima';

export function formatDistanceToNow(date: Date): string {
  const seconds = Math.round((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 30) return "justo ahora";
  if (seconds < MINUTE) return `hace ${seconds} segundos`;
  if (seconds < HOUR) return `hace ${Math.floor(seconds / MINUTE)} minutos`;
  if (seconds < DAY) return `hace ${Math.floor(seconds / HOUR)} horas`;
  if (seconds < WEEK) return `hace ${Math.floor(seconds / DAY)} días`;
  if (seconds < MONTH) return `hace ${Math.floor(seconds / MONTH)} meses`;
  return `hace ${Math.floor(seconds / YEAR)} años`;
}

// Función para parsear fechas de manera segura con zona horaria de Perú
export function parseDate(dateStr: string | Date | null | undefined, isDateOnly = false): Date | null {
  if (!dateStr) return null;
  
  try {
    // Si ya es una Date, devolverla
    if (dateStr instanceof Date) {
      return isNaN(dateStr.getTime()) ? null : dateStr;
    }
    
    // Si es string, intentar parsear
    let parsedDate: Date;
    
    // Si el string ya tiene formato ISO completo
    if (dateStr.includes('T')) {
      parsedDate = new Date(dateStr);
    } 
    // Si es solo fecha (YYYY-MM-DD) y queremos solo fecha
    else if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/) && isDateOnly) {
      // Para fechas sin hora, usar mediodía en zona horaria de Perú para evitar problemas de timezone
      parsedDate = new Date(dateStr + 'T12:00:00');
    }
    // Si es solo fecha pero queremos mantener la hora actual
    else if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      parsedDate = new Date(dateStr + 'T00:00:00');
    }
    // Si es otro formato, intentar parsear directamente
    else {
      parsedDate = new Date(dateStr);
    }
    
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  } catch {
    return null;
  }
}

// Función para formatear fecha como YYYY-MM-DD para formularios
export function formatDateForInput(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  // Si es string y ya tiene el formato YYYY-MM-DD, devolverlo directamente
  if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return date;
  }
  
  // Si es string ISO completo, extraer solo la fecha
  if (typeof date === 'string' && date.includes('T')) {
    return date.split('T')[0];
  }
  
  const parsedDate = parseDate(date, true); // true = isDateOnly
  if (!parsedDate) return '';
  
  // Extraer directamente año, mes y día de la fecha parseada
  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const day = String(parsedDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// Función para formatear fecha para mostrar en tablas (DD/MM/YYYY)
export function formatDateForDisplay(date: string | Date | null | undefined): string {
  const parsedDate = parseDate(date);
  if (!parsedDate) return '-';
  
  return parsedDate.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    timeZone: PERU_TIMEZONE
  });
}

// Función para formatear fecha y hora para mostrar en tablas
export function formatDateTimeForDisplay(date: string | Date | null | undefined): string {
  const parsedDate = parseDate(date);
  if (!parsedDate) return '-';
  
  return parsedDate.toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: PERU_TIMEZONE
  });
}

// Función para formatear fecha con nombre del mes
export function formatDateWithMonthName(date: string | Date | null | undefined): string {
  const parsedDate = parseDate(date);
  if (!parsedDate) return '-';
  
  return parsedDate.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: PERU_TIMEZONE
  });
}

// Función para formatear fecha en formato ISO con zona horaria de Perú
export function formatDateTimeISO(date: string | Date | null | undefined): string {
  const parsedDate = parseDate(date);
  if (!parsedDate) return '';
  
  // Convertir a zona horaria de Perú y formatear como ISO
  const peruDate = new Date(parsedDate.toLocaleString("en-US", {timeZone: PERU_TIMEZONE}));
  return peruDate.toISOString();
}

// Función para crear una fecha en zona horaria de Perú
export function createPeruDate(dateStr?: string): Date {
  const now = new Date();
  if (!dateStr) {
    // Crear fecha actual en zona horaria de Perú
    return new Date(now.toLocaleString("en-US", {timeZone: PERU_TIMEZONE}));
  }
  
  const parsedDate = parseDate(dateStr);
  if (!parsedDate) return now;
  
  return new Date(parsedDate.toLocaleString("en-US", {timeZone: PERU_TIMEZONE}));
}