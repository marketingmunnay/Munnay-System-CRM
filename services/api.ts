import type { 
  Lead, Campaign, VentaExtra, Incidencia, Egreso, Proveedor, User, Role, 
  BusinessInfo, ClientSource, Service, Product, Membership, ServiceCategory,
  ProductCategory, JobPosition, Publicacion, Seguidor, MetaCampaign, EgresoCategory,
  TipoProveedor, Goal, ComprobanteElectronico
} from '../types.ts';

// URL del backend en Render
const API_URL = "https://munnay-crm-backend.onrender.com/api";

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
  // Database IDs are small autoincrement values (< 1000000), timestamps are much larger
  lead.id && lead.id < 1000000
    ? apiRequest<Lead>(`/leads/${lead.id}`, 'PUT', lead)
    : apiRequest<Lead>('/leads', 'POST', { ...lead, id: undefined });
export const deleteLead = (id: number): Promise<void> => 
  apiRequest<void>(`/leads/${id}`, 'DELETE');
export const getNextHistoryNumber = (): Promise<string> =>
  apiRequest<string>('/leads/next-history-number', 'GET');

// ====== CAMPAIGNS ======
export const getCampaigns = (): Promise<Campaign[]> => apiRequest<Campaign[]>('/campaigns', 'GET');
export const saveCampaign = (campaign: Campaign): Promise<Campaign> =>
  campaign.id && campaign.id < 1000000
    ? apiRequest<Campaign>(`/campaigns/${campaign.id}`, 'PUT', campaign)
    : apiRequest<Campaign>('/campaigns', 'POST', campaign);
export const deleteCampaign = (id: number): Promise<void> =>
  apiRequest<void>(`/campaigns/${id}`, 'DELETE');

// ====== META CAMPAIGNS ======
export const getMetaCampaigns = (): Promise<MetaCampaign[]> => 
  apiRequest<MetaCampaign[]>('/campaigns/meta', 'GET');
export const saveMetaCampaign = (campaign: MetaCampaign): Promise<MetaCampaign> =>
  campaign.id && campaign.id < 1000000
    ? apiRequest<MetaCampaign>(`/campaigns/meta/${campaign.id}`, 'PUT', campaign)
    : apiRequest<MetaCampaign>('/campaigns/meta', 'POST', campaign);
export const deleteMetaCampaign = (id: number): Promise<void> =>
  apiRequest<void>(`/campaigns/meta/${id}`, 'DELETE');

// ====== VENTAS EXTRA ======
export const getVentasExtra = (): Promise<VentaExtra[]> => 
  apiRequest<VentaExtra[]>('/ventas-extra', 'GET');
export const saveVentaExtra = (venta: VentaExtra): Promise<VentaExtra> =>
  venta.id && venta.id < 1000000
    ? apiRequest<VentaExtra>(`/ventas-extra/${venta.id}`, 'PUT', venta)
    : apiRequest<VentaExtra>('/ventas-extra', 'POST', venta);
export const deleteVentaExtra = (id: number): Promise<void> =>
  apiRequest<void>(`/ventas-extra/${id}`, 'DELETE');

// ====== INCIDENCIAS ======
export const getIncidencias = (): Promise<Incidencia[]> => 
  apiRequest<Incidencia[]>('/incidencias', 'GET');
export const saveIncidencia = (incidencia: Incidencia): Promise<Incidencia> =>
  incidencia.id && incidencia.id < 1000000
    ? apiRequest<Incidencia>(`/incidencias/${incidencia.id}`, 'PUT', incidencia)
    : apiRequest<Incidencia>('/incidencias', 'POST', incidencia);
export const deleteIncidencia = (id: number): Promise<void> =>
  apiRequest<void>(`/incidencias/${id}`, 'DELETE');

// ====== EGRESOS ======
export const getEgresos = (): Promise<Egreso[]> => 
  apiRequest<Egreso[]>('/expenses', 'GET');
export const saveEgreso = (egreso: Egreso): Promise<Egreso> =>
  egreso.id && egreso.id < 1000000
    ? apiRequest<Egreso>(`/expenses/${egreso.id}`, 'PUT', egreso)
    : apiRequest<Egreso>('/expenses', 'POST', egreso);
export const deleteEgreso = (id: number): Promise<void> =>
  apiRequest<void>(`/expenses/${id}`, 'DELETE');

// ====== PROVEEDORES ======
export const getProveedores = (): Promise<Proveedor[]> => 
  apiRequest<Proveedor[]>('/proveedores', 'GET');
export const saveProveedor = (proveedor: Proveedor): Promise<Proveedor> =>
  proveedor.id && proveedor.id < 1000000
    ? apiRequest<Proveedor>(`/proveedores/${proveedor.id}`, 'PUT', proveedor)
    : apiRequest<Proveedor>('/proveedores', 'POST', proveedor);
export const deleteProveedor = (id: number): Promise<void> =>
  apiRequest<void>(`/proveedores/${id}`, 'DELETE');

// ====== TIPOS DE PROVEEDOR ======
export const getTiposProveedor = (): Promise<TipoProveedor[]> => 
  apiRequest<TipoProveedor[]>('/proveedores/tipos', 'GET');
export const saveTipoProveedor = (tipo: TipoProveedor): Promise<TipoProveedor> =>
  tipo.id && tipo.id < 1000000
    ? apiRequest<TipoProveedor>(`/proveedores/tipos/${tipo.id}`, 'PUT', tipo)
    : apiRequest<TipoProveedor>('/proveedores/tipos', 'POST', tipo);
export const deleteTipoProveedor = (id: number): Promise<void> =>
  apiRequest<void>(`/proveedores/tipos/${id}`, 'DELETE');

// ====== PUBLICACIONES ======
export const getPublicaciones = (): Promise<Publicacion[]> => 
  apiRequest<Publicacion[]>('/publicaciones', 'GET');
export const savePublicacion = (publicacion: Publicacion): Promise<Publicacion> =>
  publicacion.id && publicacion.id < 1000000
    ? apiRequest<Publicacion>(`/publicaciones/${publicacion.id}`, 'PUT', publicacion)
    : apiRequest<Publicacion>('/publicaciones', 'POST', publicacion);
export const deletePublicacion = (id: number): Promise<void> =>
  apiRequest<void>(`/publicaciones/${id}`, 'DELETE');

// ====== SEGUIDORES ======
export const getSeguidores = (): Promise<Seguidor[]> => 
  apiRequest<Seguidor[]>('/seguidores', 'GET');
export const saveSeguidor = (seguidor: Seguidor): Promise<Seguidor> =>
  seguidor.id && seguidor.id < 1000000
    ? apiRequest<Seguidor>(`/seguidores/${seguidor.id}`, 'PUT', seguidor)
    : apiRequest<Seguidor>('/seguidores', 'POST', seguidor);
export const deleteSeguidor = (id: number): Promise<void> =>
  apiRequest<void>(`/seguidores/${id}`, 'DELETE');

// ====== USERS ======
export const getUsers = (): Promise<User[]> => 
  apiRequest<User[]>('/users', 'GET');
export const saveUser = (user: User): Promise<User> =>
  user.id && user.id < 1000000
    ? apiRequest<User>(`/users/${user.id}`, 'PUT', user)
    : apiRequest<User>('/users', 'POST', user);
export const deleteUser = (id: number): Promise<void> =>
  apiRequest<void>(`/users/${id}`, 'DELETE');

// ====== ROLES ======
export const getRoles = (): Promise<Role[]> => 
  apiRequest<Role[]>('/roles', 'GET');
export const saveRole = (role: Role): Promise<Role> =>
  role.id && role.id < 1000000
    ? apiRequest<Role>(`/roles/${role.id}`, 'PUT', role)
    : apiRequest<Role>('/roles', 'POST', role);
export const deleteRole = (id: number): Promise<void> =>
  apiRequest<void>(`/roles/${id}`, 'DELETE');

// ====== GOALS ======
export const getGoals = (): Promise<Goal[]> => 
  apiRequest<Goal[]>('/goals', 'GET');
export const saveGoal = (goal: Goal): Promise<Goal> =>
  goal.id && goal.id < 1000000
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
  source.id && source.id < 1000000
    ? apiRequest<ClientSource>(`/config/client-sources/${source.id}`, 'PUT', source)
    : apiRequest<ClientSource>('/config/client-sources', 'POST', source);
export const deleteClientSource = (id: number): Promise<void> =>
  apiRequest<void>(`/config/client-sources/${id}`, 'DELETE');

// ====== SERVICES ======
export const getServices = (): Promise<Service[]> => 
  apiRequest<Service[]>('/config/services', 'GET');
export const saveService = (service: Service): Promise<Service> =>
  service.id && service.id < 1000000
    ? apiRequest<Service>(`/config/services/${service.id}`, 'PUT', service)
    : apiRequest<Service>('/config/services', 'POST', service);
export const deleteService = (id: number): Promise<void> =>
  apiRequest<void>(`/config/services/${id}`, 'DELETE');

// ====== PRODUCTS ======
export const getProducts = (): Promise<Product[]> => 
  apiRequest<Product[]>('/config/products', 'GET');
export const saveProduct = (product: Product): Promise<Product> =>
  product.id && product.id < 1000000
    ? apiRequest<Product>(`/config/products/${product.id}`, 'PUT', product)
    : apiRequest<Product>('/config/products', 'POST', product);
export const deleteProduct = (id: number): Promise<void> =>
  apiRequest<void>(`/config/products/${id}`, 'DELETE');

// ====== MEMBERSHIPS ======
export const getMemberships = (): Promise<Membership[]> => 
  apiRequest<Membership[]>('/config/memberships', 'GET');
export const saveMembership = (membership: Membership): Promise<Membership> =>
  membership.id && membership.id < 1000000
    ? apiRequest<Membership>(`/config/memberships/${membership.id}`, 'PUT', membership)
    : apiRequest<Membership>('/config/memberships', 'POST', membership);
export const deleteMembership = (id: number): Promise<void> =>
  apiRequest<void>(`/config/memberships/${id}`, 'DELETE');

// ====== SERVICE CATEGORIES ======
export const getServiceCategories = (): Promise<ServiceCategory[]> => 
  apiRequest<ServiceCategory[]>('/config/service-categories', 'GET');
export const saveServiceCategory = (category: ServiceCategory): Promise<ServiceCategory> =>
  category.id && category.id < 1000000
    ? apiRequest<ServiceCategory>(`/config/service-categories/${category.id}`, 'PUT', category)
    : apiRequest<ServiceCategory>('/config/service-categories', 'POST', category);
export const deleteServiceCategory = (id: number): Promise<void> =>
  apiRequest<void>(`/config/service-categories/${id}`, 'DELETE');

// ====== PRODUCT CATEGORIES ======
export const getProductCategories = (): Promise<ProductCategory[]> => 
  apiRequest<ProductCategory[]>('/config/product-categories', 'GET');
export const saveProductCategory = (category: ProductCategory): Promise<ProductCategory> =>
  category.id && category.id < 1000000
    ? apiRequest<ProductCategory>(`/config/product-categories/${category.id}`, 'PUT', category)
    : apiRequest<ProductCategory>('/config/product-categories', 'POST', category);
export const deleteProductCategory = (id: number): Promise<void> =>
  apiRequest<void>(`/config/product-categories/${id}`, 'DELETE');

// ====== EGRESO CATEGORIES ======
export const getEgresoCategories = (): Promise<EgresoCategory[]> => 
  apiRequest<EgresoCategory[]>('/config/egreso-categories', 'GET');
export const saveEgresoCategory = (category: EgresoCategory): Promise<EgresoCategory> =>
  category.id && category.id < 1000000
    ? apiRequest<EgresoCategory>(`/config/egreso-categories/${category.id}`, 'PUT', category)
    : apiRequest<EgresoCategory>('/config/egreso-categories', 'POST', category);
export const deleteEgresoCategory = (id: number): Promise<void> =>
  apiRequest<void>(`/config/egreso-categories/${id}`, 'DELETE');

// ====== JOB POSITIONS ======
export const getJobPositions = (): Promise<JobPosition[]> => 
  apiRequest<JobPosition[]>('/config/job-positions', 'GET');
export const saveJobPosition = (position: JobPosition): Promise<JobPosition> =>
  position.id && position.id < 1000000
    ? apiRequest<JobPosition>(`/config/job-positions/${position.id}`, 'PUT', position)
    : apiRequest<JobPosition>('/config/job-positions', 'POST', position);
export const deleteJobPosition = (id: number): Promise<void> =>
  apiRequest<void>(`/config/job-positions/${id}`, 'DELETE');

// ====== COMPROBANTES ======
export const getComprobantes = (): Promise<ComprobanteElectronico[]> => 
  apiRequest<ComprobanteElectronico[]>('/config/comprobantes', 'GET');
export const saveComprobante = (comprobante: ComprobanteElectronico): Promise<ComprobanteElectronico> =>
  comprobante.id && comprobante.id < 1000000
    ? apiRequest<ComprobanteElectronico>(`/config/comprobantes/${comprobante.id}`, 'PUT', comprobante)
    : apiRequest<ComprobanteElectronico>('/config/comprobantes', 'POST', comprobante);
export const deleteComprobante = (id: number): Promise<void> =>
  apiRequest<void>(`/config/comprobantes/${id}`, 'DELETE');

// ====== AI CONTENT GENERATION ======
export const generateAiContent = async (prompt: string): Promise<string> => {
  try {
    const response = await apiRequest<{ content: string }>('/ai/generate', 'POST', { prompt });
    return response.content;
  } catch (error) {
    console.error('Error generating AI content:', error);
    return 'Error al generar contenido con IA. Por favor, intenta nuevamente.';
  }
};

export const generateAiAnalysis = async (seguimientos: any[], paciente?: any): Promise<string> => {
  try {
    const response = await apiRequest<{ analysis: string }>('/ai/analysis', 'POST', { 
      seguimientos, 
      paciente 
    });
    return response.analysis;
  } catch (error) {
    console.error('Error generating AI analysis:', error);
    return 'Error al generar análisis con IA. Por favor, intenta nuevamente.';
  }
};
