import { GoogleGenAI } from "@google/genai";
import type { 
  Lead, Campaign, VentaExtra, Incidencia, Egreso, Proveedor, User, Role, 
  BusinessInfo, ClientSource, Service, Product, Membership, ServiceCategory,
  ProductCategory, JobPosition, Publicacion, Seguidor, MetaCampaign, EgresoCategory,
  TipoProveedor, Goal, ComprobanteElectronico
} from '../types.ts';

// URL fija de tu backend en Cloud Run
export const API_URL = "https://munnay-system-crm-156279657697.europe-west1.run.app/api";

// Longitud mínima de IDs generados temporalmente en el cliente
const GENERATED_ID_MIN_LENGTH = 7;

// Helper genérico para requests
const apiRequest = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  body?: any
): Promise<T> => {
  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${API_URL}${endpoint}`, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || 'Error en la petición a la API');
  }

  if (response.status === 204) return {} as T;
  return response.json();
};

// ========== LEADS ==========
export const getLeads = (): Promise<Lead[]> => apiRequest<Lead[]>('/leads', 'GET');
export const saveLead = (lead: Lead): Promise<Lead> =>
  String(lead.id).length > GENERATED_ID_MIN_LENGTH
    ? apiRequest<Lead>('/leads', 'POST', { ...lead, id: undefined })
    : apiRequest<Lead>(`/leads/${lead.id}`, 'PUT', lead);
export const deleteLead = (leadId: number): Promise<void> => 
  apiRequest<void>(`/leads/${leadId}`, 'DELETE');

// ========== CAMPAIGNS ==========
export const getCampaigns = (): Promise<Campaign[]> => apiRequest<Campaign[]>('/campaigns', 'GET');
export const saveCampaign = (campaign: Campaign): Promise<Campaign> =>
  String(campaign.id).length > GENERATED_ID_MIN_LENGTH
    ? apiRequest<Campaign>('/campaigns', 'POST', { ...campaign, id: undefined })
    : apiRequest<Campaign>(`/campaigns/${campaign.id}`, 'PUT', campaign);
export const deleteCampaign = (campaignId: number): Promise<void> => 
  apiRequest<void>(`/campaigns/${campaignId}`, 'DELETE');

// ========== META CAMPAIGNS ==========
export const getMetaCampaigns = (): Promise<MetaCampaign[]> => apiRequest<MetaCampaign[]>('/meta-campaigns', 'GET');
export const saveMetaCampaign = (campaign: MetaCampaign): Promise<MetaCampaign> =>
  String(campaign.id).length > GENERATED_ID_MIN_LENGTH
    ? apiRequest<MetaCampaign>('/meta-campaigns', 'POST', { ...campaign, id: undefined })
    : apiRequest<MetaCampaign>(`/meta-campaigns/${campaign.id}`, 'PUT', campaign);
export const deleteMetaCampaign = (campaignId: number): Promise<void> => 
  apiRequest<void>(`/meta-campaigns/${campaignId}`, 'DELETE');

// ========== PUBLICACIONES ==========
export const getPublicaciones = (): Promise<Publicacion[]> => apiRequest<Publicacion[]>('/publicaciones', 'GET');
export const savePublicacion = (publicacion: Publicacion): Promise<Publicacion> =>
  String(publicacion.id).length > GENERATED_ID_MIN_LENGTH
    ? apiRequest<Publicacion>('/publicaciones', 'POST', { ...publicacion, id: undefined })
    : apiRequest<Publicacion>(`/publicaciones/${publicacion.id}`, 'PUT', publicacion);
export const deletePublicacion = (publicacionId: number): Promise<void> => 
  apiRequest<void>(`/publicaciones/${publicacionId}`, 'DELETE');

// ========== SEGUIDORES ==========
export const getSeguidores = (): Promise<Seguidor[]> => apiRequest<Seguidor[]>('/seguidores', 'GET');
export const saveSeguidor = (seguidor: Seguidor): Promise<Seguidor> =>
  String(seguidor.id).length > GENERATED_ID_MIN_LENGTH
    ? apiRequest<Seguidor>('/seguidores', 'POST', { ...seguidor, id: undefined })
    : apiRequest<Seguidor>(`/seguidores/${seguidor.id}`, 'PUT', seguidor);
export const deleteSeguidor = (seguidorId: number): Promise<void> => 
  apiRequest<void>(`/seguidores/${seguidorId}`, 'DELETE');

// ========== VENTAS EXTRA ==========
export const getVentasExtra = (): Promise<VentaExtra[]> => apiRequest<VentaExtra[]>('/ventas-extra', 'GET');
export const saveVentaExtra = (venta: VentaExtra): Promise<VentaExtra> =>
  String(venta.id).length > GENERATED_ID_MIN_LENGTH
    ? apiRequest<VentaExtra>('/ventas-extra', 'POST', { ...venta, id: undefined })
    : apiRequest<VentaExtra>(`/ventas-extra/${venta.id}`, 'PUT', venta);
export const deleteVentaExtra = (ventaId: number): Promise<void> => 
  apiRequest<void>(`/ventas-extra/${ventaId}`, 'DELETE');

// ========== INCIDENCIAS ==========
export const getIncidencias = (): Promise<Incidencia[]> => apiRequest<Incidencia[]>('/incidencias', 'GET');
export const saveIncidencia = (incidencia: Incidencia): Promise<Incidencia> =>
  String(incidencia.id).length > GENERATED_ID_MIN_LENGTH
    ? apiRequest<Incidencia>('/incidencias', 'POST', { ...incidencia, id: undefined })
    : apiRequest<Incidencia>(`/incidencias/${incidencia.id}`, 'PUT', incidencia);
export const deleteIncidencia = (incidenciaId: number): Promise<void> => 
  apiRequest<void>(`/incidencias/${incidenciaId}`, 'DELETE');

// ========== EGRESOS ==========
export const getEgresos = (): Promise<Egreso[]> => apiRequest<Egreso[]>('/expenses', 'GET');
export const saveEgreso = (egreso: Egreso): Promise<Egreso> =>
  String(egreso.id).length > GENERATED_ID_MIN_LENGTH
    ? apiRequest<Egreso>('/expenses', 'POST', { ...egreso, id: undefined })
    : apiRequest<Egreso>(`/expenses/${egreso.id}`, 'PUT', egreso);
export const deleteEgreso = (egresoId: number): Promise<void> => 
  apiRequest<void>(`/expenses/${egresoId}`, 'DELETE');

// ========== PROVEEDORES ==========
export const getProveedores = (): Promise<Proveedor[]> => apiRequest<Proveedor[]>('/proveedores', 'GET');
export const saveProveedor = (proveedor: Proveedor): Promise<Proveedor> =>
  String(proveedor.id).length > GENERATED_ID_MIN_LENGTH
    ? apiRequest<Proveedor>('/proveedores', 'POST', { ...proveedor, id: undefined })
    : apiRequest<Proveedor>(`/proveedores/${proveedor.id}`, 'PUT', proveedor);
export const deleteProveedor = (proveedorId: number): Promise<void> => 
  apiRequest<void>(`/proveedores/${proveedorId}`, 'DELETE');

// ========== TIPOS PROVEEDOR ==========
export const getTiposProveedor = (): Promise<TipoProveedor[]> => apiRequest<TipoProveedor[]>('/proveedores/tipos', 'GET');
export const saveTipoProveedor = (tipo: TipoProveedor): Promise<TipoProveedor> =>
  String(tipo.id).length > GENERATED_ID_MIN_LENGTH
    ? apiRequest<TipoProveedor>('/proveedores/tipos', 'POST', { ...tipo, id: undefined })
    : apiRequest<TipoProveedor>(`/proveedores/tipos/${tipo.id}`, 'PUT', tipo);
export const deleteTipoProveedor = (id: number): Promise<void> => 
  apiRequest<void>(`/proveedores/tipos/${id}`, 'DELETE');

// ========== USERS ==========
export const getUsers = (): Promise<User[]> => apiRequest<User[]>('/users', 'GET');
export const saveUser = (user: User): Promise<User> =>
  String(user.id).length > GENERATED_ID_MIN_LENGTH
    ? apiRequest<User>('/users', 'POST', { ...user, id: undefined })
    : apiRequest<User>(`/users/${user.id}`, 'PUT', user);
export const deleteUser = (userId: number): Promise<void> => 
  apiRequest<void>(`/users/${userId}`, 'DELETE');

// ========== ROLES ==========
export const getRoles = (): Promise<Role[]> => apiRequest<Role[]>('/roles', 'GET');
export const saveRole = (role: Role): Promise<Role> =>
  String(role.id).length > GENERATED_ID_MIN_LENGTH
    ? apiRequest<Role>('/roles', 'POST', { ...role, id: undefined })
    : apiRequest<Role>(`/roles/${role.id}`, 'PUT', role);
export const deleteRole = (roleId: number): Promise<void> => 
  apiRequest<void>(`/roles/${roleId}`, 'DELETE');

// ========== BUSINESS INFO ==========
export const getBusinessInfo = (): Promise<BusinessInfo> => apiRequest<BusinessInfo>('/config/business-info', 'GET');
export const saveBusinessInfo = (info: BusinessInfo): Promise<BusinessInfo> => 
  apiRequest<BusinessInfo>('/config/business-info', 'PUT', info);

// ========== GOALS ==========
export const getGoals = (): Promise<Goal[]> => apiRequest<Goal[]>('/goals', 'GET');
export const saveGoal = (goal: Goal): Promise<Goal> =>
  String(goal.id).length > GENERATED_ID_MIN_LENGTH
    ? apiRequest<Goal>('/goals', 'POST', { ...goal, id: undefined })
    : apiRequest<Goal>(`/goals/${goal.id}`, 'PUT', goal);
export const deleteGoal = (goalId: number): Promise<void> => 
  apiRequest<void>(`/goals/${goalId}`, 'DELETE');

// ========== CLIENT SOURCES ==========
export const getClientSources = (): Promise<ClientSource[]> => apiRequest<ClientSource[]>('/config/client-sources', 'GET');
export const saveClientSource = (source: ClientSource): Promise<ClientSource> =>
  String(source.id).length > GENERATED_ID_MIN_LENGTH
    ? apiRequest<ClientSource>('/config/client-sources', 'POST', { ...source, id: undefined })
    : apiRequest<ClientSource>(`/config/client-sources/${source.id}`, 'PUT', source);
export const deleteClientSource = (id: number): Promise<void> => 
  apiRequest<void>(`/config/client-sources/${id}`, 'DELETE');

// ========== SERVICES ==========
export const getServices = (): Promise<Service[]> => apiRequest<Service[]>('/config/services', 'GET');
export const saveService = (service: Service): Promise<Service> =>
  String(service.id).length > GENERATED_ID_MIN_LENGTH
    ? apiRequest<Service>('/config/services', 'POST', { ...service, id: undefined })
    : apiRequest<Service>(`/config/services/${service.id}`, 'PUT', service);
export const deleteService = (id: number): Promise<void> => 
  apiRequest<void>(`/config/services/${id}`, 'DELETE');

// ========== PRODUCTS ==========
export const getProducts = (): Promise<Product[]> => apiRequest<Product[]>('/config/products', 'GET');
export const saveProduct = (product: Product): Promise<Product> =>
  String(product.id).length > GENERATED_ID_MIN_LENGTH
    ? apiRequest<Product>('/config/products', 'POST', { ...product, id: undefined })
    : apiRequest<Product>(`/config/products/${product.id}`, 'PUT', product);
export const deleteProduct = (id: number): Promise<void> => 
  apiRequest<void>(`/config/products/${id}`, 'DELETE');

// ========== MEMBERSHIPS ==========
export const getMemberships = (): Promise<Membership[]> => apiRequest<Membership[]>('/config/memberships', 'GET');
export const saveMembership = (membership: Membership): Promise<Membership> =>
  String(membership.id).length > GENERATED_ID_MIN_LENGTH
    ? apiRequest<Membership>('/config/memberships', 'POST', { ...membership, id: undefined })
    : apiRequest<Membership>(`/config/memberships/${membership.id}`, 'PUT', membership);
export const deleteMembership = (id: number): Promise<void> => 
  apiRequest<void>(`/config/memberships/${id}`, 'DELETE');

// ========== SERVICE CATEGORIES ==========
export const getServiceCategories = (): Promise<ServiceCategory[]> => apiRequest<ServiceCategory[]>('/config/service-categories', 'GET');
export const saveServiceCategory = (category: ServiceCategory): Promise<ServiceCategory> =>
  String(category.id).length > GENERATED_ID_MIN_LENGTH
    ? apiRequest<ServiceCategory>('/config/service-categories', 'POST', { ...category, id: undefined })
    : apiRequest<ServiceCategory>(`/config/service-categories/${category.id}`, 'PUT', category);
export const deleteServiceCategory = (id: number): Promise<void> => 
  apiRequest<void>(`/config/service-categories/${id}`, 'DELETE');

// ========== PRODUCT CATEGORIES ==========
export const getProductCategories = (): Promise<ProductCategory[]> => apiRequest<ProductCategory[]>('/config/product-categories', 'GET');
export const saveProductCategory = (category: ProductCategory): Promise<ProductCategory> =>
  String(category.id).length > GENERATED_ID_MIN_LENGTH
    ? apiRequest<ProductCategory>('/config/product-categories', 'POST', { ...category, id: undefined })
    : apiRequest<ProductCategory>(`/config/product-categories/${category.id}`, 'PUT', category);
export const deleteProductCategory = (id: number): Promise<void> => 
  apiRequest<void>(`/config/product-categories/${id}`, 'DELETE');

// ========== EGRESO CATEGORIES ==========
export const getEgresoCategories = (): Promise<EgresoCategory[]> => apiRequest<EgresoCategory[]>('/config/egreso-categories', 'GET');
export const saveEgresoCategory = (category: EgresoCategory): Promise<EgresoCategory> =>
  String(category.id).length > GENERATED_ID_MIN_LENGTH
    ? apiRequest<EgresoCategory>('/config/egreso-categories', 'POST', { ...category, id: undefined })
    : apiRequest<EgresoCategory>(`/config/egreso-categories/${category.id}`, 'PUT', category);
export const deleteEgresoCategory = (id: number): Promise<void> => 
  apiRequest<void>(`/config/egreso-categories/${id}`, 'DELETE');

// ========== JOB POSITIONS ==========
export const getJobPositions = (): Promise<JobPosition[]> => apiRequest<JobPosition[]>('/config/job-positions', 'GET');
export const saveJobPosition = (position: JobPosition): Promise<JobPosition> =>
  String(position.id).length > GENERATED_ID_MIN_LENGTH
    ? apiRequest<JobPosition>('/config/job-positions', 'POST', { ...position, id: undefined })
    : apiRequest<JobPosition>(`/config/job-positions/${position.id}`, 'PUT', position);
export const deleteJobPosition = (id: number): Promise<void> => 
  apiRequest<void>(`/config/job-positions/${id}`, 'DELETE');

// ========== COMPROBANTES ==========
export const getComprobantes = (): Promise<ComprobanteElectronico[]> => apiRequest<ComprobanteElectronico[]>('/comprobantes', 'GET');
export const saveComprobante = (comprobante: ComprobanteElectronico): Promise<ComprobanteElectronico> =>
  String(comprobante.id).length > GENERATED_ID_MIN_LENGTH
    ? apiRequest<ComprobanteElectronico>('/comprobantes', 'POST', { ...comprobante, id: undefined })
    : apiRequest<ComprobanteElectronico>(`/comprobantes/${comprobante.id}`, 'PUT', comprobante);
export const deleteComprobante = (comprobanteId: number): Promise<void> => 
  apiRequest<void>(`/comprobantes/${comprobanteId}`, 'DELETE');

// ========== UTILITY FUNCTIONS ==========
export const getNextHistoryNumber = (): Promise<number> => 
  apiRequest<number>('/leads/next-history-number', 'GET');

export const generateAiContent = async (prompt: string): Promise<string> => {
  const response = await apiRequest<{ content: string }>('/ai/generate', 'POST', { prompt });
  return response.content;
};
