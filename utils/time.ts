const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = DAY * 30;
const YEAR = DAY * 365;

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

// Función para parsear fechas de manera segura
export function parseDate(dateStr: string | Date | null | undefined): Date | null {
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
    // Si es solo fecha (YYYY-MM-DD)
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

// Función para formatear fecha como YYYY-MM-DD
export function formatDateForInput(date: string | Date | null | undefined): string {
  const parsedDate = parseDate(date);
  if (!parsedDate) return '';
  
  return parsedDate.toISOString().split('T')[0];
}

// Función para formatear fecha para mostrar en tablas (DD/MM/YYYY)
export function formatDateForDisplay(date: string | Date | null | undefined): string {
  const parsedDate = parseDate(date);
  if (!parsedDate) return '-';
  
  return parsedDate.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric'
  });
}

// Función para formatear fecha y hora para mostrar en tablas
export function formatDateTimeForDisplay(date: string | Date | null | undefined): string {
  const parsedDate = parseDate(date);
  if (!parsedDate) return '-';
  
  return parsedDate.toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

// Función para formatear fecha con nombre del mes
export function formatDateWithMonthName(date: string | Date | null | undefined): string {
  const parsedDate = parseDate(date);
  if (!parsedDate) return '-';
  
  return parsedDate.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}