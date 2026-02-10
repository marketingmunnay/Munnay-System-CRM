import React, { useState, useMemo } from 'react';
import type { Campaign } from '../../types.ts';
import { MagnifyingGlassIcon } from '../shared/Icons.tsx';
import { formatDateForDisplay } from '../../utils/time.ts';

interface AnunciosTableProps {
  campaigns: Campaign[];
  onEdit: (campaign: Campaign) => void;
}

const AnunciosTable: React.FC<AnunciosTableProps> = ({ campaigns, onEdit }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCampaigns = useMemo(() => {
        return campaigns.filter(campaign =>
            campaign.nombreAnuncio.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [campaigns, searchTerm]);

    const formatCurrency = (value: number) => `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
        <div className="bg-white p-6 rounded-lg shadow mt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-black">Listado de Anuncios</h3>
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar anuncio..."
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
                            <th scope="col" className="px-6 py-3">Nombre del Anuncio</th>
                            <th scope="col" className="px-6 py-3">Fecha</th>
                            <th scope="col" className="px-6 py-3">Campaña Meta</th>
                            <th scope="col" className="px-6 py-3">Alcance</th>
                            <th scope="col" className="px-6 py-3">Resultados</th>
                            <th scope="col" className="px-6 py-3">Costo/Resultado</th>
                            <th scope="col" className="px-6 py-3">Importe Gastado</th>
                            <th scope="col" className="px-6 py-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCampaigns.map(campaign => (
                            <tr key={campaign.id} className="bg-white border-b hover:bg-gray-50">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                    {campaign.nombreAnuncio}
                                </th>
                                <td className="px-6 py-4">
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                    {formatDateForDisplay(campaign.fecha)}
                                </td>
                                </td>
                                <td className="px-6 py-4">{campaign.categoria}</td>
                                <td className="px-6 py-4">{campaign.alcance.toLocaleString('es-PE')}</td>
                                <td className="px-6 py-4">{campaign.resultados}</td>
                                <td className="px-6 py-4">{formatCurrency(campaign.costoPorResultado)}</td>
                                <td className="px-6 py-4 font-semibold">{formatCurrency(campaign.importeGastado)}</td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => onEdit(campaign)}
                                        className="font-medium text-[#aa632d] hover:underline"
                                    >
                                        Editar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {filteredCampaigns.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <p>No se encontraron anuncios que coincidan con la búsqueda.</p>
                </div>
            )}
        </div>
    );
};

export default AnunciosTable;