
import React, { useMemo } from 'react';
import type { Lead, VentaExtra, Egreso, Goal, Publicacion, Seguidor } from '../../types.ts';
import { parseDate } from '../../utils/time';
import { MetodoPago } from '../../types.ts';
import StatCard from './StatCard.tsx';
import MonthlySalesChart from './MonthlySalesChart.tsx';
import ServiceCategorySalesChart from './ServiceCategorySalesChart.tsx';
import GoalProgressWidget from './GoalProgressWidget.tsx';

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

interface GeneralDashboardProps {
    leads: Lead[];
    ventasExtra: VentaExtra[];
    egresos: Egreso[];
    dateRange: { from: string; to: string };
    goals: Goal[];
    publicaciones: Publicacion[];
    seguidores: Seguidor[];
}

const TransactionTypeCard: React.FC<{ title: string; amount: number; color: string; iconName: string; iconColor: string; }> = ({ title, amount, color, iconName, iconColor }) => (
    <div className={`p-4 rounded-xl shadow-lg ${color} text-black w-36 h-32 flex flex-col justify-between`}>
        <div className="flex justify-end">
             <GoogleIcon name={iconName} className={`${iconColor} text-3xl`} />
        </div>
        <div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-lg font-bold">S/ {amount.toLocaleString('es-PE')}</p>
        </div>
    </div>
);


const GeneralDashboard: React.FC<GeneralDashboardProps> = ({ leads, ventasExtra, egresos, dateRange, goals, publicaciones, seguidores }) => {

    const { filteredLeads, filteredVentasExtra, filteredEgresos } = useMemo(() => {
        const { from, to } = dateRange;
        
        const checkDate = (itemDateStr?: string) => {
            if (!from && !to) return true;
            if (!itemDateStr) return false;

            const itemDate = parseDate(itemDateStr) ?? null;
            const fromDate = from ? parseDate(from) : null;
            const toDate = to ? (() => {
                const d = parseDate(to, true);
                if (!d) return parseDate(to);
                const end = new Date(d.getTime());
                end.setUTCHours(23, 59, 59, 999);
                return end;
            })() : null;

            if (fromDate && itemDate < fromDate) return false;
            if (toDate && itemDate > toDate) return false;
            
            return true;
        };

        return {
            filteredLeads: leads.filter(l => checkDate(l.fechaHoraAgenda) || checkDate(l.fechaLead)),
            filteredVentasExtra: ventasExtra.filter(v => checkDate(v.fechaVenta)),
            filteredEgresos: egresos.filter(e => checkDate(e.fechaPago)),
        };
    }, [leads, ventasExtra, egresos, dateRange]);

    const stats = useMemo(() => {
        const totalVentasMarketing = filteredLeads.reduce((sum, l) => sum + l.montoPagado, 0);
        
        const totalVentasTratamientos = filteredLeads
            .filter(l => l.aceptoTratamiento === 'Si' && l.tratamientos)
            .reduce((sum, l) => sum + l.tratamientos!.reduce((tsum, t) => tsum + t.montoPagado, 0), 0);
        
        const ventasExtraRecepcion = filteredVentasExtra
            .filter(v => v.categoria === 'Productos')
            .reduce((sum, v) => sum + v.montoPagado, 0);
    
        const ventasExtraProcedimientos = filteredVentasExtra
            .filter(v => v.categoria !== 'Productos')
            .reduce((sum, v) => sum + v.montoPagado, 0);
        
        const totalVentasExtra = ventasExtraRecepcion + ventasExtraProcedimientos;

        const totalVentasGeneral = totalVentasMarketing + totalVentasTratamientos + totalVentasExtra;
        
        const totalLeads = filteredLeads.length;
        const totalAgendados = filteredLeads.filter(l => l.estado === 'Agendado').length;
        const tasaConversion = totalLeads > 0 ? (totalAgendados / totalLeads) * 100 : 0;
        
        const leadsConDecision = filteredLeads.filter(l => l.aceptoTratamiento === 'Si' || l.aceptoTratamiento === 'No');
        const leadsAceptaron = leadsConDecision.filter(l => l.aceptoTratamiento === 'Si');
        const tasaAceptacionTratamiento = leadsConDecision.length > 0 ? (leadsAceptaron.length / leadsConDecision.length) * 100 : 0;

        const totalEgresos = filteredEgresos.reduce((sum, e) => sum + e.montoPagado, 0);

        const ventasPorMetodo = {
            Efectivo: 0,
            Tarjeta: 0,
            Transferencia: 0,
            Yape: 0,
        };

        const processPayment = (monto: number, metodo?: MetodoPago) => {
            if (!metodo || monto <= 0) return;
            switch (metodo) {
                case MetodoPago.Efectivo:
                    ventasPorMetodo.Efectivo += monto;
                    break;
                case MetodoPago.Tarjeta:
                    ventasPorMetodo.Tarjeta += monto;
                    break;
                case MetodoPago.Transferencia:
                    ventasPorMetodo.Transferencia += monto;
                    break;
                case MetodoPago.Yape:
                case MetodoPago.Plin:
                    ventasPorMetodo.Yape += monto;
                    break;
            }
        };

        filteredLeads.forEach(l => {
            processPayment(l.montoPagado, l.metodoPago);
            l.tratamientos?.forEach(t => {
                processPayment(t.montoPagado, t.metodoPago);
            });
        });

        filteredVentasExtra.forEach(v => {
            processPayment(v.montoPagado, v.metodoPago);
        });
        
        const [integerPart, decimalPart] = (totalVentasGeneral.toLocaleString('es-PE', { minimumFractionDigits: 2 })).split('.');

        return {
            totalVentasGeneral,
            totalVentasMarketing,
            tasaConversion,
            tasaAceptacionTratamiento,
            ventasExtraRecepcion,
            ventasExtraProcedimientos,
            totalEgresos,
            ventasPorMetodo,
            totalVentasFormatted: { integerPart: integerPart || '0', decimalPart: decimalPart || '00' }
        };
    }, [filteredLeads, filteredVentasExtra, filteredEgresos]);
    
    const activeGoals = useMemo(() => {
        const now = Date.now();
        return goals.filter(goal => {
            const startDate = parseDate(goal.startDate) ?? parseDate(goal.startDate, true);
            const endDateBase = parseDate(goal.endDate) ?? parseDate(goal.endDate, true);
            if (!startDate || !endDateBase) return false;
            const start = startDate.getTime();
            const end = (() => { const d = new Date(endDateBase.getTime()); d.setUTCHours(23,59,59,999); return d.getTime(); })();
            return now >= start && now <= end;
        });
    }, [goals]);

    const calculateGoalProgress = (goal: Goal): number => {
        const goalStart = parseDate(goal.startDate) ?? parseDate(goal.startDate, true);
        const goalEndBase = parseDate(goal.endDate) ?? parseDate(goal.endDate, true);
        if (!goalStart || !goalEndBase) return 0;
        const goalEnd = new Date(goalEndBase.getTime());
        goalEnd.setUTCHours(23,59,59,999);

        const isWithinGoalRange = (dateStr: string) => {
            const itemDate = parseDate(dateStr) ?? null;
            if (!itemDate) return false;
            return itemDate >= goalStart && itemDate <= goalEnd;
        };

        switch (goal.objective) {
            case 'Ventas de Servicios': {
                const ventasLeads = leads
                    .filter(l => l.fechaHoraAgenda && isWithinGoalRange(l.fechaHoraAgenda))
                    .reduce((sum, l) => {
                        const leadTotal = (l.montoPagado || 0) + (l.tratamientos?.reduce((s, t) => s + t.montoPagado, 0) || 0);
                        return sum + leadTotal;
                    }, 0);
                
                const ventasExtras = ventasExtra
                    .filter(v => v.categoria !== 'Productos' && isWithinGoalRange(v.fechaVenta))
                    .reduce((sum, v) => sum + v.montoPagado, 0);
                
                return ventasLeads + ventasExtras;
            }
            case 'Seguidores': {
                return seguidores
                    .filter(s => isWithinGoalRange(s.fecha))
                    .reduce((sum, s) => sum + (s.seguidores - s.dejaronDeSeguir), 0);
            }
            case 'Aceptación de Tratamientos': {
                 const leadsInPeriod = leads.filter(l => l.fechaHoraAgenda && isWithinGoalRange(l.fechaHoraAgenda) && (l.aceptoTratamiento === 'Si' || l.aceptoTratamiento === 'No'));
                 if (leadsInPeriod.length === 0) return 0;
                 const accepted = leadsInPeriod.filter(l => l.aceptoTratamiento === 'Si').length;
                 return (accepted / leadsInPeriod.length) * 100;
            }
            case 'Engagement': {
                const pubsInPeriod = publicaciones.filter(p => isWithinGoalRange(p.fechaPost));
                if (pubsInPeriod.length === 0) return 0;
                const totalInteractions = pubsInPeriod.reduce((sum, p) => sum + p.comentarios + p.reacciones, 0);
                const totalViews = pubsInPeriod.reduce((sum, p) => sum + p.vistas, 0);
                if (totalViews === 0) return 0;
                return (totalInteractions / totalViews) * 100;
            }
            default:
                return 0;
        }
    };


    return (
         <div>
            <div className="mb-6">
                <h3 className="text-xl font-bold text-black mb-4">Progreso de Objetivos Clave</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {activeGoals.map(goal => (
                        <GoalProgressWidget 
                            key={goal.id}
                            name={goal.name}
                            currentValue={calculateGoalProgress(goal)}
                            targetValue={goal.value}
                            unit={goal.unit}
                            startDate={goal.startDate}
                            endDate={goal.endDate}
                        />
                    ))}
                    {activeGoals.length === 0 && (
                        <div className="col-span-full bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
                            <p>No hay objetivos activos para el periodo actual.</p>
                            <p className="text-sm">Puedes configurarlos en la sección de Configuración.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col lg:flex-row items-start justify-between mb-6">
                <div className="flex-1 lg:pr-8 w-full">
                    <h3 className="text-lg font-semibold text-gray-500">Total Ventas General</h3>
                    <p className="text-5xl font-bold text-black my-2">
                        S/ {stats.totalVentasFormatted.integerPart}
                        <sup className="text-2xl font-semibold top-[-0.7em]">.{stats.totalVentasFormatted.decimalPart}</sup>
                    </p>
                    <div className="flex space-x-8 mt-4 pt-4 border-t">
                        <div className="flex items-center text-sm">
                            <div className="w-8 h-8 flex items-center justify-center bg-green-100 rounded-full mr-2">
                                <GoogleIcon name="arrow_downward" className="text-green-600 text-base" />
                            </div>
                            <div>
                                <p className="text-gray-500">Ingresos</p>
                                <p className="font-semibold text-gray-800">S/ {stats.totalVentasGeneral.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                            </div>
                        </div>
                        <div className="flex items-center text-sm">
                            <div className="w-8 h-8 flex items-center justify-center bg-red-100 rounded-full mr-2">
                                <GoogleIcon name="arrow_upward" className="text-red-600 text-base" />
                            </div>
                            <div>
                                <p className="text-gray-500">Egresos</p>
                                <p className="font-semibold text-gray-800">S/ {stats.totalEgresos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-shrink-0 lg:pl-8 lg:border-l border-gray-200 mt-8 lg:mt-0 w-full lg:w-auto">
                    <h4 className="text-lg font-semibold text-gray-500 mb-4">Ventas por Tipo de Transacción</h4>
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                        <TransactionTypeCard title="Efectivo" amount={stats.ventasPorMetodo.Efectivo} color="bg-[#FEF08A]" iconName="payments" iconColor="text-yellow-500" />
                        <TransactionTypeCard title="Tarjeta" amount={stats.ventasPorMetodo.Tarjeta} color="bg-[#BBF7D0]" iconName="credit_card" iconColor="text-green-500" />
                        <TransactionTypeCard title="Transferencia" amount={stats.ventasPorMetodo.Transferencia} color="bg-[#BAE6FD]" iconName="account_balance" iconColor="text-blue-500" />
                        <TransactionTypeCard title="Yape" amount={stats.ventasPorMetodo.Yape} color="bg-[#E9D5FF]" iconName="qr_code_2" iconColor="text-purple-500" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-6">
                 <StatCard 
                    title="Ventas Call Center" 
                    value={`S/ ${stats.totalVentasMarketing.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`} 
                    icon={<GoogleIcon name="campaign" className="text-blue-600" />}
                    iconBgClass="bg-blue-100"
                />
                 <StatCard 
                    title="Ventas Recepción" 
                    value={`S/ ${stats.ventasExtraRecepcion.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
                    icon={<GoogleIcon name="point_of_sale" className="text-cyan-600" />}
                    iconBgClass="bg-cyan-100"
                />
                <StatCard 
                    title="Ventas (Procedimientos)" 
                    value={`S/ ${stats.ventasExtraProcedimientos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
                    icon={<GoogleIcon name="vaccines" className="text-orange-600" />}
                    iconBgClass="bg-orange-100"
                />
                <StatCard 
                    title="Tasa de Conversión (Leads)" 
                    value={`${stats.tasaConversion.toFixed(1)}%`}
                    icon={<GoogleIcon name="trending_up" className="text-purple-600" />}
                    iconBgClass="bg-purple-100"
                />
                <StatCard 
                    title="% Aceptación Tratamiento" 
                    value={`${stats.tasaAceptacionTratamiento.toFixed(1)}%`}
                    icon={<GoogleIcon name="fact_check" className="text-teal-600" />}
                    iconBgClass="bg-teal-100"
                />
            </div>

            <MonthlySalesChart leads={leads} ventasExtra={ventasExtra} />
            <ServiceCategorySalesChart leads={leads} ventasExtra={ventasExtra} />
        </div>
    );
};
export default GeneralDashboard;