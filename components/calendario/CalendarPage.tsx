import React, { useState, useMemo, useEffect } from 'react';
import type { Lead, Campaign, ClientSource, Service, MetaCampaign, ComprobanteElectronico } from '../../types.ts';
import { LeadStatus, Seller } from '../../types.ts';
import { RESOURCES } from '../../constants.ts';
import LeadFormModal from '../marketing/LeadFormModal.tsx';
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon, BuildingStorefrontIcon, FunnelIcon } from '../shared/Icons.tsx';

// FIX: Update props to receive metaCampaigns for the LeadFormModal.
// FIX: Add onDeleteLead and requestConfirmation to props
interface CalendarPageProps {
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


// FIX: Destructure metaCampaigns from props.
// FIX: Fix function component return type by completing the component.
const CalendarPage: React.FC<CalendarPageProps> = ({ leads, metaCampaigns, onSaveLead, onDeleteLead, clientSources, services, requestConfirmation, onSaveComprobante, comprobantes }) => {
    const [currentDate, setCurrentDate] = useState(new Date('2023-11-05T12:00:00'));
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const handleDateChange = (days: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + days);
            return newDate;
        });
    };
    
    const handleToday = () => setCurrentDate(new Date());
    
    const handleAddClick = () => {
        setEditingLead(null);
        setIsModalOpen(true);
    }
    
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

        const isoDateTimeLocal = `${clickDate.getFullYear()}-${(clickDate.getMonth() + 1).toString().padStart(2, '0')}-${clickDate.getDate().toString().padStart(2, '0')}T${clickDate.getHours().toString().padStart(2, '0')}:${clickDate.getMinutes().toString().padStart(2, '0')}`;

        const newLead: Partial<Lead> = {
            id: Date.now(),
            estado: LeadStatus.Agendado,
            fechaHoraAgenda: isoDateTimeLocal,
            recursoId: resourceId,
            fechaLead: new Date().toISOString().split('T')[0],
            montoPagado: 0,
            servicios: [],
            nombres: '',
            apellidos: '',
            numero: '',
            vendedor: Seller.Vanesa,
            sexo: 'F',
            redSocial: 'Instagram',
            categoria: '',
            anuncio: '',
        };
        
        setEditingLead(newLead as Lead);
        setIsModalOpen(true);
    };
    
    const handleSaveAndClose = (lead: Lead) => {
        onSaveLead(lead);
        setIsModalOpen(false);
    }

    const { appointments, blocked } = useMemo(() => {
        const selectedDateStr = currentDate.toISOString().split('T')[0];
        const appointments = leads.filter(lead => 
            lead.estado === LeadStatus.Agendado && 
            lead.fechaHoraAgenda &&
            lead.fechaHoraAgenda.startsWith(selectedDateStr)
        );
        const blocked = BLOCKED_TIMES.filter(b => b.fecha === selectedDateStr);
        return { appointments, blocked };
    }, [leads, currentDate]);

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

    const AppointmentCard: React.FC<{ appointment: Lead }> = ({ appointment }) => {
        if (!appointment.fechaHoraAgenda) return null;
    
        const startTime = appointment.fechaHoraAgenda.split('T')[1].substring(0, 5);
        const appDate = new Date(appointment.fechaHoraAgenda);
        // Assuming 1 hour duration for all appointments as there is no end time in the model
        appDate.setHours(appDate.getHours() + 1); 
        const endTime = `${appDate.getHours().toString().padStart(2, '0')}:${appDate.getMinutes().toString().padStart(2, '0')}`;
        
        const top = timeToPosition(startTime);
        const height = durationToHeight(startTime, endTime);
    
        return (
            <div 
                onClick={() => handleEditAppointment(appointment)}
                className={`absolute w-full p-2 rounded-lg text-xs overflow-hidden ${getServiceColor(appointment.servicios[0])} cursor-pointer transition-all hover:shadow-lg hover:ring-2 hover:ring-offset-1 hover:ring-purple-400`}
                style={{ top: `${top}px`, height: `${Math.max(height, 40)}px`, left: '2px', width: 'calc(100% - 4px)'}}
            >
                <p className="font-bold truncate text-sm">{appointment.nombres} {appointment.apellidos}</p>
                <p className="truncate text-gray-700">{appointment.servicios.join(', ')}</p>
                <p className="absolute bottom-1 right-2 text-xs font-medium">{startTime} - {endTime}</p>
            </div>
        );
    };

    const BlockedTimeSlot: React.FC<{ block: typeof BLOCKED_TIMES[0] }> = ({ block }) => {
        const top = timeToPosition(block.horaInicio);
        const height = durationToHeight(block.horaInicio, block.horaFin);
        return (
            <div
                key={block.id}
                className="absolute w-full p-2 rounded-lg text-xs overflow-hidden bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center"
                style={{ top: `${top}px`, height: `${height}px`, left: '2px', width: 'calc(100% - 4px)'}}
            >
                 <p className="font-semibold">{block.titulo}</p>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
            <header className="flex items-center justify-between p-4 border-b flex-shrink-0 bg-gray-50/50">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center border bg-white rounded-md shadow-sm">
                        <button onClick={() => handleDateChange(-1)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-l-md"><ChevronLeftIcon className="w-5 h-5"/></button>
                        <button onClick={handleToday} className="px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 border-l border-r">Hoy</button>
                        <button onClick={() => handleDateChange(1)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-r-md"><ChevronRightIcon className="w-5 h-5" /></button>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 tracking-tight capitalize">
                        {currentDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </h2>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="flex items-center px-4 py-2 text-sm font-semibold text-gray-700 bg-white border rounded-md hover:bg-gray-100 shadow-sm">
                        <FunnelIcon className="w-4 h-4 mr-2"/>
                        Todo el equipo
                    </button>
                    <button onClick={handleAddClick} className="flex items-center bg-[#aa632d] text-white px-4 py-2 rounded-lg shadow hover:bg-[#8e5225] transition-colors">
                        <PlusIcon className="mr-2 h-5 w-5" /> Agendar Cita
                    </button>
                </div>
            </header>

            <div className="flex border-b border-gray-200 flex-shrink-0 sticky top-0 bg-white z-10">
                <div className="w-16 flex-shrink-0"></div>
                <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${RESOURCES.length}, minmax(150px, 1fr))` }}>
                    {RESOURCES.map(resource => (
                        <div key={resource.id} className="text-center text-sm text-gray-700 p-2 border-l flex items-center justify-center space-x-2 h-16">
                           {resource.type === 'personal' ? (
                               <img src={resource.imageUrl} alt={resource.name} className="w-8 h-8 rounded-full object-cover"/>
                           ) : (
                               <div className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full">
                                    <BuildingStorefrontIcon className="w-5 h-5 text-gray-500" />
                               </div>
                           )}
                           <span className="font-semibold truncate">{resource.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex overflow-auto">
                <div className="w-16 text-right pr-2">
                    {timeSlots.map(time => (
                        <div key={time} className="text-xs text-gray-400 relative" style={{ height: `${HOUR_HEIGHT}px` }}>
                            <span className="absolute -top-1.5">{time}</span>
                        </div>
                    ))}
                </div>

                <div className="flex-1 grid relative" style={{ gridTemplateColumns: `repeat(${RESOURCES.length}, minmax(150px, 1fr))` }}>
                    {RESOURCES.map((resource) => (
                        <div 
                            key={resource.id} 
                            className="relative border-l border-gray-100 group"
                            onClick={(e) => handleSlotClick(resource.id, e)}
                        >
                            {timeSlots.slice(0, -1).map(time => (
                                <div key={time} style={{ height: `${HOUR_HEIGHT}px` }} className="relative border-b border-gray-100">
                                    <div className="absolute top-1/2 left-0 w-full border-b border-dashed border-gray-100"></div>
                                </div>
                            ))}

                            {appointments.filter(a => a.recursoId === resource.id).map(app => (
                                <AppointmentCard key={app.id} appointment={app} />
                            ))}

                             {blocked.filter(b => b.recursoId === resource.id).map(block => (
                                <BlockedTimeSlot key={block.id} block={block} />
                             ))}
                        </div>
                    ))}

                    {isToday && currentTimePosition >= 0 && (
                        <div className="absolute h-0.5 bg-red-500 z-10" style={{ top: `${currentTimePosition}px`, left: '0', right: 0 }}>
                            <div className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-red-500 rounded-full"></div>
                        </div>
                    )}
                </div>
            </div>
             {/* FIX: Pass metaCampaigns to LeadFormModal instead of campaigns. */}
             {/* FIX: Pass onDelete and requestConfirmation to LeadFormModal */}
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
                onSaveComprobante={onSaveComprobante}
                comprobantes={comprobantes}
            />
        </div>
    );
};

export default CalendarPage;