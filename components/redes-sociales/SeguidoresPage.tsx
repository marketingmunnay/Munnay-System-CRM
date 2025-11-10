
import React, { useState, useMemo } from 'react';
import type { Seguidor } from '../../types.ts';
import { RedSocialPost } from '../../types.ts';
import DateRangeFilter from '../shared/DateRangeFilter.tsx';
import { PlusIcon, MagnifyingGlassIcon } from '../shared/Icons.tsx';
import SeguidorFormModal from './SeguidorFormModal.tsx';
import StatCard from '../dashboard/StatCard.tsx';

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

interface SeguidoresPageProps {
    seguidores: Seguidor[];
    onSave: (seg: Seguidor) => void;
    onDelete: (segId: number) => void;
    requestConfirmation: (message: string, onConfirm: () => void) => void;
}

const SeguidoresTable: React.FC<{ seguidores: Seguidor[], onEdit: (seg: Seguidor) => void }> = ({ seguidores, onEdit }) => {
    const redSocialBadgeColors: Record<string, string> = {
        [RedSocialPost.Instagram]: 'bg-orange-100 text-orange-800',
        [RedSocialPost.Facebook]: 'bg-blue-100 text-blue-800',
        [RedSocialPost.Tiktok]: 'bg-gray-200 text-gray-800',
        [RedSocialPost.YouTube]: 'bg-red-100 text-red-800',
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Fecha</th>
                            <th scope="col" className="px-6 py-3">Cuenta</th>
                            <th scope="col" className="px-6 py-3">Red Social</th>
                            <th scope="col" className="px-6 py-3">Seguidores</th>
                            <th scope="col" className="px-6 py-3">Dejaron de Seguir</th>
                            <th scope="col" className="px-6 py-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {seguidores.map(s => (
                            <tr key={s.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4">{new Date(s.fecha + 'T00:00:00').toLocaleDateString('es-PE')}</td>
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900">{s.cuenta}</th>
                                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${redSocialBadgeColors[s.redSocial]}`}>{s.redSocial}</span></td>
                                <td className="px-6 py-4">{s.seguidores.toLocaleString('es-PE')}</td>
                                <td className="px-6 py-4">{s.dejaronDeSeguir.toLocaleString('es-PE')}</td>
                                <td className="px-6 py-4"><button onClick={() => onEdit(s)} className="font-medium text-[#aa632d] hover:underline">Editar</button></td>
                            </tr>
                        ))}
                         {seguidores.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-gray-500">
                                    <p>No se encontraron registros de seguidores.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const SeguidoresPage: React.FC<SeguidoresPageProps> = ({ seguidores, onSave, onDelete, requestConfirmation }) => {
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSeg, setEditingSeg] = useState<Seguidor | null>(null);
    const [redSocialFilter, setRedSocialFilter] = useState<string>('');
    const [cuentaFilter, setCuentaFilter] = useState<string>('');

    const filteredSeguidores = useMemo(() => {
        let results = seguidores;

        if (dateRange.from || dateRange.to) {
            results = results.filter(s => {
                if (!s.fecha) return false;
                
                // Simple string comparison for YYYY-MM-DD format
                if (dateRange.from && s.fecha < dateRange.from) return false;
                if (dateRange.to && s.fecha > dateRange.to) return false;
                return true;
            });
        }
        
        if (searchTerm) {
            results = results.filter(s => s.cuenta.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        
        if (redSocialFilter) {
            results = results.filter(s => s.redSocial === redSocialFilter);
        }

        if (cuentaFilter) {
            results = results.filter(s => s.cuenta === cuentaFilter);
        }

        return results;
    }, [seguidores, dateRange, searchTerm, redSocialFilter, cuentaFilter]);

    const stats = useMemo(() => {
        const totalSeguidoresNuevos = filteredSeguidores.reduce((sum, s) => sum + s.seguidores, 0);
        const totalDejaronDeSeguir = filteredSeguidores.reduce((sum, s) => sum + s.dejaronDeSeguir, 0);
        const crecimientoNeto = totalSeguidoresNuevos - totalDejaronDeSeguir;
        return {
            totalSeguidoresNuevos,
            totalDejaronDeSeguir,
            crecimientoNeto,
        };
    }, [filteredSeguidores]);

    const handleAdd = () => {
        setEditingSeg(null);
        setIsModalOpen(true);
    };

    const handleEdit = (seg: Seguidor) => {
        setEditingSeg(seg);
        setIsModalOpen(true);
    };

    const handleSaveAndClose = (seg: Seguidor) => {
        onSave(seg);
        setIsModalOpen(false);
    };
    
    const CuentasOptions = useMemo(() => Array.from(new Set(seguidores.map(s => s.cuenta))), [seguidores]);

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h1 className="text-2xl font-bold text-black mb-4 md:mb-0">Seguimiento de Seguidores</h1>
                <div className="flex items-center space-x-3">
                    <DateRangeFilter onApply={setDateRange} />
                    <button 
                        onClick={handleAdd}
                        className="flex items-center bg-[#aa632d] text-white px-4 py-2 rounded-lg shadow hover:bg-[#8e5225] transition-colors"
                    >
                        <PlusIcon className="mr-2 h-5 w-5" /> Registrar Conteo
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <StatCard 
                    title="Nuevos Seguidores" 
                    value={stats.totalSeguidoresNuevos.toLocaleString('es-PE')}
                    icon={<GoogleIcon name="person_add" className="text-green-500"/>}
                    iconBgClass="bg-green-100"
                />
                <StatCard 
                    title="Dejaron de Seguir" 
                    value={stats.totalDejaronDeSeguir.toLocaleString('es-PE')}
                    icon={<GoogleIcon name="person_remove" className="text-red-500"/>}
                    iconBgClass="bg-red-100"
                />
                <StatCard 
                    title="Crecimiento Neto" 
                    value={stats.crecimientoNeto.toLocaleString('es-PE')}
                    icon={<GoogleIcon name="trending_up" className="text-blue-500"/>}
                    iconBgClass="bg-blue-100"
                />
            </div>

            <div className="bg-white p-4 rounded-lg shadow mb-6 flex justify-between items-center">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1-2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por cuenta..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-80 bg-[#f9f9fa] border border-black text-black rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
                    />
                </div>
                <div className="flex items-center space-x-4">
                     <div>
                        <select
                            value={cuentaFilter}
                            onChange={(e) => setCuentaFilter(e.target.value)}
                            className="border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
                        >
                            <option value="">Todas las Cuentas</option>
                            {CuentasOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                     <div>
                        <select
                            value={redSocialFilter}
                            onChange={(e) => setRedSocialFilter(e.target.value)}
                            className="border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
                        >
                            <option value="">Todas las Redes</option>
                            {Object.values(RedSocialPost).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <SeguidoresTable seguidores={filteredSeguidores} onEdit={handleEdit} />

            <SeguidorFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveAndClose}
                onDelete={onDelete}
                seguidor={editingSeg}
                requestConfirmation={requestConfirmation}
            />

        </div>
    );
};

export default SeguidoresPage;
