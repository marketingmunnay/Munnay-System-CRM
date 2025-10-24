import React, { useRef } from 'react';
import type { ComprobanteElectronico } from '../../types.ts';

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
}

const ImportExportPage: React.FC<ImportExportPageProps> = ({ comprobantes }) => {

    const handleFileImport = (file: File, type: string) => {
        // In a real app, you would parse the CSV and send it to the backend.
        // For this demo, we'll just show an alert.
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            // A very basic way to count rows, ignoring complexities of CSV format
            const rowCount = text.split('\n').filter(line => line.trim() !== '').length - 1; // -1 for header
            alert(`Archivo "${file.name}" cargado.\nSe importarán ${rowCount > 0 ? rowCount : 0} registros de ${type}.`);
        };
        reader.readAsText(file);
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
                    "id", "tipoDocumento", "serie", "correlativo", "fechaEm