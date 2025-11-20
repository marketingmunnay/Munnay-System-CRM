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

// Función para parsear fechas de manera segura y coherente en UTC
export function parseDate(dateStr: string | Date | null | undefined, isDateOnly = false): Date | null {
  if (!dateStr) return null;

  try {
    if (dateStr instanceof Date) {
      return isNaN(dateStr.getTime()) ? null : dateStr;
    }

    // Si es string ISO completo con zona, Date lo parsea correctamente
    if (typeof dateStr === 'string' && dateStr.includes('T')) {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? null : d;
    }

    // Si es solo fecha YYYY-MM-DD asumimos UTC midnight
    if (typeof dateStr === 'string' && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const d = new Date(dateStr + 'T00:00:00Z');
      return isNaN(d.getTime()) ? null : d;
    }

    // Intentar parseo general
    const d = new Date(String(dateStr));
    return isNaN(d.getTime()) ? null : d;
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
  // Usar la representación UTC ISO para ser consistente
  return parsedDate.toISOString().split('T')[0];
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
  // Devolver siempre ISO 8610 en UTC
  return parsedDate.toISOString();
}

// Función para formatear hora para inputs de tipo time (HH:MM)
export function formatTimeForInput(time: string | Date | null | undefined): string {
  if (!time) return '';
  
  // Si ya tiene el formato HH:MM, devolverlo directamente
  if (typeof time === 'string' && /^\d{2}:\d{2}$/.test(time)) {
    return time;
  }
  
  // Si es string ISO completo, extraer solo la hora
  if (typeof time === 'string' && time.includes('T')) {
    const timePart = time.split('T')[1];
    if (timePart) {
      return timePart.split('.')[0].substring(0, 5); // HH:MM
    }
  }
  
  const parsedDate = parseDate(time);
  if (!parsedDate) return '';
  
  // Extraer hora y minutos
  const hours = String(parsedDate.getHours()).padStart(2, '0');
  const minutes = String(parsedDate.getMinutes()).padStart(2, '0');
  
  return `${hours}:${minutes}`;
}