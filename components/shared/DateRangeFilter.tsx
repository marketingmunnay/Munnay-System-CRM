

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon, XCircleIcon } from './Icons.tsx';

interface DateRangeFilterProps {
  onApply: (dates: { from: string; to: string }) => void;
}

const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
}

const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const WEEK_DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ onApply }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  
  const [leftCalendarDate, setLeftCalendarDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  
  const rightCalendarDate = useMemo(() => {
    return new Date(leftCalendarDate.getFullYear(), leftCalendarDate.getMonth() + 1, 1);
  }, [leftCalendarDate]);

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
    onApply({ from: formatDate(startDate), to: formatDate(endDate) });
    setIsOpen(false);
  };
  
  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    onApply({ from: '', to: '' });
  };


  const handleCancel = () => {
    setIsOpen(false);
  };
  
  const handleDateClick = (day: Date) => {
      if (!startDate || (startDate && endDate)) {
          setStartDate(day);
          setEndDate(null);
      } else if (startDate && !endDate) {
          if (day < startDate) {
              setEndDate(startDate);
              setStartDate(day);
          } else {
              setEndDate(day);
          }
      }
  };
  
  const setPeriod = (period: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let start = new Date(today);
    let end = new Date(today);

    switch (period) {
        case 'hoy':
            break;
        case 'ayer':
            start.setDate(start.getDate() - 1);
            end.setDate(end.getDate() - 1);
            break;
        case 'ultimos_7_dias':
            start.setDate(start.getDate() - 6);
            break;
        case 'este_mes':
            start = new Date(today.getFullYear(), today.getMonth(), 1);
            end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            break;
        case 'mes_pasado':
            start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            end = new Date(today.getFullYear(), today.getMonth(), 0);
            break;
        default:
            return;
    }
    setStartDate(start);
    setEndDate(end);
    setLeftCalendarDate(new Date(start.getFullYear(), start.getMonth(), 1));
  };


  const generateMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // 0=Lunes

    const days: (Date | null)[] = Array(startDayOfWeek).fill(null);
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i));
    }
    return days;
  };

  const changeMonth = (offset: number) => {
      setLeftCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };
  
  const changeYear = (date: Date, year: number) => {
      setLeftCalendarDate(new Date(year, date.getMonth(), 1));
  }
  
  const changeMonthBySelect = (date: Date, month: number) => {
      setLeftCalendarDate(new Date(date.getFullYear(), month, 1));
  }
  
  const years = Array.from({length: 10}, (_, i) => new Date().getFullYear() - 5 + i);

  const renderCalendar = (date: Date) => {
    const monthDays = generateMonth(date);
    const today = new Date(); today.setHours(0,0,0,0);
    
    return (
        <div className="w-64">
             <div className="flex justify-between items-center mb-2 px-2">
                <button onClick={() => changeMonth(-1)} className="p-1 rounded-xl hover:bg-munnay-50 transition-all duration-300"><ChevronLeftIcon className="w-5 h-5"/></button>
                <div className="flex items-center space-x-1">
                     <select 
                        value={date.getMonth()} 
                        onChange={(e) => changeMonthBySelect(date, parseInt(e.target.value))}
                        className="text-sm font-semibold text-munnay-900 border-none bg-transparent focus:ring-0 p-1"
                    >
                         {MONTH_NAMES.map((name, index) => <option key={name} value={index}>{name}</option>)}
                     </select>
                      <select 
                        value={date.getFullYear()} 
                        onChange={(e) => changeYear(date, parseInt(e.target.value))}
                        className="text-sm font-semibold text-munnay-900 border-none bg-transparent focus:ring-0 p-1"
                    >
                         {years.map(year => <option key={year} value={year}>{year}</option>)}
                     </select>
                </div>
                <button onClick={() => changeMonth(1)} className="p-1 rounded-xl hover:bg-munnay-50 transition-all duration-300"><ChevronRightIcon className="w-5 h-5"/></button>
            </div>
            <div className="grid grid-cols-7 gap-y-1 text-center text-xs text-gray-500">
                {WEEK_DAYS.map(day => <div key={day} className="w-8 h-8 flex items-center justify-center">{day}</div>)}
            </div>
             <div className="grid grid-cols-7 gap-y-1">
                {monthDays.map((day, index) => {
                    if (!day) return <div key={`empty-${index}`} />;
                    
                    const isToday = day.getTime() === today.getTime();
                    const isSelectedStart = startDate && day.getTime() === startDate.getTime();
                    const isSelectedEnd = endDate && day.getTime() === endDate.getTime();
                    
                    const inRange = startDate && (
                        (endDate && day > startDate && day < endDate) ||
                        (!endDate && hoverDate && day > startDate && day < hoverDate)
                    );

                    let classes = "w-8 h-8 flex items-center justify-center rounded-full text-sm cursor-pointer ";
                    if (isToday) classes += "border border-red-500 ";
                    
                    if (isSelectedStart || isSelectedEnd) classes += "bg-[#aa632d] text-white ";
                    else if(inRange) classes += "bg-orange-100 text-[#2f3133] rounded-none ";
                    else classes += "hover:bg-gray-100 text-[#2f3133] ";

                    if (startDate && !endDate && day.getTime() === hoverDate?.getTime()) classes += "bg-orange-200 ";
                    
                    if (inRange) {
                        if (isSelectedStart) classes += "rounded-r-none ";
                        if (isSelectedEnd) classes += "rounded-l-none ";
                    }
                    
                    return (
                        <div key={index} className="flex items-center justify-center">
                            <button
                                onClick={() => handleDateClick(day)}
                                onMouseEnter={() => setHoverDate(day)}
                                onMouseLeave={() => setHoverDate(null)}
                                className={classes}
                            >
                                {day.getDate()}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    )
  };

  const displayValue = useMemo(() => {
      if(startDate && endDate) {
          if (startDate.getTime() === endDate.getTime()) {
              return formatDateForDisplay(startDate);
          }
          return `${formatDateForDisplay(startDate)} - ${formatDateForDisplay(endDate)}`;
      }
      if(startDate) {
          return formatDateForDisplay(startDate);
      }
      return 'Selecciona un periodo';
  }, [startDate, endDate]);

  return (
    <div className="relative flex items-center space-x-2" ref={wrapperRef}>
       {(startDate || endDate) && (
        <button
            onClick={handleClear}
            className="flex items-center px-3 py-2 text-sm bg-white text-munnay-700 rounded-xl shadow-soft border border-munnay-200 hover:bg-munnay-50 hover:text-munnay-900 transition-all duration-300 transition-colors"
            title="Limpiar filtro de fecha"
        >
            <XCircleIcon className="w-4 h-4 mr-1.5" />
            Limpiar
        </button>
      )}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center bg-white border border-munnay-200 text-munnay-800 px-4 py-2 rounded-xl shadow-soft hover:bg-munnay-50 transition-all duration-300 transition-colors text-sm min-w-[260px] justify-start"
      >
        <CalendarDaysIcon className="mr-2 h-5 w-5 text-gray-700" />
        <span className="truncate">{displayValue}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-munnay-200 rounded-2xl shadow-soft-lg z-10 p-4">
            <div className="flex justify-between items-center mb-4">
                <div className="text-sm">
                    <p className="text-gray-500">Fecha de inicio: <span className="font-semibold text-gray-800">{startDate ? formatDateForDisplay(startDate) : '-'}</span></p>
                    <p className="text-gray-500">Fecha de finalización: <span className="font-semibold text-gray-800">{endDate ? formatDateForDisplay(endDate) : '-'}</span></p>
                </div>
                <div>
                     <select onChange={e => setPeriod(e.target.value)} className="text-sm border-munnay-200 rounded-xl focus:ring-munnay-500 focus:border-munnay-500">
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
                {renderCalendar(leftCalendarDate)}
                {renderCalendar(rightCalendarDate)}
            </div>
             <div className="border-t mt-4 pt-3 flex justify-end items-center space-x-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm bg-munnay-100 text-munnay-800 rounded-xl hover:bg-munnay-200 transition-all duration-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleApply}
                  className="px-4 py-2 text-sm bg-munnay-500 text-white rounded-xl hover:bg-munnay-600 transition-all duration-300 transition-colors"
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