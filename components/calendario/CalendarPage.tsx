import React, { useState, useMemo, useEffect } from 'react';
import { formatDateForInput, parseDate } from '../../utils/time';
import type { Lead, Campaign, ClientSource, Service, MetaCampaign, ComprobanteElectronico, Appointment } from '../../types';
import { RESOURCES } from '../../constants';
import { LeadFormModal } from '../marketing/LeadFormModal'; // FIX: Changed to named import
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon, BuildingStorefrontIcon, FunnelIcon, CalendarDaysIcon, Cog6ToothIcon, ChevronDownIcon, XMarkIcon } from '../shared/Icons';
import AppointmentWizard from './AppointmentWizard';
import { getLeads } from '../../services/api';

interface CalendarPageProps {
    leads: Lead[];
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

const BLOCKED_TIMES = [
    {
        id: 'block-1',
        recursoId: 'Dr. Carlos',
        fecha: '2023-11-05',
        horaInicio: '14:00',
        horaFin: '17:00',
        titulo: 'Tareas Administrativas'
    },
];

const START_HOUR = 8;
const END_HOUR = 21;
const HOUR_HEIGHT = 80; // Reduced height for a more compact view

const serviceColors = [
  'bg-blue-100 border-l-4 border-blue-500 text-blue-800',
  'bg-green-100 border-l-4 border-green-500 text-green-800',
  'bg-purple-100 border-l-4 border-purple-500 text-purple-800',
  'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800',
  'bg-pink-100 border-l-4 border-pink-500 text-pink-800',
  'bg-indigo-100 border-l-4 border-indigo-500 text-indigo-800',
];

const VIEW_OPTIONS = [
        { id: 'day', label: 'Día' },
        { id: '3days', label: '3 días' },
        { id: 'week', label: 'Semana' },
        { id: 'month', label: 'Mes' },
] as const;

type ViewMode = typeof VIEW_OPTIONS[number]['id'];

const getServiceColor = (serviceName: string) => {
  let hash = 0;
  if (!serviceName || serviceName.length === 0) return serviceColors[0];
  for (let i = 0; i < serviceName.length; i++) {
    hash = serviceName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % serviceColors.length);
  return serviceColors[index];
};

const timeToPosition = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const totalMinutes = (hours - START_HOUR) * 60 + minutes;
    return (totalMinutes / 60) * HOUR_HEIGHT;
};

const durationToHeight = (startStr: string, endStr: string) => {
    const start = new Date(`1970-01-01T${startStr}`);
    const end = new Date(`1970-01-01T${endStr}`);
    const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    return (diffMinutes / 60) * HOUR_HEIGHT;
};

const DEFAULT_LEAD_DURATION = 60;

interface CalendarEvent {
    id: string;
    source: 'lead' | 'appointment';
    originId: number;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    resourceId: string;
    cliente: string;
    servicios: string[];
    leadRef?: Lead;
}

interface WizardDefaults {
    date: Date;
    resourceId?: string;
}

const padTime = (value: number) => value.toString().padStart(2, '0');

const addMinutesToTime = (timeStr: string, minutes: number) => {
    const [hours, mins] = timeStr.split(':').map(Number);
    const baseline = new Date();
    baseline.setHours(hours, mins, 0, 0);
    baseline.setMinutes(baseline.getMinutes() + minutes);
    return `${padTime(baseline.getHours())}:${padTime(baseline.getMinutes())}`;
};

const buildClienteNombre = (nombres?: string, apellidos?: string) => {
    const fullName = [nombres, apellidos].filter(Boolean).join(' ').trim();
    return fullName.length > 0 ? fullName : 'Cliente sin nombre';
};

const leadToEvent = (lead: Lead): CalendarEvent | null => {
    if (!lead.fechaHoraAgenda || !lead.recursoId) return null;
    const parsed = parseDate(lead.fechaHoraAgenda);
    if (!parsed) return null;
    const fecha = formatDateForInput(parsed);
    if (!fecha) return null;
    const horaInicio = `${padTime(parsed.getHours())}:${padTime(parsed.getMinutes())}`;
    const horaFin = addMinutesToTime(horaInicio, DEFAULT_LEAD_DURATION);
    return {
        id: `lead-${lead.id}`,
        source: 'lead',
        originId: lead.id,
        fecha,
        horaInicio,
        horaFin,
        resourceId: lead.recursoId,
        cliente: buildClienteNombre(lead.nombres, lead.apellidos),
        servicios: lead.servicios || [],
        leadRef: lead,
    };
};

const appointmentToEvent = (appointment: Appointment): CalendarEvent => {
    const horaFin = addMinutesToTime(appointment.horaInicio, appointment.duracionMinutos || DEFAULT_LEAD_DURATION);
    return {
        id: `appointment-${appointment.id}`,
        source: 'appointment',
        originId: appointment.id,
        fecha: appointment.fecha,
        horaInicio: appointment.horaInicio,
        horaFin,
        resourceId: appointment.profesionalId,
        cliente: appointment.clienteNombre,
        servicios: appointment.servicios?.map(item => item.nombre) || [],
    };
};

const FILTER_SOURCE_OPTIONS: { id: CalendarEvent['source']; label: string; description: string }[] = [
    { id: 'lead', label: 'Leads agendados', description: 'Reservas tomadas desde el módulo comercial' },
    { id: 'appointment', label: 'Citas confirmadas', description: 'Bloques gestionados desde procedimientos' }
];

interface FilterPanelProps {
    open: boolean;
    onClose: () => void;
    visibleSources: CalendarEvent['source'][];
    onToggleSource: (source: CalendarEvent['source']) => void;
    services: Service[];
}

const FiltersPanel: React.FC<FilterPanelProps> = ({ open, onClose, visibleSources, onToggleSource, services }) => {
    const quickServices = services.slice(0, 6);
    return (
        <div className={`fixed inset-0 z-40 transition-opacity duration-200 ${open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}>
            <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
            <aside className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl border-l border-slate-100 transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Filtros</p>
                        <h3 className="text-xl font-semibold text-slate-900">Refinar agenda</h3>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="h-full overflow-y-auto px-6 py-6 space-y-6">
                    <section>
                        <p className="text-sm font-semibold text-slate-900">Estado de la cita</p>
                        <div className="mt-3 space-y-3">
                            {FILTER_SOURCE_OPTIONS.map(option => {
                                const active = visibleSources.includes(option.id);
                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => onToggleSource(option.id)}
                                        className={`w-full text-left rounded-2xl border px-4 py-3 transition-colors ${active ? 'border-[#aa632d] bg-[#fff4ea]' : 'border-slate-200 hover:border-slate-300'}`}
                                    >
                                        <p className="text-sm font-semibold text-slate-900">{option.label}</p>
                                        <p className="text-xs text-slate-500">{option.description}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                    <section>
                        <p className="text-sm font-semibold text-slate-900">Canal</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {['Call Center', 'WhatsApp', 'Web', 'Referido'].map(channel => (
                                <span key={channel} className="px-3 py-1 text-xs font-semibold rounded-full border border-dashed border-slate-300 text-slate-500">
                                    {channel}
                                </span>
                            ))}
                        </div>
                    </section>
                    <section>
                        <p className="text-sm font-semibold text-slate-900">Servicios populares</p>
                        <div className="mt-3 grid grid-cols-2 gap-3">
                            {quickServices.map(service => (
                                <div key={service.id} className="rounded-2xl border border-slate-200 p-3">
                                    <p className="text-sm font-semibold text-slate-800 truncate">{service.nombre}</p>
                                    <p className="text-xs text-slate-400">{service.duracionMinutos || 60} min</p>
                                </div>
                            ))}
                            {quickServices.length === 0 && (
                                <p className="text-xs text-slate-400 col-span-2">Aún no hay servicios configurados.</p>
                            )}
                        </div>
                    </section>
                    <div className="flex justify-end gap-3 pt-2">
                        <button onClick={onClose} className="text-sm font-semibold text-slate-500 hover:text-slate-700">Cerrar</button>
                        <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-white rounded-2xl bg-[#aa632d] hover:bg-[#8e5225]">
                            Aplicar filtros
                        </button>
                    </div>
                </div>
            </aside>
        </div>
    );
};

const CalendarPage: React.FC<CalendarPageProps> = ({
    leads,
    metaCampaigns,
    campaigns,
    onSaveLead,
    onDeleteLead,
    clientSources,
    services,
    requestConfirmation,
    onSaveComprobante,
    comprobantes,
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('day');
    const [visibleResourceIds, setVisibleResourceIds] = useState<string[]>(RESOURCES.map(resource => resource.id));
    const [visibleSources, setVisibleSources] = useState<CalendarEvent['source'][]>(FILTER_SOURCE_OPTIONS.map(option => option.id));
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
    const [isResourceMenuOpen, setIsResourceMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [wizardDefaults, setWizardDefaults] = useState<WizardDefaults | null>(null);

    const teamMembers = useMemo(() => RESOURCES.filter(resource => resource.type === 'personal'), []);
    const sharedSpaces = useMemo(() => RESOURCES.filter(resource => resource.type !== 'personal'), []);
    const visibleResources = useMemo(
        () => RESOURCES.filter(resource => visibleResourceIds.includes(resource.id)),
        [visibleResourceIds]
    );

    useEffect(() => {
        setCalendarEvents(prevEvents => {
            const appointmentEvents = prevEvents.filter(event => event.source === 'appointment');
            const leadEvents = leads
                .map(leadToEvent)
                .filter((event): event is CalendarEvent => event !== null);
            return [...leadEvents, ...appointmentEvents];
        });
    }, [leads]);

    useEffect(() => {
        const timer = window.setInterval(() => setCurrentTime(new Date()), 60000);
        return () => window.clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!isViewMenuOpen) return;
        const handleClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement | null;
            if (!target) return;
            if (target.closest('[data-view-menu]')) return;
            setIsViewMenuOpen(false);
        };
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [isViewMenuOpen]);

    useEffect(() => {
        if (!isResourceMenuOpen) return;
        const handleClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement | null;
            if (!target) return;
            if (target.closest('[data-resource-menu]')) return;
            setIsResourceMenuOpen(false);
        };
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [isResourceMenuOpen]);

    const handleToggleResourceVisibility = (resourceId: string) => {
        setVisibleResourceIds(prev => {
            if (prev.includes(resourceId)) {
                if (prev.length === 1) {
                    return prev;
                }
                return prev.filter(id => id !== resourceId);
            }
            return [...prev, resourceId];
        });
    };

    const handleResetResourceVisibility = () => {
        setVisibleResourceIds(RESOURCES.map(resource => resource.id));
    };

    const handleToggleSourceFilter = (source: CalendarEvent['source']) => {
        setVisibleSources(prev => {
            if (prev.includes(source)) {
                if (prev.length === 1) {
                    return prev;
                }
                return prev.filter(item => item !== source);
            }
            return [...prev, source];
        });
    };

    const handleDateChange = (days: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + days);
            return newDate;
        });
    };
    
    const handleToday = () => setCurrentDate(new Date());
    
    const handleAddClick = () => {
        const baseDate = new Date(currentDate);
        baseDate.setHours(9, 0, 0, 0);
        setWizardDefaults({ date: baseDate });
        setIsWizardOpen(true);
    };
    
    const handleEditAppointment = (appointment: Lead) => {
        setEditingLead(appointment);
        setIsModalOpen(true);
    };

    const handleSlotClick = (resourceId: string, e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;

        const totalMinutesFromStart = (y / HOUR_HEIGHT) * 60;
        const hour = Math.floor(totalMinutesFromStart / 60) + START_HOUR;
        const minute = Math.floor(totalMinutesFromStart % 60);
        const roundedMinute = Math.round(minute / 15) * 15;

        const clickDate = new Date(currentDate);
        clickDate.setHours(hour, roundedMinute, 0, 0);

        setWizardDefaults({ date: clickDate, resourceId });
        setIsWizardOpen(true);
    };

    const handleWizardAppointmentCreated = (appointment: Appointment) => {
        setCalendarEvents(prev => {
            const nextEvent = appointmentToEvent(appointment);
            const filtered = prev.filter(event => !(event.source === 'appointment' && event.originId === appointment.id));
            return [...filtered, nextEvent];
        });
    };
    
    const handleSaveAndClose = async (lead: Lead) => {
        await onSaveLead(lead);
        // Refetch leads después de guardar para asegurar datos actualizados
        try {
            const freshLeads = await getLeads();
            // Si tienes un setter de leads en el padre, deberías llamarlo aquí
            // Por ejemplo: setLeads(freshLeads);
            // Si no, puedes emitir un evento o usar un contexto/global state
        } catch (err) {
            console.error('Error al recargar leads después de guardar:', err);
        }
        if (lead.id && editingLead) {
            setTimeout(() => {
                const updatedLead = leads.find(l => l.id === lead.id);
                if (updatedLead) {
                    setEditingLead(updatedLead);
                }
            }, 100);
        }
    };

    const selectedDateStr = useMemo(() => formatDateForInput(currentDate) ?? '', [currentDate]);

    const eventsForSelectedDate = useMemo(() => {
        if (!selectedDateStr) return [];
        return calendarEvents.filter(event => event.fecha === selectedDateStr && visibleSources.includes(event.source));
    }, [calendarEvents, selectedDateStr, visibleSources]);

    const blocked = useMemo(() => {
        if (!selectedDateStr) return [];
        return BLOCKED_TIMES.filter(b => b.fecha === selectedDateStr && visibleResourceIds.includes(b.recursoId));
    }, [selectedDateStr, visibleResourceIds]);

    const timeSlots = useMemo(() => {
        const slots = [];
        for (let i = START_HOUR; i <= END_HOUR; i++) {
            slots.push(`${i.toString().padStart(2, '0')}:00`);
        }
        return slots;
    }, []);

    const isToday = useMemo(() => {
        const today = new Date();
        return today.getFullYear() === currentDate.getFullYear() &&
               today.getMonth() === currentDate.getMonth() &&
               today.getDate() === currentDate.getDate();
    }, [currentDate]);

    const currentTimePosition = timeToPosition(`${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`);
    const primaryDateLabel = useMemo(() => currentDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }), [currentDate]);
    const secondaryDateLabel = useMemo(() => currentDate.toLocaleDateString('es-ES', { year: 'numeric' }), [currentDate]);
    const viewModeLabel = useMemo(() => VIEW_OPTIONS.find(option => option.id === viewMode)?.label ?? 'Día', [viewMode]);
    const resourceColumnCount = Math.max(visibleResources.length, 1);

    const AppointmentCard: React.FC<{ event: CalendarEvent }> = ({ event }) => {
        const top = timeToPosition(event.horaInicio);
        const height = durationToHeight(event.horaInicio, event.horaFin);
        const palette = event.source === 'lead'
            ? 'bg-gradient-to-br from-[#fff6ee] via-white to-white border-[#f5c7a5]'
            : 'bg-gradient-to-br from-[#ecfdf3] via-white to-white border-[#b4f0ce]';
        const primaryService = event.servicios[0];

        const handleClick = () => {
            if (event.source === 'lead' && event.leadRef) {
                handleEditAppointment(event.leadRef);
            }
        };

        return (
            <div
                onClick={handleClick}
                className={`absolute w-full rounded-2xl border text-xs shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-xl ${palette}`}
                style={{ top: `${top}px`, height: `${Math.max(height, 60)}px`, left: '4px', width: 'calc(100% - 8px)', padding: '0.75rem' }}
            >
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    <span>{event.source === 'lead' ? 'Lead' : 'Cita'}</span>
                    <span className="font-semibold text-slate-600">{event.horaInicio} - {event.horaFin}</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-900 truncate">{event.cliente}</p>
                <p className="text-xs text-slate-600 truncate">
                    {event.servicios.length > 0 ? event.servicios.join(', ') : 'Servicio pendiente'}
                </p>
                {primaryService && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 mt-1 bg-white/80 px-2 py-0.5 rounded-full border border-white/60 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#aa632d]" />
                        {primaryService}
                    </span>
                )}
            </div>
        );
    };

    const BlockedTimeSlot: React.FC<{ block: typeof BLOCKED_TIMES[0] }> = ({ block }) => {
        const top = timeToPosition(block.horaInicio);
        const height = durationToHeight(block.horaInicio, block.horaFin);
        return (
            <div
                key={block.id}
                className="absolute w-full p-2 rounded-2xl text-xs bg-slate-100/80 border border-dashed border-slate-300 text-slate-500 flex items-center justify-center backdrop-blur-sm"
                style={{ top: `${top}px`, height: `${height}px`, left: '4px', width: 'calc(100% - 8px)'}}
            >
                 <p className="font-semibold">{block.titulo}</p>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full gap-6 bg-slate-50 p-6 rounded-3xl overflow-hidden">
            <section className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <button onClick={handleToday} className="px-4 py-2 text-sm font-semibold rounded-2xl border border-slate-200 text-slate-700 hover:border-[#aa632d] hover:text-[#aa632d]">
                            Hoy
                        </button>
                        <div className="flex items-center border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                            <button onClick={() => handleDateChange(-1)} className="p-2.5 text-slate-500 hover:bg-slate-50">
                                <ChevronLeftIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDateChange(1)} className="p-2.5 text-slate-500 hover:bg-slate-50 border-l border-slate-100">
                                <ChevronRightIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{secondaryDateLabel}</p>
                            <h2 className="text-3xl font-semibold text-slate-900 capitalize">{primaryDateLabel}</h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsFilterPanelOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200 rounded-2xl hover:border-[#aa632d]">
                            <FunnelIcon className="w-4 h-4" /> Filtros
                        </button>
                        <button className="p-2.5 text-slate-500 border border-slate-200 rounded-2xl hover:border-[#aa632d]">
                            <Cog6ToothIcon className="w-5 h-5" />
                        </button>
                        <div className="relative" data-view-menu>
                            <button
                                onClick={() => setIsViewMenuOpen(prev => !prev)}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-slate-200 rounded-2xl hover:border-[#aa632d]"
                            >
                                <CalendarDaysIcon className="w-4 h-4 text-[#aa632d]" /> {viewModeLabel}
                                <ChevronDownIcon className="w-4 h-4 text-slate-400" />
                            </button>
                            {isViewMenuOpen && (
                                <div className="absolute right-0 mt-2 w-40 rounded-2xl border border-slate-100 bg-white shadow-lg z-10">
                                    {VIEW_OPTIONS.map(option => (
                                        <button
                                            key={option.id}
                                            onClick={() => {
                                                setViewMode(option.id);
                                                setIsViewMenuOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm ${option.id === viewMode ? 'text-[#aa632d] font-semibold bg-[#fff6ee]' : 'text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button onClick={handleAddClick} className="inline-flex items-center gap-2 bg-[#aa632d] text-white px-4 py-2 rounded-2xl shadow-sm hover:bg-[#8e5225]">
                            <PlusIcon className="w-5 h-5" /> Nueva cita
                        </button>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <div className="relative" data-resource-menu>
                        <button
                            onClick={() => setIsResourceMenuOpen(prev => !prev)}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:border-[#aa632d] hover:text-[#aa632d]"
                        >
                            Seleccionar recursos
                            <ChevronDownIcon
                                className={`w-4 h-4 transition-transform ${isResourceMenuOpen ? 'rotate-180 text-[#aa632d]' : 'text-slate-400'}`}
                            />
                        </button>
                        {isResourceMenuOpen && (
                            <div className="absolute z-20 mt-2 w-64 rounded-2xl border border-slate-100 bg-white shadow-xl p-4 space-y-4">
                                {teamMembers.length > 0 && (
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Equipo</p>
                                        <div className="mt-2 space-y-1">
                                            {teamMembers.map(member => {
                                                const isActive = visibleResourceIds.includes(member.id);
                                                return (
                                                    <label key={member.id} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={isActive}
                                                            onChange={() => handleToggleResourceVisibility(member.id)}
                                                            className="rounded border-slate-300 text-[#aa632d] focus:ring-[#aa632d]"
                                                        />
                                                        <span className="flex-1 truncate">{member.name}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                {sharedSpaces.length > 0 && (
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Recursos</p>
                                        <div className="mt-2 space-y-1">
                                            {sharedSpaces.map(space => {
                                                const isActive = visibleResourceIds.includes(space.id);
                                                return (
                                                    <label key={space.id} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={isActive}
                                                            onChange={() => handleToggleResourceVisibility(space.id)}
                                                            className="rounded border-slate-300 text-[#aa632d] focus:ring-[#aa632d]"
                                                        />
                                                        <span className="flex-1 truncate">{space.name}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 pt-1">
                                    <button
                                        onClick={handleResetResourceVisibility}
                                        className="text-xs font-semibold text-[#aa632d] hover:text-[#8e5225]"
                                    >
                                        Seleccionar todo
                                    </button>
                                    <span className="text-[11px] text-slate-400 flex-1 text-right">{visibleResources.length} activos</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <span className="text-xs uppercase tracking-[0.3em] text-slate-400">{visibleResources.length} recursos activos</span>
                </div>
            </section>

            <section className="bg-white border border-slate-200 rounded-3xl shadow-sm flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white/80 backdrop-blur">
                    <div className="flex items-center gap-3">
                        <CalendarDaysIcon className="w-5 h-5 text-[#aa632d]" />
                        <div>
                            <p className="text-sm font-semibold text-slate-900">{visibleResources.length} recursos visibles</p>
                            <p className="text-xs text-slate-500">Vista · {viewModeLabel}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                        <div className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#f5c7a5]" /> Leads
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" /> Citas
                        </div>
                    </div>
                </div>
                <div className="flex border-b border-slate-100 flex-shrink-0">
                    <div className="w-20 flex-shrink-0" />
                    <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${resourceColumnCount}, minmax(180px, 1fr))` }}>
                        {visibleResources.map(resource => (
                            <div key={resource.id} className="text-center text-sm text-slate-700 px-4 py-3 border-l border-slate-100 flex items-center justify-center gap-3 h-20 bg-slate-50/60">
                                {resource.type === 'personal' ? (
                                    <img src={resource.imageUrl} alt={resource.name} className="w-8 h-8 rounded-full object-cover" />
                                ) : (
                                    <div className="w-8 h-8 flex items-center justify-center bg-white rounded-full border border-slate-200">
                                        <BuildingStorefrontIcon className="w-4 h-4 text-slate-500" />
                                    </div>
                                )}
                                <span className="font-semibold truncate">{resource.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex-1 flex overflow-auto bg-slate-50/60">
                    <div className="w-20 text-right pr-3">
                        {timeSlots.map(time => (
                            <div key={time} className="text-[11px] text-slate-400 relative" style={{ height: `${HOUR_HEIGHT}px` }}>
                                <span className="absolute -top-1.5 right-0">{time}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex-1 grid relative" style={{ gridTemplateColumns: `repeat(${resourceColumnCount}, minmax(180px, 1fr))` }}>
                        {visibleResources.map((resource) => (
                            <div
                                key={resource.id}
                                className="relative border-l border-slate-100 bg-white hover:bg-slate-50/40 transition-colors"
                                onClick={(e) => handleSlotClick(resource.id, e)}
                            >
                                {timeSlots.slice(0, -1).map(time => (
                                    <div key={time} style={{ height: `${HOUR_HEIGHT}px` }} className="relative border-b border-slate-100">
                                        <div className="absolute top-1/2 left-4 right-4 border-b border-dashed border-slate-100"></div>
                                    </div>
                                ))}

                                {eventsForSelectedDate
                                    .filter(event => event.resourceId === resource.id)
                                    .map(event => (
                                        <AppointmentCard key={event.id} event={event} />
                                    ))}

                                {blocked.filter(b => b.recursoId === resource.id).map(block => (
                                    <BlockedTimeSlot key={block.id} block={block} />
                                ))}
                            </div>
                        ))}

                        {isToday && currentTimePosition >= 0 && (
                            <div className="absolute h-0.5 bg-rose-500 z-10" style={{ top: `${currentTimePosition}px`, left: 0, right: 0 }}>
                                <div className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-rose-500 rounded-full" />
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <FiltersPanel
                open={isFilterPanelOpen}
                onClose={() => setIsFilterPanelOpen(false)}
                visibleSources={visibleSources}
                onToggleSource={handleToggleSourceFilter}
                services={services}
            />

            <LeadFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveAndClose}
                onDelete={onDeleteLead}
                lead={editingLead}
                metaCampaigns={metaCampaigns}
                campaigns={campaigns}
                clientSources={clientSources}
                services={services}
                requestConfirmation={requestConfirmation}
                onSaveComprobante={onSaveComprobante}
                comprobantes={comprobantes}
            />
            <AppointmentWizard
                isOpen={isWizardOpen}
                onClose={() => {
                    setIsWizardOpen(false);
                    setWizardDefaults(null);
                }}
                services={services}
                clientSources={clientSources}
                onSaveLead={onSaveLead}
                defaultDate={wizardDefaults?.date}
                defaultResourceId={wizardDefaults?.resourceId}
                onAppointmentCreated={handleWizardAppointmentCreated}
            />
        </div>
    );
};

export default CalendarPage;