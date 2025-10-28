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
            try {
                const updatedItem = await typedModel.update({ where: { id: id }, data: req.body });
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
    try {
        // FIX: Use upsert for robustness: creates if not exists, updates if it does.
        // Assumes a single BusinessInfo entry with ID 1.
        const updatedInfo = await prisma.businessInfo.upsert({
            where: { id: 1 },
            update: req.body,
            create: { // Provide default values for create if it doesn't exist
                id: 1,
                nombre: req.body.nombre || 'Munnay System',
                ruc: req.body.ruc || '12345678901',
                direccion: req.body.direccion || 'Av. Principal 123',
                telefono: req.body.telefono || '987654321',
                email: req.body.email || 'info@munnay.com',
                logoUrl: req.body.logoUrl || 'https://i.imgur.com/JmZt2eU.png',
                loginImageUrl: req.body.loginImageUrl || '',
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

// Memberships
const membershipHandlers = createCrudHandlers('membership');
export const getMemberships = membershipHandlers.getAll;
export const createMembership = membershipHandlers.create;
export const updateMembership = membershipHandlers.update;
// FIX: Corrected typo 'deleteMemberships' to match the route and standard naming (plural for all)
export const deleteMembership = membershipHandlers.delete;

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