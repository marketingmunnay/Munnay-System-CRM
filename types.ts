import type { ReactNode } from "react";
import { GenerateContentResponse } from "@google/genai";

export type Page = 
    'dashboard' | 
    'calendario' | 
    'marketing-campanas' | 
    'marketing-leads' | 
    'redes-sociales-publicaciones' |
    'redes-sociales-seguidores' |
    'recepcion-agendados' | 
    'recepcion-ventas-extra' | 
    'recepcion-incidencias' | 
    'procedimientos-atenciones' |
    'procedimientos-seguimiento' |
    'procedimientos-ventas-extra' | 
    'procedimientos-incidencias' | 
    'pacientes-historia' |
    'finanzas-egresos' |
    'rrhh-perfiles' |
    'informes' |
    'configuracion';

export enum LeadStatus {
    Nuevo = 'Nuevo',
    Seguimiento = 'Seguimiento',
    PorPagar = 'Por Pagar',
    Agendado = 'Agendado',
    Perdido = 'Perdido',
}

export enum ReceptionStatus {
    Agendado = 'Agendado',
    PorAtender = 'Por Atender',
    Atendido = 'Atendido',
    Reprogramado = 'Reprogramado',
    Cancelado = 'Cancelado',
    NoAsistio = 'No Asistió'
}

export enum AtencionStatus {
    PorAtender = 'Por Atender',
    EnSeguimiento = 'En Seguimiento',
    SeguimientoHecho = 'Seguimiento Hecho',
}


export enum Seller {
    Vanesa = 'Vanesa',
    Liz = 'Liz',
    Elvira = 'Elvira'
}

// FIX: Add 'Vanesa' to Personal type to align with Seller roles and fix type error.
export type Personal = 'Vanesa' | 'Elvira' | 'Janela' | 'Liz' | 'Keila' | 'Luz' | 'Dra. Marilia' | 'Dra. Sofía' | 'Dr. Carlos';
export type Medico = 'Dra. Marilia' | 'Dra. Sofía' | 'Dr. Carlos';

export enum MetodoPago {
    Efectivo = 'Efectivo',
    Tarjeta = 'Tarjeta',
    Transferencia = 'Transferencia',
    Yape = 'Yape',
    Plin = 'Plin',
}

export enum EstadoLlamada {
    Contesto = 'Contesto',
    NoContesto = 'No contesto',
    NumeroEquivocado = 'Numero equivocado',
    Ocupado = 'Ocupado',
}

export interface RegistroLlamada {
    id: number;
    numeroLlamada: number;
    duracionLlamada: string; // HH:mm:ss
    estadoLlamada: EstadoLlamada;
    observacion?: string;
}

export interface Treatment {
    id: number;
    nombre: string;
    cantidadSesiones: number;
    precio: number;
    montoPagado: number;
    metodoPago?: MetodoPago;
    deuda: number;
}

export interface Procedure {
    id: number;
    fechaAtencion: string; // YYYY-MM-DD
    personal: Personal;
    horaInicio: string; // HH:mm
    horaFin: string; // HH:mm
    tratamientoId: number;
    nombreTratamiento: string;
    sesionNumero: number;
    asistenciaMedica: boolean;
    medico?: Medico;
    observacion?: string;
}

export interface Seguimiento {
    id: number;
    procedimientoId: number;
    nombreProcedimiento: string;
    fechaSeguimiento: string; // YYYY-MM-DD
    personal: Personal;
    inflamacion: boolean;
    ampollas: boolean;
    alergias: boolean;
    malestarGeneral: boolean;
    brote: boolean;
    dolorDeCabeza: boolean;
    moretones: boolean;
    observacion?: string;
}

export interface Alergia {
    id: number;
    nombre: string;
    gravedad: 1 | 2 | 3 | 4 | 5;
}

export interface Lead {
    id: number;
    fechaLead: string; // YYYY-MM-DD
    nombres: string;
    apellidos: string;
    numero: string;
    sexo: 'M' | 'F';
    redSocial: string;
    anuncio: string;
    vendedor: Seller;
    estado: LeadStatus;
    montoPagado: number;
    metodoPago?: MetodoPago;
    fechaHoraAgenda?: string; // ISO string
    servicios: string[];
    categoria: string;
    fechaVolverLlamar?: string; // YYYY-MM-DD
    horaVolverLlamar?: string; // HH:mm
    notas?: string;
    registrosLlamada?: RegistroLlamada[];
    // Reception properties
    nHistoria?: string;
    aceptoTratamiento?: 'Si' | 'No';
    motivoNoCierre?: string;
    tratamientos?: Treatment[];
    estadoRecepcion?: ReceptionStatus;
    recursoId?: string;
    // Procedure properties
    procedimientos?: Procedure[];
    seguimientos?: Seguimiento[];
    // Historia Paciente
    birthDate?: string;
    alergias?: Alergia[];
    membresiasAdquiridas?: Membership[];
    // Split Payment
    precioCita?: number;
    deudaCita?: number;
    metodoPagoDeuda?: MetodoPago;
    // For billing related info, but not the invoice itself
    documentType?: DocumentType;
    documentNumber?: string;
    razonSocial?: string;
    direccionFiscal?: string;
}

export interface Campaign {
    id: number;
    nombreAnuncio: string;
    categoria: string;
    alcance: number;
    resultados: number;
    costoPorResultado: number;
    importeGastado: number;
    fecha: string; // YYYY-MM-DD
}

export interface MetaCampaign {
    id: number;
    nombre: string;
    fechaInicio: string; // YYYY-MM-DD
    fechaFin: string; // YYYY-MM-DD
    categoria: string;
}

export enum TipoPost {
    Reel = 'Reel',
    Historia = 'Historia',
    Carrusel = 'Carrusel',
    Post = 'Post',
}

export enum RedSocialPost {
    Facebook = 'Facebook',
    Instagram = 'Instagram',
    Tiktok = 'Tiktok',
    YouTube = 'YouTube',
}

export interface Publicacion {
    id: number;
    fechaPost: string; // YYYY-MM-DD
    horaPost?: string; // HH:mm
    temaVideo: string;
    tipoPost: TipoPost;
    redSocial: RedSocialPost;
    publicacionUrl: string;
    imageUrl?: string;
    vistas: number;
    comentarios: number;
    reacciones: number;
    conversacionesIniciadas: number;
    convertidos: number;
}

export interface Seguidor {
    id: number;
    fecha: string; // YYYY-MM-DD
    cuenta: string;
    redSocial: RedSocialPost;
    seguidores: number;
    dejaronDeSeguir: number;
}

export interface VentaExtra {
    id: number;
    codigoVenta: string;
    fechaVenta: string; // YYYY-MM-DD
    pacienteId: number;
    nHistoria: string;
    nombrePaciente: string;
    servicio: string;
    categoria: string;
    precio: number;
    montoPagado: number;
    metodoPago: MetodoPago;
    deuda: number;
    fechaPagoDeuda?: string;
}

export interface Incidencia {
    id: number;
    fecha: string; // YYYY-MM-DD
    hora: string; // HH:mm
    pacienteId: number;
    nHistoria: string;
    nombrePaciente: string;
    tipoIncidencia: string;
    detalleIncidencia: string;
    descripcion: string;
    solucionado: boolean;
}

// FIX: Added missing types for electronic invoicing
export enum TipoComprobanteElectronico {
    Boleta = 'Boleta',
    Factura = 'Factura',
}

export enum SunatStatus {
    Aceptado = 'Aceptado',
    Pendiente = 'Pendiente',
    Rechazado = 'Rechazado',
    ConObservaciones = 'Con Observaciones',
    Anulado = 'Anulado',
}

export interface ComprobanteItem {
    id: number;
    descripcion: string;
    cantidad: number;
    valorUnitario: number;
    precioUnitario: number;
    igv: number;
    montoTotal: number;
}

export interface ComprobanteElectronico {
    id: number;
    tipoDocumento: TipoComprobanteElectronico;
    serie: string;
    correlativo: number;
    fechaEmision: string; // YYYY-MM-DD
    clienteTipoDocumento: DocumentType;
    clienteNumeroDocumento: string;
    clienteDenominacion: string;
    clienteDireccion?: string;
    items: ComprobanteItem[];
    opGravadas: number;
    igv: number;
    total: number;
    sunatStatus: SunatStatus;
    ventaId: number;
    ventaType: 'lead' | 'venta_extra';
}


export enum TipoComprobante {
    Factura = 'Factura',
    Boleta = 'Boleta de Venta',
    ReciboHonorarios = 'Recibo por Honorarios',
    SinComprobante = 'Sin Comprobante',
}

export enum ModoPagoEgreso {
    Efectivo = 'Efectivo',
    Transferencia = 'Transferencia Bancaria',
    Tarjeta = 'Tarjeta de Crédito/Débito',
    Yape = 'Yape/Plin',
}

export interface Egreso {
    id: number;
    fechaRegistro: string;
    fechaPago: string;
    proveedor: string;
    categoria: string;
    descripcion: string;
    tipoComprobante: TipoComprobante;
    serieComprobante?: string;
    nComprobante?: string;
    montoTotal: number;
    montoPagado: number;
    deuda: number;
    modoPago?: ModoPagoEgreso;
    fotoUrl?: string;
    tipoMoneda: 'Soles' | 'Dólares';
    observaciones?: string;
}

export interface TipoProveedor {
    id: number;
    nombre: string;
}

export interface Proveedor {
    id: number;
    razonSocial: string;
    ruc: string;
    tipo: string;
    numeroContacto: string;
}

export interface StatCardData {
    title: string;
    value: string;
    change?: string;
    changeType?: 'increase' | 'decrease';
    icon: ReactNode;
    iconBgClass?: string;
}

export enum DocumentType {
    DNI = 'DNI',
    RUC = 'RUC',
    Pasaporte = 'Pasaporte',
    CarnetExtranjeria = 'Carnet de Extranjería',
}

export interface Address {
    id: number;
    direccion: string;
    distrito: string;
    ciudad: string;
    referencia?: string;
}

export interface EmergencyContact {
    id: number;
    nombre: string;
    parentesco: string;
    numero: string;
}

export interface Reconocimiento {
    id: number;
    otorgadoPorId: number;
    otorgadoPorNombre: string;
    mensaje: string;
    fecha: string; // YYYY-MM-DD
}

export interface User {
    id: number;
    nombres: string;
    apellidos: string;
    usuario: string;
    password?: string;
    rolId: number;
    avatarUrl: string;
    position?: string;
    documentType?: DocumentType;
    documentNumber?: string;
    phone?: string;
    birthDate?: string;
    startDate?: string;
    addresses?: Address[];
    emergencyContacts?: EmergencyContact[];
    reconocimientos?: Reconocimiento[];
    salary?: number;
    contractType?: 'Plazo Fijo' | 'Indefinido';
    maritalStatus?: 'Soltero(a)' | 'Casado(a)' | 'Divorciado(a)' | 'Viudo(a)';
    sex?: 'M' | 'F';
}

export interface Role {
    id: number;
    nombre: string;
    permissions: Page[];
    dashboardMetrics: string[];
}

export interface BusinessInfo {
    nombre: string;
    ruc: string;
    direccion: string;
    telefono: string;
    email: string;
    logoUrl: string;
    loginImageUrl?: string;
}

export interface ClientSource {
    id: number;
    nombre: string;
}

export interface ServiceCategory {
    id: number;
    nombre: string;
}

export interface EgresoCategory {
    id: number;
    nombre: string;
}

export interface ProductCategory {
    id: number;
    nombre: string;
}

export interface JobPosition {
    id: number;
    nombre: string;
}

export interface Service {
    id: number;
    nombre: string;
    categoria: string;
    precio: number;
}

export interface Product {
    id: number;
    nombre: string;
    categoria: string;
    precio: number;
}

export interface Membership {
    id: number;
    nombre: string;
    precio: number;
    numeroSesiones: number;
    descripcion: string;
}

export type NotificationType = 'complicacion_paciente' | 'pago_por_vencer' | 'nuevo_lead' | 'cita_proxima';

export interface Notification {
    id: number;
    type: NotificationType;
    message: string;
    details: string;
    relatedId: number;
    relatedPage: Page;
    timestamp: string; // ISO string for the event time
    isRead: boolean;
}

export enum GoalUnit {
    Cantidad = 'cantidad',
    Porcentaje = 'porcentaje',
}

export enum GoalArea {
    Comercial = 'Comercial',
    Administracion = 'Administración',
    Recepcion = 'Recepción',
    Procedimientos = 'Procedimientos',
}

export enum GoalObjective {
    // Marketing & Sales
    Leads = 'Leads',
    Agendados = 'Agendados',
    Asistidos = 'Asistidos',
    CostoPorResultado = 'Costo por Resultado',
    VentasServicios = 'Ventas de Servicios',
    VentasProductos = 'Ventas de Productos',
    Recuperados = 'Recuperados',
    ConversionLeads = 'Conversión de Leads',
    ROI = 'ROI',
    
    // Social Media
    Seguidores = 'Seguidores',
    Visualizaciones = 'Visualizaciones',
    Alcance = 'Alcance',
    Engagement = 'Engagement',

    // Reception & Procedures
    CierreEvaluaciones = 'Cierre de Evaluaciones',
    AceptacionTratamientos = 'Aceptación de Tratamientos',
    EfectividadTratamientos = 'Efectividad de Tratamientos',
    SeguimientosCompletados = 'Seguimientos Completados',

    // Administration
    RotacionPersonal = 'Rotación de Personal',
    NivelStock = 'Nivel de Stock',
}

export interface Goal {
    id: number;
    name: string;
    area: GoalArea;
    objective: GoalObjective;
    value: number;
    unit: GoalUnit;
    personal?: Personal;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
}

export interface EvaluacionDesempeno {
    id: number;
    fecha: string; // YYYY-MM-DD
    evaluadorId: number;
    evaluadorNombre: string;
    resumen: string;
    fortalezas: string;
    oportunidadesMejora: string;
    planDeAccion: string;
}

export interface FeedbackSesion {
    id: number;
    fecha: string; // YYYY-MM-DD
    liderId: number;
    liderNombre: string;
    temasDiscutidos: string;
    acuerdos: string;
}