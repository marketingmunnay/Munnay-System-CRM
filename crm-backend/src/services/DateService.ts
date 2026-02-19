import { addDays, format, parseISO, isValid } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

// Punto único de verdad para manejo de fechas en backend
// Fase 1: solo normalizamos y centralizamos, sin cambiar aún DB a TIMESTAMPTZ

const DEFAULT_TIMEZONE = 'America/Lima';

export class DateService {
  /**
   * Fecha/hora actual en UTC (instante absoluto)
   */
  static nowUTC(): Date {
    return new Date();
  }

  /**
   * Parsea un string ISO (generalmente desde el frontend) a Date.
   * Devuelve null si es inválida.
   */
  static parseFromFrontend(value: string | null | undefined): Date | null {
    if (!value) return null;
    try {
      const d = parseISO(value);
      return isValid(d) ? d : null;
    } catch {
      return null;
    }
  }

  /**
   * Convierte un par fecha/hora entendidos en la zona horaria del negocio
   * (ej: "2026-02-18" + "10:30") a un Date UTC para guardar en DB.
   */
  static fromZonedDateTime(
    dateStr: string,
    timeStr: string,
    timeZone: string = DEFAULT_TIMEZONE
  ): Date {
    const dateTimeStr = `${dateStr} ${timeStr}`; // "YYYY-MM-DD HH:mm"
    return fromZonedTime(dateTimeStr, timeZone);
  }

  /**
   * Calcula el rango UTC (start/end) que corresponde a un día completo
   * en la zona horaria del negocio. Útil para reportes por fecha local.
   */
  static getLocalDayRangeUTC(
    dateStr: string, // YYYY-MM-DD en zona local
    timeZone: string = DEFAULT_TIMEZONE
  ): { start: Date; endExclusive: Date } {
    const start = fromZonedTime(`${dateStr} 00:00:00`, timeZone);

    // Rango semi-abierto: [start, nextDayStart)
    const nextDayStr = format(addDays(parseISO(dateStr), 1), 'yyyy-MM-dd');
    const endExclusive = fromZonedTime(`${nextDayStr} 00:00:00`, timeZone);
    return { start, endExclusive };
  }

  /**
   * Convierte un Date UTC a Date en la zona horaria de negocio.
   * Normalmente esto lo hará el frontend, pero lo dejamos disponible.
   */
  static toBusinessZoned(date: Date, timeZone: string = DEFAULT_TIMEZONE): Date {
    return toZonedTime(date, timeZone);
  }
}
