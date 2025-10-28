import * as express from 'express'; // FIX: Import express as a namespace
import prisma from '../lib/prisma';

// Generic CRUD factory for simple models
const createCrudHandlers = <T extends { id: number; }>(modelName: keyof Omit<typeof prisma, "$runtime" | "$extends" | "$on" | "$transaction" | "$use" | "disconnect" | "connect" | "runCommandRaw" | "queryRaw" | "executeRaw" | "lead" | "role" | "campaign" | "metaCampaign" | "egreso" | "publicacion" | "seguidor" | "ventaExtra" | "incidencia" | "proveedor" | "tipoProveedor" | "user" | "goal" | "comprobanteElectronico" | "comprobanteItem" | "treatment" | "procedure" | "registroLlamada" | "seguimiento" | "alergia" | "address" | "emergencyContact" | "reconocimiento" >) => { // FIX: Explicitly typed modelName and excluded internal Prisma properties
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
        create: async (req: express.Request, res: express.Response) => { // FIX: Use express.Request and express.Response
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
        update: async (req: express.Request<{ id: string }>, res: express.Response) => { // FIX: Use express.Request and express.Response
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

export const updateBusinessInfo = async (req: express.Request, res: express.Response) => { // FIX: Use express.Request and express.Response
    try {
        const existingInfo = await prisma.businessInfo.findFirst();
        if (!existingInfo) {
            // FIX: Use `res.status` directly.
            return res.status(404).json({ message: 'Business info not found to update.' });
        }
        const updatedInfo = await prisma.businessInfo.update({
            where: { id: existingInfo.id },
            data: req.body
        });
        // FIX: Use `res.status` directly.
        res.status(200).json(updatedInfo);
    } catch (error) {
        // FIX: Use `res.status` directamente.
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
export const getComprobantes = async (req: express.Request, res: express.Response) => { // FIX: Use express.Request and express.Response
  try {
    const comprobantes = await prisma.comprobanteElectronico.findMany({
      include: {
        items: true,
      },
      orderBy: {
        fechaEmision: 'desc',
      },
    });
    // FIX: Use `res.status` directamente.
    res.status(200).json(comprobantes);
  } catch (error) {
    // FIX: Use `res.status` directamente.
    res.status(500).json({ message: 'Error fetching comprobantes', error: (error as Error).message });
  }
};

export const createComprobante = async (req: express.Request, res: express.Response) => { // FIX: Use express.Request and express.Response
  const { id, items, fechaEmision, originalVentaId, originalVentaType, ...data } = req.body; // Destructure originalVentaId, originalVentaType
  
  let leadId: number | null = null;
  let ventaExtraId: number | null = null;

  if (originalVentaType === 'lead') {
    leadId = originalVentaId;
  } else if (originalVentaType === 'venta_extra') {
    ventaExtraId = originalVentaId;
  }

  try {
    const newComprobante = await prisma.comprobanteElectronico.create({
      data: {
        ...data,
        fechaEmision: new Date(fechaEmision),
        originalVentaId: originalVentaId, // Set originalVentaId
        originalVentaType: originalVentaType, // Set originalVentaType
        leadId: leadId, // Set leadId
        ventaExtraId: ventaExtraId, // Set ventaExtraId
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
    // FIX: Use `res.status` directamente.
    res.status(201).json(newComprobante);
  } catch (error) {
    console.error("Error creating comprobante:", error);
    // FIX: Use `res.status` directamente.
    res.status(500).json({ message: 'Error creating comprobante', error: (error as Error).message });
  }
};

export const updateComprobante = async (req: express.Request<{ id: string }>, res: express.Response) => { // FIX: Use express.Request and express.Response
  const id = parseInt(req.params.id);
  const { items, fechaEmision, originalVentaId, originalVentaType, ...data } = req.body; // Destructure originalVentaId, originalVentaType

  let leadId: number | null = null;
  let ventaExtraId: number | null = null;

  if (originalVentaType === 'lead') {
    leadId = originalVentaId;
  } else if (originalVentaType === 'venta_extra') {
    ventaExtraId = originalVentaId;
  }

  try {
    // Start a transaction to update both comprobante and its items
    const updatedComprobante = await prisma.$transaction(async (tx_prisma: typeof prisma) => {
      // First, delete existing items for this comprobante
      await tx_prisma.comprobanteItem.deleteMany({
        where: { comprobanteElectronicoId: id },
      });

      // Then, update the comprobante itself and create new items
      const comprobante = await tx_prisma.comprobanteElectronico.update({
        where: { id: id },
        data: {
          ...data,
          fechaEmision: fechaEmision ? new Date(fechaEmision) : undefined,
          originalVentaId: originalVentaId, // Set originalVentaId
          originalVentaType: originalVentaType, // Set originalVentaType
          leadId: leadId, // Set leadId
          ventaExtraId: ventaExtraId, // Set venta
        },
        include: {
          items: true,
        },
      });
      return comprobante;
    });
    // FIX: Use `res.status` directly.
    res.status(200).json(updatedComprobante);
  } catch (error) {
    console.error(`Error updating comprobante ${id}:`, error);
    // FIX: Use `res.status` directamente.
    res.status(500).json({ message: 'Error updating comprobante', error: (error as Error).message });
  }
};

export const deleteComprobante = async (req: express.Request<{ id: string }>, res: express.Response) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.comprobanteItem.deleteMany({
      where: { comprobanteElectronicoId: id },
    });
    await prisma.comprobanteElectronico.delete({
      where: { id: id },
    });
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting comprobante ${id}:`, error);
    res.status(500).json({ message: 'Error deleting comprobante', error: (error as Error).message });
  }
};