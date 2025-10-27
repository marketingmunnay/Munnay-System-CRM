import React, { useState, useMemo } from 'react';
import type { VentaExtra, Lead, Service, Product, ComprobanteElectronico } from '../../types';
import DateRangeFilter from '../shared/DateRangeFilter';
import { PlusIcon, MagnifyingGlassIcon, EyeIcon } from '../shared/Icons';
import { VentaExtraFormModal } from './VentaExtraFormModal';

interface VentasExtraPageProps {
    title: string;
    ventas: VentaExtra[];
    pacientes: Lead[];
    onSaveVenta: (venta: VentaExtra) => void;
    onDeleteVenta: (ventaId: number) => void;
    services: Service[];
    products: Product[];
    requestConfirmation: (message: string, onConfirm: () => void) => void;
    onSaveComprobante: (comprobante: ComprobanteElectronico) => Promise<void>;
    comprobantes: ComprobanteElectronico[];
}

const VentasExtraPage: React.FC<VentasExtraPageProps> = ({ title, ventas, pacientes, onSaveVenta, onDeleteVenta, services, products, requestConfirmation, onSaveComprobante, comprobantes }) => {
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVenta, setEditingVenta] = useState<VentaExtra | null>(null);

    const filteredVentas = useMemo(() => {
        let results = ventas;

        if (dateRange.from || dateRange.to) {
            const fromDate = dateRange.from ? new Date(`${dateRange.from}T00:00:00`) : null;
            const toDate = dateRange.to ? new Date(`${dateRange.to}T23:59:59`) : null;
            results = results.filter(venta => {
                const ventaDate = new Date(`${venta.fechaVenta}T00:00:00`);
                if (fromDate && ventaDate < fromDate) return false;
                if (toDate && ventaDate > toDate) return false;
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

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h1 className="text-2xl font-bold text-black mb-4 md:mb-0">{title}</h1>
                <div className="flex items-center space-x-3">
                    <DateRangeFilter onApply={setDateRange} />
                    <button 
                        onClick={handleAddVenta}
                        className="flex items-center bg-[#aa632d] text-white px-4 py-2 rounded-lg shadow hover:bg-[#8e5225] transition-colors"
                    >
                        <PlusIcon className="mr-2 h-5 w-5" /> Registrar Venta
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
                                    <td className="px-6 py-4">{new Date(venta.fechaVenta + 'T00:00:00').toLocaleDateString('es-PE')}</td>
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

            <VentaExtraFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveAndClose}
                onDelete={onDeleteVenta}
                venta={editingVenta}
                pacientes={pacientes}
                services={services}
                products={products}
                requestConfirmation={requestConfirmation}
                onSaveComprobante={onSaveComprobante}
                comprobantes={comprobantes}
            />
        </div>
    );
};

export default VentasExtraPage;