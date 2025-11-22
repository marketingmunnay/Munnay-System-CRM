import React, { useState, useMemo } from 'react';
import type { ComprobanteElectronico } from '../../types';
import { SunatStatus, TipoComprobante } from '../../types';
import { formatDateForDisplay, parseDate } from '../../utils/time';
import DateRangeFilter from '../shared/DateRangeFilter';
import { MagnifyingGlassIcon } from '../shared/Icons';

interface FacturacionPageProps {
    comprobantes: ComprobanteElectronico[];
}

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const formatCurrency = (value: number) => `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const statusColors: Record<SunatStatus, string> = {
    [SunatStatus.Aceptado]: 'bg-green-100 text-green-800',
    [SunatStatus.Pendiente]: 'bg-yellow-100 text-yellow-800',
    [SunatStatus.Rechazado]: 'bg-red-100 text-red-800',
    [SunatStatus.ConObservaciones]: 'bg-orange-100 text-orange-800',
    [SunatStatus.Anulado]: 'bg-gray-200 text-gray-800',
};

const FacturacionPage: React.FC<FacturacionPageProps> = ({ comprobantes }) => {
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<SunatStatus | ''>('');

    const filteredComprobantes = useMemo(() => {
        let results = [...comprobantes].sort((a, b) => (parseDate(b.fechaEmision)?.getTime() ?? new Date(b.fechaEmision).getTime()) - (parseDate(a.fechaEmision)?.getTime() ?? new Date(a.fechaEmision).getTime()));

        if (dateRange.from || dateRange.to) {
            const fromDate = dateRange.from ? parseDate(dateRange.from) : null;
            const toDate = dateRange.to ? (() => {
                const d = parseDate(dateRange.to, true);
                if (!d) return parseDate(dateRange.to);
                const end = new Date(d.getTime());
                end.setUTCHours(23, 59, 59, 999);
                return end;
            })() : null;
            results = results.filter(c => {
                const emisionDate = parseDate(c.fechaEmision) ?? null;
                if (fromDate && emisionDate && emisionDate < fromDate) return false;
                if (toDate && emisionDate && emisionDate > toDate) return false;
                return true;
            });
        }
        
        if (searchTerm) {
            results = results.filter(c => 
                c.clienteDenominacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.clienteNumeroDocumento.includes(searchTerm) ||
                `${c.serie}-${c.correlativo}`.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (statusFilter) {
            results = results.filter(c => c.sunatStatus === statusFilter);
        }

        return results;
    }, [comprobantes, dateRange, searchTerm, statusFilter]);
    
    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h1 className="text-2xl font-bold text-black mb-4 md:mb-0">Gestión de Facturación</h1>
                <DateRangeFilter onApply={setDateRange} />
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="relative md:col-span-2">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1-2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por cliente, documento o serie-número..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#f9f9fa] border border-black text-black rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
                        />
                    </div>
                     <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as SunatStatus | '')}
                             className="w-full bg-[#f9f9fa] border border-black text-black rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
                        >
                            <option value="">Todos los Estados</option>
                            {Object.values(SunatStatus).map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Comprobante</th>
                                <th scope="col" className="px-6 py-3">Fecha Emisión</th>
                                <th scope="col" className="px-6 py-3">Cliente</th>
                                <th scope="col" className="px-6 py-3">Total</th>
                                <th scope="col" className="px-6 py-3">Estado SUNAT</th>
                                <th scope="col" className="px-6 py-3">Acciones</th>
                            </tr>
                        </thead>
                         <tbody>
                            {filteredComprobantes.map(c => (
                                <tr key={c.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-semibold text-gray-900">
                                        <p>{c.tipoDocumento === 'Boleta' ? 'Boleta de Venta' : 'Factura'}</p>
                                        <p className="font-mono text-xs text-gray-600">{c.serie}-{c.correlativo.toString().padStart(6, '0')}</p>
                                    </td>
                                    <td className="px-6 py-4">{formatDateForDisplay(c.fechaEmision)}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-800">{c.clienteDenominacion}</p>
                                        <p className="text-xs text-gray-500">{c.clienteTipoDocumento}: {c.clienteNumeroDocumento}</p>
                                    </td>
                                    <td className="px-6 py-4 font-semibold">{formatCurrency(c.total)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[c.sunatStatus]}`}>
                                            {c.sunatStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <button className="text-blue-600 p-1 hover:bg-blue-50 rounded-full" title="Descargar PDF"><GoogleIcon name="picture_as_pdf" /></button>
                                            <button className="text-gray-600 p-1 hover:bg-gray-100 rounded-full" title="Descargar XML"><GoogleIcon name="code" /></button>
                                            <button className="text-green-600 p-1 hover:bg-green-50 rounded-full" title="Descargar CDR"><GoogleIcon name="verified" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {filteredComprobantes.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <p>No se encontraron comprobantes con los filtros actuales.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FacturacionPage;