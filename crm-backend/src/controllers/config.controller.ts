import * as express from 'express';
import prisma from '../lib/prisma';
import { Prisma, PrismaClient } from '@prisma/client';

// Define a type for model names that are valid for CRUD operations
type PrismaModelName = Exclude<keyof PrismaClient, `$${string}` | `_` | keyof typeof Prisma.ModelName>;

// Generic CRUD factory for simple models
const createCrudHandlers = <T extends { id: number; }>(modelName: PrismaModelName) => {
    const model = prisma[modelName];

    if (!model || typeof model !== 'object' || !('findMany' in model)) {
        throw new Error(`Invalid model name: ${String(modelName)}`);
    }

    const typedModel = model as any; // Still need 'any' here due to dynamic access patterns

    return {
        getAll: async (req: express.Request, res: express.Response) => {
            try {
                const items = await typedModel.findMany();
                res.status(200).json(items);
            } catch (error) {
                res.status(500).json({ message: `Error fetching ${String(modelName)}`, error: (error as Error).message });
            }
        },
        create: async (req: express.Request<any, any, T>, res: express.Response) => {
            const { id, ...data } = req.body;
            try {
                const newItem = await typedModel.create({ data });
                res.status(201).json(newItem);
            } catch (error) {
                res.status(500).json({ message: `Error creating ${String(modelName)}`, error: (error as Error).message });
            }
        },
        update: async (req: express.Request<{ id: string }, any, T>, res: express.Response) => {
            // FIX: Access `req.params.id` correctly.
            const id = parseInt(req.params.id);
            try {
                const updatedItem = await typedModel.update({ where: { id: id }, data: req.body });
                res.status(200).json(updatedItem);
            } catch (error) {
                res.status(500).json({ message: `Error updating ${String(modelName)}`, error: (error as Error).message });
            }
        },
        delete: async (req: express.Request<{ id: string }>, res: express.Response) => {
            // FIX: Access `req.params.id` correctly.
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
export const getBusinessInfo = async (req: express.Request, res: express.Response) => {
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
            res.status(200).json(defaultInfo);
        }
        res.status(200).json(info);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching business info', error: (error as Error).message });
    }
};

export const updateBusinessInfo = async (req: express.Request<any, any, Prisma.BusinessInfoUpdateInput>, res: express.Response) => {
    try {
        // FIX: Use upsert for robustness: creates if not exists, updates if it does.
        // Assumes a single BusinessInfo entry with ID 1.
        const updatedInfo = await prisma.businessInfo.upsert({
            where: { id: 1 },
            update: req.body,
            create: { // Provide default values for create if it doesn't exist
                id: 1,
                nombre: req.body.nombre as string || 'Munnay System',
                ruc: req.body.ruc as string || '12345678901',
                direccion: req.body.direccion as string || 'Av. Principal 123',
                telefono: req.body.telefono as string || '987654321',
                email: req.body.email as string || 'info@munnay.com',
                logoUrl: req.body.logoUrl as string || 'https://i.imgur.com/JmZt2eU.png',
                loginImageUrl: req.body.loginImageUrl as string || '',
            },
        });
        res.status(200).json(updatedInfo);
    } catch (error) {
        res.status(500).json({ message: 'Error updating business info', error: (error as Error).message });
    }
};

// Client Sources
const clientSourceHandlers = createCrudHandlers<'clientSource'>('clientSource');
export const getClientSources = clientSourceHandlers.getAll;
export const createClientSource = clientSourceHandlers.create;
export const updateClientSource = clientSourceHandlers.update;
export const deleteClientSource = clientSourceHandlers.delete;

// Services
const serviceHandlers = createCrudHandlers<'service'>('service');
export const getServices = serviceHandlers.getAll;
export const createService = serviceHandlers.create;
export const updateService = serviceHandlers.update;
export const deleteService = serviceHandlers.delete;

// Products
const productHandlers = createCrudHandlers<'product'>('product');
export const getProducts = productHandlers.getAll;
export const createProduct = productHandlers.create;
export const updateProduct = productHandlers.update;
export const deleteProduct = productHandlers.delete;

// Memberships
const membershipHandlers = createCrudHandlers<'membership'>('membership');
export const getMemberships = membershipHandlers.getAll;
export const createMembership = membershipHandlers.create;
export const updateMembership = membershipHandlers.update;
// FIX: Corrected typo 'deleteMemberships' to match the route and standard naming (plural for all)
export const deleteMemberships = membershipHandlers.delete;

// Service Categories
const serviceCategoryHandlers = createCrudHandlers<'serviceCategory'>('serviceCategory');
export const getServiceCategories = serviceCategoryHandlers.getAll;
export const createServiceCategory = serviceCategoryHandlers.create;
export const updateServiceCategory = serviceCategoryHandlers.update;
export const deleteServiceCategory = serviceCategoryHandlers.delete;

// Product Categories
const productCategoryHandlers = createCrudHandlers<'productCategory'>('productCategory');
export const getProductCategories = productCategoryHandlers.getAll;
export const createProductCategory = productCategoryHandlers.create;
export const updateProductCategory = productCategoryHandlers.update;
export const deleteProductCategory = productCategoryHandlers.delete;

// Egreso Categories
const egresoCategoryHandlers = createCrudHandlers<'egresoCategory'>('egresoCategory');
export const getEgresoCategories = egresoCategoryHandlers.getAll;
export const createEgresoCategory = egresoCategoryHandlers.create;
export const updateEgresoCategory = egresoCategoryHandlers.update;
export const deleteEgresoCategory = egresoCategoryHandlers.delete;

// Job Positions
const jobPositionHandlers = createCrudHandlers<'jobPosition'>('jobPosition');
export const getJobPositions = jobPositionHandlers.getAll;
export const createJobPosition = jobPositionHandlers.create;
export const updateJobPosition = jobPositionHandlers.update;
export const deleteJobPosition = jobPositionHandlers.delete;

// Comprobantes Electronicos
const comprobanteElectronicoHandlers = createCrudHandlers<'comprobanteElectronico'>('comprobanteElectronico');
export const getComprobantes = comprobanteElectronicoHandlers.getAll;
export const createComprobante = comprobanteElectronicoHandlers.create;
export const updateComprobante = comprobanteElectronicoHandlers.update;
export const deleteComprobante = comprobanteElectronicoHandlers.delete;
