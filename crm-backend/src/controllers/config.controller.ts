
// FIX: Add missing import for Express Request and Response types.
import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Generic CRUD factory for simple models
const createCrudHandlers = (modelName: any) => {
    const model = prisma[modelName as keyof typeof prisma];

    if (!model || typeof model !== 'object' || !('findMany' in model)) {
        throw new Error(`Invalid model name: ${modelName}`);
    }

    const typedModel = model as any;

    return {
        getAll: async (req: Request, res: Response) => {
            try {
                const items = await typedModel.findMany();
                res.status(200).json(items);
            } catch (error) {
                res.status(500).json({ message: `Error fetching ${modelName}`, error: (error as Error).message });
            }
        },
        create: async (req: Request, res: Response) => {
            const { id, ...data } = req.body;
            try {
                const newItem = await typedModel.create({ data });
                res.status(201).json(newItem);
            } catch (error) {
                res.status(500).json({ message: `Error creating ${modelName}`, error: (error as Error).message });
            }
        },
        update: async (req: Request, res: Response) => {
            const { id } = req.params;
            try {
                const updatedItem = await typedModel.update({ where: { id: parseInt(id) }, data: req.body });
                res.status(200).json(updatedItem);
            } catch (error) {
                res.status(500).json({ message: `Error updating ${modelName}`, error: (error as Error).message });
            }
        },
        delete: async (req: Request, res: Response) => {
            const { id } = req.params;
            try {
                await typedModel.delete({ where: { id: parseInt(id) } });
                res.status(204).send();
            } catch (error) {
                res.status(500).json({ message: `Error deleting ${modelName}`, error: (error as Error).message });
            }
        }
    };
};

// --- Business Info (special case) ---
export const getBusinessInfo = async (req: Request, res: Response) => {
    try {
        // Assuming there's only one record, or we fetch the first one.
        const info = await prisma.businessInfo.findFirst();
        if (!info) {
             // Create a default if it doesn't exist
            const defaultInfo = await prisma.businessInfo.create({
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
            return res.status(200).json(defaultInfo);
        }
        res.status(200).json(info);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching business info', error: (error as Error).message });
    }
};

export const updateBusinessInfo = async (req: Request, res: Response) => {
    try {
        const existingInfo = await prisma.businessInfo.findFirst();
        if (!existingInfo) {
            return res.status(404).json({ message: 'Business info not found to update.' });
        }
        const updatedInfo = await prisma.businessInfo.update({
            where: { id: existingInfo.id },
            data: req.body
        });
        res.status(200).json(updatedInfo);
    } catch (error) {
        res.status(500).json({ message: 'Error updating business info', error: (error as Error).message });
    }
};


// --- Client Sources ---
const clientSourceHandlers = createCrudHandlers('clientSource');
export const getClientSources = clientSourceHandlers.getAll;
export const createClientSource = clientSourceHandlers.create;
export const updateClientSource = clientSourceHandlers.update;
export const deleteClientSource = clientSourceHandlers.delete;

// --- Services ---
const serviceHandlers = createCrudHandlers('service');
export const getServices = serviceHandlers.getAll;
export const createService = serviceHandlers.create;
export const updateService = serviceHandlers.update;
export const deleteService = serviceHandlers.delete;

// --- Products ---
const productHandlers = createCrudHandlers('product');
export const getProducts = productHandlers.getAll;
export const createProduct = productHandlers.create;
export const updateProduct = productHandlers.update;
export const deleteProduct = productHandlers.delete;

// --- Memberships ---
const membershipHandlers = createCrudHandlers('membership');
export const getMemberships = membershipHandlers.getAll;
export const createMembership = membershipHandlers.create;
export const updateMembership = membershipHandlers.update;
export const deleteMembership = membershipHandlers.delete;

// --- Service Categories ---
const serviceCategoryHandlers = createCrudHandlers('serviceCategory');
export const getServiceCategories = serviceCategoryHandlers.getAll;
export const createServiceCategory = serviceCategoryHandlers.create;
export const updateServiceCategory = serviceCategoryHandlers.update;
export const deleteServiceCategory = serviceCategoryHandlers.delete;

// --- Product Categories ---
const productCategoryHandlers = createCrudHandlers('productCategory');
export const getProductCategories = productCategoryHandlers.getAll;
export const createProductCategory = productCategoryHandlers.create;
export const updateProductCategory = productCategoryHandlers.update;
export const deleteProductCategory = productCategoryHandlers.delete;

// --- Egreso Categories ---
const egresoCategoryHandlers = createCrudHandlers('egresoCategory');
export const getEgresoCategories = egresoCategoryHandlers.getAll;
export const createEgresoCategory = egresoCategoryHandlers.create;
export const updateEgresoCategory = egresoCategoryHandlers.update;
export const deleteEgresoCategory = egresoCategoryHandlers.delete;

// --- Job Positions ---
const jobPositionHandlers = createCrudHandlers('jobPosition');
export const getJobPositions = jobPositionHandlers.getAll;
export const createJobPosition = jobPositionHandlers.create;
export const updateJobPosition = jobPositionHandlers.update;
export const deleteJobPosition = jobPositionHandlers.delete;