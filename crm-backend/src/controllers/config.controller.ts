import * as express from 'express'; // FIX: Import express as a namespace
import prisma from '../lib/prisma';
import { Prisma, PrismaClient } from '@prisma/client'; // Import Prisma and PrismaClient for type definitions

// Define a type for model names that are valid for CRUD operations
type PrismaModelName = Exclude<keyof PrismaClient, `$${string}` | `_` | keyof typeof Prisma.ModelName>;

// Generic CRUD factory for simple models
const createCrudHandlers = <T extends { id: number; }>(modelName: PrismaModelName) => { // FIX: Explicitly typed modelName and excluded internal Prisma properties
    const model = prisma[modelName]; // FIX: Remove type assertion as modelName is now typed

    if (!model || typeof model !== 'object' || !('findMany' in model)) {
        throw new Error(`Invalid model name: ${String(modelName)}`); // FIX: Explicitly convert to string
    }

    const typedModel = model as any; // Still need 'any' here due to dynamic access patterns

    return {
        getAll: async (req: express.Request, res: express.Response) => { // FIX: Use express.Request and express.Response
            try {
                const items = await typedModel.findMany();
                // FIX: Use `res.status` directly.
                res.status(200).json(items);
            } catch (error) {
                // FIX: Use `res.status` directly.
                res.status(500).json({ message: `Error fetching ${String(modelName)}`, error: (error as Error).message }); // FIX: Explicitly convert to string
            }
        },
        create: async (req: express.Request<any, any, T>, res: express.Response) => { // FIX: Use express.Request and express.Response
            const { id, ...data } = req.body;
            try {
                const newItem = await typedModel.create({ data });
                // FIX: Use `res.status` directly.
                res.status(201).json(newItem);
            } catch (error) {
                // FIX: Use `res.status` directamente.
                res.status(500).json({ message: `Error creating ${String(modelName)}`, error: (error as Error).message }); // FIX: Explicitly convert to string
            }
        },
        update: async (req: express.Request<{ id: string }, any, T>, res: express.Response) => { // FIX: Use express.Request and express.Response
            const id = parseInt(req.params.id);
            try {
                const updatedItem = await typedModel.update({ where: { id: id }, data: req.body });
                // FIX: Use `res.status` directamente.
                res.status(200).json(updatedItem);
            } catch (error) {
                // FIX: Use `res.status` directamente.
                res.status(500).json({ message: `Error updating ${String(modelName)}`, error: (error as Error).message }); // FIX: Explicitly convert to string
            }
        },
        delete: async (req: express.Request<{ id: string }>, res: express.Response) => { // FIX: Use express.Request and express.Response
            const id = parseInt(req.params.id);
            try {
                await typedModel.delete({ where: { id: id } });
                // FIX: Use `res.status` directamente.
                res.status(204).send();
            } catch (error) {
                // FIX: Use `res.status` directamente.
                res.status(500).json({ message: `Error deleting ${String(modelName)}`, error: (error as Error).message }); // FIX: Explicitly convert to string
            }
        }
    };
};

// --- Business Info (special case) ---
export const getBusinessInfo = async (req: express.Request, res: express.Response) => { // FIX: Use express.Request and express.Response
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
            // FIX: Use `res.status` directly.
            return res.status(200).json(defaultInfo);
        }
        // FIX: Use `res.status` directly.
        res.status(200).json(info);
    } catch (error) {
        // FIX: Use `res.status` directly.
        res.status(500).json({ message: 'Error fetching business info', error: (error as Error).message });
    }
};

export const updateBusinessInfo = async (req: express.Request<any, any, Prisma.BusinessInfoUpdateInput>, res: express.Response) => { // FIX: Use express.Request and express.Response
    try {
        const existingInfo = await prisma.businessInfo.findFirst();
        if (!existingInfo) {
            // FIX: Use `res.status` directly.
            return res.status(404).json({ message: 'Business info not found to update.' });
        }
        const updatedInfo = await prisma.businessInfo.update({