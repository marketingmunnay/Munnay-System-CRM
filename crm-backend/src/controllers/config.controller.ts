import { Request, Response } from 'express';
import prisma from '../lib/prisma';
// FIX: Added model types from @prisma/client
// import { Prisma, ClientSource, Service, Product, Membership, ServiceCategory, ProductCategory, EgresoCategory, JobPosition, ComprobanteElectronico, BusinessInfo } from '@prisma/client';


// Generic CRUD factory for simple models
// FIX: Changed modelName to string and used `(prisma as any)` to work around type resolution issues.
const createCrudHandlers = (modelName: string) => {
    const model = (prisma as any)[modelName];

    if (!model || typeof model !== 'object' || !('findMany' in model)) {
        throw new Error(`Invalid model name: ${String(modelName)}`);
    }

    const typedModel = model as any; // Still need 'any' here due to dynamic access patterns

    return {
        getAll: async (req: Request, res: Response) => {
            try {
                const items = await typedModel.findMany();
                res.status(200).json(items);
            } catch (error) {
                res.status(500).json({ message: `Error fetching ${String(modelName)}`, error: (error as Error).message });
            }
        },
        create: async (req: Request, res: Response) => {
            const { id, ...data } = req.body;
            try {
                const newItem = await typedModel.create({ data });
                res.status(201).json(newItem);
            } catch (error) {
                res.status(500).json({ message: `Error creating ${String(modelName)}`, error: (error as Error).message });
            }
        },
        update: async (req: Request, res: Response) => {
            const id = parseInt(req.params.id);
            const { id: _, ...data } = req.body; // Exclude id from update data
            try {
                const updatedItem = await typedModel.update({ where: { id: id }, data });
                res.status(200).json(updatedItem);
            } catch (error) {
                res.status(500).json({ message: `Error updating ${String(modelName)}`, error: (error as Error).message });
            }
        },
        delete: async (req: Request, res: Response) => {
            const id = parseInt(req.params.id);
            try {
                await typedModel.delete({ where: { id: id } });
                res.status(204).send();
            } catch (error) {
                res.status(500).json({ message: `Error deleting ${String(modelName)}`, error: (error as Error).message });
            }
        }
    };
};

// --- Business Info (special case) ---
export const getBusinessInfo = async (req: Request, res: Response) => {
    try {
        // Assuming there's only one record, or we fetch the first one.
        let info = await prisma.businessInfo.findFirst();
        if (!info) {
             // Create a default if it doesn't exist
            info = await prisma.businessInfo.create({
                data: {
                    id: 1, // Explicitly set ID if it's not autoincrement
                    nombre: 'Munnay System',
                    ruc: '12345678901',
                    direccion: 'Av. Principal 123',
                    telefono: '987654321',
                    email: 'info@munnay.com',
                    logoUrl: 'https://i.imgur.com/JmZt2eU.png',
                    loginImageUrl: ''
                }
            });
        }
        res.status(200).json(info);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching business info', error: (error as Error).message });
    }
};

export const updateBusinessInfo = async (req: Request, res: Response) => {
    const { id: _, ...data } = req.body; // Exclude id from update data
    try {
        // FIX: Use upsert for robustness: creates if not exists, updates if it does.
        // Assumes a single BusinessInfo entry with ID 1.
        const updatedInfo = await prisma.businessInfo.upsert({
            where: { id: 1 },
            update: data,
            create: { // Provide default values for create if it doesn't exist
                id: 1,
                nombre: data.nombre || 'Munnay System',
                ruc: data.ruc || '12345678901',
                direccion: data.direccion || 'Av. Principal 123',
                telefono: data.telefono || '987654321',
                email: data.email || 'info@munnay.com',
                logoUrl: data.logoUrl || 'https://i.imgur.com/JmZt2eU.png',
                loginImageUrl: data.loginImageUrl || '',
            },
        });
        res.status(200).json(updatedInfo);
    } catch (error) {
        res.status(500).json({ message: 'Error updating business info', error: (error as Error).message });
    }
};

// Client Sources
const clientSourceHandlers = createCrudHandlers('clientSource');
export const getClientSources = clientSourceHandlers.getAll;
export const createClientSource = clientSourceHandlers.create;
export const updateClientSource = clientSourceHandlers.update;
export const deleteClientSource = clientSourceHandlers.delete;

// Services
const serviceHandlers = createCrudHandlers('service');
export const getServices = serviceHandlers.getAll;
export const createService = serviceHandlers.create;
export const updateService = serviceHandlers.update;
export const deleteService = serviceHandlers.delete;

// Products
const productHandlers = createCrudHandlers('product');
export const getProducts = productHandlers.getAll;
export const createProduct = productHandlers.create;
export const updateProduct = productHandlers.update;
export const deleteProduct = productHandlers.delete;

// Memberships - Custom handlers to support nested MembershipService creation
export const getMemberships = async (req: Request, res: Response) => {
    try {
        const memberships = await prisma.membership.findMany({
            include: {
                servicios: true, // Include related services
            } as any,
        });
        res.status(200).json(memberships);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching memberships', error: (error as Error).message });
    }
};

export const createMembership = async (req: Request, res: Response) => {
    const { id, servicios, ...data } = req.body;
    
    console.log('=== CREATE MEMBERSHIP REQUEST ===');
    console.log('Body recibido:', JSON.stringify(req.body, null, 2));
    
    try {
        const newMembership = await prisma.membership.create({
            data: {
                ...data,
                servicios: {
                    create: (servicios || []).map((servicio: any) => ({
                        servicioNombre: servicio.servicioNombre,
                        precio: servicio.precio,
                        numeroSesiones: servicio.numeroSesiones,
                    })),
                },
            } as any,
            include: {
                servicios: true,
            } as any,
        });
        
        console.log('Membresía creada exitosamente:', newMembership.id);
        res.status(201).json(newMembership);
    } catch (error) {
        console.error('Error creating membership:', error);
        console.error('Error stack:', (error as Error).stack);
        res.status(500).json({ 
            message: 'Error creating membership', 
            error: (error as Error).message,
            details: error instanceof Error ? error.stack : 'Unknown error'
        });
    }
};

export const updateMembership = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { id: _, servicios, ...data } = req.body;
    
    console.log('=== UPDATE MEMBERSHIP REQUEST ===');
    console.log('ID:', id);
    console.log('Body recibido:', JSON.stringify(req.body, null, 2));
    
    try {
        // Delete existing services and create new ones (simpler than selective update)
        const updatedMembership = await prisma.membership.update({
            where: { id: id },
            data: {
                ...data,
                servicios: {
                    deleteMany: {}, // Delete all existing services
                    create: (servicios || []).map((servicio: any) => ({
                        servicioNombre: servicio.servicioNombre,
                        precio: servicio.precio,
                        numeroSesiones: servicio.numeroSesiones,
                    })),
                },
            } as any,
            include: {
                servicios: true,
            } as any,
        });
        
        console.log('Membresía actualizada exitosamente:', updatedMembership.id);
        res.status(200).json(updatedMembership);
    } catch (error) {
        console.error('Error updating membership:', error);
        res.status(500).json({ 
            message: 'Error updating membership', 
            error: (error as Error).message 
        });
    }
};

export const deleteMembership = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    try {
        // Cascade delete will automatically delete related MembershipService records
        await prisma.membership.delete({ where: { id: id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ 
            message: 'Error deleting membership', 
            error: (error as Error).message 
        });
    }
};

// Service Categories
const serviceCategoryHandlers = createCrudHandlers('serviceCategory');
export const getServiceCategories = serviceCategoryHandlers.getAll;
export const createServiceCategory = serviceCategoryHandlers.create;
export const updateServiceCategory = serviceCategoryHandlers.update;
export const deleteServiceCategory = serviceCategoryHandlers.delete;

// Product Categories
const productCategoryHandlers = createCrudHandlers('productCategory');
export const getProductCategories = productCategoryHandlers.getAll;
export const createProductCategory = productCategoryHandlers.create;
export const updateProductCategory = productCategoryHandlers.update;
export const deleteProductCategory = productCategoryHandlers.delete;

// Egreso Categories
const egresoCategoryHandlers = createCrudHandlers('egresoCategory');
export const getEgresoCategories = egresoCategoryHandlers.getAll;
export const createEgresoCategory = egresoCategoryHandlers.create;
export const updateEgresoCategory = egresoCategoryHandlers.update;
export const deleteEgresoCategory = egresoCategoryHandlers.delete;

// Job Positions
const jobPositionHandlers = createCrudHandlers('jobPosition');
export const getJobPositions = jobPositionHandlers.getAll;
export const createJobPosition = jobPositionHandlers.create;
export const updateJobPosition = jobPositionHandlers.update;
export const deleteJobPosition = jobPositionHandlers.delete;

// Comprobantes Electronicos
const comprobanteElectronicoHandlers = createCrudHandlers('comprobanteElectronico');
export const getComprobantes = comprobanteElectronicoHandlers.getAll;
export const createComprobante = comprobanteElectronicoHandlers.create;
export const updateComprobante = comprobanteElectronicoHandlers.update;
export const deleteComprobante = comprobanteElectronicoHandlers.delete;