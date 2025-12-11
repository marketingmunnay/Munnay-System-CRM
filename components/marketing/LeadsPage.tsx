import React, { useState, useMemo, useEffect } from 'react';
import KanbanView from './KanbanView.tsx';
import StatCard from '../dashboard/StatCard.tsx';
import { PlusIcon, MagnifyingGlassIcon, EyeIcon, CalendarIcon, ClockIcon, UserIcon, CurrencyDollarIcon } from '../shared/Icons.tsx';
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

const LeadsTable: React.FC<{ leads: Lead[]; onEdit: (lead: Lead) => void; onPreview: (lead: Lead) => void }> = ({ leads, onEdit, onPreview }) => {
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
                                onClick={() => onPreview(lead)}
                                className="bg-white border-b last:border-0 hover:bg-[#fff4ea] cursor-pointer transition-colors"
                            >
                                <td className="px-6 py-4">{formatDateForDisplay(lead.fechaLead || new Date())}</td>
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
    const [selectedLeadPreview, setSelectedLeadPreview] = useState<Lead | null>(null);

    const filteredLeads = useMemo(() => {
        let results = leads;

        if (dateRange.from || dateRange.to) {
            results = results.filter(lead => {
                if (!lead.fechaLead) return false;

                const leadDate = formatDateForInput(lead.fechaLead);

                if (!leadDate) return false;
                if (dateRange.from && leadDate < dateRange.from) {
                    return false;
                }
                if (dateRange.to && leadDate > dateRange.to) {
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

    useEffect(() => {
        if (filteredLeads.length === 0) {
            setSelectedLeadPreview(null);
            return;
        }
        setSelectedLeadPreview(prev => {
            if (prev && filteredLeads.some(lead => lead.id === prev.id)) {
                return prev;
            }
            return filteredLeads[0];
        });
    }, [filteredLeads]);

    const handleSelectLead = (lead: Lead, openModal = false) => {
        setSelectedLeadPreview(lead);
        if (openModal) {
            setEditingLead(lead);
            setIsModalOpen(true);
        }
    };

    const handleAddLead = () => {
        setEditingLead(null);
        setIsModalOpen(true);
    };

    const handleEditLead = (lead: Lead) => handleSelectLead(lead, true);

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

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
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
                    <KanbanView leads={filteredLeads} onCardClick={(lead) => handleSelectLead(lead, true)} />
                ) : (
                    <LeadsTable leads={filteredLeads} onEdit={handleEditLead} onPreview={(lead) => handleSelectLead(lead, false)} />
                )}
            </section>

            <LeadInsightPanel lead={selectedLeadPreview} onEdit={(lead) => handleSelectLead(lead, true)} />
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

const LeadInsightPanel: React.FC<{ lead: Lead | null; onEdit: (lead: Lead) => void }> = ({ lead, onEdit }) => {
    if (!lead) {
        return (
            <aside className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center text-center text-slate-500">
                <p className="text-sm font-semibold">Selecciona un lead</p>
                <p className="text-xs mt-1">Previsualiza detalles, seguimiento y próximos compromisos.</p>
            </aside>
        );
    }

    const agendaLabel = lead.fechaHoraAgenda
        ? new Date(lead.fechaHoraAgenda).toLocaleString('es-PE', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        })
        : 'Sin agenda';

    const nextCallLabel = lead.fechaVolverLlamar
        ? `${formatDateForDisplay(lead.fechaVolverLlamar)} · ${lead.horaVolverLlamar || '—'}`
        : 'No programada';

    const lastCalls = [...(lead.registrosLlamada || [])]
        .sort((a, b) => (b.numeroLlamada || 0) - (a.numeroLlamada || 0))
        .slice(0, 3);

    return (
        <aside className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4 sticky top-24">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Lead seleccionado</p>
                    <h3 className="text-xl font-semibold text-slate-900">{lead.nombres} {lead.apellidos}</h3>
                    <p className="text-sm text-slate-500">{lead.numero} · {lead.email || 'Sin correo'}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[lead.estado]}`}>
                    {lead.estado}
                </span>
            </div>

            <div className="grid gap-3">
                <div className="rounded-2xl border border-slate-200 p-4 flex justify-between items-center">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Próxima llamada</p>
                        <p className="text-sm font-semibold text-slate-800">{nextCallLabel}</p>
                    </div>
                    <ClockIcon className="w-5 h-5 text-slate-400" />
                </div>
                <div className="rounded-2xl border border-slate-200 p-4 flex justify-between items-center">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Agenda</p>
                        <p className="text-sm font-semibold text-slate-800">{agendaLabel}</p>
                        <p className="text-xs text-slate-500">{lead.recursoId ? `Recurso: ${lead.recursoId}` : 'Sin recurso asignado'}</p>
                    </div>
                    <CalendarIcon className="w-5 h-5 text-slate-400" />
                </div>
                <div className="rounded-2xl border border-slate-200 p-4 flex justify-between items-center">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Finanzas</p>
                        <p className="text-sm font-semibold text-slate-800">Pagó S/ {(lead.montoPagado || 0).toFixed(2)}</p>
                        <p className="text-xs text-slate-500">Deuda pendiente: S/ {(lead.deudaCita || 0).toFixed(2)}</p>
                    </div>
                    <CurrencyDollarIcon className="w-5 h-5 text-slate-400" />
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Servicio de interés</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">
                    {lead.servicios?.length ? lead.servicios.join(', ') : 'Sin definir'}
                </p>
                {lead.observacionesGenerales && (
                    <p className="text-xs text-slate-500 mt-2">{lead.observacionesGenerales}</p>
                )}
            </div>

            <div>
                <p className="text-sm font-semibold text-slate-700">Seguimiento reciente</p>
                <div className="mt-2 space-y-2">
                    {lastCalls.length === 0 && (
                        <p className="text-xs text-slate-400">Aún no registras llamadas.</p>
                    )}
                    {lastCalls.map(entry => (
                        <div key={entry.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                            <div>
                                <p className="font-semibold text-slate-800">Llamada #{entry.numeroLlamada}</p>
                                <p>{entry.estadoLlamada}</p>
                            </div>
                            <span className="text-[11px] text-slate-400">{entry.duracionLlamada}</span>
                        </div>
                    ))}
                </div>
            </div>

            <button
                type="button"
                onClick={() => onEdit(lead)}
                className="w-full rounded-2xl bg-[#0f172a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a2846]"
            >
                Abrir ficha completa
            </button>
        </aside>
    );
};

export default LeadsPage;