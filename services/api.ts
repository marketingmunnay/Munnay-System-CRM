import { GoogleGenAI } from "@google/genai";
import type { 
  Lead, Campaign, VentaExtra, Incidencia, Egreso, Proveedor, User, Role, 
  BusinessInfo, ClientSource, Service, Product, Membership, ServiceCategory,
  ProductCategory, JobPosition, Publicacion, Seguidor, MetaCampaign, EgresoCategory,
  TipoProveedor, Goal, ComprobanteElectronico
} from '../types.ts';

// Use environment variable with fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

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

  const response = await fetch(`${API_URL}/api${endpoint}`, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || 'Error en la petición a la API');
  }

  if (response.status === 204) return {} as T;
  return response.json();
};

// Leads
export const getLeads = (): Promise<Lead[]> => apiRequest<Lead[]>('/leads', 'GET');
export const saveLead = (lead: Lead): Promise<Lead> =>
  String(lead.id).length > 7
    ? apiRequest<Lead>('/leads', 'POST', { ...lead, id: undefined })
    : apiRequest<Lead>(`/leads/${lead.id}`, 'PUT', lead);
export const deleteLead = (id: number): Promise<void> => apiRequest<void>(`/leads/${id}`, 'DELETE');

// Campaigns
export const getCampaigns = (): Promise<Campaign[]> => apiRequest<Campaign[]>('/campaigns', 'GET');
export const saveCampaign = (campaign: Campaign): Promise<Campaign> =>
  String(campaign.id).length > 7
    ? apiRequest<Campaign>('/campaigns', 'POST', { ...campaign, id: undefined })
    : apiRequest<Campaign>(`/campaigns/${campaign.id}`, 'PUT', campaign);
export const deleteCampaign = (id: number): Promise<void> => apiRequest<void>(`/campaigns/${id}`, 'DELETE');

// MetaCampaigns - Fixed endpoint to /campaigns/meta
export const getMetaCampaigns = (): Promise<MetaCampaign[]> => apiRequest<MetaCampaign[]>('/campaigns/meta', 'GET');
export const saveMetaCampaign = (campaign: MetaCampaign): Promise<MetaCampaign> =>
  String(campaign.id).length > 7
    ? apiRequest<MetaCampaign>('/campaigns/meta', 'POST', { ...campaign, id: undefined })
    : apiRequest<MetaCampaign>(`/campaigns/meta/${campaign.id}`, 'PUT', campaign);
export const deleteMetaCampaign = (id: number): Promise<void> => apiRequest<void>(`/campaigns/meta/${id}`, 'DELETE');

// Ventas Extra
export const getVentasExtra = (): Promise<VentaExtra[]> => apiRequest<VentaExtra[]>('/ventas-extra', 'GET');
export const saveVentaExtra = (venta: VentaExtra): Promise<VentaExtra> =>
  String(venta.id).length > 7
    ? apiRequest<VentaExtra>('/ventas-extra', 'POST', { ...venta, id: undefined })
    : apiRequest<VentaExtra>(`/ventas-extra/${venta.id}`, 'PUT', venta);
export const deleteVentaExtra = (id: number): Promise<void> => apiRequest<void>(`/ventas-extra/${id}`, 'DELETE');

// Incidencias
export const getIncidencias = (): Promise<Incidencia[]> => apiRequest<Incidencia[]>('/incidencias', 'GET');
export const saveIncidencia = (incidencia: Incidencia): Promise<Incidencia> =>
  String(incidencia.id).length > 7
    ? apiRequest<Incidencia>('/incidencias', 'POST', { ...incidencia, id: undefined })
    : apiRequest<Incidencia>(`/incidencias/${incidencia.id}`, 'PUT', incidencia);
export const deleteIncidencia = (id: number): Promise<void> => apiRequest<void>(`/incidencias/${id}`, 'DELETE');

// Egresos
export const getEgresos = (): Promise<Egreso[]> => apiRequest<Egreso[]>('/expenses', 'GET');
export const saveEgreso = (egreso: Egreso): Promise<Egreso> =>
  String(egreso.id).length > 7
    ? apiRequest<Egreso>('/expenses', 'POST', { ...egreso, id: undefined })
    : apiRequest<Egreso>(`/expenses/${egreso.id}`, 'PUT', egreso);
export const deleteEgreso = (id: number): Promise<void> => apiRequest<void>(`/expenses/${id}`, 'DELETE');

// Proveedores
export const getProveedores = (): Promise<Proveedor[]> => apiRequest<Proveedor[]>('/proveedores', 'GET');
export const saveProveedor = (proveedor: Proveedor): Promise<Proveedor> =>
  String(proveedor.id).length > 7
    ? apiRequest<Proveedor>('/proveedores', 'POST', { ...proveedor, id: undefined })
    : apiRequest<Proveedor>(`/proveedores/${proveedor.id}`, 'PUT', proveedor);
export const deleteProveedor = (id: number): Promise<void> => apiRequest<void>(`/proveedores/${id}`, 'DELETE');

// Tipos de Proveedor
export const getTiposProveedor = (): Promise<TipoProveedor[]> => apiRequest<TipoProveedor[]>('/proveedores/tipos', 'GET');
export const saveTipoProveedor = (tipo: TipoProveedor): Promise<TipoProveedor> =>
  String(tipo.id).length > 7
    ? apiRequest<TipoProveedor>('/proveedores/tipos', 'POST', { ...tipo, id: undefined })
    : apiRequest<TipoProveedor>(`/proveedores/tipos/${tipo.id}`, 'PUT', tipo);
export const deleteTipoProveedor = (id: number): Promise<void> => apiRequest<void>(`/proveedores/tipos/${id}`, 'DELETE');

// Users
export const getUsers = (): Promise<User[]> => apiRequest<User[]>('/users', 'GET');
export const saveUser = (user: User): Promise<User> =>
  String(user.id).length > 7
    ? apiRequest<User>('/users', 'POST', { ...user, id: undefined })
    : apiRequest<User>(`/users/${user.id}`, 'PUT', user);
export const deleteUser = (id: number): Promise<void> => apiRequest<void>(`/users/${id}`, 'DELETE');

// Roles
export const getRoles = (): Promise<Role[]> => apiRequest<Role[]>('/roles', 'GET');
export const saveRole = (role: Role): Promise<Role> =>
  String(role.id).length > 7
    ? apiRequest<Role>('/roles', 'POST', { ...role, id: undefined })
    : apiRequest<Role>(`/roles/${role.id}`, 'PUT', role);
export const deleteRole = (id: number): Promise<void> => apiRequest<void>(`/roles/${id}`, 'DELETE');

// Business Info
export const getBusinessInfo = (): Promise<BusinessInfo> => apiRequest<BusinessInfo>('/config/business', 'GET');
export const saveBusinessInfo = (info: BusinessInfo): Promise<BusinessInfo> => apiRequest<BusinessInfo>('/config/business', 'PUT', info);

// Goals
export const getGoals = (): Promise<Goal[]> => apiRequest<Goal[]>('/goals', 'GET');
export const saveGoal = (goal: Goal): Promise<Goal> =>
  String(goal.id).length > 7
    ? apiRequest<Goal>('/goals', 'POST', { ...goal, id: undefined })
    : apiRequest<Goal>(`/goals/${goal.id}`, 'PUT', goal);
export const deleteGoal = (id: number): Promise<void> => apiRequest<void>(`/goals/${id}`, 'DELETE');

// Client Sources
export const getClientSources = (): Promise<ClientSource[]> => apiRequest<ClientSource[]>('/config/client-sources', 'GET');
export const saveClientSource = (source: ClientSource): Promise<ClientSource> =>
  String(source.id).length > 7
    ? apiRequest<ClientSource>('/config/client-sources', 'POST', { ...source, id: undefined })
    : apiRequest<ClientSource>(`/config/client-sources/${source.id}`, 'PUT', source);
export const deleteClientSource = (id: number): Promise<void> => apiRequest<void>(`/config/client-sources/${id}`, 'DELETE');

// Services
export const getServices = (): Promise<Service[]> => apiRequest<Service[]>('/config/services', 'GET');
export const saveService = (service: Service): Promise<Service> =>
  String(service.id).length > 7
    ? apiRequest<Service>('/config/services', 'POST', { ...service, id: undefined })
    : apiRequest<Service>(`/config/services/${service.id}`, 'PUT', service);
export const deleteService = (id: number): Promise<void> => apiRequest<void>(`/config/services/${id}`, 'DELETE');

// Products
export const getProducts = (): Promise<Product[]> => apiRequest<Product[]>('/config/products', 'GET');
export const saveProduct = (product: Product): Promise<Product> =>
  String(product.id).length > 7
    ? apiRequest<Product>('/config/products', 'POST', { ...product, id: undefined })
    : apiRequest<Product>(`/config/products/${product.id}`, 'PUT', product);
export const deleteProduct = (id: number): Promise<void> => apiRequest<void>(`/config/products/${id}`, 'DELETE');

// Memberships
export const getMemberships = (): Promise<Membership[]> => apiRequest<Membership[]>('/config/memberships', 'GET');
export const saveMembership = (membership: Membership): Promise<Membership> =>
  String(membership.id).length > 7
    ? apiRequest<Membership>('/config/memberships', 'POST', { ...membership, id: undefined })
    : apiRequest<Membership>(`/config/memberships/${membership.id}`, 'PUT', membership);
export const deleteMembership = (id: number): Promise<void> => apiRequest<void>(`/config/memberships/${id}`, 'DELETE');

// Service Categories
export const getServiceCategories = (): Promise<ServiceCategory[]> => apiRequest<ServiceCategory[]>('/config/service-categories', 'GET');
export const saveServiceCategory = (category: ServiceCategory): Promise<ServiceCategory> =>
  String(category.id).length > 7
    ? apiRequest<ServiceCategory>('/config/service-categories', 'POST', { ...category, id: undefined })
    : apiRequest<ServiceCategory>(`/config/service-categories/${category.id}`, 'PUT', category);
export const deleteServiceCategory = (id: number): Promise<void> => apiRequest<void>(`/config/service-categories/${id}`, 'DELETE');

// Product Categories
export const getProductCategories = (): Promise<ProductCategory[]> => apiRequest<ProductCategory[]>('/config/product-categories', 'GET');
export const saveProductCategory = (category: ProductCategory): Promise<ProductCategory> =>
  String(category.id).length > 7
    ? apiRequest<ProductCategory>('/config/product-categories', 'POST', { ...category, id: undefined })
    : apiRequest<ProductCategory>(`/config/product-categories/${category.id}`, 'PUT', category);
export const deleteProductCategory = (id: number): Promise<void> => apiRequest<void>(`/config/product-categories/${id}`, 'DELETE');

// Egreso Categories
export const getEgresoCategories = (): Promise<EgresoCategory[]> => apiRequest<EgresoCategory[]>('/config/egreso-categories', 'GET');
export const saveEgresoCategory = (category: EgresoCategory): Promise<EgresoCategory> =>
  String(category.id).length > 7
    ? apiRequest<EgresoCategory>('/config/egreso-categories', 'POST', { ...category, id: undefined })
    : apiRequest<EgresoCategory>(`/config/egreso-categories/${category.id}`, 'PUT', category);
export const deleteEgresoCategory = (id: number): Promise<void> => apiRequest<void>(`/config/egreso-categories/${id}`, 'DELETE');

// Job Positions
export const getJobPositions = (): Promise<JobPosition[]> => apiRequest<JobPosition[]>('/config/job-positions', 'GET');
export const saveJobPosition = (position: JobPosition): Promise<JobPosition> =>
  String(position.id).length > 7
    ? apiRequest<JobPosition>('/config/job-positions', 'POST', { ...position, id: undefined })
    : apiRequest<JobPosition>(`/config/job-positions/${position.id}`, 'PUT', position);
export const deleteJobPosition = (id: number): Promise<void> => apiRequest<void>(`/config/job-positions/${id}`, 'DELETE');

// Publicaciones
export const getPublicaciones = (): Promise<Publicacion[]> => apiRequest<Publicacion[]>('/publicaciones', 'GET');
export const savePublicacion = (publicacion: Publicacion): Promise<Publicacion> =>
  String(publicacion.id).length > 7
    ? apiRequest<Publicacion>('/publicaciones', 'POST', { ...publicacion, id: undefined })
    : apiRequest<Publicacion>(`/publicaciones/${publicacion.id}`, 'PUT', publicacion);
export const deletePublicacion = (id: number): Promise<void> => apiRequest<void>(`/publicaciones/${id}`, 'DELETE');

// Seguidores
export const getSeguidores = (): Promise<Seguidor[]> => apiRequest<Seguidor[]>('/seguidores', 'GET');
export const saveSeguidor = (seguidor: Seguidor): Promise<Seguidor> =>
  String(seguidor.id).length > 7
    ? apiRequest<Seguidor>('/seguidores', 'POST', { ...seguidor, id: undefined })
    : apiRequest<Seguidor>(`/seguidores/${seguidor.id}`, 'PUT', seguidor);
export const deleteSeguidor = (id: number): Promise<void> => apiRequest<void>(`/seguidores/${id}`, 'DELETE');

// Comprobantes
export const getComprobantes = (): Promise<ComprobanteElectronico[]> => apiRequest<ComprobanteElectronico[]>('/comprobantes', 'GET');
export const saveComprobante = (comprobante: ComprobanteElectronico): Promise<ComprobanteElectronico> =>
  String(comprobante.id).length > 7
    ? apiRequest<ComprobanteElectronico>('/comprobantes', 'POST', { ...comprobante, id: undefined })
    : apiRequest<ComprobanteElectronico>(`/comprobantes/${comprobante.id}`, 'PUT', comprobante);
export const deleteComprobante = (id: number): Promise<void> => apiRequest<void>(`/comprobantes/${id}`, 'DELETE');

// Additional utility functions
export const getNextHistoryNumber = (): Promise<string> => apiRequest<string>('/leads/next-history-number', 'GET');

// AI Content Generation
export const generateAiContent = async (prompt: string): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY no está configurada');
    }
    
    const genAI = new GoogleGenAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generando contenido con IA:', error);
    throw new Error('Error al generar contenido con IA');
  }
};
