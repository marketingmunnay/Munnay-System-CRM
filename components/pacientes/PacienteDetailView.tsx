

import React, { useMemo } from 'react';
import type { Lead, Alergia } from '../../types.ts';
import Modal from '../shared/Modal.tsx';

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const calculateAge = (birthDate?: string): string => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age.toString();
};

interface TimelineEvent {
    date: Date;
    type: 'Lead' | 'Procedimiento' | 'Seguimiento' | 'Llamada';
    title: string;
    details: React.ReactNode;
    content?: React.ReactNode;
}

const eventTypeConfig = {
    Lead: { icon: 'person_add', borderColorClass: 'border-blue-500', iconColorClass: 'text-blue-500', color: '#3b82f6' },
    Procedimiento: { icon: 'vaccines', borderColorClass: 'border-green-500', iconColorClass: 'text-green-500', color: '#22c55e' },
    Seguimiento: { icon: 'rate_review', borderColorClass: 'border-amber-500', iconColorClass: 'text-amber-500', color: '#f59e0b' },
    Llamada: { icon: 'call', borderColorClass: 'border-purple-500', iconColorClass: 'text-purple-500', color: '#a855f7' },
};

const AlergiaItem: React.FC<{ alergia: Alergia }> = ({ alergia }) => {
    return (
        <div className="flex justify-between items-center bg-white p-2 rounded-md border text-sm">
            <span className="text-gray-800 font-medium">{alergia.nombre}</span>
            <div className="flex items-center space-x-1">
                {Array.from({ length: 5 }).map((_, i) => (
                    <span
                        key={i}
                        className={`w-3 h-3 rounded-full ${i < alergia.gravedad ? 'bg-red-500' : 'bg-gray-200'}`}
                        title={`Gravedad: ${alergia.gravedad} de 5`}
                    ></span>
                ))}
            </div>
        </div>
    );
};

const StatCard: React.FC<{ title: string; value: string; icon: string; iconBgClass?: string; iconColorClass?: string }> = ({ title, value, icon, iconBgClass, iconColorClass }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-4">
        <div className={`p-3 rounded-full ${iconBgClass || 'bg-gray-100'}`}>
            <GoogleIcon name={icon} className={`text-lg ${iconColorClass || 'text-gray-600'}`}/>
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);


const PacienteDetailView: React.FC<{ isOpen: boolean, onClose: () => void, paciente: Lead | null }> = ({ isOpen, onClose, paciente }) => {
    
    const timelineEvents = useMemo((): TimelineEvent[] => {
        if (!paciente) return [];
        const events: TimelineEvent[] = [];
        
        events.push({
            date: new Date(paciente.fechaLead + 'T00:00:00'),
            type: 'Lead',
            title: 'Paciente Registrado',
            details: `Origen: ${paciente.redSocial}, Vendedor: ${paciente.vendedor}.`
        });

        paciente.procedimientos?.forEach(p => {
            events.push({
                date: new Date(p.fechaAtencion + 'T' + p.horaInicio),
                type: 'Procedimiento',
                title: `${p.nombreTratamiento} (Sesión ${p.sesionNumero})`,
                details: `Atendido por ${p.personal}. ${p.asistenciaMedica ? `Con ${p.medico}.` : ''}`
            });
        });

        paciente.seguimientos?.forEach(s => {
            const sintomas = [
                s.inflamacion && 'Inflamación', s.ampollas && 'Ampollas', s.alergias && 'Alergias',
                s.malestarGeneral && 'Malestar', s.brote && 'Brote', s.dolorDeCabeza && 'Dolor Cabeza',
                s.moretones && 'Moretones'
            ].filter(Boolean).join(', ');

            events.push({
                date: new Date(s.fechaSeguimiento + 'T09:00:00'),
                type: 'Seguimiento',
                title: 'Seguimiento de Procedimiento',
                details: `Realizado por ${s.personal}.`,
                content: (
                    <div className="space-y-2 text-xs">
                        {sintomas && <p><strong>Síntomas:</strong> {sintomas}.</p>}
                        {s.observacion && (
                            <div className="mt-1 italic bg-amber-50 p-2 rounded-md border border-amber-200 text-amber-900">
                                <p className="font-semibold not-italic">Observación:</p>
                                <p>{s.observacion}</p>
                            </div>
                        )}
                    </div>
                )
            });
        });

        paciente.registrosLlamada?.forEach(l => {
            events.push({
                date: new Date(paciente.fechaLead + 'T10:00:00'), // Placeholder date
                type: 'Llamada',
                title: `Llamada ${l.numeroLlamada} (${l.estadoLlamada})`,
                details: `Duración: ${l.duracionLlamada}.`,
                content: l.observacion ? (
                     <div className="mt-1 text-xs italic bg-amber-50 p-2 rounded-md border border-amber-200 text-amber-900">
                        <p className="font-semibold not-italic">Observación:</p>
                        <p>{l.observacion}</p>
                    </div>
                ) : undefined,
            });
        });

        return events.sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [paciente]);
    
    const groupedEventsByYear = useMemo(() => {
        return timelineEvents.reduce((acc, event) => {
            const year = event.date.getFullYear();
            if (!acc[year]) {
                acc[year] = [];
            }
            acc[year].push(event);
            return acc;
        }, {} as Record<string, TimelineEvent[]>);
    }, [timelineEvents]);

    const stats = useMemo(() => {
        if (!paciente) return { totalPagado: 0, totalTratamientos: 0, totalMembresias: 0 };
        
        const pagoInicial = paciente.montoPagado || 0;
        const pagoTratamientos = (paciente.tratamientos || []).reduce((sum, t) => sum + t.montoPagado, 0);
        
        return {
            totalPagado: pagoInicial + pagoTratamientos,
            totalTratamientos: paciente.tratamientos?.length || 0,
            totalMembresias: paciente.membresiasAdquiridas?.length || 0
        };
    }, [paciente]);


    if (!paciente) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Ficha del Paciente: ${paciente.nombres} ${paciente.apellidos}`} maxWidthClass="max-w-7xl">
            <div className="flex flex-col md:flex-row bg-gray-50 max-h-[calc(90vh-110px)]">
                {/* Left Column */}
                <aside className="w-full md:w-[350px] flex-shrink-0 border-r bg-white p-6 space-y-8 overflow-y-auto">
                    <div className="text-center">
                        <img src="https://picsum.photos/id/237/100/100" alt="Foto del paciente" className="w-28 h-28 rounded-full mx-auto shadow-lg ring-4 ring-white" />
                        <h2 className="mt-4 text-2xl font-bold text-gray-900">{paciente.nombres} {paciente.apellidos}</h2>
                        <p className="text-sm text-gray-500 font-mono">{paciente.nHistoria}</p>
                    </div>

                    <div className="space-y-3">
                        <h3 className="font-semibold text-gray-800 text-base border-b pb-2">Información Personal</h3>
                        <div className="space-y-3 text-sm pt-2">
                             <div className="flex items-center text-gray-700">
                                <GoogleIcon name="cake" className="text-lg mr-3 text-gray-400"/> 
                                <span>{calculateAge(paciente.birthDate)} años</span>
                            </div>
                             <div className="flex items-center text-gray-700">
                                <GoogleIcon name="calendar_month" className="text-lg mr-3 text-gray-400"/> 
                                <span>{paciente.birthDate ? new Date(paciente.birthDate+'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A'}</span>
                            </div>
                            <div className="flex items-center text-gray-700">
                                <GoogleIcon name={paciente.sexo === 'F' ? 'female' : 'male'} className="text-lg mr-3 text-gray-400"/> 
                                <span>{paciente.sexo === 'F' ? 'Femenino' : 'Masculino'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <h3 className="font-semibold text-gray-800 text-base border-b pb-2 flex items-center">
                            <GoogleIcon name="allergy" className="text-lg mr-2 text-red-500" /> Alergias Conocidas
                        </h3>
                        <div className="space-y-2 pt-2">
                            {(paciente.alergias && paciente.alergias.length > 0) ? (
                                paciente.alergias.map(alergia => <AlergiaItem key={alergia.id} alergia={alergia} />)
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4">No se han registrado alergias.</p>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Right Column */}
                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="sticky top-0 bg-gray-50 pt-1 pb-4 z-10">
                         <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                                <button className="flex items-center px-3 py-1.5 text-sm bg-gray-200 text-gray-800 rounded-md font-semibold">
                                    <GoogleIcon name="calendar_today" className="mr-1.5 text-sm"/>
                                    Por fecha
                                </button>
                                <button className="flex items-center px-3 py-1.5 text-sm bg-white border rounded-md text-gray-600 hover:bg-gray-100">
                                    <GoogleIcon name="healing" className="mr-1.5 text-sm"/>
                                    Por afección
                                </button>
                                <button className="flex items-center px-3 py-1.5 text-sm bg-white border rounded-md text-gray-600 hover:bg-gray-100">
                                    <GoogleIcon name="category" className="mr-1.5 text-sm"/>
                                    Por tipo
                                </button>
                            </div>
                            {/* Placeholder for date range selector */}
                            <div className="text-sm text-gray-500">Rango de fechas...</div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <StatCard title="Total Pagado" value={`S/ ${stats.totalPagado.toLocaleString('es-PE')}`} icon="payments" iconBgClass="bg-green-100" iconColorClass="text-green-600"/>
                            <StatCard title="Total de Tratamientos" value={stats.totalTratamientos.toString()} icon="vaccines" iconBgClass="bg-blue-100" iconColorClass="text-blue-600"/>
                            <StatCard title="Total de Membresías" value={stats.totalMembresias.toString()} icon="card_membership" iconBgClass="bg-purple-100" iconColorClass="text-purple-600"/>
                        </div>
                    </div>
                    
                    <div className="mt-6 relative">
                         <div className="absolute left-9 top-2 h-full w-0.5 bg-gray-200"></div>
                         {Object.keys(groupedEventsByYear).sort((a,b) => Number(b) - Number(a)).map(year => (
                             <div key={year} className="relative mb-6">
                                <div className="flex items-center mb-6">
                                    <span className="absolute left-0 w-8 text-right text-sm font-semibold text-gray-600">{year}</span>
                                    <div className="absolute left-[30px] w-4 h-4 bg-purple-600 rounded-full border-4 border-gray-50 z-10"></div>
                                    <div className="pl-[70px]">
                                        <button className="bg-purple-600 text-white text-sm font-semibold px-4 py-1.5 rounded-md shadow-sm hover:bg-purple-700 transition-colors flex items-center">
                                            <GoogleIcon name="visibility" className="mr-2 text-base"/>
                                            Vista de progreso anual
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="pl-[70px] space-y-8">
                                     {groupedEventsByYear[year].map((event, index) => {
                                         const config = eventTypeConfig[event.type];
                                         return (
                                            <div key={index} className="flex items-start">
                                                <span className="w-12 text-right mr-4 text-sm font-medium text-gray-500 capitalize">{event.date.toLocaleDateString('es-ES', { month: 'short' })}.</span>
                                                <div className="absolute left-[34px] top-1 w-2 h-2 bg-gray-300 rounded-full border-2 border-gray-50 z-10"></div>
                                                <div className="relative w-full">
                                                    <div 
                                                        className="absolute -left-2 top-1.5 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8"
                                                        style={{ borderRightColor: config.color }}
                                                    ></div>
                                                    <div className={`bg-white p-3 rounded-lg border-l-4 ${config.borderColorClass} shadow-sm w-full`}>
                                                        <div className="flex items-center">
                                                            <GoogleIcon name={config.icon} className={`mr-3 text-xl ${config.iconColorClass}`} />
                                                            <div>
                                                                <p className="font-semibold text-gray-800 text-sm">{event.title}</p>
                                                                <p className="text-xs text-gray-500">{event.details}</p>
                                                            </div>
                                                        </div>
                                                        {event.content && <div className="mt-2 pl-9">{event.content}</div>}
                                                    </div>
                                                </div>
                                            </div>
                                         )
                                     })}
                                </div>
                             </div>
                         ))}
                    </div>

                </main>
            </div>
        </Modal>
    );
};

export default PacienteDetailView;