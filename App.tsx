import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import Dashboard from './components/dashboard/Dashboard';
import PlaceholderPage from './components/shared/PlaceholderPage';
// FIX: Changed to named import
import { LeadFormModal } from './components/marketing/LeadFormModal'; 
import LeadsPage from './components/marketing/LeadsPage';
import CampaignsPage from './components/marketing/CampaignsPage';
import PublicacionesPage from './components/redes-sociales/PublicacionesPage';
import SeguidoresPage from './components/redes-sociales/SeguidoresPage';
import AgendadosPage from './components/recepcion/AgendadosPage';
import VentasExtraPage from './components/recepcion/VentasExtraPage';
import IncidenciasPage from './components/recepcion/IncidenciasPage';
import PacientesHistoriaPage from './components/pacientes/PacientesHistoriaPage';
import { AtencionesDiariasPage } from './components/procedimientos/AtencionesDiariasPage';
import AnalisisSeguimientoPage from './components/procedimientos/AnalisisSeguimientoPage';
import CalendarPage from './components/calendario/CalendarPage';
import EgresosDiariosPage from './components/finanzas/EgresosDiariosPage';
import FacturacionPage from './components/finanzas/FacturacionPage';
// FIX: Changed to named export for ConfiguracionPage
import { ConfiguracionPage } from './components/configuracion/ConfiguracionPage';
import InformesPage from './components/informes/InformesPage';
import LoginPage from './components/auth/LoginPage';
import ConfirmationModal from './components/shared/ConfirmationModal';
import RecursosHumanosPage from './components/recursos-humanos/RecursosHumanosPage';
import { BirthdayAnimation } from './components/shared/BirthdayAnimation';
import type { 
    Page, Lead, Campaign, VentaExtra, Incidencia, Egreso, Proveedor, Publicacion, Seguidor,
    User, Role, BusinessInfo, ClientSource, Service, Product, Membership,
    ServiceCategory, JobPosition, ProductCategory, MetaCampaign, EgresoCategory, Notification,
    TipoProveedor,
    Goal, ComprobanteElectronico
} from './types';
import * as api from './services/api';
import { generateNotifications } from './services/notificationService';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    
    // Auth states - Authentication disabled, default user with full permissions
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    // Data states
    const [leads, setLeads] = useState<Lead[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [metaCampaigns, setMetaCampaigns] = useState<MetaCampaign[]>([]);
    const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
    const [seguidores, setSeguidores] = useState<Seguidor[]>([]);
    const [ventasExtra, setVentasExtra] = useState<VentaExtra[]>([]);
    const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
    const [egresos, setEgresos] = useState<Egreso[]>([]);
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [tiposProveedor, setTiposProveedor] = useState<TipoProveedor[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [clientSources, setClientSources] = useState<ClientSource[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [memberships, setMemberships] = useState<Membership[]>([]);
    const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
    const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
    const [egresoCategories, setEgresoCategories] = useState<EgresoCategory[]>([]);
    const [jobPositions, setJobPositions] = useState<JobPosition[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [comprobantes, setComprobantes] = useState<ComprobanteElectronico[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [loginError, setLoginError] = useState('');

    const [confirmationState, setConfirmationState] = useState<{
        isOpen: boolean;
        message: string;
        onConfirm: () => void;
    } | null>(null);

    const requestConfirmation = (message: string, onConfirm: () => void) => {
        setConfirmationState({
            isOpen: true,
            message,
            onConfirm: () => {
                onConfirm();
                setConfirmationState(null);
            },
        });
    };

    const handleCancelConfirmation = () => {
        setConfirmationState(null);
    };


    const loadData = async () => {
        setLoading(true);
        try {
            const [
                leadsData, campaignsData, ventasData, incidenciasData, 
                egresosData, proveedoresData, usersData, rolesData,
                businessInfoData, clientSourcesData, servicesData, productsData, membershipsData,
                serviceCategoriesData, productCategoriesData, jobPositionsData,
                publicacionesData, seguidoresData, metaCampaignsData, egresoCategoriesData,
                tiposProveedorData, goalsData, comprobantesData
            ] = await Promise.all([
                api.getLeads?.() || Promise.resolve([]), api.getCampaigns?.() || Promise.resolve([]), api.getVentasExtra?.() || Promise.resolve([]),
                api.getIncidencias?.() || Promise.resolve([]), api.getEgresos?.() || Promise.resolve([]), api.getProveedores?.() || Promise.resolve([]),
                api.getUsers?.() || Promise.resolve([]), api.getRoles?.() || Promise.resolve([]), api.getBusinessInfo?.() || Promise.resolve(null),
                api.getClientSources?.() || Promise.resolve([]), api.getServices?.() || Promise.resolve([]), api.getProducts?.() || Promise.resolve([]), api.getMemberships?.() || Promise.resolve([]),
                api.getServiceCategories?.() || Promise.resolve([]), api.getProductCategories?.() || Promise.resolve([]), api.getJobPositions?.() || Promise.resolve([]),
                api.getPublicaciones?.() || Promise.resolve([]), api.getSeguidores?.() || Promise.resolve([]), api.getMetaCampaigns?.() || Promise.resolve([]), api.getEgresoCategories?.() || Promise.resolve([]),
                api.getTiposProveedor?.() || Promise.resolve([]), api.getGoals?.() || Promise.resolve([]), api.getComprobantes?.() || Promise.resolve([])
            ]);
            setLeads(leadsData);
            setCampaigns(campaignsData);
            setVentasExtra(ventasData);
            setIncidencias(incidenciasData);
            setEgresos(egresosData);
            setProveedores(proveedoresData);
            setUsers(usersData);
            setRoles(rolesData);
            setBusinessInfo(businessInfoData || { nombre: 'CRM Munnay', ruc: '', direccion: '', telefono: '', email: '', logoUrl: '' });
            setClientSources(clientSourcesData);
            setServices(servicesData);
            setProducts(productsData);
            setMemberships(membershipsData);
            setServiceCategories(serviceCategoriesData);
            setProductCategories(productCategoriesData);
            setJobPositions(jobPositionsData);
            setPublicaciones(publicacionesData);
            setSeguidores(seguidoresData);
            setMetaCampaigns(metaCampaignsData);
            setEgresoCategories(egresoCategoriesData);
            setTiposProveedor(tiposProveedorData);
            setGoals(goalsData);
            setComprobantes(comprobantesData);
            
            setNotifications(generateNotifications({ leads: leadsData, egresos: egresosData }));

        } catch (error) {
            console.error("Failed to load data", error);
            // Set minimal business info on error
            if (!businessInfo) {
                setBusinessInfo({ nombre: 'CRM Munnay', ruc: '', direccion: '', telefono: '', email: '', logoUrl: '' });
            }
        } finally {
            // Always set up a default admin user with full permissions (authentication disabled)
            if (!currentUser) {
                const allPermissions: Page[] = [
                    'dashboard', 'calendario', 'marketing-campanas', 'marketing-leads',
                    'redes-sociales-publicaciones', 'redes-sociales-seguidores',
                    'recepcion-agendados', 'recepcion-ventas-extra', 'recepcion-incidencias',
                    'procedimientos-atenciones', 'procedimientos-seguimiento', 'procedimientos-ventas-extra',
                    'procedimientos-incidencias', 'pacientes-historia', 'finanzas-egresos',
                    'finanzas-facturacion', 'rrhh-perfiles', 'informes', 'configuracion'
                ];
                
                const defaultUser: User = {
                    id: 0,
                    nombres: 'Usuario',
                    apellidos: 'Administrador',
                    usuario: 'admin',
                    rolId: 1,
                    avatarUrl: '',
                    permissions: [
                        'calendario', 'marketing-campanas', 'marketing-leads', 
                        'redes-sociales-publicaciones', 'redes-sociales-seguidores',
                        'procedimientos-ventas-extra', 'recepcion-agendados', 
                        'recepcion-ventas-extra', 'recepcion-incidencias',
                        'finanzas-egresos', 'finanzas-facturacion', 'rrhh-perfiles',
                        'procedimientos-atenciones', 'procedimientos-seguimiento',
                        'procedimientos-incidencias', 'pacientes-historia', 
                        'informes', 'configuracion'
                    ],
                };
                
                setCurrentUser(defaultUser);
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Handlers for data manipulation
    const handleSaveLead = async (lead: Lead) => { await api.saveLead(lead); await loadData(); };
    const handleDeleteLead = async (leadId: number) => { await api.deleteLead(leadId); await loadData(); };
    const handleSaveCampaign = async (campaign: Campaign) => { await api.saveCampaign(campaign); await loadData(); };
    const handleDeleteCampaign = async (campaignId: number) => { await api.deleteCampaign(campaignId); await loadData(); };
    const handleImportCampaigns = async (campaigns: any[]) => { await api.bulkImportCampaigns(campaigns); await loadData(); };
    const handleSaveMetaCampaign = async (campaign: MetaCampaign) => { await api.saveMetaCampaign(campaign); await loadData(); };
    const handleDeleteMetaCampaign = async (campaignId: number) => { await api.deleteMetaCampaign(campaignId); await loadData(); };
    const handleImportMetaCampaigns = async (metaCampaigns: any[]) => { await api.bulkImportMetaCampaigns(metaCampaigns); await loadData(); };
    const handleSavePublicacion = async (publicacion: Publicacion) => { await api.savePublicacion(publicacion); await loadData(); };
    const handleDeletePublicacion = async (publicacionId: number) => { await api.deletePublicacion(publicacionId); await loadData(); };
    const handleSaveSeguidor = async (seguidor: Seguidor) => { await api.saveSeguidor(seguidor); await loadData(); };
    const handleDeleteSeguidor = async (seguidorId: number) => { await api.deleteSeguidor(seguidorId); await loadData(); };
    const handleSaveVentaExtra = async (venta: VentaExtra) => { await api.saveVentaExtra(venta); await loadData(); };
    const handleDeleteVentaExtra = async (ventaId: number) => { await api.deleteVentaExtra(ventaId); await loadData(); };
    const handleSaveIncidencia = async (incidencia: Incidencia) => { await api.saveIncidencia(incidencia); await loadData(); };
    const handleDeleteIncidencia = async (incidenciaId: number) => { await api.deleteIncidencia(incidenciaId); await loadData(); };
    const handleSaveEgreso = async (egreso: Egreso) => { await api.saveEgreso(egreso); await loadData(); };
    const handleDeleteEgreso = async (egresoId: number) => { await api.deleteEgreso(egresoId); await loadData(); };
    const handleSaveProveedor = async (proveedor: Proveedor) => { await api.saveProveedor(proveedor); await loadData(); };
    const handleDeleteProveedor = async (proveedorId: number) => { await api.deleteProveedor(proveedorId); await loadData(); };
    const handleSaveTipoProveedor = async (tipo: TipoProveedor) => { await api.saveTipoProveedor(tipo); await loadData(); };
    const handleDeleteTipoProveedor = async (id: number) => { await api.deleteTipoProveedor(id); await loadData(); };
    const handleSaveUser = async (user: User) => { 
        console.log('=== APP.TSX handleSaveUser ===');
        console.log('Usuario recibido:', user);
        try {
            console.log('Llamando a api.saveUser...');
            const result = await api.saveUser(user);
            console.log('Respuesta de api.saveUser:', result);
            console.log('Recargando datos...');
            await loadData();
            console.log('Datos recargados exitosamente');
        } catch (error) {
            console.error('ERROR en handleSaveUser:', error);
            throw error;
        }
    };
    const handleDeleteUser = async (userId: number) => { await api.deleteUser(userId); await loadData(); };
    const handleSaveRole = async (role: Role) => { await api.saveRole(role); await loadData(); };
    const handleDeleteRole = async (roleId: number) => { await api.deleteRole(roleId); await loadData(); };
    const handleSaveComprobante = async (comprobante: ComprobanteElectronico) => { await api.saveComprobante(comprobante); await loadData(); };
    const handleDeleteComprobante = async (comprobanteId: number) => { await api.deleteComprobante(comprobanteId); await loadData(); };
    
    // Business Config Handlers
    const handleSaveBusinessInfo = async (info: BusinessInfo) => { await api.saveBusinessInfo(info); await loadData(); };
    const handleSaveGoal = async (goal: Goal) => { await api.saveGoal(goal); await loadData(); };
    const handleDeleteGoal = async (goalId: number) => { await api.deleteGoal(goalId); await loadData(); };
    const handleSaveClientSource = async (source: ClientSource) => { await api.saveClientSource(source); await loadData(); };
    const handleDeleteClientSource = async (id: number) => { await api.deleteClientSource(id); await loadData(); };
    const handleSaveService = async (service: Service) => { await api.saveService(service); await loadData(); };
    const handleDeleteService = async (id: number) => { await api.deleteService(id); await loadData(); };
    const handleSaveProduct = async (product: Product) => { await api.saveProduct(product); await loadData(); };
    const handleDeleteProduct = async (id: number) => { await api.deleteProduct(id); await loadData(); };
    const handleSaveMembership = async (membership: Membership) => { await api.saveMembership(membership); await loadData(); };
    const handleDeleteMembership = async (id: number) => { await api.deleteMembership(id); await loadData(); };
    const handleSaveServiceCategory = async (category: ServiceCategory) => { await api.saveServiceCategory(category); await loadData(); };
    const handleDeleteServiceCategory = async (id: number) => { await api.deleteServiceCategory(id); await loadData(); };
    const handleSaveProductCategory = async (category: ProductCategory) => { await api.saveProductCategory(category); await loadData(); };
    const handleDeleteProductCategory = async (id: number) => { await api.deleteProductCategory(id); await loadData(); };
    const handleSaveEgresoCategory = async (category: EgresoCategory) => { await api.saveEgresoCategory(category); await loadData(); };
    const handleDeleteEgresoCategory = async (id: number) => { await api.deleteEgresoCategory(id); await loadData(); };
    const handleSaveJobPosition = async (position: JobPosition) => { await api.saveJobPosition(position); await loadData(); };
    const handleDeleteJobPosition = async (id: number) => { await api.deleteJobPosition(id); await loadData(); };

    const handleLogin = (username: string, password?: string) => {
        setLoginError('');
        const userFound = users.find(u => u.usuario.toLowerCase() === username.toLowerCase());
        if (userFound) {
            // Check password if it exists on the user object
            if (userFound.password && userFound.password !== password) {
                 setLoginError('Usuario o contraseña incorrectos.');
                 return;
            }
            setCurrentUser(userFound);
            setIsAuthenticated(true);
            setCurrentPage('dashboard');
        } else {
            setLoginError('Usuario o contraseña incorrectos.');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setCurrentUser(null);
    };

    const currentUserPermissions = useMemo(() => {
        if (!currentUser) return [];
        // If user has permissions directly (our default user), use those
        if (currentUser.permissions && currentUser.permissions.length > 0) {
            return currentUser.permissions;
        }
        // Otherwise try to find from roles
        if (roles.length > 0) {
            const userRole = roles.find(role => role.id === currentUser.rolId);
            return userRole ? userRole.permissions : [];
        }
        return [];
    }, [currentUser, roles]);

    const currentUserDashboardMetrics = useMemo(() => {
        if (!currentUser) return [];
        // Return all metrics by default for our default admin user
        if (currentUser.id === 0) {
            return ['leads', 'campaigns', 'egresos', 'ventas', 'incidencias', 'seguidores', 'publicaciones'];
        }
        if (roles.length > 0) {
            const userRole = roles.find(role => role.id === currentUser.rolId);
            return userRole ? userRole.dashboardMetrics || [] : [];
        }
        return [];
    }, [currentUser, roles]);

    // Map user permissions to dashboard tabs
    const currentUserDashboardTabs = useMemo(() => {
        if (!currentUser) return [];
        // Return all tabs by default for our default admin user
        if (currentUser.id === 0) {
            return ['general', 'marketing', 'recepcion', 'procedimientos', 'finanzas', 'rrhh'];
        }
        const tabs: string[] = [];
        const perms = currentUserPermissions;
        
        // Map permissions to tabs
        if (perms.some(p => p === 'dashboard')) tabs.push('general');
        if (perms.some(p => p.startsWith('marketing-') || p.startsWith('redes-sociales-'))) tabs.push('marketing');
        if (perms.some(p => p.startsWith('recepcion-'))) tabs.push('recepcion');
        if (perms.some(p => p.startsWith('procedimientos-'))) tabs.push('procedimientos');
        if (perms.some(p => p.startsWith('finanzas-'))) tabs.push('finanzas');
        if (perms.some(p => p.startsWith('rrhh-'))) tabs.push('rrhh');
        
        return tabs;
    }, [currentUser, currentUserPermissions]);
    
    const handleSetCurrentPage = (page: Page) => {
        if (currentUserPermissions.includes(page)) {
            setCurrentPage(page);
        } else {
            setCurrentPage('dashboard'); // Fallback to dashboard
        }
    };

    // Notification Handlers
    const handleNotificationClick = (notification: Notification) => {
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
        handleSetCurrentPage(notification.relatedPage);
    };

    const handleMarkAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };
    
    const renderPage = () => {
        if (!currentUser || !businessInfo) {
            return <div className="flex items-center justify-center h-full">Cargando...</div>
        }
        
        const dashboardProps = {
            leads, 
            campaigns, 
            ventasExtra, 
            incidencias, 
            egresos, 
            permissions: currentUserDashboardTabs,
            goals,
            seguidores,
            publicaciones,
            users,
            roles,
        };

        if (!currentUserPermissions.includes(currentPage)) {
             return <Dashboard {...dashboardProps} />;
        }

        switch (currentPage) {
            case 'dashboard':
                return <Dashboard {...dashboardProps} />;
            case 'marketing-leads':
                return <LeadsPage leads={leads} campaigns={campaigns} metaCampaigns={metaCampaigns} onSaveLead={handleSaveLead} onDeleteLead={handleDeleteLead} clientSources={clientSources} services={services} memberships={memberships} users={users} requestConfirmation={requestConfirmation} onSaveComprobante={handleSaveComprobante} comprobantes={comprobantes} />;
            case 'marketing-campanas':
                 return <CampaignsPage 
                    campaigns={campaigns} 
                    leads={leads} 
                    onSaveCampaign={handleSaveCampaign} 
                    onDeleteCampaign={handleDeleteCampaign}
                    metaCampaigns={metaCampaigns}
                    onSaveMetaCampaign={handleSaveMetaCampaign}
                    onDeleteMetaCampaign={handleDeleteMetaCampaign}
                    requestConfirmation={requestConfirmation}
                 />;
            case 'redes-sociales-publicaciones':
                return <PublicacionesPage publicaciones={publicaciones} onSave={handleSavePublicacion} onDelete={handleDeletePublicacion} requestConfirmation={requestConfirmation} />;
            case 'redes-sociales-seguidores':
                return <SeguidoresPage seguidores={seguidores} onSave={handleSaveSeguidor} onDelete={handleDeleteSeguidor} requestConfirmation={requestConfirmation} />;
            case 'recepcion-agendados':
                return <AgendadosPage leads={leads} campaigns={campaigns} metaCampaigns={metaCampaigns} onSaveLead={handleSaveLead} onDeleteLead={handleDeleteLead} clientSources={clientSources} services={services} requestConfirmation={requestConfirmation} onSaveComprobante={handleSaveComprobante} comprobantes={comprobantes} />;
            case 'recepcion-ventas-extra':
                return <VentasExtraPage title="Ventas Recepción" ventas={ventasExtra} pacientes={leads.filter(l => l.nHistoria)} onSaveVenta={handleSaveVentaExtra} onDeleteVenta={handleDeleteVentaExtra} services={services} products={products} memberships={memberships} requestConfirmation={requestConfirmation} onSaveComprobante={handleSaveComprobante} comprobantes={comprobantes} onSaveLead={handleSaveLead} />;
            case 'recepcion-incidencias':
                return <IncidenciasPage incidencias={incidencias} pacientes={leads.filter(l => l.nHistoria)} onSaveIncidencia={handleSaveIncidencia} onDeleteIncidencia={handleDeleteIncidencia} requestConfirmation={requestConfirmation} />;
            case 'procedimientos-atenciones':
                return <AtencionesDiariasPage leads={leads} campaigns={campaigns} metaCampaigns={metaCampaigns} onSaveLead={handleSaveLead} onDeleteLead={handleDeleteLead} clientSources={clientSources} services={services} requestConfirmation={requestConfirmation} onSaveComprobante={handleSaveComprobante} comprobantes={comprobantes} />;
            case 'procedimientos-seguimiento':
                return <AnalisisSeguimientoPage leads={leads} />;
            case 'pacientes-historia':
                return <PacientesHistoriaPage leads={leads} />;
            case 'calendario':
                return <CalendarPage leads={leads} campaigns={campaigns} metaCampaigns={metaCampaigns} onSaveLead={handleSaveLead} onDeleteLead={handleDeleteLead} clientSources={clientSources} services={services} requestConfirmation={requestConfirmation} onSaveComprobante={handleSaveComprobante} comprobantes={comprobantes} />;
            case 'procedimientos-ventas-extra':
                return <VentasExtraPage title="Ventas" ventas={ventasExtra} pacientes={leads.filter(l => l.nHistoria)} onSaveVenta={handleSaveVentaExtra} onDeleteVenta={handleDeleteVentaExtra} services={services} products={products} memberships={memberships} requestConfirmation={requestConfirmation} onSaveComprobante={handleSaveComprobante} comprobantes={comprobantes} onSaveLead={handleSaveLead} />;
            case 'procedimientos-incidencias':
                 return <IncidenciasPage incidencias={incidencias} pacientes={leads.filter(l => l.nHistoria)} onSaveIncidencia={handleSaveIncidencia} onDeleteIncidencia={handleDeleteIncidencia} requestConfirmation={requestConfirmation} />;
            case 'finanzas-egresos':
                return <EgresosDiariosPage 
                    egresos={egresos} 
                    onSaveEgreso={handleSaveEgreso} 
                    onDeleteEgreso={handleDeleteEgreso}
                    proveedores={proveedores}
                    egresoCategories={egresoCategories}
                    requestConfirmation={requestConfirmation}
                />;
            case 'finanzas-facturacion':
                return <FacturacionPage comprobantes={comprobantes} />;
            case 'configuracion':
                return <ConfiguracionPage
                    users={users}
                    roles={roles}
                    businessInfo={businessInfo}
                    goals={goals}
                    clientSources={clientSources}
                    services={services}
                    products={products}
                    memberships={memberships}
                    serviceCategories={serviceCategories}
                    productCategories={productCategories}
                    jobPositions={jobPositions}
                    proveedores={proveedores}
                    tiposProveedor={tiposProveedor}
                    egresoCategories={egresoCategories}
                    onSaveUser={handleSaveUser}
                    onDeleteUser={handleDeleteUser}
                    onSaveRole={handleSaveRole}
                    onDeleteRole={handleDeleteRole}
                    onSaveBusinessInfo={handleSaveBusinessInfo}
                    onSaveGoal={handleSaveGoal}
                    onDeleteGoal={handleDeleteGoal}
                    onSaveClientSource={handleSaveClientSource}
                    onDeleteClientSource={handleDeleteClientSource}
                    onSaveService={handleSaveService}
                    onDeleteService={handleDeleteService}
                    onSaveProduct={handleSaveProduct}
                    onDeleteProduct={handleDeleteProduct}
                    onSaveMembership={handleSaveMembership}
                    onDeleteMembership={handleDeleteMembership}
                    onSaveServiceCategory={handleSaveServiceCategory}
                    onDeleteServiceCategory={handleDeleteServiceCategory}
                    onSaveProductCategory={handleSaveProductCategory}
                    onDeleteProductCategory={handleDeleteProductCategory}
                    onSaveJobPosition={handleSaveJobPosition}
                    onDeleteJobPosition={handleDeleteJobPosition}
                    onSaveProveedor={handleSaveProveedor}
                    onDeleteProveedor={handleDeleteProveedor}
                    onSaveTipoProveedor={handleSaveTipoProveedor}
                    onDeleteTipoProveedor={handleDeleteTipoProveedor}
                    onSaveEgresoCategory={handleSaveEgresoCategory}
                    onDeleteEgresoCategory={handleDeleteEgresoCategory}
                    requestConfirmation={requestConfirmation}
                    comprobantes={comprobantes}
                    onImportCampaigns={handleImportCampaigns}
                    onImportMetaCampaigns={handleImportMetaCampaigns}
                />;
            case 'rrhh-perfiles':
                return <RecursosHumanosPage 
                    users={users}
                    roles={roles}
                    leads={leads}
                    goals={goals}
                    currentUser={currentUser}
                />;
            case 'informes':
                return <InformesPage
                    leads={leads}
                    campaigns={campaigns}
                    ventasExtra={ventasExtra}
                    goals={goals}
                    publicaciones={publicaciones}
                    seguidores={seguidores}
                />;
            default:
                return <Dashboard {...dashboardProps} />;
        }
    };
    
    if (loading) {
         return <div className="w-screen h-screen flex items-center justify-center">Cargando sistema...</div>;
    }

    // Authentication disabled - go directly to dashboard
    // if (!isAuthenticated) {
    //     return <LoginPage onLogin={handleLogin} error={loginError} logoUrl={businessInfo?.logoUrl} loginImageUrl={businessInfo?.loginImageUrl} />;
    // }

    return (
        <div className="flex h-screen bg-gray-100">
            <BirthdayAnimation users={users} />
            <Sidebar 
                currentPage={currentPage} 
                setCurrentPage={handleSetCurrentPage}
                isCollapsed={isSidebarCollapsed}
                permissions={currentUserPermissions}
                businessInfo={businessInfo}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopBar 
                    onToggleSidebar={() => setSidebarCollapsed(!isSidebarCollapsed)} 
                    currentUser={currentUser}
                    roles={roles}
                    onLogout={handleLogout}
                    notifications={notifications}
                    onNotificationClick={handleNotificationClick}
                    onMarkAllAsRead={handleMarkAllAsRead}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6 print:p-0">
                    {renderPage()}
                </main>
            </div>
            {confirmationState?.isOpen && (
                <ConfirmationModal
                    isOpen={true}
                    title="Confirmar Acción"
                    message={confirmationState.message}
                    onConfirm={confirmationState.onConfirm}
                    onCancel={handleCancelConfirmation}
                />
            )}
        </div>
    );
};

export default App;
