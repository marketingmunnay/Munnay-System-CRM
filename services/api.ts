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
export let getCampaigns: () => Promise<Campaign[]> = async () => { console.warn("getCampaigns not implemented"); return []; };
export let saveCampaign: (campaign: Campaign) => Promise<Campaign> = async (c) => { console.warn("saveCampaign not implemented"); return c; };
export let deleteCampaign: (campaignId: number) => Promise<number> = async (id) => { console.warn("deleteCampaign not implemented"); return id; };
export let getMetaCampaigns: () => Promise<MetaCampaign[]> = async () => { console.warn("getMetaCampaigns not implemented"); return []; };
export let saveMetaCampaign: (campaign: MetaCampaign) => Promise<MetaCampaign> = async (c) => { console.warn("saveMetaCampaign not implemented"); return c; };
export let deleteMetaCampaign: (campaignId: number) => Promise<number> = async (id) => { console.warn("deleteMetaCampaign not implemented"); return id; };
export let getPublicaciones: () => Promise<Publicacion[]> = async () => { console.warn("getPublicaciones not implemented"); return []; };
export let savePublicacion: (pub: Publicacion) => Promise<Publicacion> = async (p) => { console.warn("savePublicacion not implemented"); return p; };
export let deletePublicacion: (pubId: number) => Promise<number> = async (id) => { console.warn("deletePublicacion not implemented"); return id; };
export let getSeguidores: () => Promise<Seguidor[]> = async () => { console.warn("getSeguidores not implemented"); return []; };
export let saveSeguidor: (seg: Seguidor) => Promise<Seguidor> = async (s) => { console.warn("saveSeguidor not implemented"); return s; };
export let deleteSeguidor: (segId: number) => Promise<number> = async (id) => { console.warn("deleteSeguidor not implemented"); return id; };
export let getVentasExtra: () => Promise<VentaExtra[]> = async () => { console.warn("getVentasExtra not implemented"); return []; };
export let saveVentaExtra: (venta: VentaExtra) => Promise<VentaExtra> = async (v) => { console.warn("saveVentaExtra not implemented"); return v; };
export let deleteVentaExtra: (ventaId: number) => Promise<number> = async (id) => { console.warn("deleteVentaExtra not implemented"); return id; };
export let getIncidencias: () => Promise<Incidencia[]> = async () => { console.warn("getIncidencias not implemented"); return []; };
export let saveIncidencia: (incidencia: Incidencia) => Promise<Incidencia> = async (i) => { console.warn("saveIncidencia not implemented"); return i; };
export let deleteIncidencia: (incidenciaId: number) => Promise<number> = async (id) => { console.warn("deleteIncidencia not implemented"); return id; };
export let getEgresos: () => Promise<Egreso[]> = async () => { console.warn("getEgresos not implemented"); return []; };
export let saveEgreso: (egreso: Egreso) => Promise<Egreso> = async (e) => { console.warn("saveEgreso not implemented"); return e; };
export let deleteEgreso: (egresoId: number) => Promise<number> = async (id) => { console.warn("deleteEgreso not implemented"); return id; };
export let getProveedores: () => Promise<Proveedor[]> = async () => { console.warn("getProveedores not implemented"); return []; };
export let saveProveedor: (proveedor: Proveedor) => Promise<Proveedor> = async (p) => { console.warn("saveProveedor not implemented"); return p; };
export let deleteProveedor: (proveedorId: number) => Promise<number> = async (id) => { console.warn("deleteProveedor not implemented"); return id; };
export let getTiposProveedor: () => Promise<TipoProveedor[]> = async () => { console.warn("getTiposProveedor not implemented"); return []; };
export let saveTipoProveedor: (tipo: TipoProveedor) => Promise<TipoProveedor> = async (t) => { console.warn("saveTipoProveedor not implemented"); return t; };
export let deleteTipoProveedor: (id: number) => Promise<number> = async (id) => { console.warn("deleteTipoProveedor not implemented"); return id; };
export let getUsers: () => Promise<User[]> = async () => { console.warn("getUsers not implemented"); return []; };
export let saveUser: (user: User) => Promise<User> = async (u) => { console.warn("saveUser not implemented"); return u; };
export let deleteUser: (userId: number) => Promise<number> = async (id) => { console.warn("deleteUser not implemented"); return id; };
export let getRoles: () => Promise<Role[]> = async () => { console.warn("getRoles not implemented"); return []; };
export let saveRole: (role: Role) => Promise<Role> = async (r) => { console.warn("saveRole not implemented"); return r; };
export let deleteRole: (roleId: number) => Promise<number> = async (id) => { console.warn("deleteRole not implemented"); return id; };
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