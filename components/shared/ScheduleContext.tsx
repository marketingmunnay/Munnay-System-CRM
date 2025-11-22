import React, { createContext, useContext, useState } from 'react';
import type { Procedure } from '../../types';

type ScheduleContextType = {
    procedureToSchedule: Partial<Procedure> | null;
    setProcedureToSchedule: (p: Partial<Procedure> | null) => void;
    completedProcedure: Partial<Procedure> | null;
    setCompletedProcedure: (p: Partial<Procedure> | null) => void;
    clear: () => void;
};

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [procedureToSchedule, setProcedureToSchedule] = useState<Partial<Procedure> | null>(null);
    const [completedProcedure, setCompletedProcedure] = useState<Partial<Procedure> | null>(null);

    const clear = () => {
        setProcedureToSchedule(null);
        setCompletedProcedure(null);
    };

    return (
        <ScheduleContext.Provider value={{ procedureToSchedule, setProcedureToSchedule, completedProcedure, setCompletedProcedure, clear }}>
            {children}
        </ScheduleContext.Provider>
    );
};

export const useSchedule = (): ScheduleContextType => {
    const ctx = useContext(ScheduleContext);
    if (!ctx) throw new Error('useSchedule must be used within ScheduleProvider');
    return ctx;
};

export default ScheduleContext;
