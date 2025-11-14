import React, { useState, useMemo } from 'react';
import type { VentaExtra, Lead, Service, Product, ComprobanteElectronico, Membership } from '../../types';
import { Seller } from '../../types';
import DateRangeFilter from '../shared/DateRangeFilter';
import { formatDateForDisplay } from '../../utils/time';
import { PlusIcon, MagnifyingGlassIcon, EyeIcon } from '../shared/Icons';
import { VentaExtraFormModal } from './VentaExtraFormModal';

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

enum EstadoRecuperado {
    Recuperado = 'Recuperado',
    NoRecuperado = 'No Recuperado',
    Pendiente = 'Pendiente'
}

interface PacienteParaLlamar {
    id: number;
    pacienteId: number;
    nombrePaciente: string;
    celular: string;
    nHistoria: string;
    categoria: string;
    servicio: string;
    fechaUltimaAtencion: string;
    estado: EstadoRecuperado;
    pago?: number;
    cantidad?: number;
    tratamientoProducto?: string;
    vendedor?: Seller;
    observacion?: string;
}

interface VentasExtraPageProps {
    title: string;
    ventas: VentaExtra[];
    pacientes: Lead[];
    onSaveVenta: (venta: VentaExtra) => void;
    onSaveLead: (lead: Lead) => void;
    onDeleteVenta: (ventaId: number) => void;
    services: Service[];
    products: Product[];
    memberships: Membership[];
    requestConfirmation: (message: string, onConfirm: () => void) => void;
    onSaveComprobante: (comprobante: ComprobanteElectronico) => Promise<void>;
    comprobantes: ComprobanteElectronico[];
}

const VentasExtraPage: React.FC<VentasExtraPageProps> = ({ title, ventas, onSaveVenta, onDeleteVenta, pacientes, services, products, memberships, requestConfirmation, onSaveComprobante, comprobantes, onSaveLead }) => {
    const [activeTab, setActiveTab] = useState<'ventas' | 'llamadas'>('ventas');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVenta, setEditingVenta] = useState<VentaExtra | null>(null);
    
    // Estados para lista de llamadas
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const [filtroServicio, setFiltroServicio] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [listaGenerada, setListaGenerada] = useState<PacienteParaLlamar[]>([]);
    const [editandoPaciente, setEditandoPaciente] = useState<number | null>(null);

    const filteredVentas = useMemo(() => {
        let results = ventas;

        if (dateRange.from || dateRange.to) {
            results = results.filter(venta => {
                if (!venta.fechaVenta) return false;
                
                // Simple string comparison for YYYY-MM-DD format
                if (dateRange.from && venta.fechaVenta < dateRange.from) return false;
                if (dateRange.to && venta.fechaVenta > dateRange.to) return false;
                return true;
            });
        }
        
        if (searchTerm) {
            results = results.filter(venta => {
                const paciente = pacientes.find(p => p.id === venta.pacienteId);
                return (
                    venta.nombrePaciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    venta.nHistoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    paciente?.numero.includes(searchTerm)
                );
            });
        }

        return results;
    }, [ventas, pacientes, dateRange, searchTerm]);

    const handleAddVenta = () => {
        setEditingVenta(null);
        setIsModalOpen(true);
    };

    const handleEditVenta = (venta: VentaExtra) => {
        setEditingVenta(venta);
        setIsModalOpen(true);
    };

    const handleSaveAndClose = (venta: VentaExtra) => {
        onSaveVenta(venta);
        setIsModalOpen(false);
    };

    const formatCurrency = (value: number) => `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Obtener categorías únicas de servicios
    const categorias = useMemo(() => {
        return [...new Set(services.map(s => s.categoria))];
    }, [services]);

    // Servicios filtrados por categoría
    const serviciosFiltrados = useMemo(() => {
        if (!filtroCategoria) return services;
        return services.filter(s => s.categoria === filtroCategoria);
    }, [services, filtroCategoria]);

    // Generar lista de pacientes para llamar
    const generarListaPacientes = () => {
        // Filtrar pacientes que cumplan los criterios
        const pacientesFiltrados = pacientes.filter(paciente => {
            // Debe tener fecha de agenda
            if (!paciente.fechaHoraAgenda) return false;
            
            // Extraer fecha de fechaHoraAgenda (YYYY-MM-DD)
            const fechaAtencion = paciente.fechaHoraAgenda.split('T')[0];
            
            // Filtro por rango de fechas
            if (fechaInicio && fechaAtencion < fechaInicio) return false;
            if (fechaFin && fechaAtencion > fechaFin) return false;
            
            // Filtro por categoría
            if (filtroCategoria && paciente.categoria !== filtroCategoria) return false;
            
            // Filtro por servicio
            if (filtroServicio && !paciente.servicios.includes(filtroServicio)) return false;
            
            return true;
        });

        // Mapear a estructura de PacienteParaLlamar
        const lista: PacienteParaLlamar[] = pacientesFiltrados.map((paciente, index) => ({
            id: Date.now() + index,
            pacienteId: paciente.id,
            nombrePaciente: `${paciente.nombres} ${paciente.apellidos}`,
            celular: paciente.numero,
            nHistoria: paciente.nHistoria || '',
            categoria: paciente.categoria,
            servicio: paciente.servicios.join(', '),
            fechaUltimaAtencion: paciente.fechaHoraAgenda?.split('T')[0] || '',
            estado: EstadoRecuperado.Pendiente,
            observacion: ''
        }));

        setListaGenerada(lista);
    };

    const actualizarPaciente = (id: number, campo: keyof PacienteParaLlamar, valor: any) => {
        setListaGenerada(prev => prev.map(p => 
            p.id === id ? { ...p, [campo]: valor } : p
        ));
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h1 className="text-2xl font-bold text-black mb-4 md:mb-0">{title}</h1>
                {activeTab === 'ventas' && (
                    <div className="flex items-center space-x-3">
                        <DateRangeFilter onApply={setDateRange} />
                        <button 
                            onClick={handleAddVenta}
                            className="flex items-center bg-[#aa632d] text-white px-4 py-2 rounded-lg shadow hover:bg-[#8e5225] transition-colors"
                        >
                            <PlusIcon className="mr-2 h-5 w-5" /> Registrar Venta
                        </button>
                    </div>
                )}
            </div>

            {/* Pestañas */}
            <div className="flex space-x-1 mb-6 border-b border-gray-300">
                <button
                    onClick={() => setActiveTab('ventas')}
                    className={`px-6 py-3 font-medium transition-colors ${
                        activeTab === 'ventas'
                            ? 'text-[#aa632d] border-b-2 border-[#aa632d]'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <GoogleIcon name="receipt_long" className="inline mr-2" />
                    Ventas Extra
                </button>
                <button
                    onClick={() => setActiveTab('llamadas')}
                    className={`px-6 py-3 font-medium transition-colors ${
                        activeTab === 'llamadas'
                            ? 'text-[#aa632d] border-b-2 border-[#aa632d]'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <GoogleIcon name="call" className="inline mr-2" />
                    Lista para Llamar
                </button>
            </div>

            {/* Tab Ventas Extra */}
            {activeTab === 'ventas' && (
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
                                <th scope="col" className="px-6 py-3">Código</th>
                                <th scope="col" className="px-6 py-3">Fecha Venta</th>
                                <th scope="col" className="px-6 py-3">Paciente</th>
                                <th scope="col" className="px-6 py-3">Servicio</th>
                                <th scope="col" className="px-6 py-3">Precio</th>
                                <th scope="col" className="px-6 py-3">Pagado</th>
                                <th scope="col" className="px-6 py-3">Deuda</th>
                                <th scope="col" className="px-6 py-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVentas.map(venta => (
                                <tr key={venta.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-semibold">{venta.codigoVenta}</td>
                                    <td className="px-6 py-4">{formatDateForDisplay(venta.fechaVenta)}</td>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900">{venta.nombrePaciente}</th>
                                    <td className="px-6 py-4">{venta.servicio}</td>
                                    <td className="px-6 py-4">{formatCurrency(venta.precio)}</td>
                                    <td className="px-6 py-4 font-semibold text-green-600">{formatCurrency(venta.montoPagado)}</td>
                                    <td className={`px-6 py-4 font-semibold ${venta.deuda > 0 ? 'text-red-600' : 'text-gray-500'}`}>{formatCurrency(venta.deuda)}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleEditVenta(venta)} className="font-medium text-[#aa632d] hover:underline">
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {filteredVentas.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <p>No se encontraron ventas que coincidan con los filtros.</p>
                        </div>
                    )}
                </div>
                </div>
            )}

            {/* Tab Lista para Llamar */}
            {activeTab === 'llamadas' && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Generar Lista de Pacientes para Llamar</h2>
                    
                    {/* Filtros */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                            <select
                                value={filtroCategoria}
                                onChange={(e) => {
                                    setFiltroCategoria(e.target.value);
                                    setFiltroServicio(''); // Reset servicio cuando cambia categoría
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#aa632d] focus:border-transparent"
                            >
                                <option value="">Todas las categorías</option>
                                {categorias.map((cat, idx) => (
                                    <option key={idx} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Servicio</label>
                            <select
                                value={filtroServicio}
                                onChange={(e) => setFiltroServicio(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#aa632d] focus:border-transparent"
                                disabled={!filtroCategoria}
                            >
                                <option value="">Todos los servicios</option>
                                {serviciosFiltrados.map((serv) => (
                                    <option key={serv.id} value={serv.nombre}>{serv.nombre}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
                            <input
                                type="date"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#aa632d] focus:border-transparent"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
                            <input
                                type="date"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#aa632d] focus:border-transparent"
                            />
                        </div>
                        
                        <div className="md:col-span-4 flex justify-end">
                            <button
                                onClick={generarListaPacientes}
                                className="flex items-center bg-[#aa632d] text-white px-6 py-2 rounded-lg shadow hover:bg-[#8e5225] transition-colors"
                            >
                                <GoogleIcon name="list_alt" className="mr-2" />
                                Generar Lista
                            </button>
                        </div>
                    </div>

                    {/* Tabla de pacientes */}
                    {listaGenerada.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Paciente</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Celular</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">N° Historia</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Categoría</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Servicio</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Última Atención</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Estado</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">PAGO</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">CANT</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">TRATAMIENTO/PRODUCTO</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">VENDEDOR</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Observación</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {listaGenerada.map((paciente) => {
                                        const esRecuperado = paciente.estado === EstadoRecuperado.Recuperado;
                                        return (
                                            <tr key={paciente.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-gray-900">{paciente.nombrePaciente}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{paciente.celular}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{paciente.nHistoria}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{paciente.categoria}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{paciente.servicio}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{paciente.fechaUltimaAtencion}</td>
                                                <td className="px-4 py-3">
                                                    <select
                                                        value={paciente.estado}
                                                        onChange={(e) => actualizarPaciente(paciente.id, 'estado', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-[#aa632d] text-sm"
                                                    >
                                                        <option value={EstadoRecuperado.Pendiente}>Pendiente</option>
                                                        <option value={EstadoRecuperado.Recuperado}>Recuperado</option>
                                                        <option value={EstadoRecuperado.NoRecuperado}>No Recuperado</option>
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        value={paciente.pago || ''}
                                                        onChange={(e) => actualizarPaciente(paciente.id, 'pago', parseFloat(e.target.value) || 0)}
                                                        disabled={!esRecuperado}
                                                        className={`w-full px-2 py-1 border rounded text-sm ${
                                                            esRecuperado 
                                                                ? 'border-gray-300 focus:ring-2 focus:ring-[#aa632d]' 
                                                                : 'bg-gray-100 cursor-not-allowed'
                                                        }`}
                                                        placeholder="0.00"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        value={paciente.cantidad || ''}
                                                        onChange={(e) => actualizarPaciente(paciente.id, 'cantidad', parseInt(e.target.value) || 0)}
                                                        disabled={!esRecuperado}
                                                        className={`w-full px-2 py-1 border rounded text-sm ${
                                                            esRecuperado 
                                                                ? 'border-gray-300 focus:ring-2 focus:ring-[#aa632d]' 
                                                                : 'bg-gray-100 cursor-not-allowed'
                                                        }`}
                                                        placeholder="0"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="text"
                                                        value={paciente.tratamientoProducto || ''}
                                                        onChange={(e) => actualizarPaciente(paciente.id, 'tratamientoProducto', e.target.value)}
                                                        disabled={!esRecuperado}
                                                        className={`w-full px-2 py-1 border rounded text-sm ${
                                                            esRecuperado 
                                                                ? 'border-gray-300 focus:ring-2 focus:ring-[#aa632d]' 
                                                                : 'bg-gray-100 cursor-not-allowed'
                                                        }`}
                                                        placeholder="Producto/Tratamiento"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <select
                                                        value={paciente.vendedor || ''}
                                                        onChange={(e) => actualizarPaciente(paciente.id, 'vendedor', e.target.value as Seller)}
                                                        disabled={!esRecuperado}
                                                        className={`w-full px-2 py-1 border rounded text-sm ${
                                                            esRecuperado 
                                                                ? 'border-gray-300 focus:ring-2 focus:ring-[#aa632d]' 
                                                                : 'bg-gray-100 cursor-not-allowed'
                                                        }`}
                                                    >
                                                        <option value="">Seleccionar...</option>
                                                        <option value={Seller.Vanesa}>Vanesa</option>
                                                        <option value={Seller.Liz}>Liz</option>
                                                        <option value={Seller.Elvira}>Elvira</option>
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <textarea
                                                        value={paciente.observacion || ''}
                                                        onChange={(e) => actualizarPaciente(paciente.id, 'observacion', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-[#aa632d] text-sm"
                                                        placeholder="Observaciones..."
                                                        rows={2}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {listaGenerada.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <GoogleIcon name="list_alt" className="text-6xl mb-4 opacity-30" />
                            <p className="text-lg">No se ha generado ninguna lista aún</p>
                            <p className="text-sm mt-2">Selecciona los filtros y haz clic en "Generar Lista"</p>
                        </div>
                    )}
                </div>
            )}

            <VentaExtraFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveAndClose}
                onDelete={onDeleteVenta}
                venta={editingVenta}
                pacientes={pacientes}
                services={services}
                products={products}
                memberships={memberships}
                requestConfirmation={requestConfirmation}
                onSaveComprobante={onSaveComprobante}
                comprobantes={comprobantes}
                onSaveLead={onSaveLead}
            />
        </div>
    );
};

export default VentasExtraPage;