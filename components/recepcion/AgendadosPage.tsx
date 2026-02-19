import React, { useState, useMemo, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  DropAnimation,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Lead, Campaign, ClientSource, Service, MetaCampaign, ComprobanteElectronico, User, Appointment } from '../../types';
import { LeadStatus, ReceptionStatus, AppointmentStatus } from '../../types';
import DateRangeFilter from '../shared/DateRangeFilter';
import { getAppointments } from '../../services/api';
import { PlusIcon, ClockIcon, UserIcon, EyeIcon, CurrencyDollarIcon } from '../shared/Icons';
import StatCard from '../dashboard/StatCard';
import { LeadFormModal } from '../marketing/LeadFormModal';
import { RESOURCES } from '../../constants';
import * as api from '../../services/api';
import { useDate } from '../../src/hooks/useDate';

// GoogleIcon para íconos de StatCard
const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

// Helper function to get resource name
const getResourceName = (resourceId?: string): string => {
    if (!resourceId) return 'Sin asignar';
    const resource = RESOURCES.find(r => r.id === resourceId);
    return resource ? resource.name : resourceId;
};

interface AgendadosPageProps {
  leads: Lead[]; // To remove mostly
  metaCampaigns: MetaCampaign[];
  campaigns?: Campaign[];
  onSaveLead: (lead: Lead) => void; 
  onDeleteLead: (leadId: number) => void;
  clientSources: ClientSource[];
  services: Service[];
  requestConfirmation: (message: string, onConfirm: () => void) => void;
  onSaveComprobante: (comprobante: ComprobanteElectronico) => Promise<void>;
  comprobantes: ComprobanteElectronico[];
}

const mapAppointmentToLead = (appt: Appointment): Partial<Lead> => ({
    id: appt.leadId || 0,
    nombres: appt.lead?.nombres || appt.clienteNombre || 'Sin Nombre',
    apellidos: appt.lead?.apellidos || '',
    numero: appt.lead?.numero || '',
    fechaHoraAgenda: appt.startTime,
    estadoRecepcion: mapStatusToReception(appt.status),
    servicios: appt.service ? [appt.service.nombre] : [],
    recursoId: appt.resourceId ? String(appt.resourceId) : (appt.professionalId ? String(appt.professionalId) : undefined),
    montoPagado: 0 // TODO: Link payments
});

const mapStatusToReception = (status: AppointmentStatus): ReceptionStatus => {
    switch (status) {
        case 'SCHEDULED': return ReceptionStatus.Agendado;
        case 'CONFIRMED': return ReceptionStatus.AgendadoPorLlegar;
        case 'ARRIVED': return ReceptionStatus.PorAtender;
        case 'IN_PROGRESS': return ReceptionStatus.PorAtender; // Or EnModulo
        case 'COMPLETED': return ReceptionStatus.Atendido;
        case 'CANCELLED': return ReceptionStatus.Cancelado;
        case 'NO_SHOW': return ReceptionStatus.NoAsistio;
        default: return ReceptionStatus.Agendado;
    }
};

const normalizeReception = (value?: string) => {
    if (!value) return ReceptionStatus.Agendado;
    const s = String(value).trim();
    if (Object.values(ReceptionStatus).includes(s as any)) return s as any;
    
    const map: Record<string, string> = {
        'Agendado': ReceptionStatus.Agendado,
        'AgendadoPorLlegar': ReceptionStatus.AgendadoPorLlegar,
        'Agendado por llegar': ReceptionStatus.AgendadoPorLlegar,
        'PorAtender': ReceptionStatus.PorAtender,
        'Por Atender': ReceptionStatus.PorAtender,
        'Atendido': ReceptionStatus.Atendido,
        'Reprogramado': ReceptionStatus.Reprogramado,
        'Cancelado': ReceptionStatus.Cancelado,
        'NoAsistio': ReceptionStatus.NoAsistio,
        'No Asistió': ReceptionStatus.NoAsistio
    };
    return map[s] ?? ReceptionStatus.Agendado;
};

// Kanban Card Component (adapted from marketing Kanban)
interface KanbanCardProps {
  lead: Lead;
  onClick: () => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ lead, onClick }) => {
    const resourceName = getResourceName(lead.recursoId);
    const { formatDateTime } = useDate();
    
    const formattedDate = useMemo(() => {
        if (!lead.fechaHoraAgenda || lead.fechaHoraAgenda === 'undefined') return null;
        const value = formatDateTime(lead.fechaHoraAgenda);
        return value && value !== '-' ? value : null;
    }, [lead.fechaHoraAgenda, formatDateTime]);

    const displayName = useMemo(() => {
        const full = `${lead.nombres || ''} ${lead.apellidos || ''}`.trim();
        return full || 'Sin Nombre';
    }, [lead.nombres, lead.apellidos]);

    return (
        <div
            onClick={onClick}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4 cursor-pointer hover:shadow-md hover:border-purple-400 transition-all"
        >
            <div className="flex justify-between items-start">
                <h4 className="font-bold text-gray-800 text-sm">{displayName}</h4>
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
            {formattedDate && (
                 <div className="mt-2 flex items-center text-xs text-purple-700 font-medium bg-purple-100 p-1 rounded">
                    <ClockIcon className="mr-1.5 h-3 w-3"/>
                    <span>{formattedDate}</span>
                </div>
            )}
        </div>
    );
};


const SortableKanbanCard = ({ lead, onClick }: { lead: Lead, onClick: () => void }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ 
        id: lead.id,
        data: { type: 'Lead', lead }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <KanbanCard lead={lead} onClick={onClick} />
        </div>
    );
};

// Kanban Column Component
const KanbanColumn: React.FC<{ 
    id: string;
    title: string; 
    color: string; 
    textColor: string; 
    children: React.ReactNode; 
    count: number 
}> = ({ id, title, color, textColor, children, count }) => {
    const { setNodeRef } = useSortable({ 
        id: id,
        data: {
            type: 'Column',
            containerId: id
        }
    });

    return (
        <div 
            ref={setNodeRef}
            className="bg-gray-100 rounded-lg w-full md:w-72 flex-shrink-0 flex flex-col h-full max-h-[calc(100vh-220px)]"
        >
            <div className={`p-3 flex justify-between items-center ${color} rounded-t-lg flex-shrink-0`}>
                <h3 className={`font-semibold ${textColor} text-sm`}>{title}</h3>
                <span className={`${textColor} text-sm font-bold bg-black/10 rounded-full px-2 py-0.5`}>{count}</span>
            </div>
            <div className="p-2 flex-grow overflow-y-auto min-h-[100px]">
                {children}
            </div>
        </div>
    );
};

const AgendadosTable: React.FC<{ leads: Lead[], onEdit: (lead: Lead) => void }> = ({ leads, onEdit }) => {
    const { formatTimeOnly } = useDate();
    const formatCurrency = (value: number) => `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    const statusText: Record<string, string> = {
        [ReceptionStatus.Agendado]: 'Por Llegar',
        [ReceptionStatus.AgendadoPorLlegar]: 'Por Llegar',
        [ReceptionStatus.PorAtender]: 'En Espera',
        [ReceptionStatus.Atendido]: 'Atendido',
        [ReceptionStatus.NoAsistio]: 'No Asistió'
    };
    
    const statusColor: Record<string, string> = {
        [ReceptionStatus.Agendado]: 'text-blue-600 bg-blue-100',
        [ReceptionStatus.AgendadoPorLlegar]: 'text-blue-600 bg-blue-100',
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
                            const status = normalizeReception(lead.estadoRecepcion);
                            return (
                                <tr key={lead.id} className="bg-white border-b hover:bg-gray-50">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                        {lead.nombres} {lead.apellidos}
                                    </th>
                                    <td className="px-6 py-4 font-semibold">{formatTimeOnly(lead.fechaHoraAgenda)}</td>
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


const AgendadosPage: React.FC<AgendadosPageProps> = ({ leads, campaigns, metaCampaigns, onSaveLead, onDeleteLead, clientSources, services, requestConfirmation, onSaveComprobante, comprobantes }) => {
    const { todayKey, toDateKey, parse, getLocalDayRangeUTC } = useDate();
    const [dateRange, setDateRange] = useState(() => {
            const today = todayKey();
            return { from: today, to: today };
    });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [users, setUsers] = useState<User[]>([]);
  
  // New State for Appointments
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Fetch users (legacy) and Appointments (new)
  useEffect(() => {
    let mounted = true;
    api.getUsers()
        .then(res => { if (mounted && Array.isArray(res)) setUsers(res as User[]); })
        .catch(console.warn);

    // Fetch appointments for current range
    if (dateRange.from && dateRange.to) {
        const fromRange = getLocalDayRangeUTC(dateRange.from);
        const toRange = getLocalDayRangeUTC(dateRange.to);
        if (fromRange && toRange) {
            getAppointments(fromRange.start.toISOString(), toRange.endExclusive.toISOString())
            .then(res => { if (mounted) setAppointments(res); })
            .catch(console.error);
        }
    }

    return () => { mounted = false; };
  }, [dateRange]);

  // Merge legacy Leads with new Appointments
  const filteredLeads = useMemo(() => {
    // 1. Leads 'legacy' que vienen por props (filtrados por fecha localmente)
    const validLeads = leads.filter(lead => {
        if (lead.estado !== LeadStatus.Agendado || !lead.fechaHoraAgenda) return false;
        const agendaDate = toDateKey(lead.fechaHoraAgenda);
        if (!agendaDate) return false;
        if (dateRange.from && agendaDate < dateRange.from) return false;
        if (dateRange.to && agendaDate > dateRange.to) return false;
        return true;
    });

    // 2. Map new Appointments to Lead structure
    const appointmentLeads = appointments.map(appt => ({
        ...mapAppointmentToLead(appt), 
        // Ensure required Lead props for UI
        id: appt.leadId || -(appt.id), // Negative ID if no lead connected
        estado: LeadStatus.Agendado,
        servicios: appt.service ? [appt.service.nombre] : [], 
        // Default props to prevent crashes
        montoPagado: 0,
        categoria: 'Cita',
        etiquetas: [],
        tratamientos: [],
        historialComentarios: []
    } as unknown as Lead));

    // 3. Combine and Deduplicate (prefer Appointment if ID matches)
    // Actually, in transition phase, show both? Or dedup by leadId?
    // Let's just append for now, user can see dupes if data isn't clean.
    const combined = [...validLeads, ...appointmentLeads];

    return combined.sort((a, b) => {
        const aDate = a.fechaHoraAgenda ? parse(a.fechaHoraAgenda) : null;
        const bDate = b.fechaHoraAgenda ? parse(b.fechaHoraAgenda) : null;
        if (!aDate && !bDate) return 0;
        if (!aDate) return 1;
        if (!bDate) return -1;
        return aDate.getTime() - bDate.getTime();
    });
  }, [leads, appointments, dateRange]);

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

    const handleEditCita = async (lead: Lead) => {
        // Try to fetch full lead details from backend before opening modal.
        if (lead && lead.id) {
            try {
                const full = await api.getLead(lead.id);
                setEditingLead(full as Lead);
            } catch (err) {
                console.warn('Warning: failed to fetch full lead, opening with partial data', err);
                setEditingLead(lead);
            }
        } else {
            setEditingLead(lead);
        }
        setIsModalOpen(true);
    };
  
  const handleSaveAndClose = async (lead: Lead) => {
    await onSaveLead(lead);
    // Update editingLead with the latest data after save
    if (lead.id && editingLead) {
      // Find the updated lead from the leads array after the save operation
      // This ensures the modal shows the latest data
      setTimeout(() => {
        const updatedLead = leads.find(l => l.id === lead.id);
        if (updatedLead) {
          setEditingLead(updatedLead);
        }
      }, 100); // Small delay to ensure the parent data is updated
    }
  };

  const statusConfig: Record<string, { title: string; color: string; textColor: string; }> = {
    [ReceptionStatus.Agendado]: { title: 'Agendados (Por Llegar)', color: 'bg-sky-200', textColor: 'text-sky-800' },
        [ReceptionStatus.AgendadoPorLlegar]: { title: 'Agendados (Por Llegar)', color: 'bg-sky-200', textColor: 'text-sky-800' },
    [ReceptionStatus.PorAtender]: { title: 'Por Atender (En Espera)', color: 'bg-yellow-200', textColor: 'text-yellow-800' },
    [ReceptionStatus.Atendido]: { title: 'Atendido', color: 'bg-green-200', textColor: 'text-green-800' },
    [ReceptionStatus.Reprogramado]: { title: 'Reprogramado', color: 'bg-blue-200', textColor: 'text-blue-800' },
    [ReceptionStatus.Cancelado]: { title: 'Cancelado', color: 'bg-gray-200', textColor: 'text-gray-800' },
    [ReceptionStatus.NoAsistio]: { title: 'No Asistió', color: 'bg-red-200', textColor: 'text-red-800' },
  };

    // Define column groups to avoid duplicate columns with same title
    const kanbanColumnGroups: Array<{ key: string; statuses: string[]; config: { title: string; color: string; textColor: string } }> = [
        { key: 'agendados', statuses: [ReceptionStatus.AgendadoPorLlegar, ReceptionStatus.Agendado], config: statusConfig[ReceptionStatus.AgendadoPorLlegar] },
        { key: 'porAtender', statuses: [ReceptionStatus.PorAtender], config: statusConfig[ReceptionStatus.PorAtender] },
        { key: 'atendido', statuses: [ReceptionStatus.Atendido], config: statusConfig[ReceptionStatus.Atendido] },
        { key: 'reprogramado', statuses: [ReceptionStatus.Reprogramado], config: statusConfig[ReceptionStatus.Reprogramado] },
        { key: 'cancelado', statuses: [ReceptionStatus.Cancelado], config: statusConfig[ReceptionStatus.Cancelado] },
        { key: 'noAsistio', statuses: [ReceptionStatus.NoAsistio], config: statusConfig[ReceptionStatus.NoAsistio] },
    ];

    const [activeId, setActiveId] = useState<string | null>(null);
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(String(event.active.id));
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) {
            return;
        }

        const activeIdStr = String(active.id);
        const overIdStr = String(over.id);

        if (activeIdStr === overIdStr) {
            return;
        }

        // Find the lead being dragged
        const lead = filteredLeads.find(l => String(l.id) === activeIdStr);
        if (!lead) return;

        // Determine destination status
        let newStatus: string | null = null;
        
        // Check if dropped on a column
        const columnGroup = kanbanColumnGroups.find(g => g.key === overIdStr);
        if (columnGroup) {
            newStatus = columnGroup.statuses[0];
        } else {
             // Maybe dropped on another card?
             // Resolve the container using the sortable data
             const overData = over.data.current;
             // Usually dnd-kit context provides sortable.containerId
             const containerId = overData?.sortable?.containerId;
             
             if (containerId) {
                 const group = kanbanColumnGroups.find(g => g.key === containerId);
                 if (group) newStatus = group.statuses[0];
             }
        }

        if (newStatus && normalizeReception(lead.estadoRecepcion) !== normalizeReception(newStatus)) {
            // Optimistic update
            const originalAppt = appointments.find(a => (a.leadId === lead.id && lead.id > 0) || (-(a.id) === lead.id && lead.id < 0));
            
            if (originalAppt) {
                 let newApptStatus: AppointmentStatus | undefined;
                 switch(newStatus) {
                     case ReceptionStatus.Agendado: newApptStatus = 'SCHEDULED'; break;
                     case ReceptionStatus.AgendadoPorLlegar: newApptStatus = 'CONFIRMED'; break;
                     case ReceptionStatus.PorAtender: newApptStatus = 'ARRIVED'; break;
                     case ReceptionStatus.Atendido: newApptStatus = 'COMPLETED'; break;
                     case ReceptionStatus.Reprogramado: newApptStatus = 'SCHEDULED'; break;
                     case ReceptionStatus.Cancelado: newApptStatus = 'CANCELLED'; break;
                     case ReceptionStatus.NoAsistio: newApptStatus = 'NO_SHOW'; break;
                 }
                 
                 if (newApptStatus) {
                     // Optimistic UI update
                     setAppointments(prev => prev.map(a => 
                        a.id === originalAppt.id ? { ...a, status: newApptStatus! } : a
                     ));

                     try {
                        const statusToUpdate = newApptStatus; // capture for closure
                         await api.updateAppointmentStatus(originalAppt.id, statusToUpdate);
                         console.log(`Updated appointment ${originalAppt.id} to ${statusToUpdate}`);
                     } catch (error) {
                         console.error("Failed to update status", error);
                         // Revert
                         setAppointments(prev => prev.map(a => 
                            a.id === originalAppt.id ? { ...a, status: originalAppt.status } : a
                         ));
                         alert("Error al actualizar estado. Se ha revertido el cambio.");
                     }
                 }
            }
        }
    };

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
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 overflow-x-auto pb-4">
                    {kanbanColumnGroups.map(group => {
                        const leadsInColumn = filteredLeads.filter(lead => {
                            const leadStatus = normalizeReception(lead.estadoRecepcion);
                            return group.statuses.includes(leadStatus);
                        });
                        const config = group.config;
                        return (
                            <KanbanColumn
                                key={group.key}
                                id={group.key}
                                title={config.title}
                                color={config.color}
                                textColor={config.textColor}
                                count={leadsInColumn.length}
                            >
                                <SortableContext 
                                    items={leadsInColumn.map(l => l.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {leadsInColumn.map(lead => (
                                        <SortableKanbanCard 
                                            key={lead.id} 
                                            lead={lead} 
                                            onClick={() => handleEditCita(lead)} 
                                        />
                                    ))}
                                </SortableContext>
                            </KanbanColumn>
                        );
                    })}
                </div>
                 <DragOverlay>
                    {activeId ? (
                        <div className="transform rotate-2 opacity-80 cursor-grabbing">
                           {/* Re-render the card purely for visual fetch. 
                               We format it slightly differently or reuse KanbanCard 
                               Find the lead from activeId */}
                           {(() => {
                               const lead = filteredLeads.find(l => String(l.id) === activeId);
                               return lead ? <KanbanCard lead={lead} onClick={() => {}} /> : null;
                           })()}
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        ) : (
            <AgendadosTable leads={filteredLeads} onEdit={handleEditCita} />
        )}


        <LeadFormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveAndClose}
            onDelete={onDeleteLead}
            lead={editingLead}
            users={users}
            initialTab={'recepcion'}
            disableFicha={true}
            metaCampaigns={metaCampaigns}
            campaigns={campaigns}
            clientSources={clientSources}
            services={services}
            requestConfirmation={requestConfirmation}
            onSaveComprobante={onSaveComprobante}
            comprobantes={comprobantes}
        />
    </div>
  );
};

export default AgendadosPage;