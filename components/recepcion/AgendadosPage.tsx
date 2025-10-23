

import React, { useState, useMemo } from 'react';
import type { Lead, Campaign, ClientSource, Service, MetaCampaign } from '../../types.ts';
import { LeadStatus, ReceptionStatus } from '../../types.ts';
import DateRangeFilter from '../shared/DateRangeFilter.tsx';
import { PlusIcon, ClockIcon, UserIcon, EyeIcon, CurrencyDollarIcon } from '../shared/Icons.tsx';
import StatCard from '../dashboard/StatCard.tsx';
import LeadFormModal from '../marketing/LeadFormModal.tsx';
import { RESOURCES } from '../../constants.ts';

interface AgendadosPageProps {
  leads: Lead[];
  metaCampaigns: MetaCampaign[];
  onSaveLead: (lead: Lead) => void;
  onDeleteLead: (leadId: number) => void;
  clientSources: ClientSource[];
  services: Service[];
  requestConfirmation: (message: string, onConfirm: () => void) => void;
}

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const getResourceName = (resourceId?: string) => {
    if (!resourceId) return 'N/A';
    const resource = RESOURCES.find(r => r.id === resourceId);
    return resource ? resource.name : 'Desconocido';
};

// Kanban Card Component (adapted from marketing Kanban)
interface KanbanCardProps {
  lead: Lead;
  onClick: () => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ lead, onClick }) => {
    const resourceName = getResourceName(lead.recursoId);

    return (
        <div 
            onClick={onClick}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4 cursor-pointer hover:shadow-md hover:border-purple-400 transition-all"
        >
            <div className="flex justify-between items-start">
                <h4 className="font-bold text-gray-800 text-sm">{lead.nombres} {lead.apellidos}</h4>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-purple-100 text-purple-700`}>
                    {lead.categoria}
                </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 truncate">{lead.servicios.join(', ')}</p>
            <div className="mt-4 flex justify-between items-center text-xs text-gray-600">
                <div className="flex items-center">
                    <UserIcon className="mr-1 h-3 w-3" />
                    <span>{resourceName}</span>
                </div>
                {lead.montoPagado > 0 && (
                    <div className="flex items-center font-semibold text-green-700">
                        <CurrencyDollarIcon className="mr-1 h-3 w-3" />
                        <span>S/ {lead.montoPagado}</span>
                    </div>
                )}
            </div>
            {lead.fechaHoraAgenda && (
                 <div className="mt-2 flex items-center text-xs text-purple-700 font-medium bg-purple-100 p-1 rounded">
                    <ClockIcon className="mr-1.5 h-3 w-3"/>
                    <span>{new Date(lead.fechaHoraAgenda).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                </div>
            )}
        </div>
    );
};


// Kanban Column Component
const KanbanColumn: React.FC<{ title: string; color: string; textColor: string; children: React.ReactNode; count: number }> = ({ title, color, textColor, children, count }) => (
    <div className="bg-gray-100 rounded-lg w-full md:w-72 flex-shrink-0">
        <div className={`p-3 flex justify-between items-center rounded-t-lg ${color}`}>
            <h3 className={`font-semibold ${textColor} text-sm`}>{title}</h3>
            <span className={`${textColor} text-sm font-bold bg-black/10 rounded-full px-2 py-0.5`}>{count}</span>
        </div>
        <div className="p-2 h-full overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
            {children}
        </div>
    </div>
);

const AgendadosTable: React.FC<{ leads: Lead[], onEdit: (lead: Lead) => void }> = ({ leads, onEdit }) => {
    const formatCurrency = (value: number) => `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatDateTime = (dateTimeString: string) => new Date(dateTimeString).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true });
    
    const statusText: Record<string, string> = {
        [ReceptionStatus.Agendado]: 'Por Llegar',
        [ReceptionStatus.PorAtender]: 'En Espera',
        [ReceptionStatus.Atendido]: 'Atendido',
        [ReceptionStatus.NoAsistio]: 'No Asistió'
    };
    
    const statusColor: Record<string, string> = {
        [ReceptionStatus.Agendado]: 'text-blue-600 bg-blue-100',
        [ReceptionStatus.PorAtender]: 'text-yellow-600 bg-yellow-100',
        [ReceptionStatus.Atendido]: 'text-green-600 bg-green-100',
        [ReceptionStatus.NoAsistio]: 'text-red-600 bg-red-100'
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Paciente</th>
                            <th scope="col" className="px-6 py-3">Hora Cita</th>
                            <th scope="col" className="px-6 py-3">Servicio</th>
                            <th scope="col" className="px-6 py-3">Recurso</th>
                            <th scope="col" className="px-6 py-3">Pago Cita</th>
                            <th scope="col" className="px-6 py-3">Estado</th>
                            <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leads.map(lead => {
                            const status = lead.estadoRecepcion || ReceptionStatus.Agendado;
                            return (
                                <tr key={lead.id} className="bg-white border-b hover:bg-gray-50">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                        {lead.nombres} {lead.apellidos}
                                    </th>
                                    <td className="px-6 py-4 font-semibold">{formatDateTime(lead.fechaHoraAgenda!)}</td>
                                    <td className="px-6 py-4">{lead.servicios.join(', ')}</td>
                                    <td className="px-6 py-4">{getResourceName(lead.recursoId)}</td>
                                    <td className="px-6 py-4">{formatCurrency(lead.montoPagado)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor[status]}`}>
                                            {statusText[status]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => onEdit(lead)} className="font-medium text-[#aa632d] hover:underline flex items-center justify-center mx-auto">
                                            <EyeIcon className="w-4 h-4 mr-1"/> Ver Ficha
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                 {leads.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <p>No hay pacientes agendados para el rango de fechas seleccionado.</p>
                    </div>
                )}
            </div>
        </div>
    );
};


const AgendadosPage: React.FC<AgendadosPageProps> = ({ leads, metaCampaigns, onSaveLead, onDeleteLead, clientSources, services, requestConfirmation }) => {
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  const filteredLeads = useMemo(() => {
    let baseLeads = leads.filter(lead => lead.estado === LeadStatus.Agendado && lead.fechaHoraAgenda);

    if (dateRange.from || dateRange.to) {
      const fromDate = dateRange.from ? new Date(`${dateRange.from}T00:00:00`) : null;
      const toDate = dateRange.to ? new Date(`${dateRange.to}T23:59:59`) : null;

      baseLeads = baseLeads.filter(lead => {
        const agendaDate = new Date(lead.fechaHoraAgenda!);
        if (fromDate && agendaDate < fromDate) return false;
        if (toDate && agendaDate > toDate) return false;
        return true;
      });
    }

    return baseLeads.sort((a, b) => new Date(a.fechaHoraAgenda!).getTime() - new Date(b.fechaHoraAgenda!).getTime());
  }, [leads, dateRange]);

  const stats = useMemo(() => {
    const totalAgendados = filteredLeads.length;
    
    const ventasExtra = filteredLeads
        .filter(l => l.aceptoTratamiento === 'Si' && l.tratamientos)
        .reduce((sum, lead) => {
            const tratamientosSum = lead.tratamientos!.reduce((subSum, trat) => subSum + trat.montoPagado, 0);
            return sum + tratamientosSum;
        }, 0);

    const aceptaronTratamiento = filteredLeads.filter(l => l.aceptoTratamiento === 'Si').length;
    const porcentajeAceptaron = totalAgendados > 0 ? ((aceptaronTratamiento / totalAgendados) * 100).toFixed(1) : "0.0";
    
    return {
        totalAgendados,
        ventasExtra,
        porcentajeAceptaron
    };
  }, [filteredLeads]);


  const handleApplyDateFilter = (dates: { from: string, to: string }) => {
    setDateRange(dates);
  };

  const handleAddCita = () => {
    setEditingLead(null);
    setIsModalOpen(true);
  };

  const handleEditCita = (lead: Lead) => {
    setEditingLead(lead);
    setIsModalOpen(true);
  };
  
  const handleSaveAndClose = (lead: Lead) => {
    onSaveLead(lead);
    setIsModalOpen(false);
  };

  const statusConfig: Record<string, { title: string; color: string; textColor: string; }> = {
    [ReceptionStatus.Agendado]: { title: 'Agendados (Por Llegar)', color: 'bg-sky-200', textColor: 'text-sky-800' },
    [ReceptionStatus.PorAtender]: { title: 'Por Atender (En Espera)', color: 'bg-yellow-200', textColor: 'text-yellow-800' },
    [ReceptionStatus.Atendido]: { title: 'Atendido', color: 'bg-green-200', textColor: 'text-green-800' },
    [ReceptionStatus.Reprogramado]: { title: 'Reprogramado', color: 'bg-blue-200', textColor: 'text-blue-800' },
    [ReceptionStatus.Cancelado]: { title: 'Cancelado', color: 'bg-gray-200', textColor: 'text-gray-800' },
    [ReceptionStatus.NoAsistio]: { title: 'No Asistió', color: 'bg-red-200', textColor: 'text-red-800' },
  };

  const kanbanColumns = Object.values(ReceptionStatus);

  return (
    <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-2xl font-bold text-black mb-4 md:mb-0">Gestión de Agendados</h1>
            <div className="flex items-center space-x-3">
                <DateRangeFilter onApply={handleApplyDateFilter} />
                <button 
                    onClick={handleAddCita}
                    className="flex items-center bg-[#aa632d] text-white px-4 py-2 rounded-lg shadow hover:bg-[#8e5225] transition-colors"
                >
                    <PlusIcon className="mr-2 h-5 w-5" /> Añadir Cita
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <StatCard 
                title="Total Pacientes Agendados" 
                value={stats.totalAgendados.toString()} 
                icon={<GoogleIcon name="event_available" className="text-green-500"/>}
                iconBgClass="bg-green-100"
            />
             <StatCard 
                title="Ventas Adicionales (Tratamientos)" 
                value={`S/ ${stats.ventasExtra.toLocaleString('es-PE')}`}
                icon={<GoogleIcon name="paid" className="text-blue-500"/>}
                iconBgClass="bg-blue-100"
            />
            <StatCard 
                title="% Aceptación de Tratamiento" 
                value={`${stats.porcentajeAceptaron}%`}
                icon={<GoogleIcon name="thumb_up" className="text-indigo-500"/>}
                iconBgClass="bg-indigo-100"
            />
        </div>

        <div className="bg-white p-4 rounded-lg shadow mb-6 flex justify-end">
            <div className="flex items-center space-x-2">
                 <button onClick={() => setViewMode('kanban')} className={`px-3 py-1 rounded-md text-sm font-medium ${viewMode === 'kanban' ? 'bg-[#aa632d] text-white' : 'bg-gray-200 text-gray-700'}`}>
                     Kanban
                 </button>
                  <button onClick={() => setViewMode('table')} className={`px-3 py-1 rounded-md text-sm font-medium ${viewMode === 'table' ? 'bg-[#aa632d] text-white' : 'bg-gray-200 text-gray-700'}`}>
                     Tabla
                 </button>
             </div>
        </div>
        
         {viewMode === 'kanban' ? (
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 overflow-x-auto pb-4">
                {kanbanColumns.map(status => {
                    const leadsInColumn = filteredLeads.filter(lead => (lead.estadoRecepcion || ReceptionStatus.Agendado) === status);
                    const config = statusConfig[status];
                    return (
                        <KanbanColumn 
                            key={status} 
                            title={config.title} 
                            color={config.color} 
                            textColor={config.textColor}
                            count={leadsInColumn.length}
                        >
                            {leadsInColumn.map(lead => (
                                <KanbanCard key={lead.id} lead={lead} onClick={() => handleEditCita(lead)} />
                            ))}
                        </KanbanColumn>
                    );
                })}
            </div>
        ) : (
            <AgendadosTable leads={filteredLeads} onEdit={handleEditCita} />
        )}


        <LeadFormModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveAndClose}
            onDelete={onDeleteLead}
            lead={editingLead}
            metaCampaigns={metaCampaigns}
            clientSources={clientSources}
            services={services}
            requestConfirmation={requestConfirmation}
        />
    </div>
  );
};

export default AgendadosPage;