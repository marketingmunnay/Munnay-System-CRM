import type { 
  Lead, Campaign, VentaExtra, Incidencia, Egreso, Proveedor, User, Role, 
  BusinessInfo, ClientSource, Service, Product, Membership, ServiceCategory,
  ProductCategory, ProductBrand, JobPosition, Publicacion, Seguidor, MetaCampaign, EgresoCategory,
  TipoProveedor, Goal, GoalProgress, ComprobanteElectronico, ConfiguracionProducto, MovimientoInventario,
  PagoProducto, AlertaStock, InventarioReporteResponse, Ambiente, Appointment,
  CreateAppointmentPayload, AvailabilityRequest, AvailabilitySlot, RecurringSeriesRequest,
  AppointmentStatus, SystemLog
} from '../types.ts';

export interface BulkImportEgresoResult {
  success: boolean;
  index: number;
  data?: Egreso;
  error?: string;
}

export interface BulkImportEgresosResponse {
  message: string;
  successCount: number;
  errorCount: number;
  egresos: BulkImportEgresoResult[];
}

export interface LoginResponse {
  token: string;
  user: User;
  refreshToken?: string;
  expiresIn?: number;
}

interface RefreshResponse {
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

// URL del backend en producción (Render)
const API_URL = "https://api.munnaymedicinaestetica.com/api";

const AUTH_TOKEN_KEY = 'munnay.authToken';
const AUTH_TOKEN_EXP_KEY = 'munnay.authTokenExpiresAt';
const REFRESH_TOKEN_KEY = 'munnay.authRefreshToken';
const TOKEN_EXP_SKEW_MS = 30 * 1000; // Renovar 30s antes de expirar
const isBrowser = typeof window !== 'undefined';

let refreshPromise: Promise<string | null> | null = null;

const safeDecodeBase64 = (input: string): string | null => {
  if (!input) return null;
  try {
    const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.length % 4 === 0 ? normalized : normalized + '='.repeat(4 - (normalized.length % 4));
    if (typeof window !== 'undefined' && typeof window.atob === 'function') {
      return window.atob(padded);
    }
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(padded, 'base64').toString('binary');
    }
  } catch {
    return null;
  }
  return null;
};

const deriveExpiryFromToken = (token: string): number | null => {
  const [, payload] = token.split('.');
  if (!payload) return null;
  const decoded = safeDecodeBase64(payload);
  if (!decoded) return null;
  try {
    const parsed = JSON.parse(decoded);
    if (typeof parsed?.exp === 'number') {
      return parsed.exp * 1000;
    }
  } catch {
    return null;
  }
  return null;
};

const persistExpiry = (token: string, expiresInSeconds?: number) => {
  if (!isBrowser) return;
  try {
    if (expiresInSeconds && expiresInSeconds > 0) {
      const expiresAt = Date.now() + expiresInSeconds * 1000;
      window.localStorage.setItem(AUTH_TOKEN_EXP_KEY, expiresAt.toString());
      return;
    }
    const derived = deriveExpiryFromToken(token);
    if (derived) {
      window.localStorage.setItem(AUTH_TOKEN_EXP_KEY, derived.toString());
    } else {
      window.localStorage.removeItem(AUTH_TOKEN_EXP_KEY);
    }
  } catch (error) {
    console.warn('No fue posible calcular la expiración del token', error);
  }
};

const clearExpiry = () => {
  if (!isBrowser) return;
  try {
    window.localStorage.removeItem(AUTH_TOKEN_EXP_KEY);
  } catch (error) {
    console.warn('No fue posible eliminar la expiración almacenada', error);
  }
};

export const getAuthTokenExpiry = (): number | null => {
  if (!isBrowser) return null;
  try {
    const raw = window.localStorage.getItem(AUTH_TOKEN_EXP_KEY);
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const isAuthTokenExpired = (): boolean => {
  const expiresAt = getAuthTokenExpiry();
  if (!expiresAt) return false;
  return Date.now() >= (expiresAt - TOKEN_EXP_SKEW_MS);
};

export const getAuthToken = (): string | null => {
  if (!isBrowser) return null;
  try {
    return window.localStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.warn('No fue posible leer el token almacenado', error);
    return null;
  }
};

export const setAuthToken = (token: string, expiresInSeconds?: number) => {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    persistExpiry(token, expiresInSeconds);
  } catch (error) {
    console.warn('No fue posible guardar el token', error);
  }
};

export const clearAuthToken = () => {
  if (!isBrowser) return;
  try {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    clearExpiry();
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.warn('No fue posible eliminar el token', error);
  }
};

export const getRefreshToken = (): string | null => {
  if (!isBrowser) return null;
  try {
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setRefreshToken = (token: string) => {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch (error) {
    console.warn('No fue posible guardar el refresh token', error);
  }
};

export const clearRefreshToken = () => {
  if (!isBrowser) return;
  try {
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.warn('No fue posible eliminar el refresh token', error);
  }
};

const performRefreshRequest = async (refreshToken: string): Promise<string | null> => {
  try {
    const response = await fetch(`${API_URL}/users/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error(`Refresh token inválido (${response.status})`);
    }

    const data: RefreshResponse = await response.json();
    setAuthToken(data.token, data.expiresIn);
    if (data.refreshToken) {
      setRefreshToken(data.refreshToken);
    }
    return data.token;
  } catch (error) {
    console.error('No se pudo refrescar el token', error);
    clearAuthToken();
    return null;
  }
};

const refreshAccessToken = async (): Promise<string | null> => {
  const storedRefresh = getRefreshToken();
  if (!storedRefresh) {
    clearAuthToken();
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshed = await performRefreshRequest(storedRefresh);
      refreshPromise = null;
      return refreshed;
    })();
  }
  return refreshPromise;
};

const ensureValidToken = async (): Promise<string | null> => {
  const token = getAuthToken();
  if (!token) return null;
  if (!isAuthTokenExpired()) {
    return token;
  }
  return refreshAccessToken();
};

// Helper genérico para requests
type ApiError = Error & { status?: number };

export const apiRequest = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  body?: any
): Promise<T> => {
  const requiresAuth = endpoint !== '/users/login' && endpoint !== '/users/refresh';
  const token = requiresAuth ? await ensureValidToken() : getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${API_URL}${endpoint}`, options);

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthToken();
    }
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    const error = new Error(errorData.message || 'Error en la petición a la API') as ApiError;
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return {} as T;
  return response.json();
};

// ====== LEADS ======
export const getLeads = (): Promise<Lead[]> => apiRequest<Lead[]>('/leads', 'GET');
export const getLead = (id: number): Promise<Lead> => apiRequest<Lead>(`/leads/${id}`, 'GET');
export const searchLeads = (query: string): Promise<Lead[]> => {
  const search = new URLSearchParams({ q: query }).toString();
  return apiRequest<Lead[]>(`/leads/search?${search}`, 'GET');
};
export const saveLead = (lead: Lead): Promise<Lead> =>
  // Database IDs are small autoincrement values (< 1000000), timestamps are much larger
  lead.id && lead.id < 1000000
    ? apiRequest<Lead>(`/leads/${lead.id}`, 'PUT', lead)
    : apiRequest<Lead>('/leads', 'POST', { ...lead, id: undefined });
export const deleteLead = (id: number): Promise<void> => 
  apiRequest<void>(`/leads/${id}`, 'DELETE');
export const getNextHistoryNumber = (): Promise<string> =>
  apiRequest<string>('/leads/next-history-number', 'GET');
export const bulkImportLeads = (leads: any[]): Promise<{ message: string; leads: Lead[] }> =>
  apiRequest<{ message: string; leads: Lead[] }>('/leads/bulk', 'POST', leads);

// ====== CAMPAIGNS ======
export const getCampaigns = (): Promise<Campaign[]> => apiRequest<Campaign[]>('/campaigns', 'GET');
export const saveCampaign = (campaign: Campaign): Promise<Campaign> =>
  campaign.id && campaign.id < 1000000
    ? apiRequest<Campaign>(`/campaigns/${campaign.id}`, 'PUT', campaign)
    : apiRequest<Campaign>('/campaigns', 'POST', campaign);
export const deleteCampaign = (id: number): Promise<void> =>
  apiRequest<void>(`/campaigns/${id}`, 'DELETE');
export const bulkImportCampaigns = (campaigns: any[]): Promise<{ message: string; campaigns: Campaign[] }> =>
  apiRequest<{ message: string; campaigns: Campaign[] }>('/campaigns/bulk', 'POST', campaigns);

// ====== META CAMPAIGNS ======
export const getMetaCampaigns = (): Promise<MetaCampaign[]> => 
  apiRequest<MetaCampaign[]>('/campaigns/meta', 'GET');
export const saveMetaCampaign = (campaign: MetaCampaign): Promise<MetaCampaign> =>
  campaign.id && campaign.id < 1000000
    ? apiRequest<MetaCampaign>(`/campaigns/meta/${campaign.id}`, 'PUT', campaign)
    : apiRequest<MetaCampaign>('/campaigns/meta', 'POST', campaign);
export const deleteMetaCampaign = (id: number): Promise<void> =>
  apiRequest<void>(`/campaigns/meta/${id}`, 'DELETE');
export const bulkImportMetaCampaigns = (metaCampaigns: any[]): Promise<{ message: string; metaCampaigns: MetaCampaign[] }> =>
  apiRequest<{ message: string; metaCampaigns: MetaCampaign[] }>('/campaigns/meta/bulk', 'POST', metaCampaigns);

// ====== VENTAS EXTRA ======
export const getVentasExtra = (): Promise<VentaExtra[]> => 
  apiRequest<VentaExtra[]>('/ventas-extra', 'GET');
export const saveVentaExtra = (venta: VentaExtra): Promise<VentaExtra> =>
  venta.id && venta.id < 1000000
    ? apiRequest<VentaExtra>(`/ventas-extra/${venta.id}`, 'PUT', venta)
    : apiRequest<VentaExtra>('/ventas-extra', 'POST', venta);
export const deleteVentaExtra = (id: number): Promise<void> =>
  apiRequest<void>(`/ventas-extra/${id}`, 'DELETE');
export const bulkImportVentasExtra = (ventas: any[]): Promise<{ message: string; ventas: VentaExtra[] }> =>
  apiRequest<{ message: string; ventas: VentaExtra[] }>('/ventas-extra/bulk', 'POST', ventas);

// ====== INCIDENCIAS ======
export const getIncidencias = (): Promise<Incidencia[]> => 
  apiRequest<Incidencia[]>('/incidencias', 'GET');
export const saveIncidencia = (incidencia: Incidencia): Promise<Incidencia> =>
  incidencia.id && incidencia.id < 1000000
    ? apiRequest<Incidencia>(`/incidencias/${incidencia.id}`, 'PUT', incidencia)
    : apiRequest<Incidencia>('/incidencias', 'POST', incidencia);
export const deleteIncidencia = (id: number): Promise<void> =>
  apiRequest<void>(`/incidencias/${id}`, 'DELETE');
export const bulkImportIncidencias = (incidencias: any[]): Promise<{ message: string; incidencias: Incidencia[] }> =>
  apiRequest<{ message: string; incidencias: Incidencia[] }>('/incidencias/bulk', 'POST', incidencias);

// ====== EGRESOS ======
export const getEgresos = (): Promise<Egreso[]> => 
  apiRequest<Egreso[]>('/expenses', 'GET');
export const saveEgreso = (egreso: Egreso): Promise<Egreso> =>
  egreso.id && egreso.id < 1000000
    ? apiRequest<Egreso>(`/expenses/${egreso.id}`, 'PUT', egreso)
    : apiRequest<Egreso>('/expenses', 'POST', egreso);
export const deleteEgreso = (id: number): Promise<void> =>
  apiRequest<void>(`/expenses/${id}`, 'DELETE');
export const bulkImportEgresos = (egresos: any[]): Promise<BulkImportEgresosResponse> =>
  apiRequest<BulkImportEgresosResponse>('/expenses/bulk', 'POST', egresos);

// ====== PROVEEDORES ======
export const getProveedores = (): Promise<Proveedor[]> => 
  apiRequest<Proveedor[]>('/proveedores', 'GET');
export const saveProveedor = (proveedor: Proveedor): Promise<Proveedor> =>
  proveedor.id && proveedor.id < 1000000
    ? apiRequest<Proveedor>(`/proveedores/${proveedor.id}`, 'PUT', proveedor)
    : apiRequest<Proveedor>('/proveedores', 'POST', { ...proveedor, id: undefined });
export const deleteProveedor = (id: number): Promise<void> =>
  apiRequest<void>(`/proveedores/${id}`, 'DELETE');
export const bulkImportProveedores = (proveedores: any[]): Promise<{ message: string; proveedores: Proveedor[] }> =>
  apiRequest<{ message: string; proveedores: Proveedor[] }>('/proveedores/bulk', 'POST', proveedores);

// ====== TIPOS DE PROVEEDOR ======
export const getTiposProveedor = (): Promise<TipoProveedor[]> => 
  apiRequest<TipoProveedor[]>('/proveedores/tipos', 'GET');
export const saveTipoProveedor = (tipo: TipoProveedor): Promise<TipoProveedor> =>
  tipo.id && tipo.id < 1000000
    ? apiRequest<TipoProveedor>(`/proveedores/tipos/${tipo.id}`, 'PUT', tipo)
    : apiRequest<TipoProveedor>('/proveedores/tipos', 'POST', { ...tipo, id: undefined });
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
export const bulkImportPublicaciones = (publicaciones: any[]): Promise<{ message: string; publicaciones: Publicacion[] }> =>
  apiRequest<{ message: string; publicaciones: Publicacion[] }>('/publicaciones/bulk', 'POST', publicaciones);

// ====== SEGUIDORES ======
export const getSeguidores = (): Promise<Seguidor[]> => 
  apiRequest<Seguidor[]>('/seguidores', 'GET');
export const saveSeguidor = (seguidor: Seguidor): Promise<Seguidor> =>
  seguidor.id && seguidor.id < 1000000
    ? apiRequest<Seguidor>(`/seguidores/${seguidor.id}`, 'PUT', seguidor)
    : apiRequest<Seguidor>('/seguidores', 'POST', seguidor);
export const deleteSeguidor = (id: number): Promise<void> =>
  apiRequest<void>(`/seguidores/${id}`, 'DELETE');
export const bulkImportSeguidores = (seguidores: any[]): Promise<{ message: string; seguidores: Seguidor[] }> =>
  apiRequest<{ message: string; seguidores: Seguidor[] }>('/seguidores/bulk', 'POST', seguidores);

// ====== USERS ======
export const getUsers = (): Promise<User[]> => 
  apiRequest<User[]>('/users', 'GET');

// ====== SELLERS (Recepcionistas y Call Center) ======
export const getSellers = (): Promise<User[]> => 
  apiRequest<User[]>('/users/sellers', 'GET');
export const saveUser = (user: User): Promise<User> =>
  user.id && user.id < 1000000
    ? apiRequest<User>(`/users/${user.id}`, 'PUT', user)
    : apiRequest<User>('/users', 'POST', user);
export const deleteUser = (id: number): Promise<void> =>
  apiRequest<void>(`/users/${id}`, 'DELETE');

export const login = (usuario: string, password: string): Promise<LoginResponse> =>
  apiRequest<LoginResponse>('/users/login', 'POST', { usuario, password });

export const getCurrentUser = (): Promise<User> =>
  apiRequest<User>('/users/me', 'GET');

// ====== ROLES ======
export const getRoles = (): Promise<Role[]> => 
  apiRequest<Role[]>('/roles', 'GET');

type RolePayload = Partial<Role> & { id?: number };

export const saveRole = (role: RolePayload): Promise<Role> => {
  const hasPersistedId = typeof role.id === 'number' && role.id > 0;

  if (hasPersistedId) {
    return apiRequest<Role>(`/roles/${role.id}`, 'PUT', role);
  }

  const { id: _tempId, ...createData } = role;
  return apiRequest<Role>('/roles', 'POST', createData);
};

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
export const getGoalProgress = (userId: number, period?: string, date?: string): Promise<GoalProgress[]> => {
  const params = new URLSearchParams();
  if (period) params.set('period', period);
  if (date) params.set('date', date);
  const qs = params.toString();
  return apiRequest<GoalProgress[]>(`/goals/progress/${userId}${qs ? '?' + qs : ''}`, 'GET');
};

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

// ====== MIGRATIONS ======
export const migrateServiceColumns = (): Promise<{ message: string; migrated: boolean }> =>
  apiRequest<{ message: string; migrated: boolean }>('/config/migrate-service-columns', 'POST');

// ====== SERVICES ======
export const getServices = (): Promise<Service[]> => 
  apiRequest<Service[]>('/config/services', 'GET');
export const saveService = (service: Service): Promise<Service> =>
  service.id && service.id < 1000000
    ? apiRequest<Service>(`/config/services/${service.id}`, 'PUT', service)
    : apiRequest<Service>('/config/services', 'POST', service);
export const deleteService = (id: number): Promise<void> =>
  apiRequest<void>(`/config/services/${id}`, 'DELETE');
export const bulkImportServices = (services: any[]): Promise<{ message: string; services: Service[] }> =>
  apiRequest<{ message: string; services: Service[] }>('/config/services/bulk', 'POST', services);

// ====== PRODUCTS ======
export const getProducts = (): Promise<Product[]> => 
  apiRequest<Product[]>('/config/products', 'GET');
export const saveProduct = (product: Product): Promise<Product> =>
  product.id && product.id < 1000000
    ? apiRequest<Product>(`/config/products/${product.id}`, 'PUT', product)
    : apiRequest<Product>('/config/products', 'POST', product);
export const deleteProduct = (id: number): Promise<void> =>
  apiRequest<void>(`/config/products/${id}`, 'DELETE');
export const bulkImportProducts = (products: any[]): Promise<{ message: string; products: Product[] }> =>
  apiRequest<{ message: string; products: Product[] }>('/config/products/bulk', 'POST', products);

// ====== MEMBERSHIPS ======
export const getMemberships = (): Promise<Membership[]> => 
  apiRequest<Membership[]>('/config/memberships', 'GET');
export const saveMembership = (membership: Membership): Promise<Membership> =>
  membership.id && membership.id < 1000000
    ? apiRequest<Membership>(`/config/memberships/${membership.id}`, 'PUT', membership)
    : apiRequest<Membership>('/config/memberships', 'POST', membership);
export const deleteMembership = (id: number): Promise<void> =>
  apiRequest<void>(`/config/memberships/${id}`, 'DELETE');
export const bulkImportMemberships = (memberships: any[]): Promise<{ message: string; memberships: Membership[] }> =>
  apiRequest<{ message: string; memberships: Membership[] }>('/config/memberships/bulk', 'POST', memberships);

// ====== SERVICE CATEGORIES ======
export const getServiceCategories = (): Promise<ServiceCategory[]> => 
  apiRequest<ServiceCategory[]>('/config/service-categories', 'GET');
export const saveServiceCategory = (category: ServiceCategory): Promise<ServiceCategory> =>
  category.id && category.id < 1000000
    ? apiRequest<ServiceCategory>(`/config/service-categories/${category.id}`, 'PUT', category)
    : apiRequest<ServiceCategory>('/config/service-categories', 'POST', category);
export const deleteServiceCategory = (id: number): Promise<void> =>
  apiRequest<void>(`/config/service-categories/${id}`, 'DELETE');
export const bulkImportServiceCategories = (categories: any[]): Promise<{ message: string; categories: ServiceCategory[] }> =>
  apiRequest<{ message: string; categories: ServiceCategory[] }>('/config/service-categories/bulk', 'POST', categories);

// ====== PRODUCT CATEGORIES ======
export const getProductCategories = (): Promise<ProductCategory[]> => 
  apiRequest<ProductCategory[]>('/config/product-categories', 'GET');
export const saveProductCategory = (category: ProductCategory): Promise<ProductCategory> =>
  category.id && category.id < 1000000
    ? apiRequest<ProductCategory>(`/config/product-categories/${category.id}`, 'PUT', category)
    : apiRequest<ProductCategory>('/config/product-categories', 'POST', category);
export const deleteProductCategory = (id: number): Promise<void> =>
  apiRequest<void>(`/config/product-categories/${id}`, 'DELETE');
export const bulkImportProductCategories = (categories: any[]): Promise<{ message: string; categories: ProductCategory[] }> =>
  apiRequest<{ message: string; categories: ProductCategory[] }>('/config/product-categories/bulk', 'POST', categories);

// ====== PRODUCT BRANDS ======
export const getProductBrands = async (): Promise<ProductBrand[]> => {
  try {
    return await apiRequest<ProductBrand[]>('/config/product-brands', 'GET');
  } catch (error) {
    const status = (error as ApiError)?.status;
    if (status === 404) {
      console.warn('Endpoint /config/product-brands no disponible, devolviendo lista vacía.');
      return [];
    }
    throw error;
  }
};
export const saveProductBrand = (brand: ProductBrand): Promise<ProductBrand> =>
  brand.id && brand.id < 1000000
    ? apiRequest<ProductBrand>(`/config/product-brands/${brand.id}`, 'PUT', brand)
    : apiRequest<ProductBrand>('/config/product-brands', 'POST', brand);
export const deleteProductBrand = (id: number): Promise<void> =>
  apiRequest<void>(`/config/product-brands/${id}`, 'DELETE');

// ====== EGRESO CATEGORIES ======
export const getEgresoCategories = (): Promise<EgresoCategory[]> => 
  apiRequest<EgresoCategory[]>('/config/egreso-categories', 'GET');
export const saveEgresoCategory = (category: EgresoCategory): Promise<EgresoCategory> =>
  category.id && category.id < 1000000
    ? apiRequest<EgresoCategory>(`/config/egreso-categories/${category.id}`, 'PUT', category)
    : apiRequest<EgresoCategory>('/config/egreso-categories', 'POST', category);
export const deleteEgresoCategory = (id: number): Promise<void> =>
  apiRequest<void>(`/config/egreso-categories/${id}`, 'DELETE');
export const bulkImportEgresoCategories = (categories: any[]): Promise<{ message: string; categories: EgresoCategory[] }> =>
  apiRequest<{ message: string; categories: EgresoCategory[] }>('/config/egreso-categories/bulk', 'POST', categories);

// ====== JOB POSITIONS ======
export const getJobPositions = (): Promise<JobPosition[]> => 
  apiRequest<JobPosition[]>('/config/job-positions', 'GET');
export const saveJobPosition = (position: JobPosition): Promise<JobPosition> =>
  position.id && position.id < 1000000
    ? apiRequest<JobPosition>(`/config/job-positions/${position.id}`, 'PUT', position)
    : apiRequest<JobPosition>('/config/job-positions', 'POST', position);
export const deleteJobPosition = (id: number): Promise<void> =>
  apiRequest<void>(`/config/job-positions/${id}`, 'DELETE');
export const bulkImportJobPositions = (positions: any[]): Promise<{ message: string; positions: JobPosition[] }> =>
  apiRequest<{ message: string; positions: JobPosition[] }>('/config/job-positions/bulk', 'POST', positions);

// ====== COMPROBANTES ======
export const getComprobantes = (): Promise<ComprobanteElectronico[]> => 
  apiRequest<ComprobanteElectronico[]>('/config/comprobantes', 'GET');
export const saveComprobante = (comprobante: ComprobanteElectronico): Promise<ComprobanteElectronico> =>
  comprobante.id && comprobante.id < 1000000
    ? apiRequest<ComprobanteElectronico>(`/config/comprobantes/${comprobante.id}`, 'PUT', comprobante)
    : apiRequest<ComprobanteElectronico>('/config/comprobantes', 'POST', comprobante);
export const deleteComprobante = (id: number): Promise<void> =>
  apiRequest<void>(`/config/comprobantes/${id}`, 'DELETE');
export const bulkImportComprobantes = (comprobantes: any[]): Promise<{ message: string; comprobantes: ComprobanteElectronico[] }> =>
  apiRequest<{ message: string; comprobantes: ComprobanteElectronico[] }>('/config/comprobantes/bulk', 'POST', comprobantes);

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

// ====== INVENTARIO INTELIGENTE ======

// Configuración de productos
export const getConfiguracionProducto = (productoId: number): Promise<ConfiguracionProducto> =>
  apiRequest<ConfiguracionProducto>(`/inventory/configuracion/${productoId}`, 'GET');

export const crearConfiguracionProducto = (data: any): Promise<ConfiguracionProducto> =>
  apiRequest<ConfiguracionProducto>('/inventory/configuracion', 'POST', data);

export const actualizarConfiguracionProducto = (id: number, data: any): Promise<ConfiguracionProducto> =>
  apiRequest<ConfiguracionProducto>(`/inventory/configuracion/${id}`, 'PUT', data);

// Movimientos de inventario
export const registrarMovimiento = (data: any): Promise<MovimientoInventario> =>
  apiRequest<MovimientoInventario>('/inventory/movimientos', 'POST', data);

export const getMovimientos = (configuracionProductoId?: number): Promise<MovimientoInventario[]> =>
  apiRequest<MovimientoInventario[]>(`/inventory/movimientos${configuracionProductoId ? `?configuracionProductoId=${configuracionProductoId}` : ''}`, 'GET');

// Pagos parciales y prepagos
export const crearPagoProducto = (data: any): Promise<PagoProducto> =>
  apiRequest<PagoProducto>('/inventory/pagos', 'POST', data);

export const abonarPagoProducto = (id: number, data: any): Promise<PagoProducto> =>
  apiRequest<PagoProducto>(`/inventory/pagos/${id}/abonar`, 'POST', data);

export const entregarProducto = (id: number, data: any = {}): Promise<PagoProducto> =>
  apiRequest<PagoProducto>(`/inventory/pagos/${id}/entregar`, 'POST', data);

export const getPagosProductos = (params?: { nHistoria?: string; estadoPago?: string; estadoProducto?: string }): Promise<PagoProducto[]> => {
  const query = params
    ? '?' + new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined) as [string, string][]).toString()
    : '';
  return apiRequest<PagoProducto[]>(`/inventory/pagos${query}`, 'GET');
};

export const eliminarPagoProducto = (id: number): Promise<void> =>
  apiRequest<void>(`/inventory/pagos/${id}`, 'DELETE');

// Alertas
export const getAlertas = (params?: { visto?: boolean; resuelto?: boolean }): Promise<AlertaStock[]> => {
  const query = params
    ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]) as [string, string][]).toString()
    : '';
  return apiRequest<AlertaStock[]>(`/inventory/alertas${query}`, 'GET');
};

export const marcarAlertaVista = (id: number): Promise<AlertaStock> =>
  apiRequest<AlertaStock>(`/inventory/alertas/${id}/vista`, 'PATCH');

export const resolverAlerta = (id: number): Promise<AlertaStock> =>
  apiRequest<AlertaStock>(`/inventory/alertas/${id}/resolver`, 'PATCH');

// Reportes
export const getReporteInventario = (): Promise<InventarioReporteResponse> =>
  apiRequest<InventarioReporteResponse>('/inventory/reporte', 'GET');

// ====== CALENDARIO Y CITAS ======

interface AvailabilityResponse {
  isAvailable: boolean;
  slots: AvailabilitySlot[];
  suggestions: Array<{ fecha: string; horaInicio: string; profesionalId?: string; ambienteId?: number }>;
}


export const getAppointments = (start?: string, end?: string, professionalId?: string): Promise<Appointment[]> => {
    const params = new URLSearchParams();
    if (start) params.append('start', start);
    if (end) params.append('end', end);
    if (professionalId) params.append('professionalId', professionalId);
    return apiRequest<Appointment[]>(`/calendar/appointments?${params.toString()}`, 'GET');
};

export const getResources = (): Promise<{id: number|string, nombre: string, tipo: string, users?: any[]}[]> =>
  apiRequest<{id: number|string, nombre: string, tipo: string, users?: any[]}[]>('/calendar/resources', 'GET');

export const createResource = (data: any): Promise<any> =>
  apiRequest('/calendar/resources', 'POST', data);

export const updateResource = (id: string | number, data: any): Promise<any> =>
  apiRequest(`/calendar/resources/${id}`, 'PUT', data);

export const deleteResource = (id: string | number): Promise<void> =>
  apiRequest(`/calendar/resources/${id}`, 'DELETE');

export const getAmbientes = (): Promise<Ambiente[]> =>
  apiRequest<Ambiente[]>('/calendar/ambientes', 'GET');

export const getAvailability = (params: AvailabilityRequest): Promise<AvailabilityResponse> => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach(item => queryParams.append(key, String(item)));
    } else {
      queryParams.append(key, String(value));
    }
  });
  const qs = queryParams.toString();
  return apiRequest<AvailabilityResponse>(`/calendar/availability${qs ? `?${qs}` : ''}`, 'GET');
};

export const createAppointment = (payload: CreateAppointmentPayload): Promise<Appointment> =>
  apiRequest<Appointment>('/calendar/appointments', 'POST', payload);

export const updateAppointment = (id: number, payload: Partial<CreateAppointmentPayload>): Promise<Appointment> =>
  apiRequest<Appointment>(`/calendar/appointments/${id}`, 'PUT', payload);

export const updateAppointmentStatus = (id: number, status: AppointmentStatus): Promise<Appointment> =>
  apiRequest<Appointment>(`/calendar/appointments/${id}/status`, 'PATCH', { status });

export const rescheduleAppointment = (
  id: number,
  data: { fecha: string; horaInicio: string; duracionMinutos?: number; profesionalId?: string; ambienteId?: number }
): Promise<Appointment> =>
  apiRequest<Appointment>(`/calendar/appointments/${id}/reschedule`, 'POST', data);

export const createRecurringSeries = (payload: RecurringSeriesRequest): Promise<Appointment[]> =>
  apiRequest<Appointment[]>('/calendar/appointments/series', 'POST', payload);

export const sendAppointmentConfirmation = (
  appointmentId: number,
  channels: Array<'whatsapp' | 'email'>
): Promise<{ status: string }> =>
  apiRequest<{ status: string }>(`/calendar/appointments/${appointmentId}/confirm`, 'POST', { channels });

// ====== SHIFTS ======

export const getShiftByUserAndDate = (userId: number, date: string): Promise<any> =>
  apiRequest<any>(`/shifts/user/${userId}/date/${date}`, 'GET');

// ====== AUDITORÍA Y LOGS ======

export const getSystemLogs = (range?: 'hoy' | 'semana' | 'mes', module?: string, search?: string): Promise<SystemLog[]> => {
  const queryParams = new URLSearchParams();
  if (range) queryParams.append('range', range);
  if (module) queryParams.append('module', module);
  if (search) queryParams.append('search', search);

  const queryString = queryParams.toString();
  return apiRequest<SystemLog[]>(`/audit${queryString ? `?${queryString}` : ''}`, 'GET');
};
