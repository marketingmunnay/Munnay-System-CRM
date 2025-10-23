// NOTA: Las funciones a continuación usan datos de prueba para la demostración.
import { GoogleGenAI } from "@google/genai";
import type { 
    Lead, Campaign, VentaExtra, Incidencia, Egreso, Proveedor, User, Role, 
    BusinessInfo, ClientSource, Service, Product, Membership, ServiceCategory,
    ProductCategory, JobPosition, Publicacion, Seguidor, MetaCampaign, EgresoCategory,
    TipoProveedor,
    Goal
} from '../types.ts';
import { LeadStatus, Seller, MetodoPago, ReceptionStatus, TipoComprobante, ModoPagoEgreso, DocumentType, EstadoLlamada, TipoPost, RedSocialPost, GoalArea, GoalUnit, GoalObjective } from '../types.ts';

// Mock data (in a real app, this would be on a server)
let leads: Lead[] = [
    { id: 1, fechaLead: '2023-11-01', nombres: 'Maria', apellidos: 'Gomez', numero: '987654321', sexo: 'F', redSocial: 'Facebook', anuncio: 'Campaña Skincare Noviembre', vendedor: Seller.Vanesa, estado: LeadStatus.Agendado, montoPagado: 50, metodoPago: MetodoPago.Yape, fechaHoraAgenda: '2023-11-05T10:00:00', servicios: ['Limpieza Facial'], categoria: 'Limpieza Facial', nHistoria: 'H-1101-MAR', aceptoTratamiento: 'Si', tratamientos: [{id: 1, nombre: 'Hydrafacial', cantidadSesiones: 3, precio: 450, montoPagado: 450, metodoPago: MetodoPago.Tarjeta, deuda: 0}], procedimientos: [{id: 1, fechaAtencion: '2023-11-05', personal: 'Elvira', horaInicio: '10:00', horaFin: '11:00', tratamientoId: 1, nombreTratamiento: 'Hydrafacial', sesionNumero: 1, asistenciaMedica: false}], seguimientos: [], estadoRecepcion: ReceptionStatus.Atendido, recursoId: 'Consultorio 1', birthDate: '1995-05-15', alergias: [{id: 1, nombre: 'Penicilina', gravedad: 4}, {id: 2, nombre: 'Corticoide', gravedad: 3}, {id: 3, nombre: 'Picaduras de abeja', gravedad: 5}], membresiasAdquiridas: [{id: 1, nombre: 'Club Piel Radiante', precio: 500, numeroSesiones: 4, descripcion: '4 sesiones de limpieza facial profunda.'}] },
    { id: 2, fechaLead: '2023-11-02', nombres: 'Juan', apellidos: 'Perez', numero: '912345678', sexo: 'M', redSocial: 'Instagram', anuncio: 'Promo Juventud Eterna', vendedor: Seller.Liz, estado: LeadStatus.Seguimiento, montoPagado: 0, servicios: ['Evaluación Médica'], categoria: 'Evaluación Médica', registrosLlamada: [{ id: 1, numeroLlamada: 1, duracionLlamada: '00:02:30', estadoLlamada: EstadoLlamada.Contesto, observacion: 'Interesado, llamará para agendar.'}] },
    { id: 3, fechaLead: '2023-11-03', nombres: 'Ana', apellidos: 'Torres', numero: '998877665', sexo: 'F', redSocial: 'WhatsApp', anuncio: 'Consulta Directa', vendedor: Seller.Elvira, estado: LeadStatus.Perdido, montoPagado: 0, servicios: ['Hydrafacial'], categoria: 'Hydrafacial' },
    { id: 4, fechaLead: '2023-11-04', nombres: 'Carlos', apellidos: 'Ruiz', numero: '955667788', sexo: 'M', redSocial: 'Google', anuncio: 'Campaña Skincare Noviembre', vendedor: Seller.Vanesa, estado: LeadStatus.PorPagar, montoPagado: 0, servicios: ['Evaluación Específica'], categoria: 'Evaluación Específica' },
    { id: 5, fechaLead: '2023-11-05', nombres: 'Lucia', apellidos: 'Mendez', numero: '933221144', sexo: 'F', redSocial: 'Facebook', anuncio: 'Campaña Skincare Noviembre', vendedor: Seller.Liz, estado: LeadStatus.Agendado, montoPagado: 25, metodoPago: MetodoPago.Plin, fechaHoraAgenda: '2023-11-05T15:00:00', servicios: ['Evaluación Médica'], categoria: 'Evaluación Médica', nHistoria: 'H-1105-LUC', aceptoTratamiento: 'No', motivoNoCierre: 'El precio del tratamiento le pareció elevado.', estadoRecepcion: ReceptionStatus.PorAtender, recursoId: 'Dra. Marilia' },
];

let campaigns: Campaign[] = [
    { id: 1, nombreAnuncio: 'Campaña Skincare Noviembre', categoria: 'Limpieza Facial', alcance: 15000, resultados: 120, costoPorResultado: 5.50, importeGastado: 660, fecha: '2023-11-01' },
    { id: 2, nombreAnuncio: 'Promo Juventud Eterna', categoria: 'Evaluación Médica', alcance: 25000, resultados: 80, costoPorResultado: 8.00, importeGastado: 640, fecha: '2023-10-25' },
];

let metaCampaigns: MetaCampaign[] = [
    { id: 1, nombre: 'Campaña de Verano 2024', fechaInicio: '2023-12-01', fechaFin: '2024-02-28', categoria: 'Hydrafacial' },
    { id: 2, nombre: 'Campaña Día de la Madre', fechaInicio: '2024-04-15', fechaFin: '2024-05-12', categoria: 'Evaluación Médica' },
];

let publicaciones: Publicacion[] = [
    { id: 1, fechaPost: '2023-11-01', horaPost: '18:00', temaVideo: 'Beneficios del Hydrafacial', tipoPost: TipoPost.Reel, redSocial: RedSocialPost.Instagram, publicacionUrl: 'https://instagram.com/p/123', imageUrl: 'https://picsum.photos/seed/munnay1/400/400', vistas: 15200, comentarios: 45, reacciones: 1200, conversacionesIniciadas: 15, convertidos: 3 },
    { id: 2, fechaPost: '2023-11-03', horaPost: '19:30', temaVideo: 'Resultados de Limpeza Facial', tipoPost: TipoPost.Carrusel, redSocial: RedSocialPost.Facebook, publicacionUrl: 'https://facebook.com/p/456', vistas: 8500, comentarios: 22, reacciones: 800, conversacionesIniciadas: 8, convertidos: 1 },
    { id: 3, fechaPost: '2023-11-04', horaPost: '20:00', temaVideo: '¿Cómo cuidar tu piel en invierno?', tipoPost: TipoPost.Reel, redSocial: RedSocialPost.Tiktok, publicacionUrl: 'https://tiktok.com/v/789', vistas: 55000, comentarios: 150, reacciones: 4500, conversacionesIniciadas: 35, convertidos: 5 },
];

let seguidores: Seguidor[] = [
    { id: 1, fecha: '2023-11-01', cuenta: 'Munnay', redSocial: RedSocialPost.Instagram, seguidores: 150, dejaronDeSeguir: 10 },
    { id: 2, fecha: '2023-11-01', cuenta: 'Munnay', redSocial: RedSocialPost.Facebook, seguidores: 80, dejaronDeSeguir: 5 },
    { id: 3, fecha: '2023-11-02', cuenta: 'Dra. Marilia', redSocial: RedSocialPost.Instagram, seguidores: 120, dejaronDeSeguir: 8 },
    { id: 4, fecha: '2023-11-02', cuenta: 'Munnay', redSocial: RedSocialPost.Tiktok, seguidores: 350, dejaronDeSeguir: 25 },
];

let ventasExtra: VentaExtra[] = [
    { id: 1, codigoVenta: 'VE-001', fechaVenta: '2023-11-05', pacienteId: 1, nHistoria: 'H-1101-MAR', nombrePaciente: 'Maria Gomez', servicio: 'Bloqueador Solar SPF50', categoria: 'Productos', precio: 120, montoPagado: 120, metodoPago: MetodoPago.Efectivo, deuda: 0 },
];

let incidencias: Incidencia[] = [
    { id: 1, fecha: '2023-11-05', hora: '15:30', pacienteId: 5, nHistoria: 'H-1105-LUC', nombrePaciente: 'Lucia Mendez', tipoIncidencia: 'Queja del Paciente', detalleIncidencia: 'Tiempo de espera excesivo', descripcion: 'Paciente esperó 45 minutos para su cita programada.', solucionado: true },
];

let egresos: Egreso[] = [
    { id: 1, fechaRegistro: '2023-11-03', fechaPago: '2023-11-03', tipoMoneda: 'Soles', proveedor: 'DISTRIBUIDORA MEDESTETIC S.A.C.', categoria: 'Insumos', descripcion: 'Compra de Ácido Hialurónico', tipoComprobante: TipoComprobante.Factura, serieComprobante: 'F001', nComprobante: '00123', montoTotal: 1500, montoPagado: 1500, deuda: 0, modoPago: ModoPagoEgreso.Transferencia, observaciones: 'Pago completo.' },
    { id: 2, fechaRegistro: '2023-11-05', fechaPago: '2023-12-05', tipoMoneda: 'Soles', proveedor: 'LUZ DEL SUR', categoria: 'Servicios Públicos', descripcion: 'Recibo de luz Noviembre', tipoComprobante: TipoComprobante.SinComprobante, montoTotal: 350, montoPagado: 0, deuda: 350, modoPago: ModoPagoEgreso.Transferencia },
];

let proveedores: Proveedor[] = [
    { id: 1, razonSocial: 'DISTRIBUIDORA MEDESTETIC S.A.C.', ruc: '20601234567', tipo: 'Insumos', numeroContacto: '987654321' },
    { id: 2, razonSocial: 'LUZ DEL SUR', ruc: '20100115568', tipo: 'Servicios', numeroContacto: '016175000' },
];

let tiposProveedor: TipoProveedor[] = [
    { id: 1, nombre: 'Insumos' },
    { id: 2, nombre: 'Servicios' },
    { id: 3, nombre: 'Marketing' },
    { id: 4, nombre: 'Otros' },
];

let users: User[] = [
    { 
        id: 1, nombres: 'Admin', apellidos: 'User', usuario: 'admin', rolId: 1, 
        avatarUrl: 'https://picsum.photos/id/1005/40/40', position: 'Administrador',
        birthDate: '1985-01-15', startDate: '2020-01-10', sex: 'M',
        salary: 7000, contractType: 'Indefinido', maritalStatus: 'Casado(a)'
    },
    { 
        id: 2, nombres: 'Vanesa', apellidos: 'Marketing', usuario: 'vanesa', rolId: 2, 
        avatarUrl: 'https://picsum.photos/id/1011/40/40', position: 'Ejecutiva de Ventas',
        birthDate: '1992-07-22', startDate: '2021-06-01', sex: 'F',
        salary: 3500, contractType: 'Plazo Fijo', maritalStatus: 'Soltero(a)'
    },
    { 
        id: 3, nombres: 'Elvira', apellidos: 'Recepción', usuario: 'elvira', rolId: 3, 
        avatarUrl: 'https://picsum.photos/id/1027/40/40', position: 'Recepcionista',
        birthDate: '1998-11-30', startDate: '2022-03-15', sex: 'F',
        salary: 2200, contractType: 'Plazo Fijo', maritalStatus: 'Soltero(a)'
    },
    { 
        id: 4, nombres: 'Liz', apellidos: 'Ventas', usuario: 'liz', rolId: 2, 
        avatarUrl: 'https://picsum.photos/id/1012/40/40', position: 'Ejecutiva de Ventas',
        birthDate: '1990-03-10', startDate: '2019-08-20', sex: 'F',
        salary: 3800, contractType: 'Indefinido', maritalStatus: 'Casado(a)'
    },
    { 
        id: 5, nombres: 'Carlos', apellidos: 'Médico', usuario: 'carlos', rolId: 1,
        avatarUrl: 'https://picsum.photos/id/1013/40/40', position: 'Médico Estético',
        birthDate: '1980-09-05', startDate: '2018-02-01', sex: 'M',
        salary: 9000, contractType: 'Indefinido', maritalStatus: 'Casado(a)'
    },
    { 
        id: 6, nombres: 'Sofia', apellidos: 'Médica', usuario: 'sofia', rolId: 1,
        avatarUrl: 'https://picsum.photos/id/1014/40/40', position: 'Dermatóloga',
        birthDate: '1988-12-12', startDate: '2023-01-10', sex: 'F',
        salary: 8500, contractType: 'Plazo Fijo', maritalStatus: 'Divorciado(a)'
    }
];

let roles: Role[] = [
    // FIX: Replaced 'rrhh-liquidacion' with 'rrhh-perfiles' to match the 'Page' type.
    { id: 1, nombre: 'Administrador', permissions: ['dashboard', 'calendario', 'marketing-campanas', 'marketing-leads', 'redes-sociales-publicaciones', 'redes-sociales-seguidores', 'recepcion-agendados', 'recepcion-ventas-extra', 'recepcion-incidencias', 'procedimientos-atenciones', 'procedimientos-seguimiento', 'procedimientos-ventas-extra', 'procedimientos-incidencias', 'pacientes-historia', 'finanzas-egresos', 'rrhh-perfiles', 'informes', 'configuracion'], dashboardMetrics: ['general', 'marketing', 'recepcion', 'procedimientos', 'finanzas', 'rrhh'] },
    { id: 2, nombre: 'Marketing', permissions: ['dashboard', 'marketing-campanas', 'marketing-leads', 'redes-sociales-publicaciones', 'redes-sociales-seguidores'], dashboardMetrics: ['marketing'] },
    { id: 3, nombre: 'Recepción', permissions: ['dashboard', 'calendario', 'recepcion-agendados', 'recepcion-ventas-extra', 'recepcion-incidencias'], dashboardMetrics: ['recepcion'] },
];

let businessInfo: BusinessInfo = {
    nombre: 'Munnay',
    ruc: '12345678901',
    direccion: 'Av. Principal 123, Miraflores, Lima',
    telefono: '01-555-1234',
    email: 'contacto@munnay.pe',
    logoUrl: 'https://i.imgur.com/JmZt2eU.png',
    loginImageUrl: 'https://images.unsplash.com/photo-1473170611423-22489201d961?auto=format&fit=crop&q=80&w=2070',
};

let goals: Goal[] = [
    { id: 1, name: 'Nuevos seguidores en Instagram (mensual)', area: GoalArea.Comercial, objective: GoalObjective.Seguidores, value: 1500, unit: GoalUnit.Cantidad, startDate: '2023-11-01', endDate: '2023-11-30' },
    { id: 2, name: 'Ventas de servicios (Vanesa)', area: GoalArea.Comercial, objective: GoalObjective.VentasServicios, value: 25000, unit: GoalUnit.Cantidad, personal: 'Vanesa', startDate: '2023-11-01', endDate: '2023-11-30' },
    { id: 3, name: 'Tasa de Aceptación de Tratamientos', area: GoalArea.Recepcion, objective: GoalObjective.AceptacionTratamientos, value: 85, unit: GoalUnit.Porcentaje, startDate: '2023-11-01', endDate: '2023-11-30' },
    { id: 4, name: 'Efectividad Tratamiento Hydrafacial', area: GoalArea.Procedimientos, objective: GoalObjective.EfectividadTratamientos, value: 95, unit: GoalUnit.Porcentaje, startDate: '2023-01-01', endDate: '2023-12-31' },
    { id: 5, name: 'Engagement en Instagram', area: GoalArea.Comercial, objective: GoalObjective.Engagement, value: 5, unit: GoalUnit.Porcentaje, startDate: '2023-11-01', endDate: '2023-11-30' },
];

let clientSources: ClientSource[] = [{ id: 1, nombre: 'Facebook' }, { id: 2, nombre: 'Instagram' }, { id: 3, nombre: 'Google' }, { id: 4, nombre: 'WhatsApp' }];
let serviceCategories: ServiceCategory[] = [{id: 1, nombre: 'Limpieza Facial'}, {id: 2, nombre: 'Evaluación Médica'}, {id: 3, nombre: 'Hydrafacial'}, {id: 4, nombre: 'Evaluación Específica'}];
let productCategories: ProductCategory[] = [{id: 1, nombre: 'Cuidado Facial'}, {id: 2, nombre: 'Cuidado Corporal'}];
let egresoCategories: EgresoCategory[] = [{id: 1, nombre: 'Insumos'}, {id: 2, nombre: 'Servicios Públicos'}, {id: 3, nombre: 'Sueldos y Salarios'}, {id: 4, nombre: 'Marketing y Publicidad'}, {id: 5, nombre: 'Alquiler'}, {id: 6, nombre: 'Otro'}];
let jobPositions: JobPosition[] = [{id: 1, nombre: 'Administrador'}, {id: 2, nombre: 'Recepcionista'}, {id: 3, nombre: 'Ejecutiva de Ventas'}];
let services: Service[] = [{id: 1, nombre: 'Limpieza Facial Profunda', categoria: 'Limpieza Facial', precio: 150}, {id: 2, nombre: 'Consulta Dermatológica', categoria: 'Evaluación Médica', precio: 100}];
let products: Product[] = [{id: 1, nombre: 'Bloqueador Solar SPF50', categoria: 'Cuidado Facial', precio: 120}];
let memberships: Membership[] = [{id: 1, nombre: 'Club Piel Radiante', precio: 500, numeroSesiones: 4, descripcion: '4 sesiones de limpieza facial profunda.'}];

const apiCall = <T>(data: T): Promise<T> => new Promise(resolve => setTimeout(() => resolve(data), 300));
const saveOrUpdate = <T extends {id: number}>(collection: T[], item: T): void => {
    const index = collection.findIndex(i => i.id === item.id);
    if (index > -1) {
        collection[index] = item;
    } else {
        collection.push(item);
    }
};
const deleteItem = <T extends {id: number}>(collection: T[], id: number): void => {
    const index = collection.findIndex(i => i.id === id);
    if (index > -1) {
        collection.splice(index, 1);
    }
};

// --- API Functions ---
export const getLeads = () => apiCall(leads);
export const saveLead = (lead: Lead) => { saveOrUpdate(leads, lead); return apiCall(lead); };
export const deleteLead = (leadId: number) => { deleteItem(leads, leadId); return apiCall(leadId); };

export const getCampaigns = () => apiCall(campaigns);
export const saveCampaign = (campaign: Campaign) => { saveOrUpdate(campaigns, campaign); return apiCall(campaign); };
export const deleteCampaign = (campaignId: number) => { deleteItem(campaigns, campaignId); return apiCall(campaignId); };

export const getMetaCampaigns = () => apiCall(metaCampaigns);
export const saveMetaCampaign = (campaign: MetaCampaign) => { saveOrUpdate(metaCampaigns, campaign); return apiCall(campaign); };
export const deleteMetaCampaign = (campaignId: number) => { deleteItem(metaCampaigns, campaignId); return apiCall(campaignId); };

export const getPublicaciones = () => apiCall(publicaciones);
export const savePublicacion = (pub: Publicacion) => { saveOrUpdate(publicaciones, pub); return apiCall(pub); };
export const deletePublicacion = (pubId: number) => { deleteItem(publicaciones, pubId); return apiCall(pubId); };

export const getSeguidores = () => apiCall(seguidores);
export const saveSeguidor = (seg: Seguidor) => { saveOrUpdate(seguidores, seg); return apiCall(seg); };
export const deleteSeguidor = (segId: number) => { deleteItem(seguidores, segId); return apiCall(segId); };

export const getVentasExtra = () => apiCall(ventasExtra);
export const saveVentaExtra = (venta: VentaExtra) => { saveOrUpdate(ventasExtra, venta); return apiCall(venta); };
export const deleteVentaExtra = (ventaId: number) => { deleteItem(ventasExtra, ventaId); return apiCall(ventaId); };

export const getIncidencias = () => apiCall(incidencias);
export const saveIncidencia = (incidencia: Incidencia) => { saveOrUpdate(incidencias, incidencia); return apiCall(incidencia); };
export const deleteIncidencia = (incidenciaId: number) => { deleteItem(incidencias, incidenciaId); return apiCall(incidenciaId); };

export const getEgresos = () => apiCall(egresos);
export const saveEgreso = (egreso: Egreso) => { saveOrUpdate(egresos, egreso); return apiCall(egreso); };
export const deleteEgreso = (egresoId: number) => { deleteItem(egresos, egresoId); return apiCall(egresoId); };

export const getProveedores = () => apiCall(proveedores);
export const saveProveedor = (proveedor: Proveedor) => { saveOrUpdate(proveedores, proveedor); return apiCall(proveedor); };
export const deleteProveedor = (proveedorId: number) => { deleteItem(proveedores, proveedorId); return apiCall(proveedorId); };

export const getTiposProveedor = () => apiCall(tiposProveedor);
export const saveTipoProveedor = (tipo: TipoProveedor) => { saveOrUpdate(tiposProveedor, tipo); return apiCall(tipo); };
export const deleteTipoProveedor = (id: number) => { deleteItem(tiposProveedor, id); return apiCall(id); };

export const getUsers = () => apiCall(users);
export const saveUser = (user: User) => { saveOrUpdate(users, user); return apiCall(user); };
export const deleteUser = (userId: number) => { deleteItem(users, userId); return apiCall(userId); };

export const getRoles = () => apiCall(roles);
export const saveRole = (role: Role) => { saveOrUpdate(roles, role); return apiCall(role); };
export const deleteRole = (roleId: number) => { deleteItem(roles, roleId); return apiCall(roleId); };

export const getBusinessInfo = () => apiCall(businessInfo);
export const saveBusinessInfo = (info: BusinessInfo) => { businessInfo = info; return apiCall(info); };

export const getClientSources = () => apiCall(clientSources);
export const saveClientSource = (source: ClientSource) => { saveOrUpdate(clientSources, source); return apiCall(source); };
export const deleteClientSource = (id: number) => { deleteItem(clientSources, id); return apiCall(id); };

export const getServices = () => apiCall(services);
export const saveService = (service: Service) => { saveOrUpdate(services, service); return apiCall(service); };
export const deleteService = (id: number) => { deleteItem(services, id); return apiCall(id); };

export const getProducts = () => apiCall(products);
export const saveProduct = (product: Product) => { saveOrUpdate(products, product); return apiCall(product); };
export const deleteProduct = (id: number) => { deleteItem(products, id); return apiCall(id); };

export const getMemberships = () => apiCall(memberships);
export const saveMembership = (membership: Membership) => { saveOrUpdate(memberships, membership); return apiCall(membership); };
export const deleteMembership = (id: number) => { deleteItem(memberships, id); return apiCall(id); };

export const getServiceCategories = () => apiCall(serviceCategories);
export const saveServiceCategory = (category: ServiceCategory) => { saveOrUpdate(serviceCategories, category); return apiCall(category); };
export const deleteServiceCategory = (id: number) => { deleteItem(serviceCategories, id); return apiCall(id); };

export const getProductCategories = () => apiCall(productCategories);
export const saveProductCategory = (category: ProductCategory) => { saveOrUpdate(productCategories, category); return apiCall(category); };
export const deleteProductCategory = (id: number) => { deleteItem(productCategories, id); return apiCall(id); };

export const getEgresoCategories = () => apiCall(egresoCategories);
export const saveEgresoCategory = (category: EgresoCategory) => { saveOrUpdate(egresoCategories, category); return apiCall(category); };
export const deleteEgresoCategory = (id: number) => { deleteItem(egresoCategories, id); return apiCall(id); };

export const getJobPositions = () => apiCall(jobPositions);
export const saveJobPosition = (position: JobPosition) => { saveOrUpdate(jobPositions, position); };
export const deleteJobPosition = (id: number) => { deleteItem(jobPositions, id); };

export const getGoals = () => apiCall(goals);
export const saveGoal = (goal: Goal) => { saveOrUpdate(goals, goal); return apiCall(goal); };
export const deleteGoal = (goalId: number) => { deleteItem(goals, goalId); return apiCall(goalId); };

export const generateAiContent = async (prompt: string): Promise<string> => {
    try {
        if (!process.env.API_KEY) {
            console.error("API key for Google GenAI is not set.");
            return "Error: La clave de API no está configurada.";
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error al generar contenido con IA:", error);
        return "Error al conectar con el servicio de IA. Por favor, intente de nuevo más tarde.";
    }
};