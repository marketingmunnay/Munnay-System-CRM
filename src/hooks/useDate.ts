import { useCallback } from 'react';
import { addDays, parseISO, isValid } from 'date-fns';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';
import { es } from 'date-fns/locale';
import { useDateConfig } from '../context/DateConfigContext';

// Hook centralizado de fechas para frontend (Fase 1)

export const useDate = () => {
  const { timezone, dateFormat, timeFormat } = useDateConfig();

  const parse = useCallback((value: string | Date | null | undefined): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return isValid(value) ? value : null;

    const raw = String(value).trim();
    if (!raw || raw === 'undefined' || raw === 'null') return null;

    // Si viene como YYYY-MM-DD, interpretarlo como fecha local del negocio (al mediodía)
    // para evitar el bug de cambio de día por zona horaria.
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      try {
        const utcDate = fromZonedTime(`${raw} 12:00:00`, timezone);
        return isValid(utcDate) ? utcDate : null;
      } catch {
        return null;
      }
    }

    try {
      const d = parseISO(raw);
      return isValid(d) ? d : null;
    } catch {
      return null;
    }
  }, [timezone]);

  const formatDateTime = useCallback((value: string | Date | null | undefined): string => {
    const date = parse(value);
    if (!date) return '-';
    const timePattern = timeFormat === '12h' ? "hh:mm a" : 'HH:mm';
    return formatInTimeZone(date, timezone, `${dateFormat} ${timePattern}`, { locale: es });
  }, [parse, timezone, dateFormat, timeFormat]);

  const formatDateOnly = useCallback((value: string | Date | null | undefined): string => {
    const date = parse(value);
    if (!date) return '-';
    return formatInTimeZone(date, timezone, dateFormat, { locale: es });
  }, [parse, timezone, dateFormat]);

  const formatTimeOnly = useCallback((value: string | Date | null | undefined): string => {
    const date = parse(value);
    if (!date) return '-';
    const timePattern = timeFormat === '12h' ? "hh:mm a" : 'HH:mm';
    return formatInTimeZone(date, timezone, timePattern, { locale: es });
  }, [parse, timezone, timeFormat]);

  // Devuelve clave YYYY-MM-DD en zona del negocio (útil para filtros por día)
  const toDateKey = useCallback((value: string | Date | null | undefined): string => {
    const date = parse(value);
    if (!date) return '';
    return formatInTimeZone(date, timezone, 'yyyy-MM-dd');
  }, [parse, timezone]);

  // "Hoy" calculado explícitamente en la zona del negocio
  const todayKey = useCallback((): string => {
    return formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd');
  }, [timezone]);

  // Suma/resta días sobre una clave YYYY-MM-DD (en zona del negocio)
  const addDaysToDateKey = useCallback((baseDateKey: string, days: number): string => {
    const raw = String(baseDateKey || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return '';
    try {
      const baseUtc = fromZonedTime(`${raw} 12:00:00`, timezone);
      const shifted = addDays(baseUtc, days);
      return formatInTimeZone(shifted, timezone, 'yyyy-MM-dd');
    } catch {
      return '';
    }
  }, [timezone]);

  // Rango UTC (start/end) que corresponde a un día completo en zona del negocio
  const getLocalDayRangeUTC = useCallback((dateKey: string): { start: Date; endExclusive: Date } | null => {
    const raw = String(dateKey || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
    try {
      const start = fromZonedTime(`${raw} 00:00:00`, timezone);
      const nextDayKey = addDaysToDateKey(raw, 1);
      if (!nextDayKey) return null;
      const endExclusive = fromZonedTime(`${nextDayKey} 00:00:00`, timezone);
      return { start, endExclusive };
    } catch {
      return null;
    }
  }, [timezone, addDaysToDateKey]);

  const toInputDateTimeLocal = useCallback((value: string | Date | null | undefined): string => {
    const date = parse(value);
    if (!date) return '';
    return formatInTimeZone(date, timezone, "yyyy-MM-dd'T'HH:mm");
  }, [parse, timezone]);

  const fromInputDateTimeLocalToUTC = useCallback((inputValue: string | null | undefined): string | null => {
    if (!inputValue) return null;
    try {
      const utcDate = fromZonedTime(inputValue, timezone);
      return utcDate.toISOString();
    } catch {
      return null;
    }
  }, [timezone]);

  return {
    timezone,
    formatDateTime,
    formatDateOnly,
    formatTimeOnly,
    toInputDateTimeLocal,
    fromInputDateTimeLocalToUTC,
    toDateKey,
    todayKey,
    addDaysToDateKey,
    getLocalDayRangeUTC,
    parse,
  };
};
