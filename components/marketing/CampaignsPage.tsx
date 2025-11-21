

import React, { useState, useMemo } from 'react';
import StatCard from '../dashboard/StatCard.tsx';
import { PlusIcon } from '../shared/Icons.tsx';
import CampaignFormModal from './CampaignFormModal.tsx';
import MetaCampaignFormModal from './MetaCampaignFormModal.tsx';
import AnunciosTable from './AnunciosTable.tsx';
import DateRangeFilter from '../shared/DateRangeFilter.tsx';
import type { Campaign, Lead, MetaCampaign } from '../../types.ts';
import { formatDateForDisplay, parseDate } from '../../utils/time';

interface CampaignsPageProps {
    campaigns: Campaign[];
    leads: Lead[];
    onSaveCampaign: (campaign: Campaign) => void;
    onDeleteCampaign: (campaignId: number) => void;
    metaCampaigns: MetaCampaign[];
    onSaveMetaCampaign: (campaign: MetaCampaign) => void;
    onDeleteMetaCampaign: (campaignId: number) => void;
    requestConfirmation: (message: string, onConfirm: () => void) => void;
}

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const MetaCampaignsTable: React.FC<{ campaigns: MetaCampaign[], onEdit: (campaign: MetaCampaign) => void }> = ({ campaigns, onEdit }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow mt-6">
            <h3 className="text-lg font-semibold text-black mb-4">Campañas Meta</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nombre Campaña</th>
                            <th scope="col" className="px-6 py-3">Fecha Inicio</th>
                            <th scope="col" className="px-6 py-3">Fecha Fin</th>
                            <th scope="col" className="px-6 py-3">Categoría</th>
                            <th scope="col" className="px-6 py-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {campaigns.map(campaign => (
                            <tr key={campaign.id} className="bg-white border-b hover:bg-gray-50">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                    {campaign.nombre}
                                </th>
                                <td className="px-6 py-4">{formatDateForDisplay(campaign.fechaInicio)}</td>
                                <td className="px-6 py-4">{formatDateForDisplay(campaign.fechaFin)}</td>
                                <td className="px-6 py-4">{campaign.categoria}</td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => onEdit(campaign)}
                                        className="font-medium text-[#aa632d] hover:underline"
                                    >
                                        Editar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {campaigns.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <p>No se encontraron campañas meta.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const CampaignsPage: React.FC<CampaignsPageProps> = ({ 
    campaigns, leads, onSaveCampaign, onDeleteCampaign, 
    metaCampaigns, onSaveMetaCampaign, onDeleteMetaCampaign, requestConfirmation 
}) => {
    const [activeTab, setActiveTab] = useState<'campanas' | 'anuncios' | 'resultados'>('anuncios');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
    const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
    const [editingMetaCampaign, setEditingMetaCampaign] = useState<MetaCampaign | null>(null);
    const [dateRange, setDateRange] = useState({ from: '', to: '' });

    const filteredCampaigns = useMemo(() => {
        if (!dateRange.from && !dateRange.to) {
            return campaigns;
        }

        const fromDate = dateRange.from ? parseDate(dateRange.from) : null;
        const toDate = dateRange.to ? (() => {
            const d = parseDate(dateRange.to, true);
            if (!d) return parseDate(dateRange.to);
            const end = new Date(d.getTime());
            end.setUTCHours(23, 59, 59, 999);
            return end;
        })() : null;

        return campaigns.filter(campaign => {
            const campaignDate = parseDate(campaign.fecha) ?? null;
            if (fromDate && campaignDate < fromDate) {
                return false;
            }
            if (toDate && campaignDate > toDate) {
                return false;
            }
            return true;
        });
    }, [campaigns, dateRange]);

    const handleAddCampaign = () => {
        setEditingCampaign(null);
        setIsModalOpen(true);
    };

    const handleEditCampaign = (campaign: Campaign) => {
        setEditingCampaign(campaign);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCampaign(null);
    };

    const handleSaveCampaign = (campaignToSave: Campaign) => {
        onSaveCampaign(campaignToSave);
        handleCloseModal();
    };
    
    const handleAddMetaCampaign = () => {
        setEditingMetaCampaign(null);
        setIsMetaModalOpen(true);
    };
    
    const handleEditMetaCampaign = (campaign: MetaCampaign) => {
        setEditingMetaCampaign(campaign);
        setIsMetaModalOpen(true);
    };

    const handleCloseMetaModal = () => {
        setIsMetaModalOpen(false);
        setEditingMetaCampaign(null);
    };

    const handleSaveMetaCampaign = (campaignToSave: MetaCampaign) => {
        onSaveMetaCampaign(campaignToSave);
        handleCloseMetaModal();
    };


    const handleApplyDateFilter = (dates: { from: string, to: string }) => {
        setDateRange(dates);
    };

    const campaignStats = useMemo(() => {
        const totalGastado = filteredCampaigns.reduce((sum, c) => sum + c.importeGastado, 0);
        const totalLeads = filteredCampaigns.reduce((sum, c) => sum + c.resultados, 0);
        const avgCostoPorResultado = totalLeads > 0 ? totalGastado / totalLeads : 0;
        
        const campaignNames = new Set(filteredCampaigns.map(c => c.nombreAnuncio));
        const leadsFromCampaigns = leads.filter(l => campaignNames.has(l.anuncio));
        const agendadosFromCampaigns = leadsFromCampaigns.filter(l => l.estado === 'Agendado').length;

        const porcentajeAgendados = totalLeads > 0 ? (agendadosFromCampaigns / totalLeads) * 100 : 0;

        return {
            totalGastado,
            totalLeads,
            avgCostoPorResultado,
            porcentajeAgendados
        };
    }, [filteredCampaigns, leads]);

    const campaignResults = useMemo(() => {
        // Agrupar campañas por nombreAnuncio para obtener datos únicos
        const uniqueAnuncios = new Map<string, {
            categoria: string;
            totalLeads: number;
            totalAgendados: number;
            costos: number[];
            gastados: number[];
        }>();

        filteredCampaigns.forEach(campaign => {
            const existing = uniqueAnuncios.get(campaign.nombreAnuncio);
            if (existing) {
                existing.costos.push(campaign.costoPorResultado);
                existing.gastados.push(campaign.importeGastado);
            } else {
                uniqueAnuncios.set(campaign.nombreAnuncio, {
                    categoria: campaign.categoria,
                    totalLeads: 0,
                    totalAgendados: 0,
                    costos: [campaign.costoPorResultado],
                    gastados: [campaign.importeGastado]
                });
            }
        });

        // Contar leads por anuncio
        leads.forEach(lead => {
            const anuncioData = uniqueAnuncios.get(lead.anuncio);
            if (anuncioData) {
                anuncioData.totalLeads++;
                if (lead.estado === 'Agendado') {
                    anuncioData.totalAgendados++;
                }
            }
        });

        // Convertir a array y calcular promedios
        return Array.from(uniqueAnuncios.entries()).map(([nombreAnuncio, data]) => {
            const costoPromedio = data.costos.reduce((a, b) => a + b, 0) / data.costos.length;
            const totalGastado = data.gastados.reduce((a, b) => a + b, 0);
            const porcentajeAgendados = data.totalLeads > 0 ? (data.totalAgendados / data.totalLeads) * 100 : 0;

            return {
                categoria: data.categoria,
                nombreAnuncio,
                totalLeads: data.totalLeads,
                totalAgendados: data.totalAgendados,
                porcentajeAgendados,
                costoPromedio,
                totalGastado
            };
        });
    }, [filteredCampaigns, leads]);

  return (
    <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-2xl font-bold text-black mb-4 md:mb-0">Gestión de Campañas</h1>
             <div className="flex items-center space-x-3">
                <DateRangeFilter onApply={handleApplyDateFilter} />
                <button 
                    onClick={handleAddMetaCampaign}
                    className="flex items-center bg-white text-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                    <PlusIcon className="mr-2 h-5 w-5" /> Registrar Campaña Meta
                </button>
                <button 
                    onClick={handleAddCampaign}
                    className="flex items-center bg-[#aa632d] text-white px-4 py-2 rounded-lg shadow hover:bg-[#8e5225] transition-colors"
                >
                    <PlusIcon className="mr-2 h-5 w-5" /> Registrar Anuncio
                </button>
            </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
             <StatCard title="Total Gastado" value={`S/ ${campaignStats.totalGastado.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={<GoogleIcon name="paid" className="text-green-500" />} iconBgClass="bg-green-100" />
             <StatCard title="Cantidad de Leads" value={campaignStats.totalLeads.toString()} icon={<GoogleIcon name="groups" className="text-blue-500" />} iconBgClass="bg-blue-100" />
             <StatCard title="Costo por Resultado (Prom.)" value={`S/ ${campaignStats.avgCostoPorResultado.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={<GoogleIcon name="monitoring" className="text-yellow-500" />} iconBgClass="bg-yellow-100" />
             <StatCard title="% Agendados" value={`${campaignStats.porcentajeAgendados.toFixed(1)}%`} icon={<GoogleIcon name="show_chart" className="text-indigo-500" />} iconBgClass="bg-indigo-100" />
        </div>

        <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <button
                    onClick={() => setActiveTab('anuncios')}
                    className={`${
                        activeTab === 'anuncios'
                            ? 'border-[#aa632d] text-[#aa632d]'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                    <GoogleIcon name="campaign" className="mr-2" />
                    Anuncios
                </button>
                <button
                     onClick={() => setActiveTab('campanas')}
                     className={`${
                        activeTab === 'campanas'
                            ? 'border-[#aa632d] text-[#aa632d]'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                    <GoogleIcon name="layers" className="mr-2" />
                    Campañas Meta
                </button>
                <button
                     onClick={() => setActiveTab('resultados')}
                     className={`${
                        activeTab === 'resultados'
                            ? 'border-[#aa632d] text-[#aa632d]'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                    <GoogleIcon name="analytics" className="mr-2" />
                    Resultado de campaña
                </button>
            </nav>
        </div>

        {activeTab === 'anuncios' && <AnunciosTable campaigns={filteredCampaigns} onEdit={handleEditCampaign} />}
        {activeTab === 'campanas' && <MetaCampaignsTable campaigns={metaCampaigns} onEdit={handleEditMetaCampaign} />}
        {activeTab === 'resultados' && (
            <div className="bg-white p-6 rounded-lg shadow mt-6">
                <h3 className="text-lg font-semibold text-black mb-4">Resultado de Campaña</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nombre Campaña</th>
                                <th scope="col" className="px-6 py-3">Nombre Anuncio</th>
                                <th scope="col" className="px-6 py-3">Total Leads</th>
                                <th scope="col" className="px-6 py-3">Total Agendados</th>
                                <th scope="col" className="px-6 py-3">% Agendados</th>
                                <th scope="col" className="px-6 py-3">Costo Promedio</th>
                                <th scope="col" className="px-6 py-3">Total Gastado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaignResults.map((result, index) => (
                                <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{result.categoria}</td>
                                    <td className="px-6 py-4">{result.nombreAnuncio}</td>
                                    <td className="px-6 py-4">{result.totalLeads}</td>
                                    <td className="px-6 py-4">{result.totalAgendados}</td>
                                    <td className="px-6 py-4">{result.porcentajeAgendados.toFixed(1)}%</td>
                                    <td className="px-6 py-4">S/ {result.costoPromedio.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className="px-6 py-4">S/ {result.totalGastado.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {campaignResults.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <p>No se encontraron resultados de campañas.</p>
                        </div>
                    )}
                </div>
            </div>
        )}
        

        <CampaignFormModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSaveCampaign}
            onDelete={onDeleteCampaign}
            campaign={editingCampaign}
            metaCampaigns={metaCampaigns}
            requestConfirmation={requestConfirmation}
        />
        
        <MetaCampaignFormModal
            isOpen={isMetaModalOpen}
            onClose={handleCloseMetaModal}
            onSave={handleSaveMetaCampaign}
            campaign={editingMetaCampaign}
        />
    </div>
  );
};

export default CampaignsPage;