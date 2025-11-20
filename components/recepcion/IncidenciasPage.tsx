import React, { useState, useMemo } from 'react';
import type { Incidencia, Lead } from '../../types';
import DateRangeFilter from '../shared/DateRangeFilter.tsx';
import { formatDateTimeForDisplay } from '../../utils/time';
import { PlusIcon, MagnifyingGlassIcon, CheckCircleIcon, XCircleIcon } from '../shared/Icons.tsx';
import IncidenciaFormModal from './IncidenciaFormModal.tsx';

interface IncidenciasPageProps {
    incidencias: Incidencia[];
    pacientes: Lead[];
    onSaveIncidencia: (incidencia: Incidencia) => void;
    onDeleteIncidencia: (incidenciaId: number) => void;
    requestConfirmation: (message: string, onConfirm: () => void) => void;
}

const IncidenciasPage: React.FC<IncidenciasPageProps> = ({ incidencias, pacientes, onSaveIncidencia, onDeleteIncidencia, requestConfirmation }) => {
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIncidencia, setEditingIncidencia] = useState<Incidencia | null>(null);

    const filteredIncidencias = useMemo(() => {
        let results = incidencias;

        if (dateRange.from || dateRange.to) {
            results = results.filter(inc => {
                if (!inc.fecha) return false;
                
                // Simple string comparison for YYYY-MM-DD format
                if (dateRange.from && inc.fecha < dateRange.from) return false;
                if (dateRange.to && inc.fecha > dateRange.to) return false;
                return true;
            });
        }
        
        if (searchTerm) {
            results = results.filter(inc => {
                const paciente = pacientes.find(p => p.id === inc.pacienteId);
                return (
                    inc.nombrePaciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    inc.nHistoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    paciente?.numero.includes(searchTerm)
                );
            });
        }

        return results;
    }, [incidencias, pacientes, dateRange, searchTerm]);

    const handleAddIncidencia = () => {
        setEditingIncidencia(null);
        setIsModalOpen(true);
    };

    const handleEditIncidencia = (incidencia: Incidencia) => {
        setEditingIncidencia(incidencia);
        setIsModalOpen(true);
    };

    const handleSaveAndClose = (incidencia: Incidencia) => {
        onSaveIncidencia(incidencia);
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h1 className="text-2xl font-bold text-black mb-4 md:mb-0">Gestión de Incidencias</h1>
                <div className="flex items-center space-x-3">
                    <DateRangeFilter onApply={setDateRange} />
                    <button 
                        onClick={handleAddIncidencia}
                        className="flex items-center bg-[#aa632d] text-white px-4 py-2 rounded-lg shadow hover:bg-[#8e5225] transition-colors"
                    >
                        <PlusIcon className="mr-2 h-5 w-5" /> Registrar Incidencia
                    </button>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
                 <div className="mb-4">
                     <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, N° historia, celular..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-80 bg-[#f9f9fa] border border-black text-black rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Fecha y Hora</th>
                                <th scope="col" className="px-6 py-3">Paciente</th>
                                <th scope="col" className="px-6 py-3">Tipo Incidencia</th>
                                <th scope="col" className="px-6 py-3">Detalle</th>
                                <th scope="col" className="px-6 py-3 text-center">Solucionado</th>
                                <th scope="col" className="px-6 py-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredIncidencias.map(inc => (
                                <tr key={inc.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">{formatDateTimeForDisplay(inc.fecha + `T${inc.hora}`)}</td>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900">{inc.nombrePaciente}</th>
                                    <td className="px-6 py-4">{inc.tipoIncidencia}</td>
                                    <td className="px-6 py-4">{inc.detalleIncidencia}</td>
                                    <td className="px-6 py-4 text-center">
                                        {inc.solucionado ? (
                                            <span className="inline-flex items-center text-green-600"><CheckCircleIcon className="w-5 h-5 mr-1"/> Sí</span>
                                        ) : (
                                            <span className="inline-flex items-center text-red-600"><XCircleIcon className="w-5 h-5 mr-1"/> No</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleEditIncidencia(inc)} className="font-medium text-[#aa632d] hover:underline">
                                            Ver/Editar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredIncidencias.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <p>No se encontraron incidencias que coincidan con los filtros.</p>
                        </div>
                    )}
                </div>
            </div>

            <IncidenciaFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveAndClose}
                onDelete={onDeleteIncidencia}
                incidencia={editingIncidencia}
                pacientes={pacientes}
                requestConfirmation={requestConfirmation}
            />
        </div>
    );
};

export default IncidenciasPage;