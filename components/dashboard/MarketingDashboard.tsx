import React, { useMemo } from 'react';
import type { Lead, Campaign } from '../../types.ts';
import StatCard from './StatCard.tsx';

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

interface MarketingDashboardProps {
    leads: Lead[];
    campaigns: Campaign[];
}

const MarketingDashboard: React.FC<MarketingDashboardProps> = ({ leads, campaigns }) => {
    const stats = useMemo(() => {
        const totalLeads = leads.length;
        const totalAgendados = leads.filter(l => l.estado === 'Agendado').length;
        const totalPagosCitas = leads.reduce((sum, l) => sum + l.montoPagado, 0);
        
        const totalGastadoCampanas = campaigns.reduce((sum, c) => sum + c.importeGastado, 0);
        const totalResultadosCampanas = campaigns.reduce((sum, c) => sum + c.resultados, 0);
        const costoPromedioResultado = totalResultadosCampanas > 0 ? totalGastadoCampanas / totalResultadosCampanas : 0;
        
        const porcentajeAgendados = totalLeads > 0 ? (totalAgendados / totalLeads) * 100 : 0;

        return { totalLeads, totalAgendados, totalPagosCitas, costoPromedioResultado, porcentajeAgendados };
    }, [leads, campaigns]);

    const campaignPerformance = useMemo(() => {
        return campaigns.map(campaign => {
            const leadsFromCampaign = leads.filter(lead => lead.anuncio === campaign.nombreAnuncio);
            const agendadosFromCampaign = leadsFromCampaign.filter(lead => lead.estado === 'Agendado').length;
            const conversion = leadsFromCampaign.length > 0 ? (agendadosFromCampaign / leadsFromCampaign.length) * 100 : 0;
            return {
                ...campaign,
                generatedLeads: leadsFromCampaign.length,
                agendados: agendadosFromCampaign,
                conversion,
            };
        }).sort((a, b) => b.conversion - a.conversion);
    }, [campaigns, leads]);

    const topCampaigns = campaignPerformance.slice(0, 5);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard 
                    title="Total Leads" 
                    value={stats.totalLeads.toString()} 
                    icon={<GoogleIcon name="groups" className="text-munnay-600" />}
                    iconBgClass="bg-munnay-100"
                />
                <StatCard 
                    title="Total Agendados" 
                    value={stats.totalAgendados.toString()} 
                    icon={<GoogleIcon name="event_available" className="text-munnay-700" />}
                    iconBgClass="bg-munnay-200"
                />
                <StatCard 
                    title="Monto Citas Pagadas" 
                    value={`S/ ${stats.totalPagosCitas.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`} 
                    icon={<GoogleIcon name="payments" className="text-munnay-500" />}
                    iconBgClass="bg-munnay-100"
                />
                <StatCard 
                    title="Costo Prom. por Resultado" 
                    value={`S/ ${stats.costoPromedioResultado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`} 
                    icon={<GoogleIcon name="monitoring" className="text-munnay-600" />}
                    iconBgClass="bg-munnay-200"
                />
                <StatCard 
                    title="Porcentaje de Agendados" 
                    value={`${stats.porcentajeAgendados.toFixed(1)}%`} 
                    icon={<GoogleIcon name="show_chart" className="text-munnay-700" />}
                    iconBgClass="bg-munnay-100"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-soft-lg border border-munnay-100">
                    <h3 className="text-lg font-semibold text-munnay-900 mb-4">Rendimiento de Campañas</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-munnay-800 uppercase bg-munnay-50">
                                <tr>
                                    <th className="px-4 py-3 rounded-tl-xl">Campaña</th>
                                    <th className="px-4 py-3">Leads Generados</th>
                                    <th className="px-4 py-3">Agendados</th>
                                    <th className="px-4 py-3 rounded-tr-xl">Conversión</th>
                                </tr>
                            </thead>
                            <tbody>
                                {campaignPerformance.map(c => (
                                    <tr key={c.id} className="border-b border-munnay-100 bg-white hover:bg-munnay-50 transition-all duration-300">
                                        <td className="px-4 py-3 font-medium text-munnay-900">{c.nombreAnuncio}</td>
                                        <td className="px-4 py-3 text-gray-700">{c.generatedLeads}</td>
                                        <td className="px-4 py-3 text-gray-700">{c.agendados}</td>
                                        <td className="px-4 py-3 font-semibold text-munnay-700">{c.conversion.toFixed(1)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-soft-lg border border-munnay-100">
                    <h3 className="text-lg font-semibold text-munnay-900 mb-4">Top 5 Campañas Exitosas</h3>
                    <ul className="space-y-3">
                        {topCampaigns.map((c, index) => (
                            <li key={c.id} className="flex justify-between items-center text-sm p-3 bg-munnay-50 rounded-xl hover:shadow-soft transition-all duration-300">
                                <span className="font-medium text-munnay-800 truncate pr-4">{index + 1}. {c.nombreAnuncio}</span>
                                <span className="font-bold text-munnay-700 bg-munnay-200 px-3 py-1 rounded-full">{c.conversion.toFixed(1)}%</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};
export default MarketingDashboard;