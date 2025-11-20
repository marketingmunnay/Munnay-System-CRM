import React, { useMemo } from 'react';
import type { Lead, Campaign } from '../../types.ts';
import { parseDate } from '../../utils/time';
import StatCard from './StatCard.tsx';

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

interface MarketingDashboardProps {
    leads: Lead[];
    campaigns: Campaign[];
    dateRange: { from: string; to: string };
}

const MarketingDashboard: React.FC<MarketingDashboardProps> = ({ leads, campaigns, dateRange }) => {
    const { filteredLeads, filteredCampaigns } = useMemo(() => {
        const { from, to } = dateRange;
        
        const checkDate = (itemDateStr?: string) => {
            if (!from && !to) return true;
            if (!itemDateStr) return false;
            
            const itemDate = parseDate(itemDateStr) ?? new Date(itemDateStr);
            const fromDate = from ? (parseDate(from) ?? new Date(`${from}T00:00:00`)) : null;
            const toDate = to ? (parseDate(to) ?? new Date(`${to}T23:59:59`)) : null;
            
            if (fromDate && itemDate < fromDate) return false;
            if (toDate && itemDate > toDate) return false;
            return true;
        };
        
        return {
            filteredLeads: leads.filter(l => checkDate(l.fechaLead)),
            filteredCampaigns: campaigns.filter(c => checkDate(c.fecha))
        };
    }, [leads, campaigns, dateRange]);
    
    const stats = useMemo(() => {
        const totalLeads = filteredLeads.length;
        const totalAgendados = filteredLeads.filter(l => l.estado === 'Agendado').length;
        const totalPagosCitas = filteredLeads.reduce((sum, l) => sum + l.montoPagado, 0);
        
        const totalGastadoCampanas = filteredCampaigns.reduce((sum, c) => sum + c.importeGastado, 0);
        const totalResultadosCampanas = filteredCampaigns.reduce((sum, c) => sum + c.resultados, 0);
        const costoPromedioResultado = totalResultadosCampanas > 0 ? totalGastadoCampanas / totalResultadosCampanas : 0;
        
        const porcentajeAgendados = totalLeads > 0 ? (totalAgendados / totalLeads) * 100 : 0;

        return { totalLeads, totalAgendados, totalPagosCitas, costoPromedioResultado, porcentajeAgendados };
    }, [filteredLeads, filteredCampaigns]);

    const campaignPerformance = useMemo(() => {
        return filteredCampaigns.map(campaign => {
            const leadsFromCampaign = filteredLeads.filter(lead => lead.anuncio === campaign.nombreAnuncio);
            const agendadosFromCampaign = leadsFromCampaign.filter(lead => lead.estado === 'Agendado').length;
            const conversion = leadsFromCampaign.length > 0 ? (agendadosFromCampaign / leadsFromCampaign.length) * 100 : 0;
            return {
                ...campaign,
                generatedLeads: leadsFromCampaign.length,
                agendados: agendadosFromCampaign,
                conversion,
            };
        }).sort((a, b) => b.conversion - a.conversion);
    }, [filteredCampaigns, filteredLeads]);

    const topCampaigns = campaignPerformance.slice(0, 5);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard 
                    title="Total Leads" 
                    value={stats.totalLeads.toString()} 
                    icon={<GoogleIcon name="groups" className="text-blue-600" />}
                    iconBgClass="bg-blue-100"
                />
                <StatCard 
                    title="Total Agendados" 
                    value={stats.totalAgendados.toString()} 
                    icon={<GoogleIcon name="event_available" className="text-green-600" />}
                    iconBgClass="bg-green-100"
                />
                <StatCard 
                    title="Monto Citas Pagadas" 
                    value={`S/ ${stats.totalPagosCitas.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`} 
                    icon={<GoogleIcon name="payments" className="text-yellow-600" />}
                    iconBgClass="bg-yellow-100"
                />
                <StatCard 
                    title="Costo Prom. por Resultado" 
                    value={`S/ ${stats.costoPromedioResultado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`} 
                    icon={<GoogleIcon name="monitoring" className="text-red-600" />}
                    iconBgClass="bg-red-100"
                />
                <StatCard 
                    title="Porcentaje de Agendados" 
                    value={`${stats.porcentajeAgendados.toFixed(1)}%`} 
                    icon={<GoogleIcon name="show_chart" className="text-indigo-600" />}
                    iconBgClass="bg-indigo-100"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-blue-50 p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Rendimiento de Campañas</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2">Campaña</th>
                                    <th className="px-4 py-2">Leads Generados</th>
                                    <th className="px-4 py-2">Agendados</th>
                                    <th className="px-4 py-2">Conversión</th>
                                </tr>
                            </thead>
                            <tbody>
                                {campaignPerformance.map(c => (
                                    <tr key={c.id} className="border-b bg-white">
                                        <td className="px-4 py-2 font-medium text-gray-900">{c.nombreAnuncio}</td>
                                        <td className="px-4 py-2">{c.generatedLeads}</td>
                                        <td className="px-4 py-2">{c.agendados}</td>
                                        <td className="px-4 py-2 font-semibold">{c.conversion.toFixed(1)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-green-50 p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 5 Campañas Exitosas</h3>
                    <ul className="space-y-3">
                        {topCampaigns.map((c, index) => (
                            <li key={c.id} className="flex justify-between items-center text-sm p-2 bg-white rounded-md">
                                <span className="font-medium text-gray-700 truncate pr-4">{index + 1}. {c.nombreAnuncio}</span>
                                <span className="font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">{c.conversion.toFixed(1)}%</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};
export default MarketingDashboard;