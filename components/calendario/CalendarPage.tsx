import React, { useState, useMemo, useEffect } from 'react';
import { useRef } from 'react';
import { formatDateForInput, parseDate } from '../../utils/time';
import type { Lead, Campaign, ClientSource, Service, MetaCampaign, ComprobanteElectronico, Appointment } from '../../types';
import { RESOURCES } from '../../constants';
import { LeadFormModal } from '../marketing/LeadFormModal'; // FIX: Changed to named import
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon, BuildingStorefrontIcon, FunnelIcon, CalendarDaysIcon, Cog6ToothIcon, ChevronDownIcon, XMarkIcon } from '../shared/Icons';
import AppointmentWizard from './AppointmentWizard';
import { getLeads, getAppointments, getResources as fetchResources } from '../../services/api';

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
    appointmentRef?: Appointment;
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
    const start = new Date(appointment.startTime);
    const end = new Date(appointment.endTime);
    
    const fecha = formatDateForInput(start) || '';
    const horaInicio = `${padTime(start.getHours())}:${padTime(start.getMinutes())}`;
    const horaFin = `${padTime(end.getHours())}:${padTime(end.getMinutes())}`;

    // Mapeo inteligente del recurso visual
    // Priority: Professional ID (como string) > Resource ID (como string)
    // Esto asume que las columnas del calendario se configurarán con estos IDs.
    let resourceId = 'unassigned';
    if (appointment.professionalId) resourceId = `user-${appointment.professionalId}`;
    else if (appointment.resourceId) resourceId = `room-${appointment.resourceId}`;
    
    // Fallback if no ID found (should not happen for valid appts)
    if (resourceId === 'unassigned' && appointment.resourceId) resourceId = String(appointment.resourceId);


    const clienteNombre = appointment.lead 
        ? buildClienteNombre(appointment.lead.nombres, appointment.lead.apellidos)
        : (appointment.clienteNombre || 'Cliente Externo');

    const servicios = appointment.service ? [appointment.service.nombre] : (appointment.servicios?.map(s => s.nombre) || []);

    return {
        id: `appointment-${appointment.id}`,
        source: 'appointment',
        originId: appointment.id,
        fecha,
        horaInicio,
        horaFin,
        resourceId,
        cliente: clienteNombre,
        servicios,
        appointmentRef: appointment,
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
    
    // New States for Fresha-style backend
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [dbResources, setDbResources] = useState<any[]>([]);
    
    // Initial fetch of resources
    useEffect(() => {
        fetchResources().then(res => {
            setDbResources(res);
            // Auto-select all new resources
            if (res && res.length > 0) {
                 setVisibleResourceIds(res.map((r: any) => String(r.id)));
            }
        }).catch(err => console.error("Error fetching resources:", err));
    }, []);

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

    // DRAG AND DROP STATE
    const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);

    const handleDragStart = (e: React.DragEvent, event: CalendarEvent) => {
        setDraggedEvent(event);
        e.dataTransfer.effectAllowed = 'move';
        // Optional: Custom Drag Image
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e: React.DragEvent, resourceId: string) => {
        e.preventDefault();
        if (!draggedEvent || draggedEvent.source !== 'appointment') return;

        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        
        // Calculate Time
        const totalMinutesFromStart = (y / HOUR_HEIGHT) * 60;
        const hour = Math.floor(totalMinutesFromStart / 60) + START_HOUR;
        const minute = Math.floor(totalMinutesFromStart % 60);
        const roundedMinute = Math.round(minute / 15) * 15; // Snap to 15 min

        const newStart = new Date(currentDate);
        newStart.setHours(hour, roundedMinute, 0, 0);

        // Calculate Duration to find new End
        const [startH, startM] = draggedEvent.horaInicio.split(':').map(Number);
        const [endH, endM] = draggedEvent.horaFin.split(':').map(Number);
        const oldStart = new Date(); oldStart.setHours(startH, startM, 0,0);
        const oldEnd = new Date(); oldEnd.setHours(endH, endM, 0,0);
        const durationMs = oldEnd.getTime() - oldStart.getTime();

        const newEnd = new Date(newStart.getTime() + durationMs);
        
        // Optimistic Update
        const originalEvents = [...appointments];
        const updatedEvent = { ...draggedEvent.appointmentRef!, startTime: newStart.toISOString(), endTime: newEnd.toISOString() };
        
        try {
            // Find resource type to update correct ID
            const targetResource = dbResources.find(r => String(r.id) === resourceId);
            const isProfessional = targetResource ? (targetResource.type !== 'room' && targetResource.tipo !== 'ROOM') : true;
            
            const payload: any = {
                appointmentId: draggedEvent.originId,
                newStart: newStart.toISOString(),
                newEnd: newEnd.toISOString(),
            };

            if (isProfessional) {
                payload.newStaffId = resourceId;
            } else {
                payload.newResourceId = resourceId;
            }

            // Call Backend
            // NOTE: Using a relative fetch or a service usually. Using fetch for now as in snippet.
            // Using API_URL if defined, otherwise relative
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            const response = await fetch(`${API_URL}/calendar/appointments/move`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                 const err = await response.json();
                 throw new Error(err.message || "Error al mover");
            }

            const updatedAppt = await response.json();
            
            // Update State
            setAppointments(prev => prev.map(a => a.id === updatedAppt.id ? updatedAppt : a));

        } catch (error) {
            console.error(error);
            alert((error as Error).message); // Simple alert as requested toast logic not present in context
            // Revert is handled by not updating 'appointments' if error
        } finally {
            setDraggedEvent(null);
        }
    };

    // Fetch appointments when date changes
    useEffect(() => {
        const start = new Date(currentDate);
        start.setDate(start.getDate() - 30); // Fetch wide range
        const end = new Date(currentDate);
        end.setDate(end.getDate() + 30);
        
        getAppointments(formatDateForInput(start), formatDateForInput(end))
            .then(data => setAppointments(data))
            .catch(console.error);
    }, [currentDate]);

    // Update calendarEvents when leads OR appointments change
    useEffect(() => {
        const leadEvents = leads
            .map(leadToEvent)
            .filter((e): e is CalendarEvent => e !== null);
            
        const apptEvents = appointments.map(appointmentToEvent);

        setCalendarEvents([...leadEvents, ...apptEvents]);
    }, [leads, appointments]); // Removed dependencies that were not here before check logic

    // Timer for current time line
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Override RESOURCES constant with DB resources if available
    const activeResources = useMemo(() => {
        if (dbResources.length > 0) {
             return dbResources.map(r => ({ 
                 id: String(r.id), 
                 name: r.nombre, // Alias for legacy 'name'
                 nombre: r.nombre,
                 type: (r.type === 'room' || r.tipo === 'ROOM') ? 'espacio' : 'personal',
                 imageUrl: r.avatarUrl || ((r.type === 'room' || r.tipo === 'ROOM') ? undefined : 'https://ui-avatars.com/api/?name=' + r.nombre) // Fallback avatar
             }));
        }
        // Fallback to legacy constant but adapted
        return RESOURCES;
    }, [dbResources]);

    // Groups for UI filters (if needed)
    const teamMembers = useMemo(() => activeResources.filter(resource => resource.type === 'personal'), [activeResources]);
    const sharedSpaces = useMemo(() => activeResources.filter(resource => resource.type !== 'personal'), [activeResources]);
    
    const visibleResources = useMemo(
        () => activeResources.filter(resource => visibleResourceIds.includes(resource.id)),
        [activeResources, visibleResourceIds]
    );

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

    const [hoverInfo, setHoverInfo] = useState<{ resourceId: string, time: string, top: number } | null>(null);

    const handleMouseMove = (resourceId: string, e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const totalMinutesFromStart = (y / HOUR_HEIGHT) * 60;
        
        // Snap to 15 minutes
        const hour = Math.floor(totalMinutesFromStart / 60) + START_HOUR;
        const minute = Math.floor(totalMinutesFromStart % 60);
        const roundedMinute = Math.round(minute / 15) * 15;
        
        // Handle minute overflow (e.g., 60 minutes)
        const finalDate = new Date();
        finalDate.setHours(hour, roundedMinute, 0, 0);
        
        const displayHour = finalDate.getHours();
        const displayMinute = finalDate.getMinutes();
        
        // Calculate snap top position
        const minutesFromStart = (displayHour - START_HOUR) * 60 + displayMinute;
        const top = (minutesFromStart / 60) * HOUR_HEIGHT;

        // Format time string (e.g., 4:00pm)
        const ampm = displayHour >= 12 ? 'pm' : 'am';
        const hour12 = displayHour % 12 || 12;
        const timeStr = `${hour12}:${displayMinute.toString().padStart(2, '0')}${ampm}`;

        setHoverInfo({
            resourceId,
            time: timeStr,
            top
        });
    };

    const handleMouseLeave = () => {
        setHoverInfo(null);
    };

    // Toast state
    const [toast, setToast] = useState<string | null>(null);
    const slotRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    const handleSlotClick = (resourceId: string, e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;

        const totalMinutesFromStart = (y / HOUR_HEIGHT) * 60;
        const hour = Math.floor(totalMinutesFromStart / 60) + START_HOUR;
        const minute = Math.floor(totalMinutesFromStart % 60);
        const roundedMinute = Math.round(minute / 15) * 15;

        const clickDate = new Date(currentDate);
        clickDate.setHours(hour, roundedMinute, 0, 0);

        // Determinar si el slot está bloqueado u ocupado
        const time = `${hour.toString().padStart(2, '0')}:${roundedMinute.toString().padStart(2, '0')}`;
        const isBlocked = blocked.some(b => b.recursoId === resourceId && b.horaInicio <= time && b.horaFin > time);
        const isOccupied = eventsForSelectedDate.some(event => event.resourceId === resourceId && event.horaInicio <= time && event.horaFin > time);
        const slotKey = `${resourceId}-${time}`;
        if (isBlocked || isOccupied) {
            // Shake visual
            const slotDiv = slotRefs.current[slotKey];
            if (slotDiv) {
                slotDiv.classList.add('animate-shake');
                setTimeout(() => slotDiv.classList.remove('animate-shake'), 600);
            }
            setToast(isBlocked ? 'No puedes agendar en un horario bloqueado.' : 'Ya existe una cita en este horario.');
            setTimeout(() => setToast(null), 2500);
            return;
        }
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
        
        // Configuración de colores dinámica basada en estado
        const status = event.source === 'lead' ? event.leadRef?.estado : event.appointmentRef?.estado;
        const statusKey = String(status || '').toLowerCase().replace(/ /g, '_');
        
        const statusStyles: Record<string, string> = {
            'nuevo': 'bg-sky-50 border-sky-200 text-sky-800',
            'seguimiento': 'bg-yellow-50 border-yellow-200 text-yellow-800',
            'por_pagar': 'bg-orange-50 border-orange-200 text-orange-800',
            'agendado': 'bg-green-50 border-green-200 text-green-800',
            'perdido': 'bg-rose-50 border-rose-200 text-rose-800',
            'programada': 'bg-blue-50 border-blue-200 text-blue-800',
            'confirmada': 'bg-emerald-50 border-emerald-200 text-emerald-800',
            'en_proceso': 'bg-purple-50 border-purple-200 text-purple-800',
            'finalizada': 'bg-gray-100 border-gray-300 text-gray-700',
            'cancelada': 'bg-red-50 border-red-200 text-red-800',
            'no_asistio': 'bg-red-100 border-red-300 text-red-900',
        };

        const palette = statusStyles[statusKey] || (event.source === 'lead'
            ? 'bg-gradient-to-br from-[#fff6ee] via-white to-white border-[#f5c7a5]'
            : 'bg-gradient-to-br from-[#ecfdf3] via-white to-white border-[#b4f0ce]');
            
        const primaryService = event.servicios[0];

        const handleClick = () => {
            if (event.source === 'lead' && event.leadRef) {
                handleEditAppointment(event.leadRef);
            }
        };

        return (
            <div
                draggable={event.source === 'appointment'} // Only allow dragging new backend appointments
                onDragStart={(e) => {
                    if (event.source === 'appointment') handleDragStart(e, event);
                }}
                onClick={handleClick}
                className={`absolute w-full rounded-2xl border text-xs shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-xl ${palette} ${event.source === 'appointment' ? 'active:cursor-grabbing hover:cursor-grab' : ''}`}
                style={{ top: `${top}px`, height: `${Math.max(height, 60)}px`, left: '4px', width: 'calc(100% - 8px)', padding: '0.75rem', zIndex: 10 }}
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
                                className="relative border-l border-slate-100 bg-white hover:bg-green-50 transition-colors"
                                onClick={(e) => handleSlotClick(resource.id, e)}
                                onMouseMove={(e) => handleMouseMove(resource.id, e)}
                                onMouseLeave={handleMouseLeave}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, resource.id)}
                            >
                                {timeSlots.slice(0, -1).map(time => {
                                    const isBlocked = blocked.some(b => b.recursoId === resource.id && b.horaInicio <= time && b.horaFin > time);
                                    const isOccupied = eventsForSelectedDate.some(event => event.resourceId === resource.id && event.horaInicio <= time && event.horaFin > time);
                                    let slotClass = "relative border-b border-slate-100 bg-white transition-all duration-150";
                                    let overlay = null;
                                    if (isBlocked) {
                                        slotClass += " bg-red-100 opacity-70";
                                        overlay = <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><span className="text-xs text-red-600 font-bold bg-white/80 rounded px-2 py-1 border border-red-200">No disponible</span></div>;
                                    } else if (isOccupied) {
                                        slotClass += " bg-yellow-100 opacity-80";
                                        overlay = <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><span className="text-xs text-yellow-700 font-bold bg-white/80 rounded px-2 py-1 border border-yellow-200">Ocupado</span></div>;
                                    }
                                    const slotKey = `${resource.id}-${time}`;
                                    return (
                                        <div
                                            key={time}
                                            ref={el => (slotRefs.current[slotKey] = el)}
                                            style={{ height: `${HOUR_HEIGHT}px` }}
                                            className={slotClass}
                                        >
                                            <div className="absolute top-1/2 left-4 right-4 border-b border-dashed border-slate-100"></div>
                                            {overlay}
                                        </div>
                                    );
                                })}
    {/* Toast visual de error */}
    {toast && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-fade-in">
            {toast}
        </div>
    )}
/* Animación shake y fade-in para feedback visual */
<style jsx global>{`
@keyframes shake {
    10%, 90% { transform: translateX(-2px); }
    20%, 80% { transform: translateX(4px); }
    30%, 50%, 70% { transform: translateX(-8px); }
    40%, 60% { transform: translateX(8px); }
}
.animate-shake {
    animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
}
@keyframes fade-in {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
    animation: fade-in 0.4s ease;
}
`}</style>

                                {hoverInfo && hoverInfo.resourceId === resource.id && (
                                    <div
                                        className="absolute left-1 right-1 rounded pointer-events-none bg-indigo-50 border border-indigo-200 flex items-start pl-2 pt-1 transition-all duration-75 ease-out z-20"
                                        style={{ top: `${hoverInfo.top}px`, height: '45px' }} 
                                    >
                                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-100/50 px-1 rounded">{hoverInfo.time}</span>
                                    </div>
                                )}

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
                resources={dbResources}
            />
        </div>
    );
};

export default CalendarPage;