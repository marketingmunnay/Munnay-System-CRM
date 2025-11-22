import React, { useMemo } from 'react';
import type { Lead, VentaExtra, Incidencia } from '../../types';
import StatCard from './StatCard.tsx';

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

interface RecepcionDashboardProps {
    leads: Lead[];
    ventasExtra: VentaExtra[];
    incidencias: Incidencia[];
    dateRange: { from: string; to: string };
}

const RecepcionDashboard: React.FC<RecepcionDashboardProps> = ({ leads, ventasExtra, incidencias, dateRange }) => {
    const stats = useMemo(() => {
        const totalIncidencias = incidencias.length;

        const attendedPatients = leads.filter(l => l.procedimientos && l.procedimientos.length > 0);
        const acceptedTreatmentCount = attendedPatients.filter(l => l.aceptoTratamiento === 'Si').length;
        const conversionTreatment = attendedPatients.length > 0 ? (acceptedTreatmentCount / attendedPatients.length) * 100 : 0;
        
        const totalVentasExtraRecepcion = ventasExtra
            .filter(v => v.categoria === 'Productos')
            .reduce((sum, v) => sum + v.montoPagado, 0);

        return {
            conversionTreatment,
            totalIncidencias,
            totalVentasExtraRecepcion,
        };
    }, [leads, ventasExtra, incidencias]);

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="% de Aceptación de Tratamiento"
                    value={`${stats.conversionTreatment.toFixed(1)}%`}
                    icon={<GoogleIcon name="thumb_up" className="text-indigo-600" />}
                    iconBgClass="bg-indigo-100"
                />
                <StatCard
                    title="Total Recuperado en Recepción"
                    value={`S/ ${stats.totalVentasExtraRecepcion.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
                    icon={<GoogleIcon name="point_of_sale" className="text-cyan-600" />}
                    iconBgClass="bg-cyan-100"
                />
                <StatCard
                    title="Total de Incidencias"
                    value={stats.totalIncidencias.toString()}
                    icon={<GoogleIcon name="report" className="text-red-600" />}
                    iconBgClass="bg-red-100"
                />
            </div>
        </div>
    );
};

export default RecepcionDashboard;