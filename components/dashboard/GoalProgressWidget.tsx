
import React from 'react';
import { parseDate } from '../../utils/time.ts';

interface GoalProgressWidgetProps {
  name: string;
  currentValue: number;
  targetValue: number;
  unit: 'cantidad' | 'porcentaje';
  startDate: string;
  endDate: string;
}

const GoalProgressWidget: React.FC<GoalProgressWidgetProps> = ({
  name,
  currentValue,
  targetValue,
  unit,
  startDate,
  endDate,
}) => {
  const start = (parseDate(startDate)?.getTime()) ?? new Date(startDate).getTime();
  const end = (parseDate(endDate)?.getTime()) ?? new Date(endDate).getTime();
  const now = Date.now();

  const totalDuration = end - start;
  const elapsedDuration = now - start;

  const timeProgress = totalDuration > 0 ? Math.min(Math.max((elapsedDuration / totalDuration) * 100, 0), 100) : 0;
  const goalProgress = targetValue > 0 ? Math.min((currentValue / targetValue) * 100, 100) : 0;

  let progressBarColor = 'bg-green-500';
  if (goalProgress < timeProgress) {
    progressBarColor = 'bg-yellow-500';
  }
  if (goalProgress < timeProgress - 25) {
    progressBarColor = 'bg-red-500';
  }

  const formatValue = (value: number) => {
    if (unit === 'porcentaje') {
      return `${value.toFixed(1)}%`;
    }
    const isCurrency = name.toLowerCase().includes('ventas');
    if (isCurrency) {
        return `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return value.toLocaleString('es-PE');
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex flex-col h-full">
      <h4 className="text-sm font-semibold text-gray-700 truncate">{name}</h4>
      <div className="flex-grow flex flex-col justify-end mt-2">
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-2xl font-bold text-gray-800">{formatValue(currentValue)}</span>
          <span className="text-sm font-medium text-gray-500">/ {formatValue(targetValue)}</span>
        </div>
        <div className="relative w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${progressBarColor}`}
            style={{ width: `${goalProgress}%` }}
          ></div>
          <div
            className="absolute top-0 h-4 w-1 bg-gray-700 rounded-full"
            style={{ left: `${timeProgress}%` }}
            title={`Progreso del tiempo: ${timeProgress.toFixed(0)}%`}
          >
             <div className="absolute -top-1.5 -translate-x-1/2 w-3 h-3 bg-gray-700 rounded-full border-2 border-white"></div>
          </div>
        </div>
         <div className="text-xs text-gray-500 mt-1">
            <span>Progreso: {goalProgress.toFixed(0)}%</span>
            <span className="float-right">Tiempo: {timeProgress.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
};

export default GoalProgressWidget;
