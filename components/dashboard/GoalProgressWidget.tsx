
import React from 'react';

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
  const start = new Date(startDate + 'T00:00:00').getTime();
  const end = new Date(endDate + 'T00:00:00').getTime();
  const now = new Date().getTime();

  const totalDuration = end - start;
  const elapsedDuration = now - start;

  const timeProgress = totalDuration > 0 ? Math.min(Math.max((elapsedDuration / totalDuration) * 100, 0), 100) : 0;
  const goalProgress = targetValue > 0 ? Math.min((currentValue / targetValue) * 100, 100) : 0;

  let progressBarColor = 'bg-gradient-to-r from-green-400 to-green-500';
  if (goalProgress < timeProgress) {
    progressBarColor = 'bg-gradient-to-r from-yellow-400 to-yellow-500';
  }
  if (goalProgress < timeProgress - 25) {
    progressBarColor = 'bg-gradient-to-r from-red-400 to-red-500';
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
    <div className="bg-white p-5 rounded-2xl shadow-soft-md hover:shadow-soft-lg transition-all duration-300 flex flex-col h-full border border-munnay-100">
      <h4 className="text-sm font-semibold text-munnay-800 truncate">{name}</h4>
      <div className="flex-grow flex flex-col justify-end mt-3">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-2xl font-bold text-munnay-900">{formatValue(currentValue)}</span>
          <span className="text-sm font-medium text-munnay-600">/ {formatValue(targetValue)}</span>
        </div>
        <div className="relative w-full bg-munnay-100 rounded-full h-5">
          <div
            className={`h-5 rounded-full transition-all duration-500 ${progressBarColor}`}
            style={{ width: `${goalProgress}%` }}
          ></div>
          <div
            className="absolute top-0 h-5 w-1 bg-munnay-800 rounded-full"
            style={{ left: `${timeProgress}%` }}
            title={`Progreso del tiempo: ${timeProgress.toFixed(0)}%`}
          >
             <div className="absolute -top-1.5 -translate-x-1/2 w-3 h-3 bg-munnay-800 rounded-full border-2 border-white shadow-soft"></div>
          </div>
        </div>
         <div className="text-xs text-munnay-600 mt-2">
            <span>Progreso: {goalProgress.toFixed(0)}%</span>
            <span className="float-right">Tiempo: {timeProgress.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
};

export default GoalProgressWidget;
