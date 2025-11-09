import React, { useState, useMemo, useEffect } from 'react';
import type { Lead, Seguimiento } from '../../types.ts';
import SeguimientoDetailModal from './SeguimientoDetailModal.tsx';
import { formatDateForDisplay } from '../../utils/time.ts';
import * as api from '../../services/api.ts';

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

interface SeguimientoIAAnalysisTableProps {
    leads: Lead[];
}

type AnalysisCategory = 'Requiere Atención Urgente' | 'Requiere Seguimiento' | 'Evolución Normal' | 'Sin Datos Suficientes' | 'Error de Análisis';
interface AnalysisResult {
    status: 'loading' | 'success' | 'error';
    category?: AnalysisCategory;
}

const categoryConfig: Record<AnalysisCategory, { color: string, icon: string }> = {
    'Requiere Atención Urgente': { color: 'bg-red-100 text-red-800', icon: 'report_problem' },
    'Requiere Seguimiento': { color: 'bg-yellow-100 text-yellow-800', icon: 'watch_later' },
    'Evolución Normal': { color: 'bg-green-100 text-green-800', icon: 'check_circle' },
    'Sin Datos Suficientes': { color: 'bg-gray-100 text-gray-800', icon: 'help' },
    'Error de Análisis': { color: 'bg-gray-100 text-gray-800', icon: 'error' },
};

const SeguimientoIAAnalysisTable: React.FC<SeguimientoIAAnalysisTableProps> = ({ leads }) => {
    const [analysis, setAnalysis] = useState<Record<number, AnalysisResult>>({}); // key: lead.id
    const [selectedPatient, setSelectedPatient] = useState<Lead | null>(null);

    const patientsWithFollowUp = useMemo(() => {
        return leads.filter(l => l.seguimientos && l.seguimientos.length > 0 && l.nHistoria);
    }, [leads]);
    
    useEffect(() => {
        const analyzePatient = async (patient: Lead) => {
            if (!patient.seguimientos || patient.seguimientos.length === 0) {
                setAnalysis(prev => ({ ...prev, [patient.id]: { status: 'success', category: 'Sin Datos Suficientes' } }));
                return;
            }

            const followUpHistory = patient.seguimientos.map(s => {
                const sintomas = [
                    s.inflamacion && 'Inflamación', s.ampollas && 'Ampollas', s.alergias && 'Alergias',
                    s.malestarGeneral && 'Malestar General', s.brote && 'Brote', s.dolorDeCabeza && 'Dolor de Cabeza',
                    s.moretones && 'Moretones'
                ].filter(Boolean).join(', ') || 'Ninguno';

                return `- Fecha: ${s.fechaSeguimiento}, Procedimiento: ${s.nombreProcedimiento}, Síntomas: ${sintomas}, Observación: ${s.observacion || 'N/A'}`;
            }).join('\n');

            const prompt = `Analiza el historial de seguimiento de un paciente de una clínica estética y clasifícalo en una de las siguientes categorías: "Requiere Atención Urgente", "Requiere Seguimiento", "Evolución Normal". Considera lo siguiente para la clasificación: "Requiere Atención Urgente" para síntomas graves o persistentes (ampollas, alergias, inflamación que no mejora). "Requiere Seguimiento" para síntomas leves recurrentes (brote, moretones). "Evolución Normal" si no hay síntomas o son leves y pasajeros. Responde únicamente con el nombre de la categoría. Historial: \n${followUpHistory}`;

            try {
                const resultText = await api.generateAiContent(prompt);
                const category = resultText.trim() as AnalysisCategory;
                
                if (Object.keys(categoryConfig).includes(category)) {
                     setAnalysis(prev => ({ ...prev, [patient.id]: { status: 'success', category } }));
                } else {
                    setAnalysis(prev => ({ ...prev, [patient.id]: { status: 'error', category: 'Error de Análisis' } }));
                }

            } catch (error) {
                console.error("Error analyzing patient:", error);
                setAnalysis(prev => ({ ...prev, [patient.id]: { status: 'error', category: 'Error de Análisis' } }));
            }
        };

        patientsWithFollowUp.forEach(patient => {
            if (!analysis[patient.id]) {
                setAnalysis(prev => ({ ...prev, [patient.id]: { status: 'loading' } }));
                analyzePatient(patient);
            }
        });
    }, [patientsWithFollowUp, analysis]);

    const handleViewDetails = (patient: Lead) => {
        setSelectedPatient(patient);
    };

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow mt-6">
                <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                    <GoogleIcon name="psychology" className="mr-2 text-xl text-indigo-500" />
                    Análisis de Seguimientos con IA
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Paciente</th>
                                <th scope="col" className="px-6 py-3">Último Seguimiento</th>
                                <th scope="col" className="px-6 py-3">Estado (IA)</th>
                                <th scope="col" className="px-6 py-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patientsWithFollowUp.map(patient => {
                                const result = analysis[patient.id];
                                const lastFollowUp = patient.seguimientos?.[patient.seguimientos.length - 1];

                                return (
                                    <tr key={patient.id} className="bg-white border-b hover:bg-gray-50">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900">
                                            {patient.nombres} {patient.apellidos}
                                            <p className="text-xs text-gray-500 font-normal">{patient.nHistoria}</p>
                                        </th>
                                        <td className="px-6 py-4">
                                            {lastFollowUp ? formatDateForDisplay(lastFollowUp.fechaSeguimiento) : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {result?.status === 'loading' && <span className="text-xs text-gray-500">Analizando...</span>}
                                            {result?.status === 'success' && result.category && (
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center w-fit ${categoryConfig[result.category].color}`}>
                                                    <GoogleIcon name={categoryConfig[result.category].icon} className="mr-1.5 text-sm" />
                                                    {result.category}
                                                </span>
                                            )}
                                            {result?.status === 'error' && (
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${categoryConfig['Error de Análisis'].color}`}>
                                                     <GoogleIcon name={categoryConfig['Error de Análisis'].icon} className="mr-1.5 text-sm" />
                                                    Error
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => handleViewDetails(patient)} className="font-medium text-[#aa632d] hover:underline">
                                                Ver Detalles
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {patientsWithFollowUp.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <p>No hay pacientes con seguimientos registrados en el rango de fechas seleccionado.</p>
                        </div>
                    )}
                </div>
            </div>
            <SeguimientoDetailModal 
                isOpen={!!selectedPatient}
                onClose={() => setSelectedPatient(null)}
                patient={selectedPatient}
            />
        </>
    );
};

export default SeguimientoIAAnalysisTable;