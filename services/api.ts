import { GoogleGenAI } from "@google/genai";
import type { 
    Lead, Campaign, VentaExtra, Incidencia, Egreso, Proveedor, User, Role, 
    BusinessInfo, ClientSource, Service, Product, Membership, ServiceCategory,
    ProductCategory, JobPosition, Publicacion, Seguidor, MetaCampaign, EgresoCategory,
    TipoProveedor,
    Goal
} from '../types.ts';
import { LeadStatus, Seller, MetodoPago } from '../types';

// A more robust check for development environment.
// This works even if Vite's `import.meta.env` isn't available.
const isDevelopment = (typeof import.meta.env !== 'undefined' && import.meta.env.DEV) || 
                      (typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname));


// Declare functions that will be conditionally defined
let getLeads: () => Promise<Lead[]>;
let saveLead: (lead: Lead) => Promise<Lead>;
let deleteLead: (leadId: number) => Promise<{ id: number }>;
let getCampaigns: () => Promise<Campaign[]>;
let saveCampaign: (campaign: Campaign) => Promise<Campaign>;
let deleteCampaign: (campaignId: number) => Promise<number>;
let getMetaCampaigns: () => Promise<MetaCampaign[]>;
let saveMetaCampaign: (campaign: MetaCampaign) => Promise<MetaCampaign>;
let deleteMetaCampaign: (campaignId: number) => Promise<number>;
let getPublicaciones: () => Promise<Publicacion[]>;
let savePublicacion: (pub: Publicacion) => Promise<Publicacion>;
let deletePublicacion: (pubId: number) => Promise<number>;
let getSeguidores: () => Promise<Seguidor[]>;
let saveSeguidor: (seg: Seguidor) => Promise<Seguidor>;
let deleteSeguidor: (segId: number) => Promise<number>;
let getVentasExtra: () => Promise<VentaExtra[]>;
let saveVentaExtra: (venta: VentaExtra) => Promise<VentaExtra>;
let deleteVentaExtra: (ventaId: number) => Promise<number>;
let getIncidencias: () => Promise<Incidencia[]>;
let saveIncidencia: (incidencia: Incidencia) => Promise<Incidencia>;
let deleteIncidencia: (incidenciaId: number) => Promise<number>;
let getEgresos: () => Promise<Egreso[]>;
let saveEgreso: (egreso: Egreso) => Promise<Egreso>;
let deleteEgreso: (egresoId: number) => Promise<number>;
let getProveedores: () => Promise<Proveedor[]>;
let saveProveedor: (proveedor: Proveedor) => Promise<Proveedor>;
let deleteProveedor: (proveedorId: number) => Promise<number>;
let getTiposProveedor: () => Promise<TipoProveedor[]>;
let saveTipoProveedor: (tipo: TipoProveedor) => Promise<TipoProveedor>;
let deleteTipoProveedor: (id: number) => Promise<number>;
let getUsers: () => Promise<User[]>;
let saveUser: (user: User) => Promise<User>;
let deleteUser: (userId: number) => Promise<number>;
let getRoles: () => Promise<Role[]>;
let saveRole: (role: Role) => Promise<Role>;
let deleteRole: (roleId: number) => Promise<number>;
let getBusinessInfo: () => Promise<BusinessInfo>;
let saveBusinessInfo: (info: BusinessInfo) => Promise<BusinessInfo>;
let getClientSources: () => Promise<ClientSource[]>;
let saveClientSource: (source: ClientSource) => Promise<ClientSource>;
let deleteClientSource: (id: number) => Promise<number>;
let getServices: () => Promise<Service[]>;
let saveService: (service: Service) => Promise<Service>;
let deleteService: (id: number) => Promise<number>;
let getProducts: () => Promise<Product[]>;
let saveProduct: (product: Product) => Promise<Product>;
let deleteProduct: (id: number) => Promise<number>;
let getMemberships: () => Promise<Membership[]>;
let saveMembership: (membership: Membership) => Promise<Membership>;
let deleteMembership: (id: number) => Promise<number>;
let getServiceCategories: () => Promise<ServiceCategory[]>;
let saveServiceCategory: (category: ServiceCategory) => Promise<ServiceCategory>;
let deleteServiceCategory: (id: number) => Promise<number>;
let getProductCategories: () => Promise<ProductCategory[]>;
let saveProductCategory: (category: ProductCategory) => Promise<ProductCategory>;
let deleteProductCategory: (id: number) => Promise<number>;
let getEgresoCategories: () => Promise<EgresoCategory[]>;
let saveEgresoCategory: (category: EgresoCategory) => Promise<EgresoCategory>;
let deleteEgresoCategory: (id: number) => Promise<number>;
let getJobPositions: () => Promise<JobPosition[]>;
let saveJobPosition: (position: JobPosition) => Promise<JobPosition>;
let deleteJobPosition: (id: number) => Promise<number>;
let getGoals: () => Promise<Goal[]>;
let saveGoal: (goal: Goal) => Promise<Goal>;
let deleteGoal: (goalId: number) => Promise<number>;


if (isDevelopment) {
    // --- DEVELOPMENT ENVIRONMENT: MOCK API ---
    console.log("Running in development mode. Using mock API.");

    const mockApiCall = <T>(data: T): Promise<T> => new Promise(resolve => setTimeout(() => resolve(data), 100));

    // MOCK DATABASES
    let rolesDB: Role[] = [
        {
            id: 1,
            nombre: 'Administrador',
            permissions: ['dashboard', 'calendario', 'marketing-campanas', 'marketing-leads', 'redes-sociales-publicaciones', 'redes-sociales-seguidores', 'recepcion-agendados', 'recepcion-ventas-extra', 'recepcion-incidencias', 'procedimientos-atenciones', 'procedimientos-seguimiento', 'procedimientos-ventas-extra', 'procedimientos-incidencias', 'pacientes-historia', 'finanzas-egresos', 'rrhh-perfiles', 'informes', 'configuracion'],
            dashboardMetrics: ['general', 'marketing', 'recepcion', 'procedimientos', 'finanzas', 'rrhh']
        },
        {
            id: 2,
            nombre: 'Marketing',
            permissions: ['dashboard', 'marketing-campanas', 'marketing-leads', 'redes-sociales-publicaciones', 'redes-sociales-seguidores'],
            dashboardMetrics: ['marketing']
        }
    ];

    let usersDB: User[] = [
        {
            id: 1,
            nombres: 'Admin',
            apellidos: 'Munnay',
            usuario: 'admin',
            password: '123',
            rolId: 1,
            avatarUrl: 'https://picsum.photos/id/1005/100/100',
            position: 'Gerente General'
        },
        {
            id: 2,
            nombres: 'Vanesa',
            apellidos: 'Marketing',
            usuario: 'vanesa',
            rolId: 2,
            avatarUrl: 'https://picsum.photos/id/1027/100/100',
            position: 'Jefa de Marketing'
        }
    ];
    
    let leadsDB: Lead[] = [
        { id: 1, fechaLead: '2023-11-01', nombres: 'Ana (Mock)', apellidos: 'García', numero: '987654321', sexo: 'F', redSocial: 'Instagram', anuncio: 'Promo Noviembre', vendedor: Seller.Vanesa, estado: LeadStatus.Nuevo, montoPagado: 0, servicios: ['Limpieza Facial'], categoria: 'Faciales', registrosLlamada: [] },
        { id: 2, fechaLead: '2023-11-02', nombres: 'Luis (Mock)', apellidos: 'Martinez', numero: '912345678', sexo: 'M', redSocial: 'Facebook', anuncio: 'Campaña Skincare', vendedor: Seller.Liz, estado: LeadStatus.Agendado, montoPagado: 50, metodoPago: MetodoPago.Yape, fechaHoraAgenda: '2023-11-05T10:00:00', servicios: ['Evaluación'], categoria: 'Evaluaciones', nHistoria: 'H-MOCK-123' }
    ];
    
    // Assign mock implementations
    getLeads = () => mockApiCall([...leadsDB]);
    saveLead = async (lead: Lead) => {
        const index = leadsDB.findIndex(l => l.id === lead.id);
        if (index > -1) { leadsDB[index] = lead; } else { leadsDB.unshift({ ...lead, id: lead.id || Date.now() }); }
        return mockApiCall(lead);
    };
    deleteLead = async (leadId: number) => {
        leadsDB = leadsDB.filter(l => l.id !== leadId);
        return mockApiCall({ id: leadId });
    };

    getUsers = () => mockApiCall([...usersDB]);
    saveUser = async (user: User) => {
        const index = usersDB.findIndex(u => u.id === user.id);
        if (index > -1) { usersDB[index] = user; } else { usersDB.push({ ...user, id: user.id || Date.now() }); }
        return mockApiCall(user);
    };
    deleteUser = async (userId: number) => {
        usersDB = usersDB.filter(u => u.id !== userId);
        return mockApiCall(userId);
    };

    getRoles = () => mockApiCall([...rolesDB]);
    saveRole = async (role: Role) => {
        const index = rolesDB.findIndex(r => r.id === role.id);
        if (index > -1) { rolesDB[index] = role; } else { rolesDB.push({ ...role, id: role.id || Date.now() }); }
        return mockApiCall(role);
    };
    deleteRole = async (roleId: number) => {
        rolesDB = rolesDB.filter(r => r.id !== roleId);
        return mockApiCall(roleId);
    };

    // Assign mock implementations for all other functions
    getCampaigns = () => mockApiCall([]);
    saveCampaign = (campaign: Campaign) => mockApiCall(campaign);
    deleteCampaign = (campaignId: number) => mockApiCall(campaignId);
    getMetaCampaigns = () => mockApiCall([]);
    saveMetaCampaign = (campaign: MetaCampaign) => mockApiCall(campaign);
    deleteMetaCampaign = (campaignId: number) => mockApiCall(campaignId);
    getPublicaciones = () => mockApiCall([]);
    savePublicacion = (pub: Publicacion) => mockApiCall(pub);
    deletePublicacion = (pubId: number) => mockApiCall(pubId);
    getSeguidores = () => mockApiCall([]);
    saveSeguidor = (seg: Seguidor) => mockApiCall(seg);
    deleteSeguidor = (segId: number) => mockApiCall(segId);
    getVentasExtra = () => mockApiCall([]);
    saveVentaExtra = (venta: VentaExtra) => mockApiCall(venta);
    deleteVentaExtra = (ventaId: number) => mockApiCall(ventaId);
    getIncidencias = () => mockApiCall([]);
    saveIncidencia = (incidencia: Incidencia) => mockApiCall(incidencia);
    deleteIncidencia = (incidenciaId: number) => mockApiCall(incidenciaId);
    getEgresos = () => mockApiCall([]);
    saveEgreso = (egreso: Egreso) => mockApiCall(egreso);
    deleteEgreso = (egresoId: number) => mockApiCall(egresoId);
    getProveedores = () => mockApiCall([]);
    saveProveedor = (proveedor: Proveedor) => mockApiCall(proveedor);
    deleteProveedor = (proveedorId: number) => mockApiCall(proveedorId);
    getTiposProveedor = () => mockApiCall([]);
    saveTipoProveedor = (tipo: TipoProveedor) => mockApiCall(tipo);
    deleteTipoProveedor = (id: number) => mockApiCall(id);
    getBusinessInfo = () => mockApiCall({
        nombre: 'Munnay', ruc: '12345678901', direccion: 'Av. Principal 123, Miraflores, Lima',
        telefono: '01-555-1234', email: 'contacto@munnay.pe', logoUrl: 'https://i.imgur.com/JmZt2eU.png',
        loginImageUrl: 'https://images.unsplash.com/photo-1473170611423-22489201d961?auto=format&fit=crop&q=80&w=2070',
    });
    saveBusinessInfo = (info: BusinessInfo) => mockApiCall(info);
    getClientSources = () => mockApiCall([]);
    saveClientSource = (source: ClientSource) => mockApiCall(source);
    deleteClientSource = (id: number) => mockApiCall(id);
    getServices = () => mockApiCall([]);
    saveService = (service: Service) => mockApiCall(service);
    deleteService = (id: number) => mockApiCall(id);
    getProducts = () => mockApiCall([]);
    saveProduct = (product: Product) => mockApiCall(product);
    deleteProduct = (id: number) => mockApiCall(id);
    getMemberships = () => mockApiCall([]);
    saveMembership = (membership: Membership) => mockApiCall(membership);
    deleteMembership = (id: number) => mockApiCall(id);
    getServiceCategories = () => mockApiCall([]);
    saveServiceCategory = (category: ServiceCategory) => mockApiCall(category);
    deleteServiceCategory = (id: number) => mockApiCall(id);
    getProductCategories = () => mockApiCall([]);
    saveProductCategory = (category: ProductCategory) => mockApiCall(category);
    deleteProductCategory = (id: number) => mockApiCall(id);
    getEgresoCategories = () => mockApiCall([]);
    saveEgresoCategory = (category: EgresoCategory) => mockApiCall(category);
    deleteEgresoCategory = (id: number) => mockApiCall(id);
    getJobPositions = () => mockApiCall([]);
    saveJobPosition = (position: JobPosition) => mockApiCall(position);
    deleteJobPosition = (id: number) => mockApiCall(id);
    getGoals = () => mockApiCall([]);
    saveGoal = (goal: Goal) => mockApiCall(goal);
    deleteGoal = (goalId: number) => mockApiCall(goalId);

} else {
    // --- PRODUCTION ENVIRONMENT: REAL API ---
    console.log("Running in production mode. Using real API.");

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

    // Assign real implementations for leads
    getLeads = () => apiCall('/api/leads');
    saveLead = (lead: Lead) => apiCall('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead)
    });
    deleteLead = (leadId: number) => apiCall('/api/leads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId })
    });
    
    // Assign mock implementations for other functions as their backends are not ready
    const mockApiCallProd = <T>(data: T): Promise<T> => new Promise(resolve => resolve(data));
    getCampaigns = () => mockApiCallProd([]);
    saveCampaign = (campaign: Campaign) => mockApiCallProd(campaign);
    deleteCampaign = (campaignId: number) => mockApiCallProd(campaignId);
    getMetaCampaigns = () => mockApiCallProd([]);
    saveMetaCampaign = (campaign: MetaCampaign) => mockApiCallProd(campaign);
    deleteMetaCampaign = (campaignId: number) => mockApiCallProd(campaignId);
    getPublicaciones = () => mockApiCallProd([]);
    savePublicacion = (pub: Publicacion) => mockApiCallProd(pub);
    deletePublicacion = (pubId: number) => mockApiCallProd(pubId);
    getSeguidores = () => mockApiCallProd([]);
    saveSeguidor = (seg: Seguidor) => mockApiCallProd(seg);
    deleteSeguidor = (segId: number) => mockApiCallProd(segId);
    getVentasExtra = () => mockApiCallProd([]);
    saveVentaExtra = (venta: VentaExtra) => mockApiCallProd(venta);
    deleteVentaExtra = (ventaId: number) => mockApiCallProd(ventaId);
    getIncidencias = () => mockApiCallProd([]);
    saveIncidencia = (incidencia: Incidencia) => mockApiCallProd(incidencia);
    deleteIncidencia = (incidenciaId: number) => mockApiCallProd(incidenciaId);
    getEgresos = () => mockApiCallProd([]);
    saveEgreso = (egreso: Egreso) => mockApiCallProd(egreso);
    deleteEgreso = (egresoId: number) => mockApiCallProd(egresoId);
    getProveedores = () => mockApiCallProd([]);
    saveProveedor = (proveedor: Proveedor) => mockApiCallProd(proveedor);
    deleteProveedor = (proveedorId: number) => mockApiCallProd(proveedorId);
    getTiposProveedor = () => mockApiCallProd([]);
    saveTipoProveedor = (tipo: TipoProveedor) => mockApiCallProd(tipo);
    deleteTipoProveedor = (id: number) => mockApiCallProd(id);
    getUsers = () => mockApiCallProd([]);
    saveUser = (user: User) => mockApiCallProd(user);
    deleteUser = (userId: number) => mockApiCallProd(userId);
    getRoles = () => mockApiCallProd([]);
    saveRole = (role: Role) => mockApiCallProd(role);
    deleteRole = (roleId: number) => mockApiCallProd(roleId);
    getBusinessInfo = () => mockApiCallProd({
        nombre: 'Munnay', ruc: '12345678901', direccion: 'Av. Principal 123, Miraflores, Lima',
        telefono: '01-555-1234', email: 'contacto@munnay.pe', logoUrl: 'https://i.imgur.com/JmZt2eU.png',
        loginImageUrl: 'https://images.unsplash.com/photo-1473170611423-22489201d961?auto=format&fit=crop&q=80&w=2070',
    });
    saveBusinessInfo = (info: BusinessInfo) => mockApiCallProd(info);
    getClientSources = () => mockApiCallProd([]);
    saveClientSource = (source: ClientSource) => mockApiCallProd(source);
    deleteClientSource = (id: number) => mockApiCallProd(id);
    getServices = () => mockApiCallProd([]);
    saveService = (service: Service) => mockApiCallProd(service);
    deleteService = (id: number) => mockApiCallProd(id);
    getProducts = () => mockApiCallProd([]);
    saveProduct = (product: Product) => mockApiCallProd(product);
    deleteProduct = (id: number) => mockApiCallProd(id);
    getMemberships = () => mockApiCallProd([]);
    saveMembership = (membership: Membership) => mockApiCallProd(membership);
    deleteMembership = (id: number) => mockApiCallProd(id);
    getServiceCategories = () => mockApiCallProd([]);
    saveServiceCategory = (category: ServiceCategory) => mockApiCallProd(category);
    deleteServiceCategory = (id: number) => mockApiCallProd(id);
    getProductCategories = () => mockApiCallProd([]);
    saveProductCategory = (category: ProductCategory) => mockApiCallProd(category);
    deleteProductCategory = (id: number) => mockApiCallProd(id);
    getEgresoCategories = () => mockApiCallProd([]);
    saveEgresoCategory = (category: EgresoCategory) => mockApiCallProd(category);
    deleteEgresoCategory = (id: number) => mockApiCallProd(id);
    getJobPositions = () => mockApiCallProd([]);
    saveJobPosition = (position: JobPosition) => mockApiCallProd(position);
    deleteJobPosition = (id: number) => mockApiCallProd(id);
    getGoals = () => mockApiCallProd([]);
    saveGoal = (goal: Goal) => mockApiCallProd(goal);
    deleteGoal = (goalId: number) => mockApiCallProd(goalId);
}

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

// Export all functions
export {
    getLeads, saveLead, deleteLead, getCampaigns, saveCampaign, deleteCampaign, getMetaCampaigns,
    saveMetaCampaign, deleteMetaCampaign, getPublicaciones, savePublicacion, deletePublicacion,
    getSeguidores, saveSeguidor, deleteSeguidor, getVentasExtra, saveVentaExtra, deleteVentaExtra,
    getIncidencias, saveIncidencia, deleteIncidencia, getEgresos, saveEgreso, deleteEgreso,
    getProveedores, saveProveedor, deleteProveedor, getTiposProveedor, saveTipoProveedor,
    deleteTipoProveedor, getUsers, saveUser, deleteUser, getRoles, saveRole, deleteRole,
    getBusinessInfo, saveBusinessInfo, getClientSources, saveClientSource, deleteClientSource,
    getServices, saveService, deleteService, getProducts, saveProduct, deleteProduct, getMemberships,
    saveMembership, deleteMembership, getServiceCategories, saveServiceCategory, deleteServiceCategory,
    getProductCategories, saveProductCategory, deleteProductCategory, getEgresoCategories,
    saveEgresoCategory, deleteEgresoCategory, getJobPositions, saveJobPosition, deleteJobPosition,
    getGoals, saveGoal, deleteGoal
};