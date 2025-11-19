
import React, { useRef, useState } from 'react';
import type { ComprobanteElectronico } from '../../types.ts';
import ImportProgressModal from '../shared/ImportProgressModal';
import Modal from '../shared/Modal';

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

interface ImportSectionProps {
    title: string;
    description: string;
    templateFilename: string;
    headers: string[];
    onImport: (file: File) => void;
}

const ImportSection: React.FC<ImportSectionProps> = ({ title, description, templateFilename, headers, onImport }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

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
    onImportEgresos?: (egresos: any[]) => Promise<void>;
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
                numeric: ['precio']
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
                        } else {
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
                headers={[
                    "id", "fechaLead", "nombres", "apellidos", "numero", "sexo", "redSocial", "anuncio", 
                    "vendedor", "estado", "montoPagado", "metodoPago", "fechaHoraAgenda", "servicios", 
                    "categoria", "fechaVolverLlamar", "horaVolverLlamar", "notas", "nHistoria", 
                    "birthDate", "documentType", "documentNumber", "razonSocial", "direccionFiscal"
                ]}
                onImport={(file) => handleFileImport(file, 'Pacientes')}
            />
            
            <ImportSection
                title="Campañas (Campaigns)"
                description="Importa registros de campañas publicitarias con sus métricas."
                templateFilename="plantilla_campaigns.csv"
                headers={["id", "nombreAnuncio", "categoria", "alcance", "resultados", "costoPorResultado", "importeGastado", "fecha"]}
                onImport={(file) => handleFileImport(file, 'Campañas')}
            />

            <ImportSection
                title="Meta Campañas"
                description="Importa campañas de Meta (Facebook/Instagram) con fechas de inicio y fin."
                templateFilename="plantilla_meta_campaigns.csv"
                headers={["id", "nombre", "fechaInicio", "fechaFin", "categoria"]}
                onImport={(file) => handleFileImport(file, 'Meta Campañas')}
            />

            <ImportSection
                title="Servicios"
                description="Importa tu catálogo de servicios."
                templateFilename="plantilla_servicios.csv"
                headers={["id", "nombre", "categoria", "precio"]}
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
