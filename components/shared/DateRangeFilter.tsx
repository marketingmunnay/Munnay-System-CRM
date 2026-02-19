import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon, XCircleIcon } from './Icons.tsx';
import { useDate } from '../../src/hooks/useDate';

interface DateRangeFilterProps {
  onApply: (dates: { from: string; to: string }) => void;
}

type DateKey = string; // YYYY-MM-DD (zona del negocio)

const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const WEEK_DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ onApply }) => {
  const { formatDateOnly, todayKey, addDaysToDateKey } = useDate();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const initialToday = useMemo(() => todayKey(), [todayKey]);

  // Siempre trabajamos con YYYY-MM-DD en zona del negocio
  const [startKey, setStartKey] = useState<DateKey | null>(initialToday);
  const [endKey, setEndKey] = useState<DateKey | null>(initialToday);
  const [hoverKey, setHoverKey] = useState<DateKey | null>(null);

  // Calendarios: control por (año, mes) para evitar dependencia implícita del TZ del navegador
  const initialYear = Number(initialToday.slice(0, 4));
  const initialMonth = Number(initialToday.slice(5, 7)) - 1;
  const [leftYear, setLeftYear] = useState<number>(initialYear);
  const [leftMonth, setLeftMonth] = useState<number>(initialMonth);

  const rightCalendar = useMemo(() => {
    const month = leftMonth + 1;
    const year = leftYear + Math.floor(month / 12);
    return { year, month: ((month % 12) + 12) % 12 };
  }, [leftYear, leftMonth]);

  // Aplicar fecha HOY por defecto al cargar el componente
  useEffect(() => {
    // Aplicar HOY (zona del negocio) al cargar
    onApply({ from: initialToday, to: initialToday });
  }, [initialToday, onApply]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleApply = () => {
    const from = startKey ?? '';
    const to = endKey ?? from;
    onApply({ from, to });
    setIsOpen(false);
  };
  
  const handleClear = () => {
    setStartKey(null);
    setEndKey(null);
    onApply({ from: '', to: '' });
  };


  const handleCancel = () => {
    setIsOpen(false);
  };
  
  const handleDateClick = (dayKey: DateKey) => {
      if (!startKey || (startKey && endKey)) {
          setStartKey(dayKey);
          setEndKey(null);
          return;
      }

      if (startKey && !endKey) {
          if (dayKey < startKey) {
              setEndKey(startKey);
              setStartKey(dayKey);
          } else {
              setEndKey(dayKey);
          }
      }
  };
  
  const setPeriod = (period: string) => {
    const today = todayKey();
    let start = today;
    let end = today;

    const todayYear = Number(today.slice(0, 4));
    const todayMonth = Number(today.slice(5, 7)) - 1;

    const pad2 = (n: number) => String(n).padStart(2, '0');
    const daysInMonth = (year: number, month0: number) => new Date(Date.UTC(year, month0 + 1, 0)).getUTCDate();

    switch (period) {
        case 'hoy':
            break;
        case 'ayer':
            start = addDaysToDateKey(today, -1);
            end = start;
            break;
        case 'ultimos_7_dias':
            start = addDaysToDateKey(today, -6);
            break;
        case 'este_mes':
            start = `${todayYear}-${pad2(todayMonth + 1)}-01`;
            end = `${todayYear}-${pad2(todayMonth + 1)}-${pad2(daysInMonth(todayYear, todayMonth))}`;
            break;
        case 'mes_pasado':
            {
              const prevMonth0 = todayMonth - 1;
              const year = prevMonth0 < 0 ? todayYear - 1 : todayYear;
              const month0 = (prevMonth0 + 12) % 12;
              start = `${year}-${pad2(month0 + 1)}-01`;
              end = `${year}-${pad2(month0 + 1)}-${pad2(daysInMonth(year, month0))}`;
            }
            break;
        default:
            return;
    }

    setStartKey(start);
    setEndKey(end);

    const newYear = Number(start.slice(0, 4));
    const newMonth = Number(start.slice(5, 7)) - 1;
    setLeftYear(newYear);
    setLeftMonth(newMonth);
  };


  const pad2 = (n: number) => String(n).padStart(2, '0');
  const daysInMonth = (year: number, month0: number) => new Date(Date.UTC(year, month0 + 1, 0)).getUTCDate();

  const dayOfWeekIndexMonday0 = (year: number, month0: number, day: number): number => {
    // Usar Z (zona del negocio) implícita del hook: formatDateOnly/keys ya están en TZ negocio.
    // Para no introducir Date con TZ navegador, calculamos el índice de día ISO (1-7) desde UTC (fiable).
    // Esto es suficiente para construir la grilla de un calendario mensual.
    const utc = new Date(Date.UTC(year, month0, day, 12, 0, 0));
    // getUTCDay(): 0=Dom..6=Sáb. Convertir a 0=Lun..6=Dom
    return (utc.getUTCDay() + 6) % 7;
  };

  const generateMonth = (year: number, month0: number) => {
    const dim = daysInMonth(year, month0);
    const startDayOfWeek = dayOfWeekIndexMonday0(year, month0, 1); // 0=Lunes
    const days: (DateKey | null)[] = Array(startDayOfWeek).fill(null);
    for (let i = 1; i <= dim; i++) {
      days.push(`${year}-${pad2(month0 + 1)}-${pad2(i)}`);
    }
    return days;
  };

  const changeMonth = (offset: number) => {
    const raw = leftMonth + offset;
    const year = leftYear + Math.floor(raw / 12);
    const month = ((raw % 12) + 12) % 12;
    setLeftYear(year);
    setLeftMonth(month);
  };

  const years = useMemo(() => {
    const base = Number(initialToday.slice(0, 4));
    return Array.from({ length: 10 }, (_, i) => base - 5 + i);
  }, [initialToday]);

  const renderCalendar = (calendar: { year: number; month: number }) => {
    const monthDays = generateMonth(calendar.year, calendar.month);
    const today = initialToday;
    
    return (
        <div className="w-64">
             <div className="flex justify-between items-center mb-2 px-2">
                <button onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-gray-100"><ChevronLeftIcon className="w-5 h-5"/></button>
                <div className="flex items-center space-x-1">
                     <select 
                        value={calendar.month} 
                        onChange={(e) => setLeftMonth(parseInt(e.target.value))}
                        className="text-sm font-semibold text-gray-800 border-none bg-transparent focus:ring-0 p-1"
                    >
                         {MONTH_NAMES.map((name, index) => <option key={name} value={index}>{name}</option>)}
                     </select>
                      <select 
                        value={calendar.year} 
                        onChange={(e) => setLeftYear(parseInt(e.target.value))}
                        className="text-sm font-semibold text-gray-800 border-none bg-transparent focus:ring-0 p-1"
                    >
                         {years.map(year => <option key={year} value={year}>{year}</option>)}
                     </select>
                </div>
                <button onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-gray-100"><ChevronRightIcon className="w-5 h-5"/></button>
            </div>
            <div className="grid grid-cols-7 gap-y-1 text-center text-xs text-gray-500">
                {WEEK_DAYS.map(day => <div key={day} className="w-8 h-8 flex items-center justify-center">{day}</div>)}
            </div>
             <div className="grid grid-cols-7 gap-y-1">
                {monthDays.map((dayKey, index) => {
                  if (!dayKey) return <div key={`empty-${index}`} />;

                  const isToday = dayKey === today;
                  const isSelectedStart = startKey && dayKey === startKey;
                  const isSelectedEnd = endKey && dayKey === endKey;
                    
                  const inRange = startKey && (
                    (endKey && dayKey > startKey && dayKey < endKey) ||
                    (!endKey && hoverKey && dayKey > startKey && dayKey < hoverKey)
                  );

                    let classes = "w-8 h-8 flex items-center justify-center rounded-full text-sm cursor-pointer ";
                    if (isToday) classes += "border border-red-500 ";
                    
                    if (isSelectedStart || isSelectedEnd) classes += "bg-[#aa632d] text-white ";
                    else if(inRange) classes += "bg-orange-100 text-[#2f3133] rounded-none ";
                    else classes += "hover:bg-gray-100 text-[#2f3133] ";

                    if (startKey && !endKey && dayKey === hoverKey) classes += "bg-orange-200 ";
                    
                    if (inRange) {
                        if (isSelectedStart) classes += "rounded-r-none ";
                        if (isSelectedEnd) classes += "rounded-l-none ";
                    }
                    
                    return (
                        <div key={index} className="flex items-center justify-center">
                            <button
                              onClick={() => handleDateClick(dayKey)}
                              onMouseEnter={() => setHoverKey(dayKey)}
                              onMouseLeave={() => setHoverKey(null)}
                                className={classes}
                            >
                              {Number(dayKey.slice(8, 10))}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    )
  };

  const displayValue = useMemo(() => {
      if (startKey && endKey) {
        if (startKey === endKey) {
          return formatDateOnly(startKey);
        }
        return `${formatDateOnly(startKey)} - ${formatDateOnly(endKey)}`;
      }
      if (startKey) {
        return formatDateOnly(startKey);
      }
      return 'Selecciona un periodo';
    }, [startKey, endKey, formatDateOnly]);

  return (
    <div className="relative flex items-center space-x-2" ref={wrapperRef}>
       {(startKey || endKey) && (
        <button
            onClick={handleClear}
            className="flex items-center px-3 py-2 text-sm bg-white text-gray-600 rounded-lg shadow-sm border border-gray-300 hover:bg-gray-50 hover:text-gray-800 transition-colors"
            title="Limpiar filtro de fecha"
        >
            <XCircleIcon className="w-4 h-4 mr-1.5" />
            Limpiar
        </button>
      )}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center bg-white border border-gray-300 text-[#2f3133] px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-sm min-w-[260px] justify-start"
      >
        <CalendarDaysIcon className="mr-2 h-5 w-5 text-gray-700" />
        <span className="truncate">{displayValue}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-10 p-4">
            <div className="flex justify-between items-center mb-4">
                <div className="text-sm">
                <p className="text-gray-500">Fecha de inicio: <span className="font-semibold text-gray-800">{startKey ? formatDateOnly(startKey) : '-'}</span></p>
                <p className="text-gray-500">Fecha de finalización: <span className="font-semibold text-gray-800">{(endKey ?? startKey) ? formatDateOnly(endKey ?? startKey) : '-'}</span></p>
                </div>
                <div>
                     <select onChange={e => setPeriod(e.target.value)} className="text-sm border-gray-300 rounded-md focus:ring-[#aa632d] focus:border-[#aa632d]">
                         <option value="">Periodo automático</option>
                         <option value="hoy">Hoy</option>
                         <option value="ayer">Ayer</option>
                         <option value="ultimos_7_dias">Últimos 7 días</option>
                         <option value="este_mes">Este mes</option>
                         <option value="mes_pasado">Mes pasado</option>
                     </select>
                </div>
            </div>
            <div className="flex space-x-4 border-t pt-4">
                {renderCalendar({ year: leftYear, month: leftMonth })}
                {renderCalendar(rightCalendar)}
            </div>
             <div className="border-t mt-4 pt-3 flex justify-end items-center space-x-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleApply}
                  className="px-4 py-2 text-sm bg-[#aa632d] text-white rounded-md hover:bg-[#8e5225] transition-colors"
                >
                  Aplicar
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;