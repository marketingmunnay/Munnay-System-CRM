

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
    <div className="bg-white p-5 rounded-lg shadow-md flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        {change && (
          <div className="flex items-center mt-2">
            <span className={`flex items-center text-xs font-semibold ${changeColor}`}>
                {isIncrease ? <ArrowUpIcon /> : <ArrowDownIcon />}
                {change}
            </span>
            <span className="text-xs text-gray-400 ml-1">vs mes anterior</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-full ${iconBgClass || 'bg-gray-100'}`}>
        {typeof icon === 'string' ? <GoogleIcon name={icon} className={iconColorClass} /> : icon}
      </div>
    </div>
  );
};

export default StatCard;