import { GoogleGenAI } from "@google/genai";
import type { 
    Lead, Campaign, VentaExtra, Incidencia, Egreso, Proveedor, User, Role, 
    BusinessInfo, ClientSource, Service, Product, Membership, ServiceCategory,
    ProductCategory, JobPosition, Publicacion, Seguidor, MetaCampaign, EgresoCategory,
    TipoProveedor,
    Goal
} from '../types.ts';

const API_URL = 'http://localhost:4000/api';

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


export let getVentasExtra: () => Promise<VentaExtra[]> = async () => { console.warn("getVentasExtra not implemented"); return []; };
export let saveVentaExtra: (venta: VentaExtra) => Promise<VentaExtra> = async (v) => { console.warn("saveVentaExtra not implemented"); return v; };
export let deleteVentaExtra: (ventaId: number) => Promise<number> = async (id) => { console.warn("deleteVentaExtra not implemented"); return id; };
export let getIncidencias: () => Promise<Incidencia[]> = async () => { console.warn("getIncidencias not implemented"); return []; };
export let saveIncidencia: (incidencia: Incidencia) => Promise<Incidencia> = async (i) => { console.warn("saveIncidencia not implemented"); return i; };
export let deleteIncidencia: (incidenciaId: number) => Promise<number> = async (id) => { console.warn("deleteIncidencia not implemented"); return id; };
export let getProveedores: () => Promise<Proveedor[]> = async () => { console.warn("getProveedores not implemented"); return []; };
export let saveProveedor: (proveedor: Proveedor) => Promise<Proveedor> = async (p) => { console.warn("saveProveedor not implemented"); return p; };
export let deleteProveedor: (proveedorId: number) => Promise<number> = async (id) => { console.warn("deleteProveedor not implemented"); return id; };
export let getTiposProveedor: () => Promise<TipoProveedor[]> = async () => { console.warn("getTiposProveedor not implemented"); return []; };
export let saveTipoProveedor: (tipo: TipoProveedor) => Promise<TipoProveedor> = async (t) => { console.warn("saveTipoProveedor not implemented"); return t; };
// FIX: Add missing deleteTipoProveedor function export to resolve error in App.tsx
export let deleteTipoProveedor: (id: number) => Promise<void> = async (id) => { console.warn("deleteTipoProveedor not implemented"); };
export let getUsers: () => Promise<User[]> = async () => { console.warn("getUsers not implemented"); return []; };
export let saveUser: (user: User) => Promise<User> = async (u) => { console.warn("saveUser not implemented"); return u; };
export let deleteUser: (userId: number) => Promise<number> = async (id) => { console.warn("deleteUser not implemented"); return id; };
export let getBusinessInfo: () => Promise<BusinessInfo> = async () => { console.warn("getBusinessInfo not implemented"); return { nombre: 'Munnay', ruc: '', direccion: '', telefono: '', email: '', logoUrl: 'https://i.imgur.com/JmZt2eU.png', loginImageUrl: '' }; };
export let saveBusinessInfo: (info: BusinessInfo) => Promise<BusinessInfo> = async (i) => { console.warn("saveBusinessInfo not implemented"); return i; };
export let getClientSources: () => Promise<ClientSource[]> = async () => { console.warn("getClientSources not implemented"); return []; };
export let saveClientSource: (source: ClientSource) => Promise<ClientSource> = async (s) => { console.warn("saveClientSource not implemented"); return s; };
export let deleteClientSource: (id: number) => Promise<number> = async (id) => { console.warn("deleteClientSource not implemented"); return id; };
export let getServices: () => Promise<Service[]> = async () => { console.warn("getServices not implemented"); return []; };
export let saveService: (service: Service) => Promise<Service> = async (s) => { console.warn("saveService not implemented"); return s; };
export let deleteService: (id: number) => Promise<number> = async (id) => { console.warn("deleteService not implemented"); return id; };
export let getProducts: () => Promise<Product[]> = async () => { console.warn("getProducts not implemented"); return []; };
export let saveProduct: (product: Product) => Promise<Product> = async (p) => { console.warn("saveProduct not implemented"); return p; };
export let deleteProduct: (id: number) => Promise<number> = async (id) => { console.warn("deleteProduct not implemented"); return id; };
export let getMemberships: () => Promise<Membership[]> = async () => { console.warn("getMemberships not implemented"); return []; };
export let saveMembership: (membership: Membership) => Promise<Membership> = async (m) => { console.warn("saveMembership not implemented"); return m; };
export let deleteMembership: (id: number) => Promise<number> = async (id) => { console.warn("deleteMembership not implemented"); return id; };
export let getServiceCategories: () => Promise<ServiceCategory[]> = async () => { console.warn("getServiceCategories not implemented"); return []; };
export let saveServiceCategory: (category: ServiceCategory) => Promise<ServiceCategory> = async (c) => { console.warn("saveServiceCategory not implemented"); return c; };
export let deleteServiceCategory: (id: number) => Promise<number> = async (id) => { console.warn("deleteServiceCategory not implemented"); return id; };
export let getProductCategories: () => Promise<ProductCategory[]> = async () => { console.warn("getProductCategories not implemented"); return []; };
export let saveProductCategory: (category: ProductCategory) => Promise<ProductCategory> = async (c) => { console.warn("saveProductCategory not implemented"); return c; };
export let deleteProductCategory: (id: number) => Promise<number> = async (id) => { console.warn("deleteProductCategory not implemented"); return id; };
export let getEgresoCategories: () => Promise<EgresoCategory[]> = async () => { console.warn("getEgresoCategories not implemented"); return []; };
export let saveEgresoCategory: (category: EgresoCategory) => Promise<EgresoCategory> = async (c) => { console.warn("saveEgresoCategory not implemented"); return c; };
export let deleteEgresoCategory: (id: number) => Promise<number> = async (id) => { console.warn("deleteEgresoCategory not implemented"); return id; };
export let getJobPositions: () => Promise<JobPosition[]> = async () => { console.warn("getJobPositions not implemented"); return []; };
export let saveJobPosition: (position: JobPosition) => Promise<JobPosition> = async (p) => { console.warn("saveJobPosition not implemented"); return p; };
export let deleteJobPosition: (id: number) => Promise<number> = async (id) => { console.warn("deleteJobPosition not implemented"); return id; };
export let getGoals: () => Promise<Goal[]> = async () => { console.warn("getGoals not implemented"); return []; };
export let saveGoal: (goal: Goal) => Promise<Goal> = async (g) => { console.warn("saveGoal not implemented"); return g; };
export let deleteGoal: (goalId: number) => Promise<number> = async (id) => { console.warn("deleteGoal not implemented"); return id; };


// AI function is common for both environments
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