import React, { useState, useMemo } from 'react';
import type { Lead, Procedure, ClientSource, Service, MetaCampaign, ComprobanteElectronico, Campaign } from '../../types';
import { AtencionStatus, ReceptionStatus } from '../../types';
import DateRangeFilter from '../shared/DateRangeFilter';
import { EyeIcon, UserIcon, ClockIcon } from '../shared/Icons';
import { LeadFormModal } from '../marketing/LeadFormModal'; // FIX: Changed to named import
import StatCard from '../dashboard/StatCard';

interface AtencionesDiariasPageProps {
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

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

interface Atencion {
    lead: Lead;
    procedure: Procedure;
    status: AtencionStatus;
}

const statusConfig: Record<AtencionStatus, { title: string; color: string; textColor: string; }> = {
    [AtencionStatus.PorAtender]: { title: 'Por Atender', color: 'bg-sky-200', textColor: 'text-sky-800' },
    [AtencionStatus.Atendido]: { title: 'Atendido', color: 'bg-blue-200', textColor: 'text-blue-800' },
    [AtencionStatus.EnSeguimiento]: { title: 'En Seguimiento', color: 'bg-yellow-200', textColor: 'text-yellow-800' },
    [AtencionStatus.SeguimientoHecho]: { title: 'Seguimiento Hecho', color: 'bg-green-200', textColor: 'text-green-800' },
};

// Normalize reception status tokens (backend) or display values into the UI enum values
const normalizeReception = (value?: string) => {
    if (!value) return ReceptionStatus.Agendado;
    const s = String(value).trim();
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
    if (Object.values(ReceptionStatus).includes(s as any)) return s as any;
    return map[s] ?? ReceptionStatus.Agendado;
};

const getProcedimientoStatus = (lead: Lead, procedure: Procedure): AtencionStatus => {
    const hasSeguimiento = lead.seguimientos?.some(s => s.procedimientoId === procedure.id);
    // If there's already a seguimiento, it's done
    if (hasSeguimiento) return AtencionStatus.SeguimientoHecho;

    // If reception says 'Atendido' show it in Atendido column (no seguimiento yet)
    const estado = normalizeReception(lead.estadoRecepcion);
    if (estado === ReceptionStatus.Atendido) return AtencionStatus.Atendido;

    // If procedure exists but reception not 'Atendido', consider it En Seguimiento
    return AtencionStatus.EnSeguimiento;
};


const KanbanCard: React.FC<{ atencion: Atencion; onClick: (lead: Lead) => void }> = ({ atencion, onClick }) => (
    <div 
        onClick={() => onClick(atencion.lead)}
        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4 cursor-pointer hover:shadow-md hover:border-purple-400 transition-all"
    >
        <div className="flex justify-between items-start">
            <h4 className="font-bold text-gray-800 text-sm">{atencion.lead.nombres} {atencion.lead.apellidos}</h4>
             <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                {atencion.lead.nHistoria}
            </span>
        </div>
        <p className="text-xs text-gray-500 mt-1 truncate">{atencion.procedure.nombreTratamiento} - Sesión {atencion.procedure.sesionNumero}</p>
        <div className="mt-4 flex justify-between items-center text-xs text-gray-600">
            <div className="flex items-center">
                <UserIcon className="mr-1 h-3 w-3" />
                <span>{atencion.procedure.personal}</span>
            </div>
        </div>
        <div className="mt-2 flex items-center text-xs text-purple-700 font-medium bg-purple-100 p-1 rounded">
            <ClockIcon className="mr-1.5 h-3 w-3"/>
            <span>{atencion.procedure.horaInicio} - {atencion.procedure.horaFin}</span>
        </div>
    </div>
);

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

const AtencionesTable: React.FC<{ atenciones: Atencion[], onEdit: (lead: Lead) => void }> = ({ atenciones, onEdit }) => {
    const statusColor: Record<AtencionStatus, string> = {
        [AtencionStatus.PorAtender]: 'text-blue-600 bg-blue-100',
        [AtencionStatus.EnSeguimiento]: 'text-yellow-600 bg-yellow-100',
        [AtencionStatus.SeguimientoHecho]: 'text-green-600 bg-green-100',
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Paciente</th>
                            <th scope="col" className="px-6 py-3">Hora</th>
                            <th scope="col" className="px-6 py-3">Tratamiento</th>
                            <th scope="col" className="px-6 py-3">Personal</th>
                            <th scope="col" className="px-6 py-3">Estado</th>
                            <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {atenciones.map(atencion => (
                            <tr key={`${atencion.lead.id}-${atencion.procedure.id}`} className="bg-white border-b hover:bg-gray-50">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                    {atencion.lead.nombres} {atencion.lead.apellidos}
                                    <p className="text-xs text-gray-500 font-normal">{atencion.lead.nHistoria}</p>
                                </th>
                                <td className="px-6 py-4">{atencion.procedure.horaInicio} - {atencion.procedure.horaFin}</td>
                                <td className="px-6 py-4">{atencion.procedure.nombreTratamiento} (Sesión {atencion.procedure.sesionNumero})</td>
                                <td className="px-6 py-4">{atencion.procedure.personal}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor[atencion.status]}`}>
                                        {atencion.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => onEdit(atencion.lead)} className="font-medium text-[#aa632d] hover:underline flex items-center justify-center mx-auto">
                                        <EyeIcon className="w-4 h-4 mr-1"/> Ver Ficha
                                    </button>
                                </td>
                            </tr>
                        ))}
                         {atenciones.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <p>No hay atenciones programadas para el rango de fechas seleccionado.</p>
                            </div>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const AtencionesDiariasPage: React.FC<AtencionesDiariasPageProps> = ({ leads, campaigns, metaCampaigns, onSaveLead, onDeleteLead, clientSources, services, requestConfirmation, onSaveComprobante, comprobantes }) => {
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

    const filteredAtenciones = useMemo(() => {
        let allAtenciones: Atencion[] = [];

        // Filter leads that have accepted treatments and procedures
        const relevantLeads = leads.filter(lead => {
            const estado = normalizeReception(lead.estadoRecepcion);
            const hasTreatments = lead.tratamientos && lead.tratamientos.length > 0;
            const hasProcedures = lead.procedimientos && lead.procedimientos.length > 0;
            // Include leads that accepted treatment OR leads that are in Por Atender reception status
            return (lead.aceptoTratamiento === 'Si' || estado === ReceptionStatus.PorAtender)
                && hasTreatments && hasProcedures;
        });

        // Flatten procedures into individual 'Atencion' objects
        relevantLeads.forEach(lead => {
            lead.procedimientos?.forEach(procedure => {
                allAtenciones.push({
                    lead,
                    procedure,
                    status: getProcedimientoStatus(lead, procedure)
                });
            });
        });

        // Apply date range filter based on procedure date
        if (dateRange.from || dateRange.to) {
            allAtenciones = allAtenciones.filter(atencion => {
                if (!atencion.procedure.fechaAtencion) return false;
                
                // Simple string comparison for YYYY-MM-DD format
                if (dateRange.from && atencion.procedure.fechaAtencion < dateRange.from) return false;
                if (dateRange.to && atencion.procedure.fechaAtencion > dateRange.to) return false;
                return true;
            });
        }
        
        // Group by patient - show only the most recent procedure for each patient
        const groupedByPatient = new Map<number, Atencion>();
        
        allAtenciones
            .sort((a, b) => {
                // Sort by date and time to get most recent first
                const dateA = new Date(`${a.procedure.fechaAtencion}T${a.procedure.horaInicio}`);
                const dateB = new Date(`${b.procedure.fechaAtencion}T${b.procedure.horaInicio}`);
                return dateB.getTime() - dateA.getTime(); // Most recent first
            })
            .forEach(atencion => {
                // Only keep the first (most recent) procedure for each patient
                if (!groupedByPatient.has(atencion.lead.id)) {
                    groupedByPatient.set(atencion.lead.id, atencion);
                }
            });

        // Convert back to array and sort by date/time
        return Array.from(groupedByPatient.values()).sort((a, b) => {
            const dateA = new Date(`${a.procedure.fechaAtencion}T${a.procedure.horaInicio}`);
            const dateB = new Date(`${b.procedure.fechaAtencion}T${b.procedure.horaInicio}`);
            return dateA.getTime() - dateB.getTime();
        });

    }, [leads, dateRange]);
    
    const stats = useMemo(() => {
        const totalAtenciones = filteredAtenciones.length;
        const atendidas = filteredAtenciones.filter(a => a.status === AtencionStatus.SeguimientoHecho).length;
        const enSeguimiento = filteredAtenciones.filter(a => a.status === AtencionStatus.EnSeguimiento).length;
        const porAtender = filteredAtenciones.filter(a => a.status === AtencionStatus.PorAtender).length;

        return {
            totalAtenciones,
            atendidas,
            enSeguimiento,
            porAtender
        };
    }, [filteredAtenciones]);


    const handleApplyDateFilter = (dates: { from: string, to: string }) => {
        setDateRange(dates);
    };

    const handleEditAtencion = (lead: Lead) => {
        setEditingLead(lead);
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

    const kanbanColumns = Object.values(AtencionStatus);

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h1 className="text-2xl font-bold text-black mb-4 md:mb-0">Atenciones Diarias</h1>
                <DateRangeFilter onApply={handleApplyDateFilter} />
            </div>

            {/* Information Note */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <GoogleIcon name="info" className="text-blue-400" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-blue-700">
                            <strong>Vista resumida:</strong> Se muestra únicamente la atención más reciente de cada paciente. 
                            Para ver todos los procedimientos, utiliza el formulario de edición del paciente.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard 
                    title="Total Atenciones" 
                    value={stats.totalAtenciones.toString()} 
                    icon={<GoogleIcon name="local_hospital" className="text-blue-500"/>}
                    iconBgClass="bg-blue-100"
                />
                 <StatCard 
                    title="Atenciones Realizadas (Seguimiento Hecho)" 
                    value={stats.atendidas.toString()}
                    icon={<GoogleIcon name="task_alt" className="text-green-500"/>}
                    iconBgClass="bg-green-100"
                />
                <StatCard 
                    title="Atenciones en Seguimiento" 
                    value={stats.enSeguimiento.toString()}
                    icon={<GoogleIcon name="hourglass_empty" className="text-yellow-500"/>}
                    iconBgClass="bg-yellow-100"
                />
                <StatCard 
                    title="Atenciones Por Atender" 
                    value={stats.porAtender.toString()}
                    icon={<GoogleIcon name="pending_actions" className="text-orange-500"/>}
                    iconBgClass="bg-orange-100"
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
                    const atencionesInColumn = filteredAtenciones.filter(atencion => atencion.status === status);
                    const config = statusConfig[status];
                    return (
                        <KanbanColumn 
                            key={status} 
                            title={config.title} 
                            color={config.color} 
                            textColor={config.textColor}
                            count={atencionesInColumn.length}
                        >
                            {atencionesInColumn.map(atencion => (
                                <KanbanCard key={`${atencion.lead.id}-${atencion.procedure.id}`} atencion={atencion} onClick={handleEditAtencion} />
                            ))}
                        </KanbanColumn>
                    );
                })}
            </div>
        ) : (
            <AtencionesTable atenciones={filteredAtenciones} onEdit={handleEditAtencion} />
        )}

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
        </div>
    );
};