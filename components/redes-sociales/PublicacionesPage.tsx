
import React, { useState, useMemo } from 'react';
import type { Publicacion } from '../../types.ts';
import { TipoPost, RedSocialPost } from '../../types.ts';
import DateRangeFilter from '../shared/DateRangeFilter.tsx';
import { PlusIcon, MagnifyingGlassIcon } from '../shared/Icons.tsx';
import PublicacionFormModal from './PublicacionFormModal.tsx';

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

interface PublicacionesPageProps {
    publicaciones: Publicacion[];
    onSave: (pub: Publicacion) => void;
    onDelete: (pubId: number) => void;
    requestConfirmation: (message: string, onConfirm: () => void) => void;
}

const InteractionTypeCard: React.FC<{ title: string; amount: string; color: string; iconName: string; iconColor: string; }> = ({ title, amount, color, iconName, iconColor }) => (
    <div className={`p-4 rounded-xl shadow-lg ${color} text-black w-36 h-32 flex flex-col justify-between`}>
        <div className="flex justify-end">
             <GoogleIcon name={iconName} className={`${iconColor} text-3xl`} />
        </div>
        <div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-lg font-bold">{amount}</p>
        </div>
    </div>
);

const PublicacionesTable: React.FC<{ publicaciones: Publicacion[], onEdit: (pub: Publicacion) => void }> = ({ publicaciones, onEdit }) => {
    const redSocialBadgeColors: Record<string, string> = {
        [RedSocialPost.Instagram]: 'bg-orange-100 text-orange-800',
        [RedSocialPost.Facebook]: 'bg-blue-100 text-blue-800',
        [RedSocialPost.Tiktok]: 'bg-gray-200 text-gray-800',
        [RedSocialPost.YouTube]: 'bg-red-100 text-red-800',
    };

    const tipoPostBadgeColors: Record<string, string> = {
        [TipoPost.Reel]: 'bg-sky-100 text-sky-800',
        [TipoPost.Historia]: 'bg-yellow-100 text-yellow-800',
        [TipoPost.Carrusel]: 'bg-purple-100 text-purple-800',
        [TipoPost.Post]: 'bg-green-100 text-green-800',
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Imagen</th>
                            <th scope="col" className="px-6 py-3">Fecha y Hora</th>
                            <th scope="col" className="px-6 py-3">Tema</th>
                            <th scope="col" className="px-6 py-3">Tipo</th>
                            <th scope="col" className="px-6 py-3">Red Social</th>
                            <th scope="col" className="px-6 py-3">Publicación</th>
                            <th scope="col" className="px-6 py-3">Vistas</th>
                            <th scope="col" className="px-6 py-3">Comentarios</th>
                            <th scope="col" className="px-6 py-3">Reacciones</th>
                            <th scope="col" className="px-6 py-3">Conversaciones</th>
                            <th scope="col" className="px-6 py-3">Convertidos</th>
                            <th scope="col" className="px-6 py-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {publicaciones.map(p => (
                            <tr key={p.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    {p.imageUrl ? (
                                        <img src={p.imageUrl} alt={p.temaVideo} className="h-12 w-12 rounded-md object-cover" />
                                    ) : (
                                        <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center">
                                            <GoogleIcon name="hide_image" className="text-gray-400" />
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(p.fechaPost + `T${p.horaPost || '00:00'}`).toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'})}</td>
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900">{p.temaVideo}</th>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${tipoPostBadgeColors[p.tipoPost]}`}>
                                        {p.tipoPost}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${redSocialBadgeColors[p.redSocial]}`}>
                                        {p.redSocial}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <a href={p.publicacionUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ver</a>
                                </td>
                                <td className="px-6 py-4">{p.vistas.toLocaleString('es-PE')}</td>
                                <td className="px-6 py-4">{p.comentarios}</td>
                                <td className="px-6 py-4">{p.reacciones}</td>
                                <td className="px-6 py-4">{p.conversacionesIniciadas}</td>
                                <td className="px-6 py-4 font-bold text-green-600">{p.convertidos}</td>
                                <td className="px-6 py-4">
                                    <button onClick={() => onEdit(p)} className="font-medium text-[#aa632d] hover:underline">Editar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {publicaciones.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <p>No se encontraron publicaciones que coincidan con los filtros.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const PublicacionesPage: React.FC<PublicacionesPageProps> = ({ publicaciones, onSave, onDelete, requestConfirmation }) => {
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPub, setEditingPub] = useState<Publicacion | null>(null);
    const [tipoPostFilter, setTipoPostFilter] = useState<string>('');
    const [redSocialFilter, setRedSocialFilter] = useState<string>('');

    const filteredPublicaciones = useMemo(() => {
        let results = publicaciones;

        if (dateRange.from || dateRange.to) {
            results = results.filter(p => {
                if (!p.fechaPost) return false;
                
                // Simple string comparison for YYYY-MM-DD format
                if (dateRange.from && p.fechaPost < dateRange.from) return false;
                if (dateRange.to && p.fechaPost > dateRange.to) return false;
                return true;
            });
        }
        
        if (searchTerm) {
            results = results.filter(p => p.temaVideo.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        
        if (tipoPostFilter) {
            results = results.filter(p => p.tipoPost === tipoPostFilter);
        }

        if (redSocialFilter) {
            results = results.filter(p => p.redSocial === redSocialFilter);
        }

        return results;
    }, [publicaciones, dateRange, searchTerm, tipoPostFilter, redSocialFilter]);

    const stats = useMemo(() => {
        const reels = filteredPublicaciones.filter(p => p.tipoPost === TipoPost.Reel);
        const totalVistasReels = reels.reduce((sum, p) => sum + p.vistas, 0);
        
        return {
            totalVistas: filteredPublicaciones.reduce((sum, p) => sum + p.vistas, 0),
            totalComentarios: filteredPublicaciones.reduce((sum, p) => sum + p.comentarios, 0),
            totalReacciones: filteredPublicaciones.reduce((sum, p) => sum + p.reacciones, 0),
            totalConversaciones: filteredPublicaciones.reduce((sum, p) => sum + p.conversacionesIniciadas, 0),
            totalConvertidosReels: reels.reduce((sum, p) => sum + p.convertidos, 0),
            promedioVistasReels: reels.length > 0 ? totalVistasReels / reels.length : 0,
            totalVistasReels: totalVistasReels,
        };
    }, [filteredPublicaciones]);

    const handleAdd = () => {
        setEditingPub(null);
        setIsModalOpen(true);
    };

    const handleEdit = (pub: Publicacion) => {
        setEditingPub(pub);
        setIsModalOpen(true);
    };

    const handleSaveAndClose = (pub: Publicacion) => {
        onSave(pub);
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h1 className="text-2xl font-bold text-black mb-4 md:mb-0">Publicaciones en Redes Sociales</h1>
                <div className="flex items-center space-x-3">
                    <DateRangeFilter onApply={setDateRange} />
                    <button 
                        onClick={handleAdd}
                        className="flex items-center bg-[#aa632d] text-white px-4 py-2 rounded-lg shadow hover:bg-[#8e5225] transition-colors"
                    >
                        <PlusIcon className="mr-2 h-5 w-5" /> Registrar Publicación
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col lg:flex-row items-start justify-between mb-6">
                <div className="flex-1 lg:pr-8 w-full">
                    <h3 className="text-lg font-semibold text-gray-500">Promedio Vistas de Reels</h3>
                    <p className="text-5xl font-bold text-black my-2">
                        {stats.promedioVistasReels.toLocaleString('es-PE', { maximumFractionDigits: 0 })}
                        <sup className="text-2xl font-semibold top-[-0.7em]"> vistas/reel</sup>
                    </p>
                    <div className="flex space-x-8 mt-4 pt-4 border-t">
                        <div className="flex items-center text-sm">
                            <div className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full mr-2">
                                <GoogleIcon name="visibility" className="text-blue-600 text-base" />
                            </div>
                            <div>
                                <p className="text-gray-500">Total Vistas (Reels)</p>
                                <p className="font-semibold text-gray-800">{stats.totalVistasReels.toLocaleString('es-PE')}</p>
                            </div>
                        </div>
                        <div className="flex items-center text-sm">
                            <div className="w-8 h-8 flex items-center justify-center bg-green-100 rounded-full mr-2">
                                <GoogleIcon name="paid" className="text-green-600 text-base" />
                            </div>
                            <div>
                                <p className="text-gray-500">Total Convertidos (Reels)</p>
                                <p className="font-semibold text-gray-800">{stats.totalConvertidosReels.toLocaleString('es-PE')}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-shrink-0 lg:pl-8 lg:border-l border-gray-200 mt-8 lg:mt-0 w-full lg:w-auto">
                    <h4 className="text-lg font-semibold text-gray-500 mb-4">Interacciones Totales</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <InteractionTypeCard title="Vistas" amount={stats.totalVistas.toLocaleString('es-PE')} color="bg-[#BAE6FD]" iconName="visibility" iconColor="text-blue-500" />
                        <InteractionTypeCard title="Comentarios" amount={stats.totalComentarios.toLocaleString('es-PE')} color="bg-[#BBF7D0]" iconName="comment" iconColor="text-green-500" />
                        <InteractionTypeCard title="Reacciones" amount={stats.totalReacciones.toLocaleString('es-PE')} color="bg-[#E9D5FF]" iconName="favorite" iconColor="text-purple-500" />
                        <InteractionTypeCard title="Conversaciones" amount={stats.totalConversaciones.toLocaleString('es-PE')} color="bg-[#FEF08A]" iconName="chat" iconColor="text-yellow-500" />
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow mb-6 flex justify-between items-center">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1-2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por tema..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-80 bg-[#f9f9fa] border border-black text-black rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
                    />
                </div>
                <div className="flex items-center space-x-4">
                     <div>
                        <select
                            value={tipoPostFilter}
                            onChange={(e) => setTipoPostFilter(e.target.value)}
                            className="border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
                        >
                            <option value="">Todos los Tipos</option>
                            {Object.values(TipoPost).map(opt => <option key={opt} value={opt}>{opt}</option>)}
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

            <PublicacionesTable publicaciones={filteredPublicaciones} onEdit={handleEdit} />

            <PublicacionFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveAndClose}
                onDelete={onDelete}
                publicacion={editingPub}
                requestConfirmation={requestConfirmation}
            />

        </div>
    );
};

export default PublicacionesPage;
