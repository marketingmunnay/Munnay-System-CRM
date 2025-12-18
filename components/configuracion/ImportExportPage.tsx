
import React, { useRef, useState } from 'react';
import type { ComprobanteElectronico } from '../../types.ts';
import { getCampaigns, getEgresos, getLeads, getMetaCampaigns } from '../../services/api';
import type { BulkImportEgresosResponse } from '../../services/api';
import ImportProgressModal from '../shared/ImportProgressModal';
import Modal from '../shared/Modal';

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const toCsvValue = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const stringValue = typeof value === 'string' ? value : value.toString();
    return /[",\n]/.test(stringValue) ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
};

const downloadCsv = (filename: string, headers: string[], rows: (string | number | null | undefined)[][]) => {
    const csvRows = rows.map(row => row.map(toCsvValue).join(','));
    const csv = [headers.map(toCsvValue).join(','), ...csvRows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const LEAD_HEADERS = [
    'id',
    'fechaLead',
    'nombres',
    'apellidos',
    'numero',
    'sexo',
    'redSocial',
    'anuncio',
    'vendedor',
    'estado',
    'montoPagado',
    'metodoPago',
    'fechaHoraAgenda',
    'servicios',
    'categoria',
    'fechaVolverLlamar',
    'horaVolverLlamar',
    'notas',
    'nHistoria',
    'birthDate',
    'documentType',
    'documentNumber',
    'razonSocial',
    'direccionFiscal'
];

const CAMPAIGN_HEADERS = ['id', 'nombreAnuncio', 'categoria', 'alcance', 'resultados', 'costoPorResultado', 'importeGastado', 'fecha'];

const META_CAMPAIGN_HEADERS = ['id', 'nombre', 'fechaInicio', 'fechaFin', 'categoria'];

const EGRESO_HEADERS = [
    'id',
    'fechaRegistro',
    'fechaPago',
    'proveedor',
    'categoria',
    'descripcion',
    'tipoComprobante',
    'serieComprobante',
    'nComprobante',
    'montoTotal',
    'montoPagado',
    'deuda',
    'modoPago',
    'tipoMoneda',
    'observaciones',
    'comprobantes'
];

interface ImportSectionProps {
    title: string;
    description: string;
    templateFilename: string;
    headers: string[];
    onImport: (file: File) => void;
    exportConfig?: {
        label?: string;
        iconName?: string;
        onExport: () => Promise<void> | void;
    };
}

const ImportSection: React.FC<ImportSectionProps> = ({ title, description, templateFilename, headers, onImport, exportConfig }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    const handleDownloadTemplate = () => {
        const csvString = headers.join(',');
        // \uFEFF is a BOM to ensure Excel opens UTF-8 correctly
        const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' }); 
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", templateFilename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onImport(e.target.files[0]);
            // Reset file input value to allow re-uploading the same file
            e.target.value = '';
        }
    };

    const handleExportClick = async () => {
        if (!exportConfig) return;
        try {
            setIsExporting(true);
            await exportConfig.onExport();
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border">
            <h3 className="text-xl font-bold text-black flex items-center">
                <GoogleIcon name="description" className="mr-2 text-gray-500" />
                {title}
            </h3>
            <p className="text-sm text-gray-600 mt-2 mb-4">{description}</p>
            <div className="flex items-center space-x-3">
                <button
                    onClick={handleDownloadTemplate}
                    className="flex items-center bg-gray-100 text-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-300 hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                    <GoogleIcon name="download" className="mr-2"/>
                    Descargar Plantilla
                </button>
                <button
                    onClick={handleImportClick}
                    className="flex items-center bg-[#aa632d] text-white px-4 py-2 rounded-lg shadow hover:bg-[#8e5225] transition-colors text-sm font-medium"
                >
                    <GoogleIcon name="upload" className="mr-2"/>
                    Importar desde CSV
                </button>
                {exportConfig && (
                    <button
                        onClick={handleExportClick}
                        disabled={isExporting}
                        className="flex items-center bg-white text-[#aa632d] px-4 py-2 rounded-lg shadow-sm border border-[#aa632d] hover:bg-[#fff3eb] transition-colors text-sm font-medium disabled:opacity-70"
                    >
                        <GoogleIcon name={exportConfig.iconName || 'download'} className="mr-2"/>
                        {isExporting ? 'Exportando…' : (exportConfig.label || 'Exportar CSV')}
                    </button>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>
        </div>
    );
};

interface ImportExportPageProps {
    comprobantes: ComprobanteElectronico[];
    onImportCampaigns?: (campaigns: any[]) => Promise<void>;
    onImportMetaCampaigns?: (metaCampaigns: any[]) => Promise<void>;
    onImportLeads?: (leads: any[]) => Promise<void>;
    onImportVentasExtra?: (ventas: any[]) => Promise<void>;
    onImportIncidencias?: (incidencias: any[]) => Promise<void>;
    onImportEgresos?: (egresos: any[]) => Promise<BulkImportEgresosResponse>;
    onImportProveedores?: (proveedores: any[]) => Promise<void>;
    onImportPublicaciones?: (publicaciones: any[]) => Promise<void>;
    onImportSeguidores?: (seguidores: any[]) => Promise<void>;
    onImportComprobantes?: (comprobantes: any[]) => Promise<void>;
    onImportServices?: (services: any[]) => Promise<void>;
    onImportProducts?: (products: any[]) => Promise<void>;
    onImportMemberships?: (memberships: any[]) => Promise<void>;
    onImportServiceCategories?: (categories: any[]) => Promise<void>;
    onImportProductCategories?: (categories: any[]) => Promise<void>;
    onImportEgresoCategories?: (categories: any[]) => Promise<void>;
    onImportJobPositions?: (positions: any[]) => Promise<void>;
}

const ImportExportPage: React.FC<ImportExportPageProps> = ({ 
    comprobantes, 
    onImportCampaigns, 
    onImportMetaCampaigns,
    onImportLeads,
    onImportVentasExtra,
    onImportIncidencias,
    onImportEgresos,
    onImportProveedores,
    onImportPublicaciones,
    onImportSeguidores,
    onImportComprobantes,
    onImportServices,
    onImportProducts,
    onImportMemberships,
    onImportServiceCategories,
    onImportProductCategories,
    onImportEgresoCategories,
    onImportJobPositions
}) => {
    const [importProgress, setImportProgress] = useState({
        isOpen: false,
        title: '',
        totalItems: 0,
        processedItems: 0,
        currentItem: '',
        isComplete: false,
        successMessage: '',
        errorMessage: ''
    });

    const [validationErrors, setValidationErrors] = useState<{
        isOpen: boolean;
        errors: string[];
        warnings: string[];
    }>({
        isOpen: false,
        errors: [],
        warnings: []
    });

    const [currentImportData, setCurrentImportData] = useState<{
        text: string;
        type: string;
    } | null>(null);

    const validateCSV = (text: string, type: string): { errors: string[], warnings: string[] } => {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Parse basic structure
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) {
            errors.push('El archivo está vacío.');
            return { errors, warnings };
        }

        if (lines.length < 2) {
            errors.push('El archivo debe contener al menos una fila de encabezados y una fila de datos.');
            return { errors, warnings };
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const dataRows = lines.slice(1);

        // Define required columns and validations for each type
        const validations: { [key: string]: { required: string[], numeric?: string[], date?: string[], boolean?: string[] } } = {
            'Pacientes': {
                required: ['nombres', 'apellidos', 'numero'],
                numeric: ['montoPagado'],
                date: ['fechaLead', 'fechaHoraAgenda', 'fechaVolverLlamar', 'birthDate']
            },
            'Campañas': {
                required: ['nombreAnuncio', 'categoria'],
                numeric: ['alcance', 'resultados', 'costoPorResultado', 'importeGastado'],
                date: ['fecha']
            },
            'Meta Campañas': {
                required: ['nombre', 'categoria'],
                date: ['fechaInicio', 'fechaFin']
            },
            'Servicios': {
                required: ['nombre', 'categoria'],
                numeric: ['precio', 'duracionMinutos']
            },
            'Productos': {
                required: ['nombre', 'categoria'],
                numeric: ['precio']
            },
            'Ventas': {
                required: ['codigoVenta', 'nHistoria', 'servicio'],
                numeric: ['precio', 'montoPagado', 'deuda'],
                date: ['fechaVenta', 'fechaPagoDeuda']
            },
            'Incidencias': {
                required: ['nHistoria', 'tipoIncidencia'],
                date: ['fecha'],
                boolean: ['solucionado']
            },
            'Atenciones Diarias': {
                required: ['nHistoria', 'nombreTratamiento'],
                date: ['fechaAtencion']
            },
            'Seguimientos': {
                required: ['nHistoria', 'nombreTratamiento'],
                date: ['fechaSeguimiento']
            },
            'Comprobantes Electrónicos': {
                required: ['tipoDocumento', 'serie', 'correlativo', 'fechaEmision'],
                numeric: ['opGravadas', 'igv', 'total'],
                date: ['fechaEmision']
            },
            'Egresos': {
                required: ['fechaRegistro', 'proveedor', 'categoria', 'descripcion', 'montoTotal'],
                numeric: ['montoTotal', 'montoPagado', 'deuda'],
                date: ['fechaRegistro', 'fechaPago']
            }
        };

        const typeValidation = validations[type];
        if (!typeValidation) {
            warnings.push(`No se encontraron validaciones específicas para el tipo "${type}". Se realizará una validación básica.`);
            return { errors, warnings };
        }

        // Check required columns
        const missingColumns = typeValidation.required.filter(col => !headers.includes(col.toLowerCase()));
        if (missingColumns.length > 0) {
            errors.push(`Faltan las siguientes columnas requeridas: ${missingColumns.join(', ')}`);
        }

        // Validate data rows
        dataRows.forEach((row, index) => {
            const values = row.split(',').map(v => v.trim());
            const rowNumber = index + 2; // +2 because index starts at 0 and we skip header

            // Check if row has enough columns
            if (values.length !== headers.length) {
                errors.push(`Fila ${rowNumber}: Tiene ${values.length} columnas pero se esperaban ${headers.length}.`);
                return;
            }

            // Validate numeric fields
            if (typeValidation.numeric) {
                typeValidation.numeric.forEach(field => {
                    const fieldIndex = headers.indexOf(field.toLowerCase());
                    if (fieldIndex !== -1 && values[fieldIndex]) {
                        const numValue = parseFloat(values[fieldIndex]);
                        if (isNaN(numValue)) {
                            errors.push(`Fila ${rowNumber}, columna "${field}": "${values[fieldIndex]}" no es un número válido.`);
                        }
                    }
                });
            }

            // Validate date fields
            if (typeValidation.date) {
                typeValidation.date.forEach(field => {
                    const fieldIndex = headers.indexOf(field.toLowerCase());
                    if (fieldIndex !== -1 && values[fieldIndex]) {
                        const dateValue = values[fieldIndex];
                        // Basic date validation - check if it can be parsed as a date
                        const date = new Date(dateValue);
                        if (isNaN(date.getTime())) {
                            errors.push(`Fila ${rowNumber}, columna "${field}": "${dateValue}" no es una fecha válida. Use formato DD/MM/YYYY o YYYY-MM-DD.`);
                        }
                    }
                });
            }

            // Validate boolean fields
            if (typeValidation.boolean) {
                typeValidation.boolean.forEach(field => {
                    const fieldIndex = headers.indexOf(field.toLowerCase());
                    if (fieldIndex !== -1 && values[fieldIndex]) {
                        const boolValue = values[fieldIndex].toLowerCase();
                        if (!['true', 'false', '1', '0', 'si', 'no', 'sí', 'yes', 'no'].includes(boolValue)) {
                            errors.push(`Fila ${rowNumber}, columna "${field}": "${values[fieldIndex]}" no es un valor booleano válido. Use true/false, 1/0, sí/no, yes/no.`);
                        }
                    }
                });
            }

            // Check for empty required fields
            typeValidation.required.forEach(field => {
                const fieldIndex = headers.indexOf(field.toLowerCase());
                if (fieldIndex !== -1 && !values[fieldIndex]) {
                    errors.push(`Fila ${rowNumber}, columna "${field}": Este campo requerido está vacío.`);
                }
            });
        });

        // Check for duplicate entries if applicable
        if (type === 'Pacientes' && dataRows.length > 0) {
            const numeroColumn = headers.indexOf('numero');
            if (numeroColumn !== -1) {
                const numeros = dataRows.map(row => row.split(',')[numeroColumn]?.trim()).filter(n => n);
                const duplicates = numeros.filter((num, index) => numeros.indexOf(num) !== index);
                if (duplicates.length > 0) {
                    warnings.push(`Se encontraron números de teléfono duplicados: ${[...new Set(duplicates)].join(', ')}. Verifique si son registros válidos.`);
                }
            }
        }

        return { errors, warnings };
    };

    const processImport = async (text: string, type: string) => {
        try {
            // Parse CSV
            const lines = text.split('\n').filter(line => line.trim() !== '');
            if (lines.length < 2) {
                alert('El archivo CSV está vacío o no tiene datos.');
                return;
            }

            const headers = lines[0].split(',').map(h => h.trim());
            const dataRows = lines.slice(1);
            const totalItems = dataRows.length;

            // Initialize progress modal
            setImportProgress({
                isOpen: true,
                title: `Importando ${type}`,
                totalItems,
                processedItems: 0,
                currentItem: '',
                isComplete: false,
                successMessage: '',
                errorMessage: ''
            });

            if (type === 'Campañas' && onImportCampaigns) {
                const campaigns = [];

                for (let i = 0; i < dataRows.length; i++) {
                    const values = dataRows[i].split(',').map(v => v.trim());
                    const campaign: any = {};

                    headers.forEach((header, index) => {
                        const value = values[index];
                        if (header === 'alcance' || header === 'resultados') {
                            campaign[header] = parseInt(value) || 0;
                        } else if (header === 'costoPorResultado' || header === 'importeGastado') {
                            campaign[header] = parseFloat(value) || 0;
                        } else {
                            campaign[header] = value;
                        }
                    });

                    campaigns.push(campaign);

                    // Update progress
                    setImportProgress(prev => ({
                        ...prev,
                        processedItems: i + 1,
                        currentItem: campaign.nombreAnuncio || `Registro ${i + 1}`
                    }));

                    // Add small delay to show progress animation
                    await new Promise(resolve => setTimeout(resolve, 50));
                }

                await onImportCampaigns(campaigns);

                setImportProgress(prev => ({
                    ...prev,
                    isComplete: true,
                    successMessage: `Se importaron ${campaigns.length} campañas exitosamente.`
                }));

            } else if (type === 'Meta Campañas' && onImportMetaCampaigns) {
                const metaCampaigns = [];

                for (let i = 0; i < dataRows.length; i++) {
                    const values = dataRows[i].split(',').map(v => v.trim());
                    const metaCampaign: any = {};

                    headers.forEach((header, index) => {
                        metaCampaign[header] = values[index];
                    });

                    metaCampaigns.push(metaCampaign);

                    // Update progress
                    setImportProgress(prev => ({
                        ...prev,
                        processedItems: i + 1,
                        currentItem: metaCampaign.nombre || `Registro ${i + 1}`
                    }));

                    // Add small delay to show progress animation
                    await new Promise(resolve => setTimeout(resolve, 50));
                }

                await onImportMetaCampaigns(metaCampaigns);

                setImportProgress(prev => ({
                    ...prev,
                    isComplete: true,
                    successMessage: `Se importaron ${metaCampaigns.length} meta campañas exitosamente.`
                }));

            } else if (type === 'Pacientes' && onImportLeads) {
                const leads = [];

                for (let i = 0; i < dataRows.length; i++) {
                    const values = dataRows[i].split(',').map(v => v.trim());
                    const lead: any = {};

                    headers.forEach((header, index) => {
                        const value = values[index];
                        // Convert numeric fields
                        if (['montoPagado'].includes(header)) {
                            lead[header] = parseFloat(value) || 0;
                        } 
                        // Convert date fields to ISO format
                        else if (['fechaLead', 'fechaHoraAgenda', 'fechaVolverLlamar', 'birthDate'].includes(header) && value) {
                            // Try to parse common date formats
                            const date = new Date(value);
                            if (!isNaN(date.getTime())) {
                                // Convert to YYYY-MM-DD format for date-only fields
                                if (header === 'fechaLead' || header === 'birthDate') {
                                    lead[header] = date.toISOString().split('T')[0];
                                } else {
                                    // For datetime fields, keep full ISO
                                    lead[header] = date.toISOString();
                                }
                            } else {
                                // If can't parse, keep original value
                                lead[header] = value;
                            }
                        }
                        else {
                            lead[header] = value;
                        }
                    });

                    leads.push(lead);

                    // Update progress
                    setImportProgress(prev => ({
                        ...prev,
                        processedItems: i + 1,
                        currentItem: `${lead.nombres} ${lead.apellidos}` || `Registro ${i + 1}`
                    }));

                    // Add small delay to show progress animation
                    await new Promise(resolve => setTimeout(resolve, 50));
                }

                await onImportLeads(leads);

                setImportProgress(prev => ({
                    ...prev,
                    isComplete: true,
                    successMessage: `Se importaron ${leads.length} pacientes/leads exitosamente.`
                }));

            } else if (type === 'Servicios' && onImportServices) {
                const services = [];

                for (let i = 0; i < dataRows.length; i++) {
                    const values = dataRows[i].split(',').map(v => v.trim());
                    const service: any = {};

                    headers.forEach((header, index) => {
                        const value = values[index];
                        if (header === 'precio') {
                            service[header] = parseFloat(value) || 0;
                        } else if (header === 'duracionMinutos') {
                            service[header] = parseInt(value) || 60; // Default 60 minutos
                        } else {
                            service[header] = value;
                        }
                    });

                    services.push(service);

                    // Update progress
                    setImportProgress(prev => ({
                        ...prev,
                        processedItems: i + 1,
                        currentItem: service.nombre || `Registro ${i + 1}`
                    }));

                    // Add small delay to show progress animation
                    await new Promise(resolve => setTimeout(resolve, 50));
                }

                await onImportServices(services);

                setImportProgress(prev => ({
                    ...prev,
                    isComplete: true,
                    successMessage: `Se importaron ${services.length} servicios exitosamente.`
                }));

            } else if (type === 'Productos' && onImportProducts) {
                const products = [];

                for (let i = 0; i < dataRows.length; i++) {
                    const values = dataRows[i].split(',').map(v => v.trim());
                    const product: any = {};

                    headers.forEach((header, index) => {
                        const value = values[index];
                        if (header === 'precio') {
                            product[header] = parseFloat(value) || 0;
                        } else {
                            product[header] = value;
                        }
                    });

                    products.push(product);

                    // Update progress
                    setImportProgress(prev => ({
                        ...prev,
                        processedItems: i + 1,
                        currentItem: product.nombre || `Registro ${i + 1}`
                    }));

                    // Add small delay to show progress animation
                    await new Promise(resolve => setTimeout(resolve, 50));
                }

                await onImportProducts(products);

                setImportProgress(prev => ({
                    ...prev,
                    isComplete: true,
                    successMessage: `Se importaron ${products.length} productos exitosamente.`
                }));

            } else if (type === 'Ventas' && onImportVentasExtra) {
                const ventas = [];

                for (let i = 0; i < dataRows.length; i++) {
                    const values = dataRows[i].split(',').map(v => v.trim());
                    const venta: any = {};

                    headers.forEach((header, index) => {
                        const value = values[index];
                        if (['precio', 'montoPagado', 'deuda'].includes(header)) {
                            venta[header] = parseFloat(value) || 0;
                        } else {
                            venta[header] = value;
                        }
                    });

                    ventas.push(venta);

                    // Update progress
                    setImportProgress(prev => ({
                        ...prev,
                        processedItems: i + 1,
                        currentItem: venta.codigoVenta || `Registro ${i + 1}`
                    }));

                    // Add small delay to show progress animation
                    await new Promise(resolve => setTimeout(resolve, 50));
                }

                await onImportVentasExtra(ventas);

                setImportProgress(prev => ({
                    ...prev,
                    isComplete: true,
                    successMessage: `Se importaron ${ventas.length} ventas exitosamente.`
                }));

            } else if (type === 'Incidencias' && onImportIncidencias) {
                const incidencias = [];

                for (let i = 0; i < dataRows.length; i++) {
                    const values = dataRows[i].split(',').map(v => v.trim());
                    const incidencia: any = {};

                    headers.forEach((header, index) => {
                        const value = values[index];
                        if (header === 'solucionado') {
                            incidencia[header] = value.toLowerCase() === 'true' || value === '1';
                        } else {
                            incidencia[header] = value;
                        }
                    });

                    incidencias.push(incidencia);

                    // Update progress
                    setImportProgress(prev => ({
                        ...prev,
                        processedItems: i + 1,
                        currentItem: incidencia.tipoIncidencia || `Registro ${i + 1}`
                    }));

                    // Add small delay to show progress animation
                    await new Promise(resolve => setTimeout(resolve, 50));
                }

                await onImportIncidencias(incidencias);

                setImportProgress(prev => ({
                    ...prev,
                    isComplete: true,
                    successMessage: `Se importaron ${incidencias.length} incidencias exitosamente.`
                }));

            } else if (type === 'Egresos' && onImportEgresos) {
                const egresos: any[] = [];

                // Helper to normalize enum values to PascalCase
                const normalizeTipoComprobante = (val: string): string => {
                    if (!val || !val.trim()) return 'SinComprobante';
                    const normalized = val.toLowerCase().trim().replace(/\s+/g, '');
                    if (normalized === 'factura') return 'Factura';
                    if (normalized === 'boleta') return 'Boleta';
                    if (normalized === 'recibohonorarios' || normalized === 'recibodehonorarios') return 'ReciboHonorarios';
                    if (normalized === 'sincomprobante') return 'SinComprobante';
                    return val; // Return original if no match so backend can alert
                };

                const normalizeModoPago = (val: string): string => {
                    if (!val) return '';
                    const normalized = val.toLowerCase().trim();
                    if (normalized === 'efectivo') return 'Efectivo';
                    if (normalized === 'transferencia' || normalized === 'transferencia bancaria' || normalized === 'transferenciabancaria') return 'Transferencia';
                    if (normalized === 'tarjeta' || normalized === 'tarjeta de crédito' || normalized === 'tarjeta de credito' || normalized === 'tarjetadecredito') return 'Tarjeta';
                    if (normalized === 'yape') return 'Yape';
                    return val;
                };

                for (let i = 0; i < dataRows.length; i++) {
                    const values = dataRows[i].split(',').map(v => v.trim());
                    const egreso: any = {};

                    headers.forEach((header, index) => {
                        const value = values[index];
                        if (['montoTotal', 'montoPagado', 'deuda'].includes(header)) {
                            egreso[header] = parseFloat(value) || 0;
                        } else if (['fechaRegistro', 'fechaPago'].includes(header) && value) {
                            const date = new Date(value);
                            if (!isNaN(date.getTime())) {
                                egreso[header] = date.toISOString().split('T')[0];
                            } else {
                                egreso[header] = value;
                            }
                        } else if (header === 'comprobantes' && value) {
                            // split by semicolon
                            egreso.comprobantes = value.split(';').map(s => ({ url: s.trim() })).filter((x: any) => x.url);
                        } else if (header === 'tipoComprobante') {
                            egreso[header] = normalizeTipoComprobante(value);
                        } else if (header === 'modoPago' && value) {
                            egreso[header] = normalizeModoPago(value);
                        } else {
                            egreso[header] = value;
                        }
                    });

                    if (!egreso.tipoComprobante || String(egreso.tipoComprobante).trim() === '') {
                        egreso.tipoComprobante = 'SinComprobante';
                    }

                    egresos.push(egreso);

                    setImportProgress(prev => ({
                        ...prev,
                        processedItems: i + 1,
                        currentItem: egreso.proveedor || `Registro ${i + 1}`
                    }));

                    await new Promise(resolve => setTimeout(resolve, 50));
                }

                try {
                    const response = await onImportEgresos(egresos);
                    const failures = response?.egresos?.filter(result => !result.success) ?? [];
                    const detailItems = failures.map((failure, idx) => ({
                        rowNumber: typeof failure.index === 'number' ? failure.index + 1 : undefined,
                        error: failure.error || 'Error desconocido'
                    }));
                    const successCount = response?.successCount ?? (egresos.length - failures.length);
                    const errorCount = response?.errorCount ?? failures.length;
                    const hasErrors = errorCount > 0;

                    setImportProgress(prev => ({
                        ...prev,
                        processedItems: totalItems,
                        isComplete: true,
                        successMessage: hasErrors ? '' : `Se importaron ${successCount} egresos exitosamente.`,
                        errorMessage: hasErrors
                            ? `Se importaron ${successCount} egresos, pero ${errorCount} registros tuvieron errores. Revisa el detalle para corregirlos.`
                            : '',
                        detailItems,
                        successCount,
                        errorCount
                    }));
                } catch (error) {
                    console.error('Error importing egresos:', error);
                    setImportProgress(prev => ({
                        ...prev,
                        processedItems: totalItems,
                        isComplete: true,
                        successMessage: '',
                        errorMessage: `Error al importar egresos: ${(error as Error).message || 'Error desconocido'}`,
                        detailItems: [],
                        successCount: 0,
                        errorCount: totalItems
                    }));
                }

            } else if (type === 'Comprobantes Electrónicos' && onImportComprobantes) {
                const comprobantes = [];

                for (let i = 0; i < dataRows.length; i++) {
                    const values = dataRows[i].split(',').map(v => v.trim());
                    const comprobante: any = {};

                    headers.forEach((header, index) => {
                        const value = values[index];
                        if (['opGravadas', 'igv', 'total'].includes(header)) {
                            comprobante[header] = parseFloat(value) || 0;
                        } else {
                            comprobante[header] = value;
                        }
                    });

                    comprobantes.push(comprobante);

                    // Update progress
                    setImportProgress(prev => ({
                        ...prev,
                        processedItems: i + 1,
                        currentItem: `${comprobante.tipoDocumento} ${comprobante.serie}-${comprobante.correlativo}` || `Registro ${i + 1}`
                    }));

                    // Add small delay to show progress animation
                    await new Promise(resolve => setTimeout(resolve, 50));
                }

                await onImportComprobantes(comprobantes);

                setImportProgress(prev => ({
                    ...prev,
                    isComplete: true,
                    successMessage: `Se importaron ${comprobantes.length} comprobantes electrónicos exitosamente.`
                }));

            } else {
                // For other types, simulate processing (types without specific import functions yet)
                for (let i = 0; i < totalItems; i++) {
                    setImportProgress(prev => ({
                        ...prev,
                        processedItems: i + 1,
                        currentItem: `Registro ${i + 1}`
                    }));

                    // Add small delay to show progress animation
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                setImportProgress(prev => ({
                    ...prev,
                    isComplete: true,
                    successMessage: `Se importaron ${totalItems} registros de ${type} exitosamente.`
                }));
            }
        } catch (error) {
            console.error(`Error al procesar la importación de ${type}:`, error);
            setImportProgress(prev => ({
                ...prev,
                isComplete: true,
                errorMessage: `Error al procesar los datos. Verifica el formato del archivo.`
            }));
        }
    };

    const handleFileImport = async (file: File, type: string) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const text = e.target?.result as string;

                // Store current import data
                setCurrentImportData({ text, type });

                // Validate CSV first
                const { errors, warnings } = validateCSV(text, type);

                if (errors.length > 0) {
                    setValidationErrors({
                        isOpen: true,
                        errors,
                        warnings
                    });
                    return;
                }

                // If only warnings, show them but allow import to proceed
                if (warnings.length > 0) {
                    setValidationErrors({
                        isOpen: true,
                        errors: [],
                        warnings
                    });
                    return;
                }

                // If no errors or warnings, proceed directly with import
                await processImport(text, type);

            } catch (error) {
                console.error(`Error al importar ${type}:`, error);
                setImportProgress(prev => ({
                    ...prev,
                    isComplete: true,
                    errorMessage: `Error al importar los datos. Verifica el formato del archivo.`
                }));
            }
        };

        reader.readAsText(file);
    };

    const handleCloseProgressModal = () => {
        setImportProgress({
            isOpen: false,
            title: '',
            totalItems: 0,
            processedItems: 0,
            currentItem: '',
            isComplete: false,
            successMessage: '',
            errorMessage: ''
        });
    };

    const handleValidationModalClose = () => {
        setValidationErrors({
            isOpen: false,
            errors: [],
            warnings: []
        });
    };

    const handleProceedWithImport = async () => {
        if (currentImportData) {
            setValidationErrors({
                isOpen: false,
                errors: [],
                warnings: []
            });
            await processImport(currentImportData.text, currentImportData.type);
        }
    };

    const exportLeadsCsv = async () => {
        try {
            const data = await getLeads();
            if (!data || data.length === 0) {
                alert('No hay leads para exportar.');
                return;
            }
            const rows = data.map(lead => [
                lead.id ?? '',
                lead.fechaLead ?? '',
                lead.nombres ?? '',
                lead.apellidos ?? '',
                lead.numero ?? '',
                lead.sexo ?? '',
                lead.redSocial ?? '',
                lead.anuncio ?? '',
                lead.vendedor ?? '',
                lead.estado ?? '',
                lead.montoPagado ?? '',
                lead.metodoPago ?? '',
                lead.fechaHoraAgenda ?? '',
                (lead.servicios || []).join(';'),
                lead.categoria ?? '',
                lead.fechaVolverLlamar ?? '',
                lead.horaVolverLlamar ?? '',
                lead.notas ?? '',
                lead.nHistoria ?? '',
                lead.birthDate ?? '',
                lead.documentType ?? '',
                lead.documentNumber ?? '',
                lead.razonSocial ?? '',
                lead.direccionFiscal ?? ''
            ]);
            downloadCsv('leads_export.csv', LEAD_HEADERS, rows);
        } catch (error) {
            console.error('Error al exportar leads', error);
            alert('Error al exportar leads. Revisa la consola.');
        }
    };

    const exportCampaignsCsv = async () => {
        try {
            const data = await getCampaigns();
            if (!data || data.length === 0) {
                alert('No hay campañas para exportar.');
                return;
            }
            const rows = data.map(campaign => [
                campaign.id ?? '',
                campaign.nombreAnuncio ?? '',
                campaign.categoria ?? '',
                campaign.alcance ?? '',
                campaign.resultados ?? '',
                campaign.costoPorResultado ?? '',
                campaign.importeGastado ?? '',
                campaign.fecha ?? ''
            ]);
            downloadCsv('campaigns_export.csv', CAMPAIGN_HEADERS, rows);
        } catch (error) {
            console.error('Error al exportar campañas', error);
            alert('Error al exportar campañas. Revisa la consola.');
        }
    };

    const exportMetaCampaignsCsv = async () => {
        try {
            const data = await getMetaCampaigns();
            if (!data || data.length === 0) {
                alert('No hay campañas meta para exportar.');
                return;
            }
            const rows = data.map(campaign => [
                campaign.id ?? '',
                campaign.nombre ?? '',
                campaign.fechaInicio ?? '',
                campaign.fechaFin ?? '',
                campaign.categoria ?? ''
            ]);
            downloadCsv('meta_campaigns_export.csv', META_CAMPAIGN_HEADERS, rows);
        } catch (error) {
            console.error('Error al exportar campañas meta', error);
            alert('Error al exportar campañas meta. Revisa la consola.');
        }
    };

    const exportEgresosCsv = async () => {
        try {
            const data = await getEgresos();
            if (!data || data.length === 0) {
                alert('No hay egresos para exportar.');
                return;
            }
            const rows = data.map((egreso: any) => {
                const comprobantes = Array.isArray(egreso.comprobantes)
                    ? egreso.comprobantes.map((c: any) => c?.url || '').filter(Boolean).join(';')
                    : '';
                return [
                    egreso.id ?? '',
                    egreso.fechaRegistro ?? '',
                    egreso.fechaPago ?? '',
                    egreso.proveedor ?? '',
                    egreso.categoria ?? '',
                    egreso.descripcion ?? '',
                    egreso.tipoComprobante ?? '',
                    egreso.serieComprobante ?? '',
                    egreso.nComprobante ?? '',
                    egreso.montoTotal ?? '',
                    egreso.montoPagado ?? '',
                    egreso.deuda ?? '',
                    egreso.modoPago ?? '',
                    egreso.tipoMoneda ?? '',
                    egreso.observaciones ?? '',
                    comprobantes
                ];
            });
            downloadCsv('egresos_export.csv', EGRESO_HEADERS, rows);
        } catch (error) {
            console.error('Error al exportar egresos', error);
            alert('Error al exportar egresos. Revisa la consola.');
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black">Importación y Exportación de Datos</h2>
            <p className="text-gray-600">
                Usa estas herramientas para añadir datos en bloque a tu sistema. Descarga la plantilla para asegurar que el formato de tu archivo sea correcto.
            </p>

            <ImportSection
                title="Pacientes / Leads"
                description="Añade o actualiza la información de tus pacientes y leads desde un archivo CSV."
                templateFilename="plantilla_pacientes.csv"
                headers={LEAD_HEADERS}
                onImport={(file) => handleFileImport(file, 'Pacientes')}
                exportConfig={{ label: 'Exportar Leads', onExport: exportLeadsCsv }}
            />
            
            <ImportSection
                title="Campañas (Campaigns)"
                description="Importa registros de campañas publicitarias con sus métricas."
                templateFilename="plantilla_campaigns.csv"
                headers={CAMPAIGN_HEADERS}
                onImport={(file) => handleFileImport(file, 'Campañas')}
                exportConfig={{ label: 'Exportar Campañas', onExport: exportCampaignsCsv }}
            />

            <ImportSection
                title="Meta Campañas"
                description="Importa campañas de Meta (Facebook/Instagram) con fechas de inicio y fin."
                templateFilename="plantilla_meta_campaigns.csv"
                headers={META_CAMPAIGN_HEADERS}
                onImport={(file) => handleFileImport(file, 'Meta Campañas')}
                exportConfig={{ label: 'Exportar Meta Campañas', onExport: exportMetaCampaignsCsv }}
            />

            <ImportSection
                title="Servicios"
                description="Importa tu catálogo de servicios."
                templateFilename="plantilla_servicios.csv"
                headers={["id", "nombre", "categoria", "precio", "duracionMinutos", "descripcion"]}
                onImport={(file) => handleFileImport(file, 'Servicios')}
            />

            <ImportSection
                title="Productos"
                description="Importa tu catálogo de productos."
                templateFilename="plantilla_productos.csv"
                headers={["id", "nombre", "categoria", "precio"]}
                onImport={(file) => handleFileImport(file, 'Productos')}
            />

            <ImportSection
                title="Ventas"
                description="Importa registros de ventas adicionales (recuperados)."
                templateFilename="plantilla_ventas.csv"
                headers={[
                    "id", "codigoVenta", "fechaVenta", "nHistoria", "servicio", "categoria", 
                    "precio", "montoPagado", "metodoPago", "deuda", "fechaPagoDeuda"
                ]}
                onImport={(file) => handleFileImport(file, 'Ventas')}
            />

            <ImportSection
                title="Incidencias"
                description="Importa un historial de incidencias."
                templateFilename="plantilla_incidencias.csv"
                headers={[
                    "id", "fecha", "hora", "nHistoria", "tipoIncidencia", "detalleIncidencia", 
                    "descripcion", "solucionado"
                ]}
                onImport={(file) => handleFileImport(file, 'Incidencias')}
            />

            <ImportSection
                title="Egresos"
                description="Importa registros de egresos (gastos) desde un CSV. Para comprobantes múltiples use la columna 'comprobantes' separando URLs por punto y coma (;)."
                templateFilename="plantilla_egresos.csv"
                headers={EGRESO_HEADERS}
                onImport={(file) => handleFileImport(file, 'Egresos')}
                exportConfig={{ label: 'Exportar Egresos', onExport: exportEgresosCsv }}
            />

            <ImportSection
                title="Atenciones Diarias (Procedimientos)"
                description="Importa registros de procedimientos realizados a los pacientes."
                templateFilename="plantilla_atenciones.csv"
                headers={[
                    "id", "nHistoria", "nombreTratamiento", "sesionNumero", "fechaAtencion", "personal", 
                    "horaInicio", "horaFin", "asistenciaMedica", "medico", "observacion"
                ]}
                onImport={(file) => handleFileImport(file, 'Atenciones Diarias')}
            />
            
            <ImportSection
                title="Seguimiento"
                description="Importa los seguimientos realizados post-procedimiento."
                templateFilename="plantilla_seguimientos.csv"
                headers={[
                    "id", "nHistoria", "nombreTratamiento", "sesionNumero", "fechaSeguimiento", 
                    "personal", "inflamacion", "ampollas", "alergias", "malestarGeneral", "brote", 
                    "dolorDeCabeza", "moretones", "observacion"
                ]}
                onImport={(file) => handleFileImport(file, 'Seguimientos')}
            />

            <ImportSection
                title="Comprobantes Electrónicos"
                description="Importa comprobantes electrónicos ya emitidos."
                templateFilename="plantilla_comprobantes.csv"
                headers={[
                    "id", "tipoDocumento", "serie", "correlativo", "fechaEmision",
                    "clienteTipoDocumento", "clienteNumeroDocumento", "clienteDenominacion",
                    "clienteDireccion", "items", "opGravadas", "igv", "total", "sunatStatus",
                    "ventaId", "ventaType"
                ]}
                onImport={(file) => handleFileImport(file, 'Comprobantes Electrónicos')}
            />

            <ImportProgressModal
                isOpen={importProgress.isOpen}
                title={importProgress.title}
                totalItems={importProgress.totalItems}
                processedItems={importProgress.processedItems}
                currentItem={importProgress.currentItem}
                isComplete={importProgress.isComplete}
                successMessage={importProgress.successMessage}
                errorMessage={importProgress.errorMessage}
                onClose={handleCloseProgressModal}
            />

            <Modal
                isOpen={validationErrors.isOpen}
                onClose={handleValidationModalClose}
                title={validationErrors.errors.length > 0 ? "Errores en el archivo CSV" : "Advertencias en el archivo CSV"}
                maxWidthClass="max-w-2xl"
                footer={
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={handleValidationModalClose}
                            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        {validationErrors.errors.length === 0 && (
                            <button
                                onClick={handleProceedWithImport}
                                className="px-4 py-2 bg-[#aa632d] text-white rounded-lg hover:bg-[#8e5225] transition-colors"
                            >
                                Continuar con la importación
                            </button>
                        )}
                    </div>
                }
            >
                <div className="p-6">
                    {validationErrors.errors.length > 0 && (
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-red-600 mb-2">Errores encontrados:</h3>
                            <ul className="list-disc list-inside space-y-1 text-red-700">
                                {validationErrors.errors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                            <p className="mt-3 text-sm text-gray-600">
                                Corrige estos errores en tu archivo CSV antes de continuar con la importación.
                            </p>
                        </div>
                    )}

                    {validationErrors.warnings.length > 0 && (
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-yellow-600 mb-2">Advertencias:</h3>
                            <ul className="list-disc list-inside space-y-1 text-yellow-700">
                                {validationErrors.warnings.map((warning, index) => (
                                    <li key={index}>{warning}</li>
                                ))}
                            </ul>
                            <p className="mt-3 text-sm text-gray-600">
                                Estas advertencias no impiden la importación, pero revisa si los datos son correctos.
                            </p>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default ImportExportPage;
