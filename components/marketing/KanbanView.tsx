import React from 'react';
import type { Lead } from '../../types';
import { LeadStatus } from '../../types';
import { ClockIcon, CurrencyDollarIcon, UserIcon } from '../shared/Icons';

interface KanbanViewProps {
  leads: Lead[];
  onCardClick: (lead: Lead) => void;
}

interface KanbanCardProps {
  lead: Lead;
  onClick: () => void;
}

const statusConfig: Record<LeadStatus, { title: string, color: string, textColor: string }> = {
    [LeadStatus.Nuevo]: { title: 'Nuevo', color: 'bg-sky-200', textColor: 'text-sky-800' },
    [LeadStatus.Seguimiento]: { title: 'Seguimiento', color: 'bg-yellow-200', textColor: 'text-yellow-800' },
    [LeadStatus.PorPagar]: { title: 'Por Pagar', color: 'bg-orange-200', textColor: 'text-orange-800' },
    [LeadStatus.Agendado]: { title: 'Agendado', color: 'bg-green-200', textColor: 'text-green-800' },
    [LeadStatus.Perdido]: { title: 'Perdido', color: 'bg-rose-200', textColor: 'text-rose-800' },
};

const KanbanCard: React.FC<KanbanCardProps> = ({ lead, onClick }) => (
    <div 
        onClick={onClick}
        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4 cursor-pointer hover:shadow-md hover:border-purple-400 transition-all"
    >
        <div className="flex justify-between items-start">
            <h4 className="font-bold text-gray-800 text-sm">{lead.nombres} {lead.apellidos}</h4>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${lead.redSocial === 'Instagram' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                {lead.redSocial}
            </span>
        </div>
        <p className="text-xs text-gray-500 mt-1 truncate">{lead.servicios.join(', ')}</p>
        <div className="mt-4 flex justify-between items-center text-xs text-gray-600">
            <div className="flex items-center">
                <UserIcon className="mr-1 h-3 w-3" />
                <span>{lead.vendedor}</span>
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
                <span>{new Date(lead.fechaHoraAgenda).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
        )}
    </div>
);


const KanbanColumn: React.FC<{ title: string; color: string; textColor: string; children: React.ReactNode; count: number }> = ({ title, color, textColor, children, count }) => (
    <div className="bg-gray-100 rounded-lg w-full md:w-72 flex-shrink-0">
        <div className={`p-3 flex justify-between items-center rounded-t-lg ${color}`}>
            <h3 className={`font-semibold ${textColor} text-sm`}>{title}</h3>
            <span className={`${textColor} text-sm font-bold bg-black/10 rounded-full px-2 py-0.5`}>{count}</span>
        </div>
        <div className="p-2 h-full overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            {children}
        </div>
    </div>
);

const KanbanView: React.FC<KanbanViewProps> = ({ leads, onCardClick }) => {
  const columns: LeadStatus[] = Object.values(LeadStatus);

  return (
    <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 overflow-x-auto pb-4">
        {columns.map(status => {
            const filteredLeads = leads.filter(lead => lead.estado === status);
            const config = statusConfig[status];
            return (
                <KanbanColumn key={status} title={config.title} color={config.color} textColor={config.textColor} count={filteredLeads.length}>
                    {filteredLeads.map(lead => (
                        <KanbanCard key={lead.id} lead={lead} onClick={() => onCardClick(lead)} />
                    ))}
                </KanbanColumn>
            );
        })}
    </div>
  );
};

export default KanbanView;