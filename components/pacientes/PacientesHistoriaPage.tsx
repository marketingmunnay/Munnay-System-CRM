
import React, { useState, useMemo } from 'react';
import type { Lead } from '../../types.ts';
import PacienteDetailView from './PacienteDetailView.tsx';
import { MagnifyingGlassIcon } from '../shared/Icons.tsx';

interface PacientesHistoriaPageProps {
    leads: Lead[];
}

const PacientesHistoriaPage: React.FC<PacientesHistoriaPageProps> = ({ leads }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPaciente, setSelectedPaciente] = useState<Lead | null>(null);

    const pacientes = useMemo(() => {
        return leads.filter(lead => lead.nHistoria);
    }, [leads]);

    const filteredPacientes = useMemo(() => {
        if (!searchTerm) return pacientes;
        return pacientes.filter(p => 
            `${p.nombres} ${p.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.nHistoria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.numero.includes(searchTerm)
        );
    }, [pacientes, searchTerm]);

    const handleViewDetails = (paciente: Lead) => {
        setSelectedPaciente(paciente);
    };
    
    return (
        <div>
            <h1 className="text-2xl font-bold text-black mb-6">Historia de Pacientes</h1>

            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-black">Listado de Pacientes</h3>
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar paciente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-64 bg-[#f9f9fa] border border-black text-black rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">N° Historia</th>
                                <th scope="col" className="px-6 py-3">Paciente</th>
                                <th scope="col" className="px-6 py-3">Teléfono</th>
                                <th scope="col" className="px-6 py-3">Última Visita</th>
                                <th scope="col" className="px-6 py-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPacientes.map(paciente => (
                                <tr key={paciente.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-mono">{paciente.nHistoria}</td>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900">{paciente.nombres} {paciente.apellidos}</th>
                                    <td className="px-6 py-4">{paciente.numero}</td>
                                    <td className="px-6 py-4">{paciente.fechaHoraAgenda ? new Date(paciente.fechaHoraAgenda).toLocaleDateString('es-PE') : 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleViewDetails(paciente)} className="font-medium text-[#aa632d] hover:underline">Ver Historia</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {filteredPacientes.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <p>No se encontraron pacientes que coincidan con la búsqueda.</p>
                        </div>
                    )}
                </div>
            </div>

            <PacienteDetailView 
                isOpen={!!selectedPaciente}
                onClose={() => setSelectedPaciente(null)}
                paciente={selectedPaciente}
            />
        </div>
    );
};

export default PacientesHistoriaPage;