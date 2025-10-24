import React, { useState, useMemo } from 'react';
import type { Lead, Procedure, ClientSource, Service, MetaCampaign } from '../../types.ts';
import { AtencionStatus, ReceptionStatus } from '../../types.ts';
import DateRangeFilter from '../shared/DateRangeFilter.tsx';
import { EyeIcon, UserIcon, ClockIcon } from '../shared/Icons.tsx';
import LeadFormModal from '../marketing/LeadFormModal.tsx';
import StatCard from '../dashboard/StatCard.tsx';

// FIX: Update props to receive metaCampaigns for the LeadFormModal.
// FIX: Add onDeleteLead and requestConfirmation to props
interface AtencionesDiariasPageProps {
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

interface Atencion {
    lead: Lead;
    procedure: Procedure;
    status: AtencionStatus;
}

const statusConfig: Record<AtencionStatus, { title: string; color: string; textColor: string; }> = {
    [AtencionStatus.PorAtender]: { title: 'Por Atender', color: 'bg-sky-200', textColor: 'text-sky-800' },
    [AtencionStatus.EnSeguimiento]: { title: 'En Seguimiento', color: 'bg-yellow-200', textColor: 'text-yellow-800' },
    [AtencionStatus.SeguimientoHecho]: { title: 'Seguimiento Hecho', color: 'bg-green-200', textColor: 'text-green-800' },
};

const getProcedimientoStatus = (lead: Lead, procedure: Procedure): AtencionStatus => {
    const hasSeguimiento = lead.seguimientos?.some(s => s.procedimientoId === procedure.id);
    if (hasSeguimiento) {
        return AtencionStatus.SeguimientoHecho;
    }
    
    if (lead.estadoRecepcion === ReceptionStatus.Atendido) {
        return AtencionStatus.EnSeguimiento;
    }

    return AtencionStatus.PorAtender;
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
                            <tr key={atencion.procedure.id} className="bg-white border-b hover:bg-gray-50">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                    {atencion.lead.nombres} {atencion.lead.apellidos}
                                </th>
                                <td className="px-6 py-4 font-semibold">{atencion.procedure.horaInicio}</td>
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
                    </tbody>
                </table>
                 {atenciones.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <p>No hay atenciones registradas para el rango de fechas seleccionado.</p>
                    </div>
                )}
            </div>
        </div>
    );
};


// FIX: Destructure metaCampaigns from props.
// FIX: Fix function component return type by completing the component.
const AtencionesDiariasPage: React.FC<AtencionesDiariasPageProps> = ({ leads, metaCampaigns, onSaveLead, onDeleteLead, clientSources, services, requestConfirmation }) => {
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  const atencionesDelDia = useMemo(() => {
    const fromDateStr = dateRange.from ? new Date(`${dateRange.from}T00:00:00`).toISOString().split('T')[0] : '';
    const toDateStr = dateRange.to ? new Date(`${dateRange.to}T23:59:59`).toISOString().split('T')[0] : '';

    const atenciones: Atencion[] = [];
    leads.forEach(lead => {
        if (lead.procedimientos) {
            lead.procedimientos.forEach(proc => {
                let include = true;
                if (fromDateStr && proc.fechaAtencion < fromDateStr) include = false;
                if (toDateStr && proc.fechaAtencion > toDateStr) include = false;

                if (include) {
                    atenciones.push({
                        lead,
                        procedure: proc,
                        status: getProcedimientoStatus(lead, proc),
                    });
                }
            });
        }
    });

    return atenciones.sort((a, b) => a.procedure.horaInicio.localeCompare(b.procedure.horaInicio));
  }, [leads, dateRange]);

  const stats = useMemo(() => {
    const totalAtenciones = atencionesDelDia.length;
    const porAtender = atencionesDelDia.filter(a => a.status === AtencionStatus.PorAtender).length;
    const enSeguimiento = atencionesDelDia.filter(a => a.status === AtencionStatus.EnSeguimiento).length;
    const seguimientoHecho = atencionesDelDia.filter(a => a.status === AtencionStatus.SeguimientoHecho).length;
    return { totalAtenciones, porAtender, enSeguimiento, seguimientoHecho };
  }, [atencionesDelDia]);

  const handleApplyDateFilter = (dates: { from: string, to: string }) => {
    setDateRange(dates);
  };

  const handleEditAtencion = (lead: Lead) => {
    setEditingLead(lead);
    setIsModalOpen(true);
  };

  const handleSaveAndClose = (lead: Lead) => {
    onSaveLead(lead);
    setIsModalOpen(false);
  };

  const kanbanColumns = Object.values(AtencionStatus);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-black mb-4 md:mb-0">Atenciones Diarias</h1>
        <div className="flex items-center space-x-3">
          <DateRangeFilter onApply={handleApplyDateFilter} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatCard title="Total Atenciones" value={stats.totalAtenciones.toString()} icon={<GoogleIcon name="medical_services" className="text-blue-500"/>} iconBgClass="bg-blue-100" />
        <StatCard title="Por Atender" value={stats.porAtender.toString()} icon={<GoogleIcon name="pending_actions" className="text-sky-500"/>} iconBgClass="bg-sky-100" />
        <StatCard title="En Seguimiento" value={stats.enSeguimiento.toString()} icon={<GoogleIcon name="hourglass_top" className="text-yellow-500"/>} iconBgClass="bg-yellow-100" />
        <StatCard title="Seguimiento Hecho" value={stats.seguimientoHecho.toString()} icon={<GoogleIcon name="task_alt" className="text-green-500"/>} iconBgClass="bg-green-100" />
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
            const atencionesInColumn = atencionesDelDia.filter(a => a.status === status);
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
                  <KanbanCard key={atencion.procedure.id} atencion={atencion} onClick={handleEditAtencion} />
                ))}
              </KanbanColumn>
            );
          })}
        </div>
      ) : (
        <AtencionesTable atenciones={atencionesDelDia} onEdit={handleEditAtencion} />
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

export default AtencionesDiariasPage;