

import React from 'react';
import type { StatCardData } from '../../types.ts';
import { ArrowUpIcon, ArrowDownIcon } from '../shared/Icons.tsx';

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

interface CustomStatCardData extends Omit<StatCardData, 'icon'> {
  icon: string | React.ReactNode; // Allow string for GoogleIcon name or ReactNode for custom icons
  iconColorClass?: string; // New prop for icon color
}

const StatCard: React.FC<CustomStatCardData> = ({ title, value, change, changeType, icon, iconBgClass, iconColorClass }) => {
  const isIncrease = changeType === 'increase';
  const changeColor = isIncrease ? 'text-green-600' : 'text-red-600';

  return (
    <div className="bg-white p-6 rounded-2xl shadow-soft-md hover:shadow-soft-lg transition-all duration-300 flex items-start justify-between border border-munnay-100">
      <div>
        <p className="text-sm font-medium text-munnay-700">{title}</p>
        <p className="text-2xl font-bold text-munnay-900 mt-2">{value}</p>
        {change && (
          <div className="flex items-center mt-3">
            <span className={`flex items-center text-xs font-semibold ${changeColor}`}>
                {isIncrease ? <ArrowUpIcon /> : <ArrowDownIcon />}
                {change}
            </span>
            <span className="text-xs text-gray-500 ml-1">vs mes anterior</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl ${iconBgClass || 'bg-munnay-50'}`}>
        {typeof icon === 'string' ? <GoogleIcon name={icon} className={iconColorClass} /> : icon}
      </div>
    </div>
  );
};

export default StatCard;