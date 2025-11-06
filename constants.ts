import type { Campaign, Page } from './types';

export const RESOURCES = [
    { id: 'Dra. Marilia', name: 'Dra. Marilia', type: 'personal', imageUrl: 'https://picsum.photos/id/1027/100/100' },
    { id: 'Dra. Sofía', name: 'Dra. Sofía', type: 'personal', imageUrl: 'https://picsum.photos/id/1011/100/100' },
    { id: 'Dr. Carlos', name: 'Dr. Carlos', type: 'personal', imageUrl: 'https://picsum.photos/id/1005/100/100' },
    { id: 'Vanesa', name: 'Vanesa', type: 'personal', imageUrl: 'https://picsum.photos/id/1025/100/100' },
    { id: 'Consultorio 1', name: 'Consultorio 1', type: 'room' },
    { id: 'Consultorio 2', name: 'Consultorio 2', type: 'room' },
    { id: 'Sala de Procedimientos', name: 'Sala de Procedimientos', type: 'room' },
];

export const INCIDENCIA_TYPES: Record<string, string[]> = {
    'Queja del Paciente': ['Mala atención del personal', 'Tiempo de espera excesivo', 'Resultados no esperados', 'Problemas con el pago'],
    'Problema de Equipo': ['Equipo malogrado', 'Falta de insumos', 'Problema de software'],
    'Incidente de Personal': ['Tardanza o inasistencia', 'Conflicto interno', 'Error en procedimiento'],
    'Otro': ['Otro tipo de incidencia'],
};




export const ALL_PAGES_CONFIG: { id: Page; label: string; group: string }[] = [
    { id: 'dashboard', label: 'Dashboard', group: 'General' },
    { id: 'calendario', label: 'Calendario', group: 'General' },
    { id: 'marketing-campanas', label: 'Campañas', group: 'Comercial' },
    { id: 'marketing-leads', label: 'Leads', group: 'Comercial' },
    { id: 'redes-sociales-publicaciones', label: 'Publicaciones', group: 'Comercial' },
    { id: 'redes-sociales-seguidores', label: 'Seguidores', group: 'Comercial' },
    { id: 'recepcion-agendados', label: 'Agendados', group: 'Administración' },
    { id: 'recepcion-ventas-extra', label: 'Recuperados', group: 'Administración' },
    { id: 'recepcion-incidencias', label: 'Incidencias (Recepción)', group: 'Administración' },
    { id: 'procedimientos-atenciones', label: 'Atenciones Diarias', group: 'Procedimientos' },
    { id: 'procedimientos-seguimiento', label: 'Seguimiento', group: 'Procedimientos' },
    { id: 'procedimientos-ventas-extra', label: 'Ventas (Procedimientos)', group: 'Procedimientos' },
    { id: 'procedimientos-incidencias', label: 'Incidencias (Procedimientos)', group: 'Procedimientos' },
    { id: 'pacientes-historia', label: 'Historia Pacientes', group: 'Procedimientos' },
    { id: 'finanzas-egresos', label: 'Egresos', group: 'Finanzas' },
    { id: 'finanzas-facturacion', label: 'Facturación', group: 'Finanzas' },
    { id: 'rrhh-perfiles', label: 'Perfiles de Equipo', group: 'Recursos Humanos' },
    { id: 'informes', label: 'Informes', group: 'Reportes' },
    { id: 'configuracion', label: 'Configuración del Sistema', group: 'Administración' },
];

export const DASHBOARD_METRICS_CONFIG: { id: string; label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'recepcion', label: 'Recepción' },
    { id: 'procedimientos', label: 'Procedimientos' },
    { id: 'finanzas', label: 'Finanzas' },
    { id: 'rrhh', label: 'Recursos Humanos' },
];