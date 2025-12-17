import React, { useState, useMemo } from 'react';
import KanbanView from './KanbanView.tsx';
import StatCard from '../dashboard/StatCard.tsx';
import { PlusIcon, MagnifyingGlassIcon, EyeIcon } from '../shared/Icons.tsx';
// FIX: Changed to named import
import { LeadFormModal } from './LeadFormModal';
import DateRangeFilter from '../shared/DateRangeFilter.tsx';
import { formatDateForDisplay, formatDateForInput } from '../../utils/time.ts';
import type { Lead, MetaCampaign, ClientSource, Service, ComprobanteElectronico, Campaign, Membership } from '../../types.ts';
import { LeadStatus } from '../../types.ts';

interface LeadsPageProps {
    leads: Lead[];
    metaCampaigns: MetaCampaign[];
    campaigns?: Campaign[];
    onSaveLead: (lead: Lead) => void;
    onDeleteLead: (leadId: number) => void;
    clientSources: ClientSource[];
    services: Service[];
    memberships?: Membership[];
    users?: any[];
    requestConfirmation: (message: string, onConfirm: () => void) => void;
    onSaveComprobante: (comprobante: ComprobanteElectronico) => Promise<void>;
    comprobantes: ComprobanteElectronico[];
}

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const STATUS_COLORS: Record<LeadStatus, string> = {
    [LeadStatus.Nuevo]: 'text-blue-600 bg-blue-100',
    [LeadStatus.Seguimiento]: 'text-yellow-600 bg-yellow-100',
    [LeadStatus.PorPagar]: 'text-orange-600 bg-orange-100',
    [LeadStatus.Agendado]: 'text-emerald-600 bg-emerald-100',
    [LeadStatus.Perdido]: 'text-rose-600 bg-rose-100',
};

const toDateOnlyTimestamp = (value?: string | Date | null): number | null => {
    if (!value) return null;
    const normalized = formatDateForInput(value);
    if (!normalized) return null;
    const parsed = new Date(`${normalized}T00:00:00`);
    const time = parsed.getTime();
    return Number.isNaN(time) ? null : time;
};

const LeadsTable: React.FC<{ leads: Lead[]; onEdit: (lead: Lead) => void }> = ({ leads, onEdit }) => {
    return (
        <div className="bg-white p-6 rounded-3xl shadow border border-slate-100">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Fecha Lead</th>
                            <th scope="col" className="px-6 py-3">Paciente</th>
                            <th scope="col" className="px-6 py-3">Servicio / Interés</th>
                            <th scope="col" className="px-6 py-3">Red Social</th>
                            <th scope="col" className="px-6 py-3">Campaña</th>
                            <th scope="col" className="px-6 py-3">Vendedor</th>
                            <th scope="col" className="px-6 py-3">Estado</th>
                            <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leads.map(lead => (
                            <tr
                                key={lead.id}
                                className="bg-white border-b last:border-0 hover:bg-[#fff4ea] transition-colors"
                            >
                                <td className="px-6 py-4">{formatDateForDisplay(lead.fechaLead || lead.fechaHoraAgenda || new Date())}</td>
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                    {lead.nombres} {lead.apellidos}
                                </th>
                                <td className="px-6 py-4 text-gray-600 truncate max-w-[200px]">
                                    {lead.servicios?.length ? lead.servicios.join(', ') : 'Sin definir'}
                                </td>
                                <td className="px-6 py-4">{lead.redSocial}</td>
                                <td className="px-6 py-4 truncate max-w-xs">{lead.anuncio}</td>
                                <td className="px-6 py-4">{lead.vendedor}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[lead.estado]}`}>
                                        {lead.estado}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onEdit(lead);
                                        }}
                                        className="font-medium text-[#aa632d] hover:underline flex items-center justify-center mx-auto"
                                    >
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


const LeadsPage: React.FC<LeadsPageProps> = ({ leads, campaigns, metaCampaigns, onSaveLead, onDeleteLead, clientSources, services, memberships, users, requestConfirmation, onSaveComprobante, comprobantes }) => {
    const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLeads = useMemo(() => {
        const fromTimestamp = dateRange.from ? new Date(`${dateRange.from}T00:00:00`).getTime() : null;
        const toTimestamp = dateRange.to ? new Date(`${dateRange.to}T23:59:59`).getTime() : null;

        const results = (fromTimestamp === null && toTimestamp === null)
            ? [...leads]
            : leads.filter(lead => {
                const leadTimestamp = toDateOnlyTimestamp(lead.fechaLead) ?? toDateOnlyTimestamp(lead.fechaHoraAgenda);
                if (leadTimestamp === null) {
                    return false;
                }
                if (fromTimestamp !== null && leadTimestamp < fromTimestamp) {
                    return false;
                }
                if (toTimestamp !== null && leadTimestamp > toTimestamp) {
                    return false;
                }
                return true;
            });

        if (viewMode === 'table' && searchTerm) {
            return results.filter(lead =>
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

    const handleSaveLead = async (leadToSave: Lead) => {
        await onSaveLead(leadToSave);
        // Update editingLead with the latest data after save
        if (leadToSave.id && editingLead) {
            // Find the updated lead from the leads array after the save operation
            // This ensures the modal shows the latest data
            setTimeout(() => {
                const updatedLead = leads.find(l => l.id === leadToSave.id);
                if (updatedLead) {
                    setEditingLead(updatedLead);
                }
            }, 100); // Small delay to ensure the parent data is updated
        }
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
        const agendados = filteredLeads.filter(l => l.estado === LeadStatus.Agendado).length;
        const totalPagos = filteredLeads.reduce((sum, l) => sum + l.montoPagado, 0);
        const porcentajeAgendados = totalLeads > 0 ? ((agendados / totalLeads) * 100).toFixed(1) : "0";

        const totalLlamadasRealizadas = filteredLeads.reduce((sum, lead) => sum + (lead.registrosLlamada?.length || 0), 0);
        const totalLlamadasContestadas = filteredLeads.reduce((sum, lead) => sum + (lead.registrosLlamada?.filter(reg => reg.estadoLlamada === 'Contesto').length || 0), 0);
        const porcentajeAgendadosPorLlamada = totalLlamadasContestadas > 0 ? ((agendados / totalLlamadasContestadas) * 100).toFixed(1) : "0";
        
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
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Pipeline</p>
                <h1 className="text-3xl font-bold text-slate-900">Gestión de Leads</h1>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
                <DateRangeFilter onApply={handleApplyDateFilter} />
                <button 
                    onClick={handleAddLead}
                    className="flex items-center bg-[#aa632d] text-white px-4 py-2 rounded-xl shadow hover:bg-[#8e5225] transition-colors"
                >
                    <PlusIcon className="mr-2 h-5 w-5" /> Registrar Lead
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <StatCard title="Total Leads" value={totalLeads.toString()} icon={<GoogleIcon name="groups" className="text-blue-500" />} iconBgClass="bg-blue-100" />
             <StatCard title="Leads Agendados" value={agendados.toString()} icon={<GoogleIcon name="event_available" className="text-green-500" />} iconBgClass="bg-green-100" />
             <StatCard title="Total Pagos (Leads)" value={`S/ ${totalPagos.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={<GoogleIcon name="paid" className="text-yellow-500" />} iconBgClass="bg-yellow-100" />
             <StatCard title="Tasa de Agendados" value={`${porcentajeAgendados}%`} icon={<GoogleIcon name="percent" className="text-purple-500" />} iconBgClass="bg-purple-100" />
        </div>

        <div className="space-y-4">
            <section className="space-y-4">
                <div className="bg-white p-4 rounded-2xl shadow flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="relative w-full md:w-auto">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por paciente, teléfono, campaña..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-80 bg-[#f9f9fa] border border-black/10 text-black rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => setViewMode('kanban')} className={`px-3 py-1.5 rounded-full text-sm font-medium ${viewMode === 'kanban' ? 'bg-[#aa632d] text-white' : 'bg-gray-200 text-gray-700'}`}>
                            Kanban
                        </button>
                        <button onClick={() => setViewMode('table')} className={`px-3 py-1.5 rounded-full text-sm font-medium ${viewMode === 'table' ? 'bg-[#aa632d] text-white' : 'bg-gray-200 text-gray-700'}`}>
                            Tabla
                        </button>
                    </div>
                </div>

                {viewMode === 'kanban' ? (
                    <KanbanView leads={filteredLeads} onCardClick={handleEditLead} />
                ) : (
                    <LeadsTable leads={filteredLeads} onEdit={handleEditLead} />
                )}
            </section>
        </div>

        <LeadFormModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSaveLead}
            onDelete={onDeleteLead}
            lead={editingLead}
            metaCampaigns={metaCampaigns}
            campaigns={campaigns}
            clientSources={clientSources}
            services={services}
            memberships={memberships}
            users={users}
            requestConfirmation={requestConfirmation}
            onSaveComprobante={onSaveComprobante}
            comprobantes={comprobantes}
                />
        </div>
    );
};

export default LeadsPage;