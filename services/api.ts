import { GoogleGenAI } from "@google/genai";
import type { 
    Lead, Campaign, VentaExtra, Incidencia, Egreso, Proveedor, User, Role, 
    BusinessInfo, ClientSource, Service, Product, Membership, ServiceCategory,
    ProductCategory, JobPosition, Publicacion, Seguidor, MetaCampaign, EgresoCategory,
    TipoProveedor,
    Goal, ComprobanteElectronico
} from '../types.ts';

// ===================================================================================
// ¡IMPORTANTE PARA LA PUESTA EN PRODUCCIÓN (HOSTING)!
// ===================================================================================
// Cuando despliegues el backend en un servicio de hosting (como Google Cloud Run),
// obtendrás una URL pública (ej: https://crm-munnay-backend-xyz.a.run.app).
//
// **DEBES REEMPLAZAR 'http://localhost:4000' POR ESA URL PÚBLICA.**
//
// Ejemplo: const API_URL = 'https://crm-munnay-backend-xyz.a.run.app/api'; // <--- ASÍ DEBERÍA QUEDAR
//
// Mientras tanto, se mantiene 'localhost' para que las pruebas locales sigan funcionando.
const API_URL =  process.env.NEXT_PUBLIC_API_URL ||  "https://munnay-system-crm-156279657697.europe-west1.run.app/api";


const apiRequest = async <T>(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: any): Promise<T> => {
    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${endpoint}`, options);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'Error en la petición a la API');
    }
    
    if (response.status === 204) { // No Content
        return {} as T;
    }

    return response.json();
};


// --- LIVE API IMPLEMENTATION ---

// Leads
export const getLeads = (): Promise<Lead[]> => apiRequest<Lead[]>('/leads', 'GET');

export const saveLead = (lead: Lead): Promise<Lead> => {
    // A simple check to see if it's a new lead with a temporary frontend ID
    if (String(lead.id).length > 7) { 
        const { id, ...leadToCreate } = lead;
        return apiRequest<Lead>('/leads', 'POST', leadToCreate);
    }
    return apiRequest<Lead>(`/leads/${lead.id}`, 'PUT', lead);
};

export const deleteLead = (leadId: number): Promise<void> => apiRequest(`/leads/${leadId}`, 'DELETE');

// FIX: Added getNextHistoryNumber function
export const getNextHistoryNumber = (): Promise<string> => apiRequest<string>('/leads/next-history-number', 'GET');


// Campaigns
export const getCampaigns = (): Promise<Campaign[]> => apiRequest<Campaign[]>('/campaigns', 'GET');
export const saveCampaign = (campaign: Campaign): Promise<Campaign> => {
    if (String(campaign.id).length > 7) {
        const { id, ...data } = campaign;
        return apiRequest<Campaign>('/campaigns', 'POST', data);
    }
    return apiRequest<Campaign>(`/campaigns/${campaign.id}`, 'PUT', campaign);
};
export const deleteCampaign = (campaignId: number): Promise<void> => apiRequest(`/campaigns/${campaignId}`, 'DELETE');

// MetaCampaigns
export const getMetaCampaigns = (): Promise<MetaCampaign[]> => apiRequest<MetaCampaign[]>('/campaigns/meta', 'GET');
export const saveMetaCampaign = (campaign: MetaCampaign): Promise<MetaCampaign> => {
    if (String(campaign.id).length > 7) {
        const { id, ...data } = campaign;
        return apiRequest<MetaCampaign>('/campaigns/meta', 'POST', data);
    }
    return apiRequest<MetaCampaign>(`/campaigns/meta/${campaign.id}`, 'PUT', campaign);
};
export const deleteMetaCampaign = (campaignId: number): Promise<void> => apiRequest(`/campaigns/meta/${campaignId}`, 'DELETE');

// Egresos
export const getEgresos = (): Promise<Egreso[]> => apiRequest<Egreso[]>('/expenses', 'GET');
export const saveEgreso = (egreso: Egreso): Promise<Egreso> => {
    if (String(egreso.id).length > 7) {
        const { id, ...data } = egreso;
        return apiRequest<Egreso>('/expenses', 'POST', data);
    }
    return apiRequest<Egreso>(`/expenses/${egreso.id}`, 'PUT', egreso);
};
export const deleteEgreso = (egresoId: number): Promise<void> => apiRequest(`/expenses/${egresoId}`, 'DELETE');

// Roles
export const getRoles = (): Promise<Role[]> => apiRequest<Role[]>('/roles', 'GET');
export const saveRole = (role: Role): Promise<Role> => {
    if (String(role.id).length > 7) {
        const { id, ...data } = role;
        return apiRequest<Role>('/roles', 'POST', data);
    }
    return apiRequest<Role>(`/roles/${role.id}`, 'PUT', role);
};
export const deleteRole = (roleId: number): Promise<void> => apiRequest(`/roles/${roleId}`, 'DELETE');

// Publicaciones
export const getPublicaciones = (): Promise<Publicacion[]> => apiRequest<Publicacion[]>('/publicaciones', 'GET');
export const savePublicacion = (pub: Publicacion): Promise<Publicacion> => {
    if (String(pub.id).length > 7) {
        const { id, ...data } = pub;
        return apiRequest<Publicacion>('/publicaciones', 'POST', data);
    }
    return apiRequest<Publicacion>(`/publicaciones/${pub.id}`, 'PUT', pub);
};
export const deletePublicacion = (pubId: number): Promise<void> => apiRequest(`/publicaciones/${pubId}`, 'DELETE');

// Seguidores
export const getSeguidores = (): Promise<Seguidor[]> => apiRequest<Seguidor[]>('/seguidores', 'GET');
export const saveSeguidor = (seg: Seguidor): Promise<Seguidor> => {
    if (String(seg.id).length > 7) {
        const { id, ...data } = seg;
        return apiRequest<Seguidor>('/seguidores', 'POST', data);
    }
    return apiRequest<Seguidor>(`/seguidores/${seg.id}`, 'PUT', seg);
};
export const deleteSeguidor = (segId: number): Promise<void> => apiRequest(`/seguidores/${segId}`, 'DELETE');

// Ventas Extra
export const getVentasExtra = (): Promise<VentaExtra[]> => apiRequest<VentaExtra[]>('/ventas-extra', 'GET');
export const saveVentaExtra = (venta: VentaExtra): Promise<VentaExtra> => {
    if (String(venta.id).length > 7) {
        const { id, ...data } = venta;
        return apiRequest<VentaExtra>('/ventas-extra', 'POST', data);
    }
    return apiRequest<VentaExtra>(`/ventas-extra/${venta.id}`, 'PUT', venta);
};
export const deleteVentaExtra = (ventaId: number): Promise<void> => apiRequest(`/ventas-extra/${ventaId}`, 'DELETE');

// Incidencias
export const getIncidencias = (): Promise<Incidencia[]> => apiRequest<Incidencia[]>('/incidencias', 'GET');
export const saveIncidencia = (incidencia: Incidencia): Promise<Incidencia> => {
    if (String(incidencia.id).length > 7) {
        const { id, ...data } = incidencia;
        return apiRequest<Incidencia>('/incidencias', 'POST', data);
    }
    return apiRequest<Incidencia>(`/incidencias/${incidencia.id}`, 'PUT', incidencia);
};
export const deleteIncidencia = (incidenciaId: number): Promise<void> => apiRequest(`/incidencias/${incidenciaId}`, 'DELETE');

// Proveedores
export const getProveedores = (): Promise<Proveedor[]> => apiRequest<Proveedor[]>('/proveedores', 'GET');
export const saveProveedor = (proveedor: Proveedor): Promise<Proveedor> => {
    if (String(proveedor.id).length > 7) {
        const { id, ...data } = proveedor;
        return apiRequest<Proveedor>('/proveedores', 'POST', data);
    }
    return apiRequest<Proveedor>(`/proveedores/${proveedor.id}`, 'PUT', proveedor);
};
export const deleteProveedor = (proveedorId: number): Promise<void> => apiRequest(`/proveedores/${proveedorId}`, 'DELETE');

// Tipos de Proveedor
export const getTiposProveedor = (): Promise<TipoProveedor[]> => apiRequest<TipoProveedor[]>('/proveedores/tipos', 'GET');
export const saveTipoProveedor = (tipo: TipoProveedor): Promise<TipoProveedor> => {
    if (String(tipo.id).length > 7) {
        const { id, ...data } = tipo;
        return apiRequest<TipoProveedor>('/proveedores/tipos', 'POST', data);
    }
    return apiRequest<TipoProveedor>(`/proveedores/tipos/${tipo.id}`, 'PUT', tipo);
};
export const deleteTipoProveedor = (id: number): Promise<void> => apiRequest(`/proveedores/tipos/${id}`, 'DELETE');

// Users
export const getUsers = (): Promise<User[]> => apiRequest<User[]>('/users', 'GET');
export const saveUser = (user: User): Promise<User> => {
    if (String(user.id).length > 7) {
        const { id, ...data } = user;
        return apiRequest<User>('/users', 'POST', data);
    }
    return apiRequest<User>(`/users/${user.id}`, 'PUT', user);
};
export const deleteUser = (userId: number): Promise<void> => apiRequest(`/users/${userId}`, 'DELETE');

// Comprobantes Electronicos
export const getComprobantes = (): Promise<ComprobanteElectronico[]> => apiRequest<ComprobanteElectronico[]>('/comprobantes', 'GET');
export const saveComprobante = (comprobante: ComprobanteElectronico): Promise<ComprobanteElectronico> => {
    if (String(comprobante.id).length > 7) {
        const { id, ...data } = comprobante;
        return apiRequest<ComprobanteElectronico>('/comprobantes', 'POST', data);
    }
    return apiRequest<ComprobanteElectronico>(`/comprobantes/${comprobante.id}`, 'PUT', comprobante);
};
export const deleteComprobante = (comprobanteId: number): Promise<void> => apiRequest(`/comprobantes/${comprobanteId}`, 'DELETE');


// Generic Config Handlers
const createConfigApi = <T extends { id: number, nombre?: string }>(endpoint: string) => ({
    getAll: (): Promise<T[]> => apiRequest<T[]>(`/config/${endpoint}`, 'GET'),
    save: (item: T): Promise<T> => {
        if (String(item.id).length > 7) {
            const { id, ...data } = item;
            return apiRequest<T>(`/config/${endpoint}`, 'POST', data);
        }
        return apiRequest<T>(`/config/${endpoint}/${item.id}`, 'PUT', item);
    },
    delete: (id: number): Promise<void> => apiRequest(`/config/${endpoint}/${id}`, 'DELETE'),
});

const businessInfoApi = {
    get: (): Promise<BusinessInfo> => apiRequest<BusinessInfo>('/config/business-info', 'GET'),
    save: (info: BusinessInfo): Promise<BusinessInfo> => apiRequest<BusinessInfo>('/config/business-info', 'PUT', info),
};


export const getBusinessInfo = businessInfoApi.get;
export const saveBusinessInfo = businessInfoApi.save;

const clientSourceApi = createConfigApi<ClientSource>('client-sources');
export const getClientSources = clientSourceApi.getAll;
export const saveClientSource = clientSourceApi.save;
export const deleteClientSource = clientSourceApi.delete;

const serviceApi = createConfigApi<Service>('services');
export const getServices = serviceApi.getAll;
export const saveService = serviceApi.save;
export const deleteService = serviceApi.delete;

const productApi = createConfigApi<Product>('products');
export const getProducts = productApi.getAll;
export const saveProduct = productApi.save;
export const deleteProduct = productApi.delete;

const membershipApi = createConfigApi<Membership>('memberships');
export const getMemberships = membershipApi.getAll;
export const saveMembership = membershipApi.save;
export const deleteMembership = membershipApi.delete;

const serviceCategoryHandlers = createConfigApi<ServiceCategory>('service-categories');
export const getServiceCategories = serviceCategoryHandlers.getAll;
export const saveServiceCategory = serviceCategoryHandlers.save;
export const deleteServiceCategory = serviceCategoryHandlers.delete;

const productCategoryHandlers = createConfigApi<ProductCategory>('product-categories');
export const getProductCategories = productCategoryHandlers.getAll;
export const saveProductCategory = productCategoryHandlers.save;
export const deleteProductCategory = productCategoryHandlers.delete;

const egresoCategoryApi = createConfigApi<EgresoCategory>('egreso-categories');
export const getEgresoCategories = egresoCategoryApi.getAll;
// FIX: Changed to `saveEgresoCategory` to match the `createConfigApi` return type.
export const saveEgresoCategory = egresoCategoryApi.save;
export const deleteEgresoCategory = egresoCategoryApi.delete;

const jobPositionApi = createConfigApi<JobPosition>('job-positions');
export const getJobPositions = jobPositionApi.getAll;
// FIX: Changed to `saveJobPosition` to match the `createConfigApi` return type.
export const saveJobPosition = jobPositionApi.save;
export const deleteJobPosition = jobPositionApi.delete;

// Goals
export const getGoals = (): Promise<Goal[]> => apiRequest<Goal[]>('/goals', 'GET');
export const saveGoal = (goal: Goal): Promise<Goal> => {
    if (String(goal.id).length > 7) {
        const { id, ...data } = goal;
        return apiRequest<Goal>('/goals', 'POST', data);
    }
    return apiRequest<Goal>(`/goals/${goal.id}`, 'PUT', goal);
};
export const deleteGoal = (goalId: number): Promise<void> => apiRequest(`/goals/${goalId}`, 'DELETE');


// AI function is common for both environments
export const generateAiContent = async (prompt: string): Promise<string> => {
    try {
        if (!process.env.API_KEY) {
            console.error("API key for Google GenAI is not set.");
            return "Error: La clave de API no está configurada.";
        }
        // FIX: Corrected API call to use ai.models.generateContent with contents.parts structure and correct model.
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', // Corrected model name as per guidelines
            contents: [{ parts: [{text: prompt}] }], // Corrected structure as per guidelines
        });

        // Use .text directly as per new guidelines
        return response.text;
    } catch (error) {
        console.error("Error al generar contenido con IA:", error);
        return "Error al conectar con el servicio de IA. Por favor, intente de nuevo más tarde.";
    }
};