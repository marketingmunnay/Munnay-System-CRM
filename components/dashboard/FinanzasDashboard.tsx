import React from 'react';
import { WrenchScrewdriverIcon } from '../shared/Icons.tsx';

const FinanzasDashboard: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-96 bg-white rounded-lg shadow p-8">
      <WrenchScrewdriverIcon className="w-16 h-16 text-purple-400 mb-4" />
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Panel de Finanzas</h1>
      <p className="text-gray-500">Esta sección está actualmente en construcción.</p>
      <p className="text-gray-500">Aquí se mostrarán los informes financieros detallados.</p>
    </div>
  );
};

export default FinanzasDashboard;