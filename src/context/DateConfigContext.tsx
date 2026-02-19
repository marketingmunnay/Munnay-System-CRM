import React, { createContext, useContext, useEffect, useState } from 'react';

export type TimeFormat = '12h' | '24h';

export interface DateConfig {
  timezone: string;      // IANA timezone, e.g. 'America/Lima'
  dateFormat: string;    // e.g. 'dd/MM/yyyy'
  timeFormat: TimeFormat;
}

const defaultConfig: DateConfig = {
  timezone: 'America/Lima',
  dateFormat: 'dd/MM/yyyy',
  timeFormat: '12h',
};

const DateConfigContext = createContext<DateConfig>(defaultConfig);

export const useDateConfig = () => useContext(DateConfigContext);

export const DateConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<DateConfig>(defaultConfig);

  useEffect(() => {
    // Fase 1: leer desde localStorage si existe, en el futuro desde API /config
    try {
      const raw = localStorage.getItem('munnay-date-config');
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<DateConfig>;
        setConfig({ ...defaultConfig, ...parsed });
      }
    } catch (e) {
      console.warn('Failed to load date config from localStorage', e);
    }
  }, []);

  return (
    <DateConfigContext.Provider value={config}>
      {children}
    </DateConfigContext.Provider>
  );
};
