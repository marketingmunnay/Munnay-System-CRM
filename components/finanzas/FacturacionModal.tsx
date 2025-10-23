
import React, { useState, useEffect, useMemo } from 'react';
import type { VentaExtra, Lead, ComprobanteElectronico, ComprobanteItem } from '../../types.ts';
import { DocumentType, TipoComprobanteElectronico, SunatStatus } from '../../types.ts';
import Modal from '../shared/Modal.tsx';

interface FacturacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (comprobante: ComprobanteElectronico) => Promise<void>;
  paciente: Lead;
  venta: VentaExtra;
  ventaType: 'lead' | 'venta_extra';
}

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const IGV_RATE = 0.18;

const FacturacionModal: React.FC<FacturacionModalProps> = ({ isOpen, onClose, onSave, paciente, venta, ventaType }) => {
    const [tipoDoc, setTipoDoc] = useState<TipoComprobanteElectronico>(TipoComprobanteElectronico.Boleta);
    const [clienteDocTipo, setClienteDocTipo] = useState<DocumentType>(paciente.documentType || DocumentType.DNI);
    const [clienteDocNum, setClienteDocNum] = useState(paciente.documentNumber || '');
    const [clienteDenom, setClienteDenom] = useState(tipoDoc === 'Boleta' ? `${paciente.nombres} ${paciente.apellidos}` : (paciente.razonSocial || ''));
    const [clienteDir, setClienteDir] = useState(paciente.direccionFiscal || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    useEffect(() => {
        if (tipoDoc === TipoComprobanteElectronico.Factura) {
            setClienteDocTipo(DocumentType.RUC);
            setClienteDenom(paciente.razonSocial || '');
        } else {
            setClienteDocTipo(paciente.documentType || DocumentType.DNI);
            setClienteDenom(`${paciente.nombres} ${paciente.apellidos}`);
        }
    }, [tipoDoc, paciente]);


    const { items, opGravadas, igv, total } = useMemo(() => {
        const item: ComprobanteItem = {
            id: 1,
            descripcion: venta.servicio,
            cantidad: 1,
            valorUnitario: venta.montoPagado / (1 + IGV_RATE),
            precioUnitario: venta.montoPagado,
            igv: venta.montoPagado - (venta.montoPagado / (1 + IGV_RATE)),
            montoTotal: venta.montoPagado,
        };
        const items = [item];
        const opGravadas = items.reduce((sum, i) => sum + i.valorUnitario, 0);
        const igv = items.reduce((sum, i) => sum + i.igv, 0);
        const total = opGravadas + igv;
        return { items, opGravadas, igv, total };
    }, [venta]);

    const handleSubmit = async () => {
        if (!clienteDocNum || !clienteDenom) {
            alert('El documento y nombre/razón social del cliente son obligatorios.');
            return;
        }
        if (tipoDoc === TipoComprobanteElectronico.Factura && clienteDocTipo !== DocumentType.RUC) {
            alert('Para facturas, el tipo de documento debe ser RUC.');
            return;
        }
        
        setIsSubmitting(true);
        const nuevoComprobante: ComprobanteElectronico = {
            id: Date.now(),
            tipoDocumento: tipoDoc,
            serie: tipoDoc === 'Boleta' ? 'B001' : 'F001',
            correlativo: Math.floor(Math.random() * 1000) + 1, // Mock
            fechaEmision: new Date().toISOString().split('T')[0],
            clienteTipoDocumento: clienteDocTipo,
            clienteNumeroDocumento: clienteDocNum,
            clienteDenominacion: clienteDenom,
            clienteDireccion: clienteDir,
            items,
            opGravadas,
            igv,
            total,
            sunatStatus: SunatStatus.Pendiente,
            ventaId: venta.id,
            ventaType,
        };
        
        await onSave(nuevoComprobante);
        setIsSubmitting(false);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Emisión de Comprobante Electrónico"
            maxWidthClass="max-w-3xl"
            footer={
                <div className="space-x-2">
                    <button onClick={onClose} disabled={isSubmitting} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50">Cancelar</button>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 min-w-[200px]">
                        {isSubmitting ? 'Enviando a SUNAT...' : 'Generar y Enviar'}
                    </button>
                </div>
            }
        >
            <div className="p-6">
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700">Tipo de Comprobante:</label>
                            <select value={tipoDoc} onChange={(e) => setTipoDoc(e.target.value as TipoComprobanteElectronico)} className="border-black bg-[#f9f9fa] rounded-md p-2">
                                <option value={TipoComprobanteElectronico.Boleta}>Boleta de Venta</option>
                                <option value={TipoComprobanteElectronico.Factura}>Factura</option>
                            </select>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-xl">{tipoDoc === 'Boleta' ? 'B001' : 'F001'}-<span className="text-gray-500">CORRELATIVO</span></p>
                            <p className="text-sm text-gray-500">Fecha: {new Date().toLocaleDateString('es-PE')}</p>
                        </div>
                    </div>

                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-md font-bold px-2 text-black">Datos del Cliente</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-sm">Tipo Doc.</label>
                                    <select value={clienteDocTipo} onChange={e => setClienteDocTipo(e.target.value as DocumentType)} disabled={tipoDoc==='Factura'} className="w-full p-2 border-black bg-[#f9f9fa] rounded-md">
                                        {Object.values(DocumentType).map(dt => <option key={dt} value={dt}>{dt}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm">N° Documento</label>
                                    <input value={clienteDocNum} onChange={e => setClienteDocNum(e.target.value)} className="w-full p-2 border-black bg-[#f9f9fa] rounded-md"/>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm">Nombres y Apellidos / Razón Social</label>
                                <input value={clienteDenom} onChange={e => setClienteDenom(e.target.value)} className="w-full p-2 border-black bg-[#f9f9fa] rounded-md"/>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm">Dirección Fiscal</label>
                                <input value={clienteDir} onChange={e => setClienteDir(e.target.value)} className="w-full p-2 border-black bg-[#f9f9fa] rounded-md"/>
                            </div>
                        </div>
                    </fieldset>

                     <fieldset className="border p-4 rounded-md">
                        <legend className="text-md font-bold px-2 text-black">Detalle de la Venta</legend>
                        <table className="w-full text-sm mt-2">
                            <thead className="text-left bg-gray-100">
                                <tr>
                                    <th className="p-2">Cant.</th>
                                    <th className="p-2 w-full">Descripción</th>
                                    <th className="p-2">P. Unit.</th>
                                    <th className="p-2">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(item => (
                                    <tr key={item.id}>
                                        <td className="p-2 text-center">{item.cantidad}</td>
                                        <td className="p-2">{item.descripcion}</td>
                                        <td className="p-2 text-right">{item.precioUnitario.toFixed(2)}</td>
                                        <td className="p-2 text-right font-semibold">{item.montoTotal.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="flex justify-end mt-4">
                            <div className="w-64 space-y-2 text-sm">
                                <div className="flex justify-between"><span>Op. Gravadas:</span><span>S/ {opGravadas.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span>IGV (18%):</span><span>S/ {igv.toFixed(2)}</span></div>
                                <div className="flex justify-between font-bold text-base border-t pt-2 mt-2"><span>TOTAL:</span><span>S/ {total.toFixed(2)}</span></div>
                            </div>
                        </div>
                    </fieldset>
                </div>
            </div>
        </Modal>
    );
};

export default FacturacionModal;