import React, { useState } from 'react';
import type { Lead, Campaign, VentaExtra, Goal, Publicacion, Seguidor } from '../../types.ts';
// FIX: Changed to named export for InformeComercial
import { InformeComercial } from './InformeComercial.tsx';
import DateRangeFilter from '../shared/DateRangeFilter.tsx';

interface InformesPageProps {
    leads: Lead[];
    campaigns: Campaign[];
    ventasExtra: VentaExtra[];
    goals: Goal[];
    publicaciones: Publicacion[];
    seguidores: Seguidor[];
}

const InformesPage: React.FC<InformesPageProps> = ({ leads, campaigns, ventasExtra, goals, publicaciones, seguidores }) => {
    const [dateRange, setDateRange] = useState({ from: '', to: '' });

    const handleApplyDateFilter = (dates: { from: string, to: string }) => {
        setDateRange(dates);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center print:hidden">
                <h1 className="text-2xl font-bold text-black mb-4 md:mb-0">Informes</h1>
                <DateRangeFilter onApply={handleApplyDateFilter} />
            </div>
            
            {/* For now, only the commercial report is shown. This can be expanded with tabs in the future. */}
            <InformeComercial 
                leads={leads}
                campaigns={campaigns}
                ventasExtra={ventasExtra}
                dateRange={dateRange}
                goals={goals}
                publicaciones={publicaciones}
                seguidores={seguidores}
            />
        </div>
    );
};

export default InformesPage;