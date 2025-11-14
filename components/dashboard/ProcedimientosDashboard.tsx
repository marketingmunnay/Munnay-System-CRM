import React, { useMemo } from 'react';
import type { Lead, VentaExtra, Incidencia } from '../../types';
import StatCard from './StatCard.tsx';

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

interface ProcedimientosDashboardProps {
    leads: Lead[];
    ventasExtra: VentaExtra[];
    incidencias: Incidencia[];
    dateRange: { from: string; to: string };
}

const ProcedimientosDashboard: React.FC<ProcedimientosDashboardProps> = ({ leads, ventasExtra, incidencias, dateRange }) => {
    const stats = useMemo(() => {
        const totalIncidencias = incidencias.length;

        const patientsWithInflamacion = new Set<number>();
        leads.forEach(lead => {
            if (lead.seguimientos?.some(s => s.inflamacion)) {
                patientsWithInflamacion.add(lead.id);
            }
        });
        
        const totalVentasExtraProcedimientos = ventasExtra
            .filter(v => v.categoria !== 'Productos')
            .reduce((sum, v) => sum + v.montoPagado, 0);

        return {
            totalIncidencias,
            totalConInflamacion: patientsWithInflamacion.size,
            totalVentasExtraProcedimientos,
        };
    }, [leads, ventasExtra, incidencias]);
    
    const serviceStats = useMemo(() => {
        const serviceCount: Record<string, number> = {};
        leads.forEach(lead => {
            lead.tratamientos?.forEach(trat => {
                serviceCount[trat.nombre] = (serviceCount[trat.nombre] || 0) + 1;
            });
        });
        return Object.entries(serviceCount)
            .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, 5);
    }, [leads]);
    
    const patientLists = useMemo(() => {
        const patientsWithProcedures = leads.filter(l => l.procedimientos && l.procedimientos.length > 0);
        
        const masDe10 = patientsWithProcedures.filter(p => p.procedimientos!.length > 10);
        const menosDe3 = patientsWithProcedures.filter(p => p.procedimientos!.length < 3);
        const entre4y9 = patientsWithProcedures.filter(p => p.procedimientos!.length >= 4 && p.procedimientos!.length <= 9);

        const conComplicaciones = leads.map(lead => {
            const complications = (lead.seguimientos || []).reduce((count, seg) => {
                return count + (seg.inflamacion ? 1 : 0) + (seg.ampollas ? 1 : 0) + (seg.alergias ? 1 : 0) + (seg.malestarGeneral ? 1 : 0) + (seg.brote ? 1 : 0) + (seg.dolorDeCabeza ? 1 : 0) + (seg.moretones ? 1 : 0);
            }, 0);
            return { lead, complications };
        })
        .filter(item => item.complications > 0)
        .sort((a, b) => b.complications - a.complications)
        .slice(0, 5);

        return { masDe10, menosDe3, entre4y9, conComplicaciones };
    }, [leads]);

    const ListCard: React.FC<{title: string, items: {name: string, value: string}[], bgColor: string}> = ({title, items, bgColor}) => (
        <div className={`${bgColor} p-4 rounded-lg shadow h-full`}>
            <h4 className="font-semibold text-gray-700 text-base mb-3">{title}</h4>
            {items.length > 0 ? (
                <ul className="space-y-2">
                    {items.map((item, index) => (
                         <li key={index} className="flex justify-between items-center text-sm bg-white/50 p-2 rounded-md">
                            <span className="text-gray-600">{item.name}</span>
                            <span className="font-semibold text-gray-800">{item.value}</span>
                        </li>
                    ))}
                </ul>
            ) : <p className="text-sm text-gray-500 text-center pt-4">No hay datos.</p>}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <StatCard
                    title="Total Ventas Extra Procedimientos"
                    value={`S/ ${stats.totalVentasExtraProcedimientos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
                    icon={<GoogleIcon name="vaccines" className="text-orange-600" />}
                    iconBgClass="bg-orange-100"
                />
                 <StatCard
                    title="Total Incidencias"
                    value={stats.totalIncidencias.toString()}
                    icon={<GoogleIcon name="report" className="text-red-600" />}
                    iconBgClass="bg-red-100"
                />
                 <StatCard
                    title="Total Pacientes con Inflamación"
                    value={stats.totalConInflamacion.toString()}
                    icon={<GoogleIcon name="local_fire_department" className="text-orange-600" />}
                    iconBgClass="bg-orange-100"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <ListCard 
                    title="Top 5 Servicios Más Vendidos" 
                    items={serviceStats.map(([name, count]) => ({name, value: `${count} vendidos`}))}
                    bgColor="bg-indigo-50"
                 />
                 <ListCard 
                    title="Pacientes con Más Complicaciones" 
                    items={patientLists.conComplicaciones.map(p => ({name: `${p.lead.nombres} ${p.lead.apellidos}`, value: `${p.complications} síntoma(s)`}))} 
                    bgColor="bg-red-50"
                 />
                <div>
                     <ListCard 
                        title="Pacientes por N° de Sesiones" 
                        items={[
                            { name: 'Más de 10 sesiones', value: `${patientLists.masDe10.length} paciente(s)`},
                            { name: 'Entre 4 y 9 sesiones', value: `${patientLists.entre4y9.length} paciente(s)`},
                            { name: 'Menos de 3 sesiones', value: `${patientLists.menosDe3.length} paciente(s)`},
                        ]}
                        bgColor="bg-yellow-50"
                    />
                </div>
            </div>
        </div>
    );
};
export default ProcedimientosDashboard;