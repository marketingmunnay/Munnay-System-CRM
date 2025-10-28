import React, { useState, useMemo } from 'react';
import KanbanView from './KanbanView.tsx';
import StatCard from '../dashboard/StatCard.tsx';
import { PlusIcon, MagnifyingGlassIcon, EyeIcon } from '../shared/Icons.tsx';
// FIX: Changed to named import
import LeadFormModal from './LeadFormModal.tsx';
import DateRangeFilter from '../shared/DateRangeFilter.tsx';
import type { Lead, MetaCampaign, ClientSource, Service, ComprobanteElectronico } from '../../types.ts';
import { LeadStatus } from '../../types.ts';

interface LeadsPageProps {
    leads: Lead[];
    metaCampaigns: MetaCampaign[];
    onSaveLead: (lead: Lead) => void;
    onDeleteLead: (leadId: number) => void;
    clientSources: ClientSource[];
    services: Service[];
    requestConfirmation: (message: string, onConfirm: () => void) => void;
    onSaveComprobante: (comprobante: ComprobanteElectronico) => Promise<void>;
    comprobantes: ComprobanteElectronico[];
}

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const LeadsTable: React.FC<{ leads: Lead[], onEdit: (lead: Lead) => void }> = ({ leads, onEdit }) => {
    const statusColor: Record<LeadStatus, string> = {
        [LeadStatus.Nuevo]: 'text-blue-600 bg-blue-100',
        [LeadStatus.Seguimiento]: 'text-yellow-600 bg-yellow-100',
        [LeadStatus.PorPagar]: 'text-orange-600 bg-orange-100',
        [LeadStatus.Agendado]: 'text-green-600 bg-green-100',
        [LeadStatus.Perdido]: 'text-red-600 bg-red-100',
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Fecha Lead</th>
                            <th scope="col" className="px-6 py-3">Paciente</th>
                            <th scope="col" className="px-6 py-3">Red Social</th>
                            <th scope="col" className="px-6 py-3">Campaña</th>
                            <th scope="col" className="px-6 py-3">Vendedor</th>
                            <th scope="col" className="px-6 py-3">Estado</th>
                            <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leads.map(lead => (
                            <tr key={lead.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4">{new Date(lead.fechaLead + 'T00:00:00').toLocaleDateString('es-PE')}</td>
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                    {lead.nombres} {lead.apellidos}
                                </th>
                                <td className="px-6 py-4">{lead.redSocial}</td>
                                <td className="px-6 py-4 truncate max-w-xs">{lead.anuncio}</td>
                                <td className="px-6 py-4">{lead.vendedor}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor[lead.estado]}`}>
                                        {lead.estado}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => onEdit(lead)} className="font-medium text-[#aa632d] hover:underline flex items-center justify-center mx-auto">
                                        <EyeIcon className="w-4 h-4 mr-1"/> Editar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {leads.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <p>No se encontraron leads que coincidan con los filtros.</p>
                    </div>
                )}
            </div>
        </div>
    );
};


const LeadsPage: React.FC<LeadsPageProps> = ({ leads, metaCampaigns, onSaveLead, onDeleteLead, clientSources, services, requestConfirmation, onSaveComprobante, comprobantes }) => {
    const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLeads = useMemo(() => {
        let results = leads;

        if (dateRange.from || dateRange.to) {
            const fromDate = dateRange.from ? new Date(`${dateRange.from}T00:00:00`) : null;
            const toDate = dateRange.to ? new Date(`${dateRange.to}T23:59:59`) : null;

            results = results.filter(lead => {
                const leadDate = new Date(`${lead.fechaLead}T00:00:00`);
                if (fromDate && leadDate < fromDate) {
                    return false;
                }
                if (toDate && leadDate > toDate) {
                    return false;
                }
                return true;
            });
        }

        if (viewMode === 'table' && searchTerm) {
            results = results.filter(lead =>
                `${lead.nombres} ${lead.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.numero.includes(searchTerm) ||
                lead.anuncio.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        return results;
    }, [leads, dateRange, viewMode, searchTerm]);

    const handleAddLead = () => {
        setEditingLead(null);
        setIsModalOpen(true);
    };

    const handleEditLead = (lead: Lead) => {
        setEditingLead(lead);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingLead(null);
    };

    const handleSaveLead = (leadToSave: Lead) => {
        onSaveLead(leadToSave);
        handleCloseModal();
    };
    
    const handleApplyDateFilter = (dates: { from: string, to: string }) => {
        setDateRange(dates);
    };

    const {
        totalLeads,
        agendados,
        totalPagos,
        porcentajeAgendados,
        totalLlamadasRealizadas,
        totalLlamadasContestadas,
        porcentajeAgendadosPorLlamada
    } = useMemo(() => {
        const totalLeads = filteredLeads.length;
        const agendados = filteredLeads.filter(l => l.estado === 'Agendado').length;
        const totalPagos = filteredLeads.reduce((sum, l) => sum + l.montoPagado, 0);
        const porcentajeAgendados = totalLeads > 0 ? ((agendados / totalLeads) * 100).toFixed(1) : "0";

        const totalLlamadasRealizadas = filteredLeads.reduce((sum, lead) => sum + (lead.registrosLlamada?.length || 0), 0);
        const totalLlamadasContestadas = filteredLeads.reduce((sum, lead) => {
            const contestadas = lead.registrosLlamada?.filter(r => r.estadoLlamada === 'Contesto').length || 0;
            return sum + contestadas;
        }, 0);
        const porcentajeAgendadosPorLlamada = totalLlamadasRealizadas > 0 ? ((agendados / totalLlamadasRealizadas) * 100).toFixed(1) : "0";

        return {
            totalLeads,
            agendados,
            totalPagos,
            porcentajeAgendados,
            totalLlamadasRealizadas,
            totalLlamadasContestadas,
            porcentajeAgendadosPorLlamada
        };
    }, [filteredLeads]);


  return (
    <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-2xl font-bold text-black mb-4 md:mb-0">Gestión de Leads</h1>
            <div className="flex items-center space-x-3">
                <DateRangeFilter onApply={handleApplyDateFilter} />
                <button 
                    onClick={handleAddLead}
                    className="flex items-center bg-[#aa632d] text-white px-4 py-2 rounded-lg shadow hover:bg-[#8e5225] transition-colors"
                >
                    <PlusIcon className="mr-2 h-5 w-5" /> Añadir Lead
                </button>
            </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
             <StatCard title="Total Leads (Rango)" value={totalLeads.toString()} icon={<GoogleIcon name="groups" className="text-blue-500" />} iconBgClass="bg-blue-100" />
             <StatCard title="Total Agendados" value={agendados.toString()} icon={<GoogleIcon name="event_available" className="text-green-500" />} iconBgClass="bg-green-100" />
             <StatCard title="Total Pagos" value={`S/ ${totalPagos.toLocaleString()}`} icon={<GoogleIcon name="payments" className="text-yellow-500" />} iconBgClass="bg-yellow-100" />
             <StatCard title="% Agendados" value={`${porcentajeAgendados}%`} icon={<GoogleIcon name="show_chart" className="text-indigo-500" />} iconBgClass="bg-indigo-100" />
             <StatCard title="Total Llamadas Realizadas" value={totalLlamadasRealizadas.toString()} icon={<GoogleIcon name="call" className="text-cyan-500" />} iconBgClass="bg-cyan-100" />
             <StatCard title="Total Llamadas Contestadas" value={totalLlamadasContestadas.toString()} icon={<GoogleIcon name="ring_volume" className="text-teal-500" />} iconBgClass="bg-teal-100" />
             <StatCard title="% Agendados / Llamadas" value={`${porcentajeAgendadosPorLlamada}%`} icon={<GoogleIcon name="percent" className="text-rose-500" />} iconBgClass="bg-rose-100" />
        </div>

        {/* View controls */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row justify-between items-center">
             <div className="relative w-full md:w-auto">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Buscar por nombre, telf, campaña..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={viewMode !== 'table'}
                    className="w-full md:w-64 bg-[#f9f9fa] border border-black text-black rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d] disabled:bg-gray-200"
                />
            </div>
             <div className="flex items-center space-x-2 mt-4 md:mt-0">
                 <button onClick={() => setViewMode('kanban')} className={`px-3 py-1 rounded-md text-sm font-medium ${viewMode === 'kanban' ? 'bg-[#aa632d] text-white' : 'bg-gray-200 text-gray-700'}`}>
                     Kanban
                 </button>
                  <button onClick={() => setViewMode('table')} className={`px-3 py-1 rounded-md text-sm font-medium ${viewMode === 'table' ? 'bg-[#aa632d] text-white' : 'bg-gray-200 text-gray-700'}`}>
                     Tabla
                 </button>
             </div>
        </div>

        {viewMode === 'kanban' ? (
            <KanbanView leads={filteredLeads} onCardClick={handleEditLead} />
        ) : (
            <LeadsTable leads={filteredLeads} onEdit={handleEditLead} />
        )}

        <LeadFormModal 
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSaveLead}
            onDelete={onDeleteLead}
            lead={editingLead}
            metaCampaigns={metaCampaigns}
            clientSources={clientSources}
            services={services}
            requestConfirmation={requestConfirmation}
            onSaveComprobante={onSaveComprobante}
            comprobantes={comprobantes}
        />
    </div>
  );
};

export default LeadsPage;