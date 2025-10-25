import { Request, Response } from 'express';
import prisma from '../lib/prisma';
// FIX: Removed duplicate import of PrismaClient as it's already instantiated in prisma.ts and exported as a default.
// The type `PrismaClient` can be referenced directly from the `prisma` instance's type if needed, or re-imported
// as a type import: `import type { PrismaClient } from '@prisma/client';` if truly necessary for a type annotation.
// For transaction, `tx_prisma` automatically gets the correct type.

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
                // FIX: Add .status() method to the response object.
                res.status(200).json(items);
            } catch (error) {
                // FIX: Add .status() method to the response object.
                res.status(500).json({ message: `Error fetching ${modelName}`, error: (error as Error).message });
            }
        },
        create: async (req: Request<any, any, any>, res: Response) => {
            // FIX: Access body from the request object directly.
            const { id, ...data } = req.body;
            try {
                const newItem = await typedModel.create({ data });
                // FIX: Add .status() method to the response object.
                res.status(201).json(newItem);
            } catch (error) {
                // FIX: Add .status() method to the response object.
                res.status(500).json({ message: `Error creating ${modelName}`, error: (error as Error).message });
            }
        },
        update: async (req: Request<{ id: string }, any, any>, res: Response) => {
            // FIX: Access params from the request object directly.
            const { id } = req.params;
            try {
                // FIX: Access body from the request object directly.
                const updatedItem = await typedModel.update({ where: { id: parseInt(id) }, data: req.body });
                // FIX: Add .status() method to the response object.
                res.status(200).json(updatedItem);
            } catch (error) {
                // FIX: Add .status() method to the response object.
                res.status(500).json({ message: `Error updating ${modelName}`, error: (error as Error).message });
            }
        },
        delete: async (req: Request<{ id: string }>, res: Response) => {
            // FIX: Access params from the request object directly.
            const { id } = req.params;
            try {
                await typedModel.delete({ where: { id: parseInt(id) } });
                // FIX: Add .status() method to the response object.
                res.status(204).send();
            } catch (error) {
                // FIX: Add .status() method to the response object.
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
            // FIX: Add .status() method to the response object.
            return res.status(200).json(defaultInfo);
        }
        // FIX: Add .status() method to the response object.
        res.status(200).json(info);
    } catch (error) {
        // FIX: Add .status() method to the response object.
        res.status(500).json({ message: 'Error fetching business info', error: (error as Error).message });
    }
};

export const updateBusinessInfo = async (req: Request<any, any, any>, res: Response) => {
    try {
        const existingInfo = await prisma.businessInfo.findFirst();
        if (!existingInfo) {
            // FIX: Add .status() method to the response object.
            return res.status(404).json({ message: 'Business info not found to update.' });
        }
        // FIX: Access body from the request object directly.
        const updatedInfo = await prisma.businessInfo.update({
            where: { id: existingInfo.id },
            data: req.body
        });
        // FIX: Add .status() method to the response object.
        res.status(200).json(updatedInfo);
    } catch (error) {
        // FIX: Add .status() method to the response object.
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
export const deleteMemberships = membershipHandlers.delete;

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

// Comprobantes Electronicos
export const getComprobantes = async (req: Request, res: Response) => {
  try {
    const comprobantes = await prisma.comprobanteElectronico.findMany({
      include: {
        items: true,
      },
      orderBy: {
        fechaEmision: 'desc',
      },
    });
    // FIX: Add .status() method to the response object.
    res.status(200).json(comprobantes);
  } catch (error) {
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error fetching comprobantes', error: (error as Error).message });
  }
};

export const createComprobante = async (req: Request<any, any, any>, res: Response) => {
  // FIX: Access body from the request object directly.
  const { id, items, fechaEmision, ...data } = req.body;
  try {
    const newComprobante = await prisma.comprobanteElectronico.create({
      data: {
        ...data,
        fechaEmision: new Date(fechaEmision),
        items: {
          create: items.map((item: any) => ({
            descripcion: item.descripcion,
            cantidad: item.cantidad,
            valorUnitario: item.valorUnitario,
            precioUnitario: item.precioUnitario,
            igv: item.igv,
            montoTotal: item.montoTotal,
          })),
        },
      },
      include: {
        items: true,
      },
    });
    // FIX: Add .status() method to the response object.
    res.status(201).json(newComprobante);
  } catch (error) {
    console.error("Error creating comprobante:", error);
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error creating comprobante', error: (error as Error).message });
  }
};

export const updateComprobante = async (req: Request<{ id: string }, any, any>, res: Response) => {
  // FIX: Access params from the request object directly.
  const { id } = req.params;
  // FIX: Access body from the request object directly.
  const { items, fechaEmision, ...data } = req.body;
  try {
    // Start a transaction to update both comprobante and its items
    const updatedComprobante = await prisma.$transaction(async (tx_prisma: typeof prisma) => {
      // First, delete existing items for this comprobante
      await tx_prisma.comprobanteItem.deleteMany({
        where: { comprobanteElectronicoId: parseInt(id) },
      });

      // Then, update the comprobante itself and create new items
      const comprobante = await tx_prisma.comprobanteElectronico.update({
        where: { id: parseInt(id) },
        data: {
          ...data,
          fechaEmision: fechaEmision ? new Date(fechaEmision) : undefined,
          items: {
            create: items.map((item: any) => ({
              descripcion: item.descripcion,
              cantidad: item.cantidad,
              valorUnitario: item.valorUnitario,
              precioUnitario: item.precioUnitario,
              igv: item.igv,
              montoTotal: item.montoTotal,
            })),
          },
        },
        include: {
          items: true,
        },
      });
      return comprobante;
    });

    // FIX: Add .status() method to the response object.
    res.status(200).json(updatedComprobante);
  } catch (error) {
    console.error(`Error updating comprobante ${id}:`, error);
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error updating comprobante', error: (error as Error).message });
  }
};

export const deleteComprobante = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access params from the request object directly.
  const { id } = req.params;
  try {
    // Deleting the comprobante should cascade to its items
    await prisma.comprobanteElectronico.delete({
      where: { id: parseInt(id) },
    });
    // FIX: Add .status() method to the response object.
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting comprobante ${id}:`, error);
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error deleting comprobante', error: (error as Error).message });
  }
};