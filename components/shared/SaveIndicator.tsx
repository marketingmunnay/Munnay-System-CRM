import React from 'react';
import { SaveStatus } from '../../hooks/useAutoSave';

interface SaveIndicatorProps {
  status: SaveStatus;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  className?: string;
}

const SaveIndicator: React.FC<SaveIndicatorProps> = ({ 
  status, 
  lastSaved, 
  hasUnsavedChanges, 
  className = '' 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case SaveStatus.SAVING:
        return {
          icon: (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
          ),
          text: 'Guardando...',
          textColor: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case SaveStatus.SAVED:
        return {
          icon: (
            <svg className="h-4 w-4 text-green-600 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ),
          text: '¡Guardado!',
          textColor: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case SaveStatus.ERROR:
        return {
          icon: (
            <svg className="h-4 w-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ),
          text: 'Error al guardar',
          textColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      default:
        if (hasUnsavedChanges) {
          return {
            icon: (
              <div className="h-2 w-2 bg-orange-400 rounded-full animate-pulse"></div>
            ),
            text: 'Cambios sin guardar',
            textColor: 'text-orange-600',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200'
          };
        }
        return null;
    }
  };

  const config = getStatusConfig();

  if (!config) {
    return lastSaved ? (
      <div className={`flex items-center space-x-2 text-xs text-gray-500 ${className}`}>
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span>Último guardado: {formatLastSaved(lastSaved)}</span>
      </div>
    ) : null;
  }

  return (
    <div 
      className={`
        flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-medium
        transition-all duration-300 ease-in-out
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${className}
      `}
    >
      {config.icon}
      <span>{config.text}</span>
      {lastSaved && status === SaveStatus.SAVED && (
        <span className="text-xs opacity-75">
          ({formatLastSaved(lastSaved)})
        </span>
      )}
    </div>
  );
};

function formatLastSaved(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffSeconds < 60) {
    return 'hace un momento';
  } else if (diffMinutes < 60) {
    return `hace ${diffMinutes} min`;
  } else if (diffHours < 24) {
    return `hace ${diffHours} h`;
  } else {
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

export default SaveIndicator;