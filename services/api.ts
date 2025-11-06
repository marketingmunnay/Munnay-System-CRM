import { GoogleGenAI } from "@google/genai";
import type { 
  Lead, Campaign, VentaExtra, Incidencia, Egreso, Proveedor, User, Role, 
  BusinessInfo, ClientSource, Service, Product, Membership, ServiceCategory,
  ProductCategory, JobPosition, Publicacion, Seguidor, MetaCampaign, EgresoCategory,
  TipoProveedor, Goal, ComprobanteElectronico
} from '../types.ts';

// URL fija de tu backend en Cloud Run
const API_URL = "https://munnay-system-crm-156279657697.europe-west1.run.app/api";

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

// ====== LEADS ======
export const getLeads = (): Promise<Lead[]> => apiRequest<Lead[]>('/leads', 'GET');
export const saveLead = (lead: Lead): Promise<Lead> =>
  String(lead.id).length > 7
    ? apiRequest<Lead>('/leads', 'POST', { ...lead, id: undefined })
    : apiRequest<Lead>(`/leads/${lead.id}`, 'PUT', lead);
export const deleteLead = (id: number): Promise<void> => 
  apiRequest<void>(`/leads/${id}`, 'DELETE');
export const getNextHistoryNumber = (): Promise<{ nextNumber: number }> =>
  apiRequest<{ nextNumber: number }>('/leads/next-history-number', 'GET');

// ====== CAMPAIGNS ======
export const getCampaigns = (): Promise<Campaign[]> => apiRequest<Campaign[]>('/campaigns', 'GET');
export const saveCampaign = (campaign: Campaign): Promise<Campaign> =>
  campaign.id
    ? apiRequest<Campaign>(`/campaigns/${campaign.id}`, 'PUT', campaign)
    : apiRequest<Campaign>('/campaigns', 'POST', campaign);
export const deleteCampaign = (id: number): Promise<void> =>
  apiRequest<void>(`/campaigns/${id}`, 'DELETE');

// ====== META CAMPAIGNS ======
export const getMetaCampaigns = (): Promise<MetaCampaign[]> => 
  apiRequest<MetaCampaign[]>('/campaigns/meta', 'GET');
export const saveMetaCampaign = (campaign: MetaCampaign): Promise<MetaCampaign> =>
  campaign.id
    ? apiRequest<MetaCampaign>(`/campaigns/meta/${campaign.id}`, 'PUT', campaign)
    : apiRequest<MetaCampaign>('/campaigns/meta', 'POST', campaign);
export const deleteMetaCampaign = (id: number): Promise<void> =>
  apiRequest<void>(`/campaigns/meta/${id}`, 'DELETE');

// ====== VENTAS EXTRA ======
export const getVentasExtra = (): Promise<VentaExtra[]> => 
  apiRequest<VentaExtra[]>('/ventas-extra', 'GET');
export const saveVentaExtra = (venta: VentaExtra): Promise<VentaExtra> =>
  venta.id
    ? apiRequest<VentaExtra>(`/ventas-extra/${venta.id}`, 'PUT', venta)
    : apiRequest<VentaExtra>('/ventas-extra', 'POST', venta);
export const deleteVentaExtra = (id: number): Promise<void> =>
  apiRequest<void>(`/ventas-extra/${id}`, 'DELETE');

// ====== INCIDENCIAS ======
export const getIncidencias = (): Promise<Incidencia[]> => 
  apiRequest<Incidencia[]>('/incidencias', 'GET');
export const saveIncidencia = (incidencia: Incidencia): Promise<Incidencia> =>
  incidencia.id
    ? apiRequest<Incidencia>(`/incidencias/${incidencia.id}`, 'PUT', incidencia)
    : apiRequest<Incidencia>('/incidencias', 'POST', incidencia);
export const deleteIncidencia = (id: number): Promise<void> =>
  apiRequest<void>(`/incidencias/${id}`, 'DELETE');

// ====== EGRESOS ======
export const getEgresos = (): Promise<Egreso[]> => 
  apiRequest<Egreso[]>('/expenses', 'GET');
export const saveEgreso = (egreso: Egreso): Promise<Egreso> =>
  egreso.id
    ? apiRequest<Egreso>(`/expenses/${egreso.id}`, 'PUT', egreso)
    : apiRequest<Egreso>('/expenses', 'POST', egreso);
export const deleteEgreso = (id: number): Promise<void> =>
  apiRequest<void>(`/expenses/${id}`, 'DELETE');

// ====== PROVEEDORES ======
export const getProveedores = (): Promise<Proveedor[]> => 
  apiRequest<Proveedor[]>('/proveedores', 'GET');
export const saveProveedor = (proveedor: Proveedor): Promise<Proveedor> =>
  proveedor.id
    ? apiRequest<Proveedor>(`/proveedores/${proveedor.id}`, 'PUT', proveedor)
    : apiRequest<Proveedor>('/proveedores', 'POST', proveedor);
export const deleteProveedor = (id: number): Promise<void> =>
  apiRequest<void>(`/proveedores/${id}`, 'DELETE');

// ====== TIPOS DE PROVEEDOR ======
export const getTiposProveedor = (): Promise<TipoProveedor[]> => 
  apiRequest<TipoProveedor[]>('/proveedores/tipos', 'GET');
export const saveTipoProveedor = (tipo: TipoProveedor): Promise<TipoProveedor> =>
  tipo.id
    ? apiRequest<TipoProveedor>(`/proveedores/tipos/${tipo.id}`, 'PUT', tipo)
    : apiRequest<TipoProveedor>('/proveedores/tipos', 'POST', tipo);
export const deleteTipoProveedor = (id: number): Promise<void> =>
  apiRequest<void>(`/proveedores/tipos/${id}`, 'DELETE');

// ====== PUBLICACIONES ======
export const getPublicaciones = (): Promise<Publicacion[]> => 
  apiRequest<Publicacion[]>('/publicaciones', 'GET');
export const savePublicacion = (publicacion: Publicacion): Promise<Publicacion> =>
  publicacion.id
    ? apiRequest<Publicacion>(`/publicaciones/${publicacion.id}`, 'PUT', publicacion)
    : apiRequest<Publicacion>('/publicaciones', 'POST', publicacion);
export const deletePublicacion = (id: number): Promise<void> =>
  apiRequest<void>(`/publicaciones/${id}`, 'DELETE');

// ====== SEGUIDORES ======
export const getSeguidores = (): Promise<Seguidor[]> => 
  apiRequest<Seguidor[]>('/seguidores', 'GET');
export const saveSeguidor = (seguidor: Seguidor): Promise<Seguidor> =>
  seguidor.id
    ? apiRequest<Seguidor>(`/seguidores/${seguidor.id}`, 'PUT', seguidor)
    : apiRequest<Seguidor>('/seguidores', 'POST', seguidor);
export const deleteSeguidor = (id: number): Promise<void> =>
  apiRequest<void>(`/seguidores/${id}`, 'DELETE');

// ====== USERS ======
export const getUsers = (): Promise<User[]> => 
  apiRequest<User[]>('/users', 'GET');
export const saveUser = (user: User): Promise<User> =>
  user.id
    ? apiRequest<User>(`/users/${user.id}`, 'PUT', user)
    : apiRequest<User>('/users', 'POST', user);
export const deleteUser = (id: number): Promise<void> =>
  apiRequest<void>(`/users/${id}`, 'DELETE');

// ====== ROLES ======
export const getRoles = (): Promise<Role[]> => 
  apiRequest<Role[]>('/roles', 'GET');
export const saveRole = (role: Role): Promise<Role> =>
  role.id
    ? apiRequest<Role>(`/roles/${role.id}`, 'PUT', role)
    : apiRequest<Role>('/roles', 'POST', role);
export const deleteRole = (id: number): Promise<void> =>
  apiRequest<void>(`/roles/${id}`, 'DELETE');

// ====== GOALS ======
export const getGoals = (): Promise<Goal[]> => 
  apiRequest<Goal[]>('/goals', 'GET');
export const saveGoal = (goal: Goal): Promise<Goal> =>
  goal.id
    ? apiRequest<Goal>(`/goals/${goal.id}`, 'PUT', goal)
    : apiRequest<Goal>('/goals', 'POST', goal);
export const deleteGoal = (id: number): Promise<void> =>
  apiRequest<void>(`/goals/${id}`, 'DELETE');

// ====== BUSINESS INFO ======
export const getBusinessInfo = (): Promise<BusinessInfo> => 
  apiRequest<BusinessInfo>('/config/business-info', 'GET');
export const saveBusinessInfo = (info: BusinessInfo): Promise<BusinessInfo> =>
  apiRequest<BusinessInfo>('/config/business-info', 'PUT', info);

// ====== CLIENT SOURCES ======
export const getClientSources = (): Promise<ClientSource[]> => 
  apiRequest<ClientSource[]>('/config/client-sources', 'GET');
export const saveClientSource = (source: ClientSource): Promise<ClientSource> =>
  source.id
    ? apiRequest<ClientSource>(`/config/client-sources/${source.id}`, 'PUT', source)
    : apiRequest<ClientSource>('/config/client-sources', 'POST', source);
export const deleteClientSource = (id: number): Promise<void> =>
  apiRequest<void>(`/config/client-sources/${id}`, 'DELETE');

// ====== SERVICES ======
export const getServices = (): Promise<Service[]> => 
  apiRequest<Service[]>('/config/services', 'GET');
export const saveService = (service: Service): Promise<Service> =>
  service.id
    ? apiRequest<Service>(`/config/services/${service.id}`, 'PUT', service)
    : apiRequest<Service>('/config/services', 'POST', service);
export const deleteService = (id: number): Promise<void> =>
  apiRequest<void>(`/config/services/${id}`, 'DELETE');

// ====== PRODUCTS ======
export const getProducts = (): Promise<Product[]> => 
  apiRequest<Product[]>('/config/products', 'GET');
export const saveProduct = (product: Product): Promise<Product> =>
  product.id
    ? apiRequest<Product>(`/config/products/${product.id}`, 'PUT', product)
    : apiRequest<Product>('/config/products', 'POST', product);
export const deleteProduct = (id: number): Promise<void> =>
  apiRequest<void>(`/config/products/${id}`, 'DELETE');

// ====== MEMBERSHIPS ======
export const getMemberships = (): Promise<Membership[]> => 
  apiRequest<Membership[]>('/config/memberships', 'GET');
export const saveMembership = (membership: Membership): Promise<Membership> =>
  membership.id
    ? apiRequest<Membership>(`/config/memberships/${membership.id}`, 'PUT', membership)
    : apiRequest<Membership>('/config/memberships', 'POST', membership);
export const deleteMembership = (id: number): Promise<void> =>
  apiRequest<void>(`/config/memberships/${id}`, 'DELETE');

// ====== SERVICE CATEGORIES ======
export const getServiceCategories = (): Promise<ServiceCategory[]> => 
  apiRequest<ServiceCategory[]>('/config/service-categories', 'GET');
export const saveServiceCategory = (category: ServiceCategory): Promise<ServiceCategory> =>
  category.id
    ? apiRequest<ServiceCategory>(`/config/service-categories/${category.id}`, 'PUT', category)
    : apiRequest<ServiceCategory>('/config/service-categories', 'POST', category);
export const deleteServiceCategory = (id: number): Promise<void> =>
  apiRequest<void>(`/config/service-categories/${id}`, 'DELETE');

// ====== PRODUCT CATEGORIES ======
export const getProductCategories = (): Promise<ProductCategory[]> => 
  apiRequest<ProductCategory[]>('/config/product-categories', 'GET');
export const saveProductCategory = (category: ProductCategory): Promise<ProductCategory> =>
  category.id
    ? apiRequest<ProductCategory>(`/config/product-categories/${category.id}`, 'PUT', category)
    : apiRequest<ProductCategory>('/config/product-categories', 'POST', category);
export const deleteProductCategory = (id: number): Promise<void> =>
  apiRequest<void>(`/config/product-categories/${id}`, 'DELETE');

// ====== EGRESO CATEGORIES ======
export const getEgresoCategories = (): Promise<EgresoCategory[]> => 
  apiRequest<EgresoCategory[]>('/config/egreso-categories', 'GET');
export const saveEgresoCategory = (category: EgresoCategory): Promise<EgresoCategory> =>
  category.id
    ? apiRequest<EgresoCategory>(`/config/egreso-categories/${category.id}`, 'PUT', category)
    : apiRequest<EgresoCategory>('/config/egreso-categories', 'POST', category);
export const deleteEgresoCategory = (id: number): Promise<void> =>
  apiRequest<void>(`/config/egreso-categories/${id}`, 'DELETE');

// ====== JOB POSITIONS ======
export const getJobPositions = (): Promise<JobPosition[]> => 
  apiRequest<JobPosition[]>('/config/job-positions', 'GET');
export const saveJobPosition = (position: JobPosition): Promise<JobPosition> =>
  position.id
    ? apiRequest<JobPosition>(`/config/job-positions/${position.id}`, 'PUT', position)
    : apiRequest<JobPosition>('/config/job-positions', 'POST', position);
export const deleteJobPosition = (id: number): Promise<void> =>
  apiRequest<void>(`/config/job-positions/${id}`, 'DELETE');

// ====== COMPROBANTES ======
export const getComprobantes = (): Promise<ComprobanteElectronico[]> => 
  apiRequest<ComprobanteElectronico[]>('/config/comprobantes', 'GET');
export const saveComprobante = (comprobante: ComprobanteElectronico): Promise<ComprobanteElectronico> =>
  comprobante.id
    ? apiRequest<ComprobanteElectronico>(`/config/comprobantes/${comprobante.id}`, 'PUT', comprobante)
    : apiRequest<ComprobanteElectronico>('/config/comprobantes', 'POST', comprobante);
export const deleteComprobante = (id: number): Promise<void> =>
  apiRequest<void>(`/config/comprobantes/${id}`, 'DELETE');

// ====== AI CONTENT GENERATION ======
export const generateAiContent = async (prompt: string): Promise<string> => {
  // This would need Google Gemini API key configuration
  // For now, return a placeholder
  console.warn('AI content generation not fully configured');
  return 'Contenido generado por IA no disponible';
};
