import React from 'react';
import type { Lead } from '../../types.ts';
import SeguimientoIAAnalysisTable from './SeguimientoIAAnalysisTable.tsx';

interface AnalisisSeguimientoPageProps {
    leads: Lead[];
}

const AnalisisSeguimientoPage: React.FC<AnalisisSeguimientoPageProps> = ({ leads }) => {
    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h1 className="text-2xl font-bold text-black mb-4 md:mb-0">Seguimiento de Pacientes</h1>
            </div>
            <p className="text-gray-600 mb-6">
                Esta tabla muestra a los pacientes que tienen seguimientos registrados. Utiliza inteligencia artificial para
                analizar su evolución y los clasifica para ayudarte a identificar rápidamente a quienes
                requieren atención prioritaria.
            </p>
            <SeguimientoIAAnalysisTable leads={leads} />
        </div>
    );
};

export default AnalisisSeguimientoPage;