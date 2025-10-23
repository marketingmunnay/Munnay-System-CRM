

import React from 'react';
import { WrenchScrewdriverIcon } from './Icons.tsx';

interface PlaceholderPageProps {
  title: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg shadow p-8">
      <WrenchScrewdriverIcon className="w-16 h-16 text-purple-400 mb-4" />
      <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>
      <p className="text-gray-500">Esta sección está actualmente en construcción.</p>
      <p className="text-gray-500">Vuelve pronto para ver las nuevas funcionalidades.</p>
    </div>
  );
};

export default PlaceholderPage;