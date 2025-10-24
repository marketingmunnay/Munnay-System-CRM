import { GoogleGenAI } from "@google/genai";
import type { 
    Lead, Campaign, VentaExtra, Incidencia, Egreso, Proveedor, User, Role, 
    BusinessInfo, ClientSource, Service, Product, Membership, ServiceCategory,
    ProductCategory, JobPosition, Publicacion, Seguidor, MetaCampaign, EgresoCategory,
    TipoProveedor,
    Goal
} from '../types.ts';

// Helper function to handle API calls
async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API call failed with status ${response.status}: ${errorText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error during API call to ${url}:`, error);
        throw error;
    }
}

// --- API Functions ---
export const getLeads = (): Promise<Lead[]> => apiCall('/api/leads');

export const saveLead = async (lead: Lead): Promise<Lead> => {
    return await apiCall('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead)
    });
};

export const deleteLead = async (leadId: number): Promise<{ id: number }> => {
     return await apiCall('/api/leads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId })
    });
};


// The following functions are placeholders and would need their own backend endpoints
// For now, they return empty arrays or mock data to avoid breaking the UI.

const mockApiCall = <T>(data: T): Promise<T> => new Promise(resolve => setTimeout(() => resolve(data), 100));

export const getCampaigns = (): Promise<Campaign[]> => mockApiCall([]);
export const saveCampaign = (campaign: Campaign): Promise<Campaign> => mockApiCall(campaign);
export const deleteCampaign = (campaignId: number): Promise<number> => mockApiCall(campaignId);

export const getMetaCampaigns = (): Promise<MetaCampaign[]> => mockApiCall([]);
export const saveMetaCampaign = (campaign: MetaCampaign): Promise<MetaCampaign> => mockApiCall(campaign);
export const deleteMetaCampaign = (campaignId: number): Promise<number> => mockApiCall(campaignId);

export const getPublicaciones = (): Promise<Publicacion[]> => mockApiCall([]);
export const savePublicacion = (pub: Publicacion): Promise<Publicacion> => mockApiCall(pub);
export const deletePublicacion = (pubId: number): Promise<number> => mockApiCall(pubId);

export const getSeguidores = (): Promise<Seguidor[]> => mockApiCall([]);
export const saveSeguidor = (seg: Seguidor): Promise<Seguidor> => mockApiCall(seg);
export const deleteSeguidor = (segId: number): Promise<number> => mockApiCall(segId);

export const getVentasExtra = (): Promise<VentaExtra[]> => mockApiCall([]);
export const saveVentaExtra = (venta: VentaExtra): Promise<VentaExtra> => mockApiCall(venta);
export const deleteVentaExtra = (ventaId: number): Promise<number> => mockApiCall(ventaId);

export const getIncidencias = (): Promise<Incidencia[]> => mockApiCall([]);
export const saveIncidencia = (incidencia: Incidencia): Promise<Incidencia> => mockApiCall(incidencia);
export const deleteIncidencia = (incidenciaId: number): Promise<number> => mockApiCall(incidenciaId);

export const getEgresos = (): Promise<Egreso[]> => mockApiCall([]);
export const saveEgreso = (egreso: Egreso): Promise<Egreso> => mockApiCall(egreso);
export const deleteEgreso = (egresoId: number): Promise<number> => mockApiCall(egresoId);

export const getProveedores = (): Promise<Proveedor[]> => mockApiCall([]);
export const saveProveedor = (proveedor: Proveedor): Promise<Proveedor> => mockApiCall(proveedor);
export const deleteProveedor = (proveedorId: number): Promise<number> => mockApiCall(proveedorId);

export const getTiposProveedor = (): Promise<TipoProveedor[]> => mockApiCall([]);
export const saveTipoProveedor = (tipo: TipoProveedor): Promise<TipoProveedor> => mockApiCall(tipo);
export const deleteTipoProveedor = (id: number): Promise<number> => mockApiCall(id);

export const getUsers = (): Promise<User[]> => mockApiCall([]);
export const saveUser = (user: User): Promise<User> => mockApiCall(user);
export const deleteUser = (userId: number): Promise<number> => mockApiCall(userId);

export const getRoles = (): Promise<Role[]> => mockApiCall([]);
export const saveRole = (role: Role): Promise<Role> => mockApiCall(role);
export const deleteRole = (roleId: number): Promise<number> => mockApiCall(roleId);

export const getBusinessInfo = (): Promise<BusinessInfo> => mockApiCall({
    nombre: 'Munnay',
    ruc: '12345678901',
    direccion: 'Av. Principal 123, Miraflores, Lima',
    telefono: '01-555-1234',
    email: 'contacto@munnay.pe',
    logoUrl: 'https://i.imgur.com/JmZt2eU.png',
    loginImageUrl: 'https://images.unsplash.com/photo-1473170611423-22489201d961?auto=format&fit=crop&q=80&w=2070',
});
export const saveBusinessInfo = (info: BusinessInfo): Promise<BusinessInfo> => mockApiCall(info);

export const getClientSources = (): Promise<ClientSource[]> => mockApiCall([]);
export const saveClientSource = (source: ClientSource): Promise<ClientSource> => mockApiCall(source);
export const deleteClientSource = (id: number): Promise<number> => mockApiCall(id);

export const getServices = (): Promise<Service[]> => mockApiCall([]);
export const saveService = (service: Service): Promise<Service> => mockApiCall(service);
export const deleteService = (id: number): Promise<number> => mockApiCall(id);

export const getProducts = (): Promise<Product[]> => mockApiCall([]);
export const saveProduct = (product: Product): Promise<Product> => mockApiCall(product);
export const deleteProduct = (id: number): Promise<number> => mockApiCall(id);

export const getMemberships = (): Promise<Membership[]> => mockApiCall([]);
export const saveMembership = (membership: Membership): Promise<Membership> => mockApiCall(membership);
export const deleteMembership = (id: number): Promise<number> => mockApiCall(id);

export const getServiceCategories = (): Promise<ServiceCategory[]> => mockApiCall([]);
export const saveServiceCategory = (category: ServiceCategory): Promise<ServiceCategory> => mockApiCall(category);
export const deleteServiceCategory = (id: number): Promise<number> => mockApiCall(id);

export const getProductCategories = (): Promise<ProductCategory[]> => mockApiCall([]);
export const saveProductCategory = (category: ProductCategory): Promise<ProductCategory> => mockApiCall(category);
export const deleteProductCategory = (id: number): Promise<number> => mockApiCall(id);

export const getEgresoCategories = (): Promise<EgresoCategory[]> => mockApiCall([]);
export const saveEgresoCategory = (category: EgresoCategory): Promise<EgresoCategory> => mockApiCall(category);
export const deleteEgresoCategory = (id: number): Promise<number> => mockApiCall(id);

export const getJobPositions = (): Promise<JobPosition[]> => mockApiCall([]);
export const saveJobPosition = (position: JobPosition): Promise<JobPosition> => mockApiCall(position);
export const deleteJobPosition = (id: number): Promise<number> => mockApiCall(id);

export const getGoals = (): Promise<Goal[]> => mockApiCall([]);
export const saveGoal = (goal: Goal): Promise<Goal> => mockApiCall(goal);
export const deleteGoal = (goalId: number): Promise<number> => mockApiCall(goalId);

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