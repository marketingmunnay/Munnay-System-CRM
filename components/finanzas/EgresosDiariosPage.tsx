
import React, { useState, useMemo, useEffect, FC } from 'react';
import type { Egreso, Proveedor, EgresoCategory } from '../../types.ts';
import DateRangeFilter from '../shared/DateRangeFilter.tsx';
import StatCard from '../dashboard/StatCard.tsx';
import { PlusIcon, MagnifyingGlassIcon, CheckCircleIcon, XCircleIcon, TrashIcon } from '../shared/Icons.tsx';
import EgresoFormModal from './EgresoFormModal.tsx';
import Modal from '../shared/Modal.tsx';
import { formatDateForDisplay } from '../../utils/time.ts';
import { getTipoCambioSunat, type TipoCambio } from '../../services/tipoCambioService.ts';

interface EgresosDiariosPageProps {
    egresos: Egreso[];
    onSaveEgreso: (egreso: Egreso) => void;
    onDeleteEgreso: (egresoId: number) => void;
    proveedores: Proveedor[];
    egresoCategories: EgresoCategory[];
    requestConfirmation: (message: string, onConfirm: () => void) => void;
}

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const formatCurrency = (value: number, moneda: 'Soles' | 'Dólares' = 'Soles') => {
    const prefix = moneda === 'Soles' ? 'S/' : '$';
    return `${prefix} ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
const formatDate = (dateString?: string) => formatDateForDisplay(dateString);


const ImagePreviewModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
}> = ({ isOpen, onClose, imageUrl }) => {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
    }
  }, [isOpen]);

  if (!isOpen || !imageUrl) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Vista Previa del Comprobante" maxWidthClass="max-w-5xl">
      <div className="p-4 bg-gray-800 flex justify-center items-center overflow-hidden h-[75vh]">
        <img
          src={imageUrl}
          alt="Comprobante"
          className="max-w-full max-h-full object-contain transition-transform duration-200 ease-in-out"
          style={{ transform: `scale(${zoom})` }}
        />
      </div>
      <div className="flex justify-center items-center p-2 space-x-4 bg-white border-t">
          <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.2))} className="p-2 rounded-full hover:bg-gray-100 text-gray-700" title="Alejar">
              <GoogleIcon name="zoom_out" />
          </button>
          <span className="text-sm font-semibold text-gray-700 w-12 text-center">{(zoom * 100).toFixed(0)}%</span>
          <button onClick={() => setZoom(z => Math.min(z + 0.2, 5))} className="p-2 rounded-full hover:bg-gray-100 text-gray-700" title="Acercar">
              <GoogleIcon name="zoom_in" />
          </button>
           <button onClick={() => setZoom(1)} className="p-2 rounded-full hover:bg-gray-100 text-gray-700" title="Restablecer">
              <GoogleIcon name="restart_alt" />
          </button>
      </div>
    </Modal>
  );
};

const DetailRow: FC<{ label: string, value?: string | number | null }> = ({ label, value }) => (
    <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-800">{value || 'No especificado'}</p>
    </div>
);

const EgresoDetails: FC<{ egreso: Egreso | null, onViewImage: (url: string) => void }> = ({ egreso, onViewImage }) => {
    if (!egreso) return null;

    return (
        <div className="p-6 space-y-6">
            <fieldset className="border p-4 rounded-md">
                <legend className="text-md font-bold px-2 text-black">Información General</legend>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    <DetailRow label="Fecha de Registro" value={formatDate(egreso.fechaRegistro)} />
                    <DetailRow label="Fecha del Pago" value={formatDate(egreso.fechaPago)} />
                    <DetailRow label="Categoría" value={egreso.categoria} />
                    <DetailRow label="Proveedor" value={egreso.proveedor} />
                </div>
                <div className="mt-4">
                     <DetailRow label="Descripción" value={egreso.descripcion} />
                </div>
                {egreso.observaciones && <div className="mt-4"><DetailRow label="Observaciones" value={egreso.observaciones} /></div>}
            </fieldset>

            <fieldset className="border p-4 rounded-md">
                 <legend className="text-md font-bold px-2 text-black">Detalles del Comprobante</legend>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                    <DetailRow label="Tipo de Comprobante" value={egreso.tipoComprobante} />
                    <DetailRow label="Serie" value={egreso.serieComprobante} />
                    <DetailRow label="Número" value={egreso.nComprobante} />
                 </div>
            </fieldset>
            
             <fieldset className="border p-4 rounded-md">
                 <legend className="text-md font-bold px-2 text-black">Información del Pago</legend>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    <DetailRow label="Moneda" value={egreso.tipoMoneda} />
                    <DetailRow label="Monto Total" value={formatCurrency(egreso.montoTotal, egreso.tipoMoneda)} />
                    <DetailRow label="Monto Pagado" value={formatCurrency(egreso.montoPagado, egreso.tipoMoneda)} />
                    <DetailRow label="Deuda" value={formatCurrency(egreso.deuda, egreso.tipoMoneda)} />
                    <DetailRow label="Modo de Pago" value={egreso.modoPago} />
                 </div>
            </fieldset>

             <fieldset className="border p-4 rounded-md">
                 <legend className="text-md font-bold px-2 text-black">Adjunto</legend>
                 <div className="mt-2">
                     {egreso.fotoUrl ? (
                         <button 
                             onClick={() => onViewImage(egreso.fotoUrl!)}
                             className="flex items-center bg-gray-100 text-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-300 hover:bg-gray-200 transition-colors"
                         >
                             <GoogleIcon name="visibility" className="mr-2"/>
                             Ver Comprobante
                         </button>
                     ) : (
                         <p className="text-sm text-gray-500">No hay comprobante adjunto.</p>
                     )}
                 </div>
            </fieldset>
        </div>
    );
};


const EgresosTable: React.FC<{ 
    egresos: Egreso[], 
    onViewDetails: (egreso: Egreso) => void, 
    onEdit: (egreso: Egreso) => void, 
    onDelete: (egresoId: number) => void,
    requestConfirmation: (message: string, onConfirm: () => void) => void 
}> = ({ egresos, onViewDetails, onEdit, onDelete, requestConfirmation }) => {

    const handleDeleteClick = (egreso: Egreso) => {
        requestConfirmation(
            `¿Estás seguro de que quieres eliminar el egreso de "${egreso.proveedor}"? Esta acción no se puede deshacer.`,
            () => onDelete(egreso.id)
        );
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Fecha Registro</th>
                        <th scope="col" className="px-6 py-3">Fecha Pago</th>
                        <th scope="col" className="px-6 py-3">Proveedor</th>
                        <th scope="col" className="px-6 py-3">Categoría</th>
                        <th scope="col" className="px-6 py-3">Monto Total</th>
                        <th scope="col" className="px-6 py-3">Deuda</th>
                        <th scope="col" className="px-6 py-3 text-center">Estado Pago</th>
                        <th scope="col" className="px-6 py-3">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {egresos.map(egreso => (
                        <tr key={egreso.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4">{formatDate(egreso.fechaRegistro)}</td>
                            <td className="px-6 py-4">{formatDate(egreso.fechaPago)}</td>
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900">{egreso.proveedor}</th>
                            <td className="px-6 py-4">{egreso.categoria}</td>
                            <td className="px-6 py-4 font-semibold">{formatCurrency(egreso.montoTotal, egreso.tipoMoneda)}</td>
                            <td className={`px-6 py-4 font-semibold ${egreso.deuda > 0 ? 'text-red-600' : 'text-gray-500'}`}>{formatCurrency(egreso.deuda, egreso.tipoMoneda)}</td>
                            <td className="px-6 py-4 text-center">
                                {egreso.deuda <= 0 ? (
                                    <span className="inline-flex items-center text-green-600"><CheckCircleIcon className="w-5 h-5 mr-1"/> Pagado</span>
                                ) : (
                                    <span className="inline-flex items-center text-yellow-600"><XCircleIcon className="w-5 h-5 mr-1"/> Pendiente</span>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => onViewDetails(egreso)}
                                        className="text-green-600 hover:text-green-800 p-1"
                                        title="Ver Detalles"
                                    >
                                        <GoogleIcon name="visibility" className="text-xl" />
                                    </button>
                                     <button onClick={() => onEdit(egreso)} className="text-blue-600 hover:text-blue-800 p-1" title="Editar">
                                        <GoogleIcon name="edit" className="text-xl" />
                                    </button>
                                    <button onClick={() => handleDeleteClick(egreso)} className="text-red-600 hover:text-red-800 p-1" title="Eliminar">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {egresos.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <p>No se encontraron egresos que coincidan con los filtros.</p>
                </div>
            )}
        </div>
    );
};

const EgresosDiariosPage: React.FC<EgresosDiariosPageProps> = ({ egresos, onSaveEgreso, onDeleteEgreso, proveedores, egresoCategories, requestConfirmation }) => {
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [isEgresoModalOpen, setIsEgresoModalOpen] = useState(false);
    const [editingEgreso, setEditingEgreso] = useState<Egreso | null>(null);
    const [activeTab, setActiveTab] = useState('proximos');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewingEgreso, setViewingEgreso] = useState<Egreso | null>(null);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
    const [tipoCambio, setTipoCambio] = useState<TipoCambio | null>(null);

    // Obtener tipo de cambio al montar el componente
    useEffect(() => {
        const fetchTipoCambio = async () => {
            const tc = await getTipoCambioSunat();
            setTipoCambio(tc);
        };
        fetchTipoCambio();
    }, []);

    const dateFilteredEgresos = useMemo(() => {
        let results = egresos;

        if (dateRange.from || dateRange.to) {
            const fromDate = dateRange.from ? new Date(`${dateRange.from}T00:00:00`) : null;
            const toDate = dateRange.to ? new Date(`${dateRange.to}T23:59:59`) : null;
            results = results.filter(e => {
                const egresoDate = new Date(`${e.fechaPago}T00:00:00`);
                if (fromDate && egresoDate < fromDate) return false;
                if (toDate && egresoDate > toDate) return false;
                return true;
            });
        }
        return results;
    }, [egresos, dateRange]);
    
    const filteredEgresos = useMemo(() => {
        let results = dateFilteredEgresos;

        if (searchTerm && activeTab === 'historial') {
            results = results.filter(e =>
                e.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return results;
    }, [dateFilteredEgresos, searchTerm, activeTab]);

    const stats = useMemo(() => {
        const tcDisponible = tipoCambio?.disponible && tipoCambio?.venta;
        const tc = tcDisponible ? tipoCambio.venta! : 0;
        
        let totalEgresosSoles = 0;
        let totalEgresosDolares = 0;
        let totalDeudaSoles = 0;
        let totalDeudaDolares = 0;
        let totalInsumosSoles = 0;
        let totalInsumosDolares = 0;

        dateFilteredEgresos.forEach(e => {
            const esSoles = e.tipoMoneda === 'Soles';
            
            // Acumular egresos por moneda
            if (esSoles) {
                totalEgresosSoles += e.montoTotal;
                totalDeudaSoles += e.deuda;
                if (e.categoria === 'Insumos') totalInsumosSoles += e.montoTotal;
            } else {
                totalEgresosDolares += e.montoTotal;
                totalDeudaDolares += e.deuda;
                if (e.categoria === 'Insumos') totalInsumosDolares += e.montoTotal;
            }
        });

        // Calcular totales en soles solo si el TC está disponible
        const totalEgresosEnSoles = tcDisponible ? totalEgresosSoles + (totalEgresosDolares * tc) : null;
        const totalDeudaEnSoles = tcDisponible ? totalDeudaSoles + (totalDeudaDolares * tc) : null;
        const totalInsumosEnSoles = tcDisponible ? totalInsumosSoles + (totalInsumosDolares * tc) : null;

        return { 
            totalEgresosSoles, 
            totalEgresosDolares,
            totalEgresosEnSoles,
            totalDeudaSoles,
            totalDeudaDolares,
            totalDeudaEnSoles,
            totalInsumosSoles,
            totalInsumosDolares,
            totalInsumosEnSoles,
            tcDisponible
        };
    }, [dateFilteredEgresos, tipoCambio]);

    const proximosPagos = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dateFilteredEgresos
            .filter(e => e.deuda > 0 && e.fechaPago)
            .map(e => {
                try {
                    const fechaPago = new Date(e.fechaPago + 'T00:00:00');
                    if (isNaN(fechaPago.getTime())) {
                        return { ...e, diasParaVencer: 0 };
                    }
                    const diffTime = fechaPago.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return { ...e, diasParaVencer: diffDays };
                } catch (error) {
                    return { ...e, diasParaVencer: 0 };
                }
            })
            .sort((a, b) => a.diasParaVencer - b.diasParaVencer);
    }, [dateFilteredEgresos]);

    const { paginatedPagos, totalPages } = useMemo(() => {
        const total = Math.ceil(proximosPagos.length / ITEMS_PER_PAGE);
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return {
            paginatedPagos: proximosPagos.slice(start, end),
            totalPages: total,
        };
    }, [proximosPagos, currentPage]);

    const handleAddEgreso = () => {
        setEditingEgreso(null);
        setIsEgresoModalOpen(true);
    };
    
    const handleViewDetails = (egreso: Egreso) => {
        setViewingEgreso(egreso);
        setIsViewModalOpen(true);
    };

    const handleEditEgreso = (egreso: Egreso) => {
        setEditingEgreso(egreso);
        setIsEgresoModalOpen(true);
    };
    
    const handleViewImage = (imageUrl: string) => {
        setSelectedImageUrl(imageUrl);
        setIsPreviewModalOpen(true);
    };

    const handleSaveAndCloseEgreso = (egreso: Egreso) => {
        onSaveEgreso(egreso);
        setIsEgresoModalOpen(false);
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h1 className="text-2xl font-bold text-black mb-4 md:mb-0">Egresos Diarios</h1>
                <div className="flex items-center space-x-3">
                    <DateRangeFilter onApply={setDateRange} />
                    <button 
                        onClick={handleAddEgreso}
                        className="flex items-center bg-[#aa632d] text-white px-4 py-2 rounded-lg shadow hover:bg-[#8e5225] transition-colors"
                    >
                        <PlusIcon className="mr-2 h-5 w-5" /> Registrar Egreso
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                 <div className="bg-white p-4 rounded-lg shadow-md border">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                            <div className="bg-red-100 p-2 rounded-lg mr-3">
                                <GoogleIcon name="payments" className="text-red-500" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-600">Total de Egresos</h3>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between items-baseline">
                            <span className="text-xs text-gray-500">Soles:</span>
                            <span className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalEgresosSoles, 'Soles')}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-xs text-gray-500">Dólares:</span>
                            <span className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalEgresosDolares, 'Dólares')}</span>
                        </div>
                        <div className="border-t pt-1 mt-1">
                            <div className="flex justify-between items-baseline">
                                <span className="text-xs font-semibold text-gray-600">Total en Soles:</span>
                                {stats.tcDisponible && stats.totalEgresosEnSoles !== null ? (
                                    <span className="text-xl font-bold text-red-600">{formatCurrency(stats.totalEgresosEnSoles, 'Soles')}</span>
                                ) : (
                                    <span className="text-sm text-gray-400 italic">-</span>
                                )}
                            </div>
                        </div>
                        {tipoCambio?.disponible && tipoCambio.venta ? (
                            <p className="text-xs text-gray-400 mt-1">TC: {tipoCambio.venta.toFixed(3)}</p>
                        ) : (
                            <p className="text-xs text-red-400 mt-1">{tipoCambio?.mensaje || 'TC no disponible'}</p>
                        )}
                    </div>
                </div>
                
                 <div className="bg-white p-4 rounded-lg shadow-md border">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                            <div className="bg-orange-100 p-2 rounded-lg mr-3">
                                <GoogleIcon name="receipt_long" className="text-orange-500" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-600">Total de Deuda</h3>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between items-baseline">
                            <span className="text-xs text-gray-500">Soles:</span>
                            <span className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalDeudaSoles, 'Soles')}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-xs text-gray-500">Dólares:</span>
                            <span className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalDeudaDolares, 'Dólares')}</span>
                        </div>
                        <div className="border-t pt-1 mt-1">
                            <div className="flex justify-between items-baseline">
                                <span className="text-xs font-semibold text-gray-600">Total en Soles:</span>
                                {stats.tcDisponible && stats.totalDeudaEnSoles !== null ? (
                                    <span className="text-xl font-bold text-orange-600">{formatCurrency(stats.totalDeudaEnSoles, 'Soles')}</span>
                                ) : (
                                    <span className="text-sm text-gray-400 italic">-</span>
                                )}
                            </div>
                        </div>
                        {tipoCambio?.disponible && tipoCambio.venta ? (
                            <p className="text-xs text-gray-400 mt-1">TC: {tipoCambio.venta.toFixed(3)}</p>
                        ) : (
                            <p className="text-xs text-red-400 mt-1">{tipoCambio?.mensaje || 'TC no disponible'}</p>
                        )}
                    </div>
                </div>
                
                 <div className="bg-white p-4 rounded-lg shadow-md border">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                            <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                <GoogleIcon name="inventory_2" className="text-blue-500" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-600">Compra de Insumos</h3>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between items-baseline">
                            <span className="text-xs text-gray-500">Soles:</span>
                            <span className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalInsumosSoles, 'Soles')}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-xs text-gray-500">Dólares:</span>
                            <span className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalInsumosDolares, 'Dólares')}</span>
                        </div>
                        <div className="border-t pt-1 mt-1">
                            <div className="flex justify-between items-baseline">
                                <span className="text-xs font-semibold text-gray-600">Total en Soles:</span>
                                {stats.tcDisponible && stats.totalInsumosEnSoles !== null ? (
                                    <span className="text-xl font-bold text-blue-600">{formatCurrency(stats.totalInsumosEnSoles, 'Soles')}</span>
                                ) : (
                                    <span className="text-sm text-gray-400 italic">-</span>
                                )}
                            </div>
                        </div>
                        {tipoCambio?.disponible && tipoCambio.venta ? (
                            <p className="text-xs text-gray-400 mt-1">TC: {tipoCambio.venta.toFixed(3)}</p>
                        ) : (
                            <p className="text-xs text-red-400 mt-1">{tipoCambio?.mensaje || 'TC no disponible'}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('proximos')}
                        className={`${
                            activeTab === 'proximos'
                                ? 'border-[#aa632d] text-[#aa632d]'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                    >
                        <GoogleIcon name="notifications_active" className="mr-2"/> Próximos Pagos
                    </button>
                     <button
                        onClick={() => setActiveTab('historial')}
                        className={`${
                            activeTab === 'historial'
                                ? 'border-[#aa632d] text-[#aa632d]'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                    >
                        <GoogleIcon name="history" className="mr-2"/> Historial de Egresos
                    </button>
                </nav>
            </div>

            {activeTab === 'proximos' && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg mb-6">
                    <h3 className="text-lg font-bold text-yellow-800 mb-2">Próximos Pagos Pendientes</h3>
                    {proximosPagos.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="text-xs text-yellow-900 uppercase">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Proveedor</th>
                                            <th className="px-4 py-2 text-left">Categoría</th>
                                            <th className="px-4 py-2 text-left">Monto Deuda</th>
                                            <th className="px-4 py-2 text-left">Fecha de Pago</th>
                                            <th className="px-4 py-2 text-left">Días p/ Vencer</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-yellow-800">
                                        {paginatedPagos.map(p => {
                                            let diasStyle = "font-semibold ";
                                            if (p.diasParaVencer < 0) diasStyle += "text-red-600";
                                            else if (p.diasParaVencer <= 7) diasStyle += "text-orange-600";
                                            else diasStyle += "text-green-600";
                                            
                                            return (
                                                <tr key={p.id} className="border-b border-yellow-200 last:border-b-0">
                                                    <td className="px-4 py-2 font-medium">{p.proveedor}</td>
                                                    <td className="px-4 py-2">{p.categoria}</td>
                                                    <td className="px-4 py-2">{formatCurrency(p.deuda, p.tipoMoneda)}</td>
                                                    <td className="px-4 py-2">{formatDate(p.fechaPago)}</td>
                                                    <td className={`px-4 py-2 ${diasStyle}`}>
                                                        {p.diasParaVencer < 0 ? 'Vencido' : `${p.diasParaVencer} día(s)`}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                             {totalPages > 1 && (
                                <div className="flex justify-end items-center mt-4 text-sm text-yellow-800">
                                    <span>Página {currentPage} de {totalPages}</span>
                                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="ml-4 px-3 py-1 border border-yellow-300 rounded-md disabled:opacity-50">Anterior</button>
                                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="ml-2 px-3 py-1 border border-yellow-300 rounded-md disabled:opacity-50">Siguiente</button>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-sm text-yellow-700">No hay pagos pendientes en el rango de fechas seleccionado.</p>
                    )}
                </div>
            )}

            {activeTab === 'historial' && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="mb-4">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1-2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar por proveedor, descripción..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full md:w-80 bg-[#f9f9fa] border border-black text-black rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
                            />
                        </div>
                    </div>

                    <EgresosTable 
                        egresos={filteredEgresos} 
                        onViewDetails={handleViewDetails}
                        onEdit={handleEditEgreso} 
                        onDelete={onDeleteEgreso}
                        requestConfirmation={requestConfirmation}
                    />
                </div>
            )}
            
            <EgresoFormModal
                isOpen={isEgresoModalOpen}
                onClose={() => setIsEgresoModalOpen(false)}
                onSave={handleSaveAndCloseEgreso}
                onDelete={onDeleteEgreso}
                egreso={editingEgreso}
                proveedores={proveedores}
                egresoCategories={egresoCategories}
                requestConfirmation={requestConfirmation}
            />
            
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Detalles del Egreso"
                maxWidthClass="max-w-4xl"
                footer={
                    <button 
                        onClick={() => setIsViewModalOpen(false)} 
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        Cerrar
                    </button>
                }
            >
                <EgresoDetails egreso={viewingEgreso} onViewImage={handleViewImage} />
            </Modal>


            <ImagePreviewModal
                isOpen={isPreviewModalOpen}
                onClose={() => setIsPreviewModalOpen(false)}
                imageUrl={selectedImageUrl}
            />
        </div>
    );
};

export default EgresosDiariosPage;