import type { ReactNode } from "react";

export type Page = 
    'dashboard' | 
    'calendario' | 
    'tareas' |
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
    'finanzas-facturacion' |
    'administracion-inventario' |
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
    AgendadoPorLlegar = 'Agendado por llegar',
    PorAtender = 'Por Atender',
    Atendido = 'Atendido',
    Reprogramado = 'Reprogramado',
    Cancelado = 'Cancelado',
    NoAsistio = 'No Asistió'
}

export enum AtencionStatus {
    PorAtender = 'Por Atender',
    Atendido = 'Atendido',
    EnSeguimiento = 'En Seguimiento',
    SeguimientoHecho = 'Seguimiento Hecho',
}


export enum Seller {
    Vanesa = 'Vanesa',
    Liz = 'Liz',
    Elvira = 'Elvira'
}

export type Personal = 'Vanesa' | 'Elvira' | 'Janela' | 'Liz' | 'Keila' | 'Luz' | 'Dra. Marilia' | 'Dra. Sofía' | 'Dr. Carlos';
export type Medico = 'Dra. Marilia' | 'Dra. Sofía' | 'Dr. Carlos';

export enum MetodoPago {
    Efectivo = 'Efectivo',
    Tarjeta = 'Tarjeta',
    TransferenciaBCP = 'Transferencia BCP',
    TransferenciaInterbank = 'Transferencia Interbank',
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
    tipo?: 'Servicio' | 'Membresía';
    cantidadSesiones: number;
    precio: number;
    montoPagado: number;
    metodoPago?: MetodoPago;
    deuda: number;
}

export interface PagoRecepcion {
    id: number;
    monto: number;
    metodoPago: MetodoPago;
    fechaPago: string; // ISO string
    observacion?: string;
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
    email?: string;
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
    profesionalAsignado?: string;
    observacionesGenerales?: string;
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
    pagosRecepcion?: PagoRecepcion[];
    // Procedure properties
    procedimientos?: Procedure[];
    seguimientos?: Seguimiento[];
    // Historia Paciente
    birthDate?: string;
    alergias?: Alergia[];
    membresiasAdquiridas?: LeadMembership[];
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
    originalVentaId: number; // The ID of the Lead or VentaExtra this comprobante is for
    originalVentaType: 'lead' | 'venta_extra'; // The type of original venta
    leadId?: number; // Optional FK to Lead
    ventaExtraId?: number; // Optional FK to VentaExtra
}


export enum TipoComprobante {
    Factura = 'Factura',
    Boleta = 'Boleta',
    ReciboHonorarios = 'ReciboHonorarios',
    SinComprobante = 'SinComprobante',
}

export const TIPO_COMPROBANTE_LABELS: Record<TipoComprobante, string> = {
    [TipoComprobante.Factura]: 'Factura',
    [TipoComprobante.Boleta]: 'Boleta de Venta',
    [TipoComprobante.ReciboHonorarios]: 'Recibo por Honorarios',
    [TipoComprobante.SinComprobante]: 'Sin Comprobante',
};

export enum ModoPagoEgreso {
    Efectivo = 'Efectivo',
    Transferencia = 'Transferencia',
    Tarjeta = 'Tarjeta',
    Yape = 'Yape',
}

export const MODO_PAGO_EGRESO_LABELS: Record<ModoPagoEgreso, string> = {
    [ModoPagoEgreso.Efectivo]: 'Efectivo',
    [ModoPagoEgreso.Transferencia]: 'Transferencia bancaria',
    [ModoPagoEgreso.Tarjeta]: 'Tarjeta de crédito/débito',
    [ModoPagoEgreso.Yape]: 'Yape / Plin',
};

export interface Egreso {
    id: number;
    fechaRegistro: string;
    fechaPago?: string;
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
    ruc?: string;
    tipo: string;
    numeroContacto?: string;
    diasCredito?: number;
    categoriaEgreso?: string;
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
    role?: Role | null;
    avatarUrl: string;
    position?: string;
    
    // Datos Personales
    documentType?: DocumentType;
    documentNumber?: string;
    birthDate?: string;
    nationality?: string;
    sex?: 'M' | 'F';
    maritalStatus?: 'Soltero(a)' | 'Casado(a)' | 'Divorciado(a)' | 'Viudo(a)';
    phone?: string;
    email?: string;
    
    // Datos Laborales
    startDate?: string;
    endDate?: string;
    contractType?: 'Indefinido' | 'Plazo Fijo' | 'Locación de Servicios' | 'Prácticas';
    workday?: 'Tiempo Completo' | 'Tiempo Parcial';
    workSchedule?: string;
    directBoss?: string;
    workCenter?: string;
    employeeCode?: string;
    
    // Datos Salariales
    salary?: number;
    bonuses?: number;
    currency?: 'Soles' | 'Dólares';
    bankName?: string;
    accountType?: 'Ahorros' | 'Corriente' | 'CCI';
    accountNumber?: string;
    paymentMethod?: 'Transferencia' | 'Efectivo' | 'Cheque';
    laborRegime?: 'Privado' | 'Público' | 'Microempresa';
    afpType?: string;
    afpCode?: string;
    afpPercentage?: number;
    healthInsurance?: string;
    
    // Relaciones
    addresses?: Address[];
    emergencyContacts?: EmergencyContact[];
    reconocimientos?: Reconocimiento[];
    permissions?: Page[];
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

export interface ProductBrand {
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
    duracionMinutos: number;
    descripcion?: string;
    profesionalRequerido?: string;
    notas?: string;
}

export interface Ambiente {
    id: number;
    nombre: string;
    tipo: string;
    estado: 'activo' | 'inactivo';
    capacidad?: number;
}

export type AppointmentStatus = 'Booked' | 'Confirmed' | 'Completed' | 'Cancelled' | 'NoShow' | string;

export interface AppointmentServiceItem {
    serviceId: number;
    nombre: string;
    duracionMinutos: number;
    precio: number;
}

export interface Appointment {
    id: number;
    leadId: number;
    clienteNombre: string;
    clienteDocumento?: string;
    servicios: AppointmentServiceItem[];
    fecha: string; // YYYY-MM-DD
    horaInicio: string; // HH:mm
    duracionMinutos: number;
    profesionalId: string;
    ambienteId?: number;
    estado: AppointmentStatus;
    origen: string;
    notas?: string;
    recurrenteId?: number;
}

export interface CreateAppointmentPayload {
    leadId: number;
    servicioIds: number[];
    fecha: string;
    horaInicio: string;
    duracionMinutos: number;
    profesionalId: string;
    ambienteId?: number;
    estado: AppointmentStatus;
    origen: string;
    notas?: string;
    confirmarPor?: Array<'whatsapp' | 'email'>;
    emitirComprobante?: boolean;
    documento?: DocumentType;
    numeroDocumento?: string;
}

export interface AvailabilityRequest {
    fecha: string;
    horaInicio: string;
    duracionMinutos: number;
    servicioIds: number[];
    profesionalId?: string;
    ambienteId?: number;
}

export interface AvailabilitySlot {
    profesionalId: string;
    ambienteId?: number;
    disponible: boolean;
    motivo?: string;
    sugerencias?: Array<{ fecha: string; horaInicio: string; profesionalId?: string; ambienteId?: number }>;
}

export interface RecurringSeriesRequest {
    baseAppointment: CreateAppointmentPayload;
    frecuencia: 'diaria' | 'semanal' | 'mensual';
    intervalo: number;
    diasSemana?: string[];
    fechaFin?: string;
    sinFin?: boolean;
}

// DESACTIVADO HASTA APLICAR MIGRACIÓN
// export enum TipoProducto {
//     Venta = 'venta',
//     Insumo = 'insumo',
// }

export interface Product {
    id: number;
    nombre: string;
    descripcion?: string;
    categoria: string;
    marca?: string;
    proveedorId?: number;
    unidadMedida?: UnidadMedida;
    valorMedida?: number;
    precioCoste?: number;
    precioTotal?: number;
    precio: number;
    // Campos de inventario desactivados hasta aplicar migración
    // tipo?: TipoProducto;
    // costoCompra?: number;
    // precioVenta?: number;
    // stockActual?: number;
    // stockMinimo?: number;
    // stockCritico?: number;
    // movimientos?: MovimientoStock[];
}

export interface MovimientoStock {
    id: number;
    productoId: number;
    tipoMovimiento: 'entrada' | 'salida';
    cantidad: number;
    costoUnitario: number;
    precioUnitario: number;
    motivo: string;
    fecha: string;
    creadoPor?: string;
    ventaExtraId?: number;
    procedimientoId?: number;
}

// Catálogo de membresías (configuración global)
export interface Membership {
    id: number;
    nombre: string;
    descripcion: string;
    precioTotal: number;
    servicios?: MembershipService[];
}

// Servicios incluidos en una membresía
export interface MembershipService {
    id: number;
    membershipId: number;
    servicioNombre: string;
    precio: number;
    precioCita?: number;
    numeroSesiones: number;
}

// Membresías adquiridas por un lead
export interface LeadMembership {
    id: number;
    leadId: number;
    membershipId: number;
    membership?: Membership;
    fechaCompra: string;
    precioTotal: number;
}

export type NotificationType = 'complicacion_paciente' | 'pago_por_vencer' | 'nuevo_lead' | 'cita_proxima' | 'recordatorio_llamada';

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
    Administracion = 'Administracion',
    Recepcion = 'Recepcion',
    Procedimientos = 'Procedimientos',
}

export enum GoalObjective {
    // Marketing & Sales
    Leads = 'Leads',
    Agendados = 'Agendados',
    Asistidos = 'Asistidos',
    CostoPorResultado = 'CostoPorResultado',
    VentasServicios = 'VentasServicios',
    VentasProductos = 'VentasProductos',
    Recuperados = 'Recuperados',
    ConversionLeads = 'ConversionLeads',
    ROI = 'ROI',
    
    // Social Media
    Seguidores = 'Seguidores',
    Visualizaciones = 'Visualizaciones',
    Alcance = 'Alcance',
    Engagement = 'Engagement',

    // Reception & Procedures
    CierreEvaluaciones = 'CierreEvaluaciones',
    AceptacionTratamientos = 'AceptacionTratamientos',
    EfectividadTratamientos = 'EfectividadTratamientos',
    SeguimientosCompletados = 'SeguimientosCompletados',

    // Administration
    RotacionPersonal = 'RotacionPersonal',
    NivelStock = 'NivelStock',
}

export const GoalAreaLabels: Record<GoalArea, string> = {
    [GoalArea.Comercial]: 'Comercial',
    [GoalArea.Administracion]: 'Administración',
    [GoalArea.Recepcion]: 'Recepción',
    [GoalArea.Procedimientos]: 'Procedimientos',
};

export const GoalObjectiveLabels: Record<GoalObjective, string> = {
    [GoalObjective.Leads]: 'Leads',
    [GoalObjective.Agendados]: 'Agendados',
    [GoalObjective.Asistidos]: 'Asistidos',
    [GoalObjective.CostoPorResultado]: 'Costo por Resultado',
    [GoalObjective.VentasServicios]: 'Ventas de Servicios',
    [GoalObjective.VentasProductos]: 'Ventas de Productos',
    [GoalObjective.Recuperados]: 'Recuperados',
    [GoalObjective.ConversionLeads]: 'Conversión de Leads',
    [GoalObjective.ROI]: 'ROI',
    [GoalObjective.Seguidores]: 'Seguidores',
    [GoalObjective.Visualizaciones]: 'Visualizaciones',
    [GoalObjective.Alcance]: 'Alcance',
    [GoalObjective.Engagement]: 'Engagement',
    [GoalObjective.CierreEvaluaciones]: 'Cierre de Evaluaciones',
    [GoalObjective.AceptacionTratamientos]: 'Aceptación de Tratamientos',
    [GoalObjective.EfectividadTratamientos]: 'Efectividad de Tratamientos',
    [GoalObjective.SeguimientosCompletados]: 'Seguimientos Completados',
    [GoalObjective.RotacionPersonal]: 'Rotación de Personal',
    [GoalObjective.NivelStock]: 'Nivel de Stock',
};

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

// ========================================
// MÓDULO DE INVENTARIO INTELIGENTE
// ========================================

export type UnidadMedida = 'unidades' | 'cajas' | 'paquetes' | 'blister' | 'ml' | 'g' | 'litros';
export type TipoMovimiento = 'entrada' | 'salida' | 'ajuste' | 'reserva' | 'devolucion';
export type EstadoPago = 'pendiente' | 'parcial' | 'completado' | 'cancelado';
export type EstadoProducto = 'reservado' | 'pendiente_entrega' | 'entregado' | 'pendiente_stock';
export type TipoAlerta = 'stock_bajo' | 'stock_critico' | 'stock_cero';
export type EstadoStockInventario = 'normal' | 'stock_bajo' | 'sin_stock' | 'bajo' | 'critico';

export interface InventarioReporteItem {
    productoId: number;
    productoNombre: string;
    stockActual: number;
    stockMinimo: number;
    unidadMedida: UnidadMedida;
    costoUnitario: number;
    precioVenta: number;
    precioSinIGV: number;
    igvMonto: number;
    aplicaIGV: boolean;
    valorInventario: number;
    valorVenta: number;
    alertasActivas: number;
    estadoStock: EstadoStockInventario;
}

export interface InventarioResumen {
    totalProductos: number;
    totalValorInventario: number;
    totalValorVenta: number;
    productosSinStock: number;
    productosStockBajo: number;
    alertasActivas: number;
}

export interface InventarioReporteResponse {
    reporte: InventarioReporteItem[];
    resumen: InventarioResumen;
}

export interface ConfiguracionProducto {
    id: number;
    productoId: number;
    stockActual: number;
    stockMinimo: number;
    unidadMedida: UnidadMedida;
    equivalenciaBase: number;
    costoUnitario: number;
    aplicaIGV: boolean;
    igvPorcentaje: number;
    alertasActivas: boolean;
    createdAt: string;
    updatedAt: string;
    movimientos?: MovimientoInventario[];
    alertas?: AlertaStock[];
}

export interface MovimientoInventario {
    id: number;
    configuracionProductoId: number;
    tipoMovimiento: TipoMovimiento;
    cantidad: number;
    stockAnterior: number;
    stockNuevo: number;
    costoUnitario: number;
    precioVenta: number;
    motivo: string;
    referencia?: string;
    creadoPor?: string;
    createdAt: string;
}

export interface PagoProducto {
    id: number;
    productoId: number;
    nHistoria: string;
    montoTotal: number;
    montoPagado: number;
    saldoPendiente: number;
    estadoPago: EstadoPago;
    estadoProducto: EstadoProducto;
    esPrepago: boolean;
    fechaPago: string;
    fechaEntrega?: string;
    historialPagos?: HistorialPagoProducto[];
    observaciones?: string;
    createdAt: string;
    updatedAt: string;
}

export interface HistorialPagoProducto {
    id: number;
    pagoProductoId: number;
    montoAbonado: number;
    metodoPago: string;
    fechaPago: string;
    registradoPor?: string;
    observaciones?: string;
    createdAt: string;
}

export interface AlertaStock {
    id: number;
    configuracionProductoId: number;
    tipoAlerta: TipoAlerta;
    mensaje: string;
    stockActual: number;
    stockMinimo: number;
    visto: boolean;
    resuelto: boolean;
    createdAt: string;
    resolvidoAt?: string;
}

export interface ProductoConInventario extends Product {
    configuracion?: ConfiguracionProducto;
    alertasActivas?: number;
}