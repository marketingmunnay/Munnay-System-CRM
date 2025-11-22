import React, { useMemo } from 'react';
import type { User, Role, Lead, Goal } from '../../types.ts';
import { LeadStatus } from '../../types.ts';
import { formatDateForDisplay } from '../../utils/time';

const GoogleIcon: React.FC<{ name: string; className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

interface PerfilEmpleadoDetalleProps {
    user: User;
    role: Role | undefined;
    leads: Lead[];
    goals: Goal[];
}

const KPICard: React.FC<{ title: string, value: string, icon: string, color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-4 rounded-lg border flex items-start space-x-3">
        <div 
            className={`${color} text-white flex items-center justify-center`}
            style={{ padding: '0.75rem', width: '50px', height: '50px', borderRadius: '50%' }}
        >
            <GoogleIcon name={icon} />
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const PerfilEmpleadoDetalle: React.FC<PerfilEmpleadoDetalleProps> = ({ user, role, leads, goals }) => {
    
    const performanceKPIs = useMemo(() => {
        if (!user || !role) return [];

        const userName = user.nombres;
        
        if (role.nombre === 'Marketing' || role.nombre === 'Administrador') {
            const userLeads = leads.filter(l => l.vendedor === userName);
            const totalLeads = userLeads.length;
            const agendados = userLeads.filter(l => l.estado === LeadStatus.Agendado).length;
            const conversionRate = totalLeads > 0 ? (agendados / totalLeads) * 100 : 0;
            const totalVentas = userLeads.reduce((sum, l) => sum + (l.montoPagado || 0), 0);

            return [
                { title: 'Leads Asignados', value: totalLeads.toString(), icon: 'groups', color: 'bg-blue-500' },
                { title: 'Tasa de Conversión', value: `${conversionRate.toFixed(1)}%`, icon: 'show_chart', color: 'bg-green-500' },
                { title: 'Monto en Citas', value: `S/ ${totalVentas.toLocaleString()}`, icon: 'payments', color: 'bg-amber-500' },
            ];
        }

        if (role.nombre === 'Procedimientos' || role.nombre === 'Recepción') {
             const procedimientosRealizados = leads.reduce((count, lead) => {
                return count + (lead.procedimientos?.filter(p => p.personal === userName).length || 0);
            }, 0);
             return [
                { title: 'Procedimientos Realizados', value: procedimientosRealizados.toString(), icon: 'vaccines', color: 'bg-sky-500' },
                { title: 'Satisfacción Paciente', value: 'N/A', icon: 'sentiment_satisfied', color: 'bg-purple-500' },
            ];
        }

        return [];
    }, [user, role, leads]);

    const userGoals = useMemo(() => {
        if (!user) return [];
        const fullName = `${user.nombres} ${user.apellidos}`;
        return goals.filter(g => g.personal === fullName);
    }, [user, goals]);
    
    const sortedRecognitions = useMemo(() => {
        if (!user?.reconocimientos) return [];
        return [...user.reconocimientos].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    }, [user]);

    return (
        <div className="p-6 bg-gray-50 h-full">
            <div className="flex items-start space-x-6">
                <img src={user.avatarUrl} alt="Avatar" className="w-32 h-32 rounded-full border-4 border-white shadow-lg"/>
                <div className="pt-2">
                    <h2 className="text-3xl font-bold text-gray-900">{user.nombres} {user.apellidos}</h2>
                    <p className="text-md text-gray-600">{user.position}</p>
                    <p className="text-sm bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full mt-1 inline-block">{role?.nombre}</p>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Indicadores Clave de Desempeño (KPIs)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {performanceKPIs.length > 0 ? (
                        performanceKPIs.map(kpi => <KPICard key={kpi.title} {...kpi} />)
                    ) : (
                        <p className="text-sm text-gray-500 md:col-span-3">No hay KPIs definidos para este rol.</p>
                    )}
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Metas Asignadas</h3>
                 {userGoals.length > 0 ? (
                    <ul className="space-y-2">
                        {userGoals.map(goal => (
                            <li key={goal.id} className="bg-white p-3 rounded-md border text-sm flex justify-between">
                                <span className="font-medium text-gray-700">{goal.name}</span>
                                <span className="font-bold text-gray-800">{goal.value}{goal.unit === 'porcentaje' ? '%' : ''}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-500">No hay metas asignadas.</p>
                )}
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Reconocimientos Recibidos</h3>
                {sortedRecognitions.length > 0 ? (
                    <div className="space-y-4">
                        {sortedRecognitions.map(r => (
                            <div key={r.id} className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                                <blockquote className="italic text-gray-700">"{r.mensaje}"</blockquote>
                                <p className="text-right text-xs font-semibold text-amber-800 mt-2">- {r.otorgadoPorNombre}, {formatDateForDisplay(r.fecha)}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                     <p className="text-sm text-gray-500">Aún no ha recibido reconocimientos.</p>
                )}
            </div>
        </div>
    );
};

export default PerfilEmpleadoDetalle;