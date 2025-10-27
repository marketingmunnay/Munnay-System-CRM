import { Request, Response } from 'express';
import prisma from '../lib/prisma';
// FIX: Removed `ParamsDictionary` import as it was causing type conflicts.

export const getLeads = async (req: Request, res: Response) => {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        tratamientos: true,
        procedimientos: true,
        registrosLlamada: true,
        seguimientos: true,
        alergias: true,
        // Include new relation for ComprobanteElectronico
        comprobantes: true,
      }
    });
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    (res as Response).status(200).json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    (res as Response).status(500).json({ message: 'Error fetching leads', error: (error as Error).message });
  }
};

export const getLeadById = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access `req.params.id` correctly (added explicit cast for clarity).
  const id = (req.params as any).id;
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: parseInt(id) },
      include: {
        tratamientos: true,
        procedimientos: true,
        registrosLlamada: true,
        seguimientos: true,
        alergias: true,
        // Include new relation for ComprobanteElectronico
        comprobantes: true,
      }
    });
    if (!lead) {
      // FIX: Use `res.status` directly (added explicit cast for clarity).
      return (res as Response).status(404).json({ message: 'Lead not found' });
    }
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    (res as Response).status(200).json(lead);
  } catch (error) {
    console.error(`Error fetching lead ${id}:`, error);
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    (res as Response).status(500).json({ message: 'Error fetching lead', error: (error as Error).message });
  }
};

export const createLead = async (req: Request, res: Response) => {
  const { 
    id, createdAt, updatedAt, 
    tratamientos, procedimientos, registrosLlamada, seguimientos, 
    alergias, membresiasAdquiridas, comprobantes, 
    // FIX: Access `req.body` correctly (added explicit cast for clarity).
    ...leadData 
  } = (req.body as any);

  try {
    const newLead = await prisma.lead.create({
      data: {
        ...leadData,
        fechaLead: new Date(leadData.fechaLead),
        fechaHoraAgenda: leadData.fechaHoraAgenda ? new Date(leadData.fechaHoraAgenda) : null,
        fechaVolverLlamar: leadData.fechaVolverLlamar ? new Date(leadData.fechaVolverLlamar) : null,
        birthDate: leadData.birthDate ? new Date(leadData.birthDate) : null,
        // Handle relation for memberships if needed, currently not supported in simple create
        membresiasAdquiridas: {
          connect: (membresiasAdquiridas as {id: number}[])?.map((m: {id: number}) => ({id: m.id})) || []
        }
      },
    });
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    (res as Response).status(201).json(newLead);
  } catch (error) {
    console.error("Error creating lead:", error);
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    (res as Response).status(500).json({ message: 'Error creating lead', error: (error as Error).message });
  }
};

export const updateLead = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access `req.params.id` correctly (added explicit cast for clarity).
  const id = (req.params as any).id;
  const { 
    createdAt, updatedAt, 
    tratamientos, procedimientos, registrosLlamada, seguimientos, 
    alergias, membresiasAdquiridas, comprobantes, 
    // FIX: Access `req.body` correctly (added explicit cast for clarity).
    ...leadData 
  } = (req.body as any);

  try {
    // NOTE: This is a simplified update that only handles scalar fields.
    // A real-world scenario requires complex logic to handle updates, creations,
    // and deletions of related records (treatments, procedures, etc.) within a transaction.
    const updatedLead = await prisma.lead.update({
      where: { id: parseInt(id) },
      data: {
        ...leadData,
        fechaLead: leadData.fechaLead ? new Date(leadData.fechaLead) : undefined,
        fechaHoraAgenda: leadData.fechaHoraAgenda ? new Date(leadData.fechaHoraAgenda) : (leadData.fechaHoraAgenda === null ? null : undefined),
        fechaVolverLlamar: leadData.fechaVolverLlamar ? new Date(leadData.fechaVolverLlamar) : (leadData.fechaVolverLlamar === null ? null : undefined),
        birthDate: leadData.birthDate ? new Date(leadData.birthDate) : (leadData.birthDate === null ? null : undefined),
        membresiasAdquiridas: {
          set: (membresiasAdquiridas as {id: number}[])?.map((m: {id: number}) => ({id: m.id})) || []
        }
      },
       include: {
        tratamientos: true,
        procedimientos: true,
        registrosLlamada: true,
        seguimientos: true,
        alergias: true,
        // Include new relation for ComprobanteElectronico
        comprobantes: true,
      }
    });
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    (res as Response).status(200).json(updatedLead);
  } catch (error) {
    console.error(`Error updating lead ${id}:`, error);
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    (res as Response).status(500).json({ message: 'Error updating lead', error: (error as Error).message });
  }
};

export const deleteLead = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access `req.params.id` correctly (added explicit cast for clarity).
  const id = (req.params as any).id;
  try {
    // Prisma requires deleting related records first if not using cascading deletes in the schema.
    // The schema has been updated with onDelete: Cascade, so these manual deletes are a safeguard.
    // However, for Many-to-Many relationships or if specific logic is needed, more complex handling is required.

    // Disconnect memberships first if it's a Many-to-Many with onDelete: SetNull or not Cascade
    await prisma.lead.update({
      where: { id: parseInt(id) },
      data: {
        membresiasAdquiridas: {
          set: [], // Disconnect all related memberships
        },
      },
    });

    // These should cascade due to onDelete: Cascade in schema.prisma, but keeping them as a fallback if not configured correctly
    await prisma.registroLlamada.deleteMany({ where: { leadId: parseInt(id) } });
    await prisma.treatment.deleteMany({ where: { leadId: parseInt(id) } });
    await prisma.procedure.deleteMany({ where: { leadId: parseInt(id) } });
    await prisma.seguimiento.deleteMany({ where: { leadId: parseInt(id) } });
    await prisma.alergia.deleteMany({ where: { leadId: parseInt(id) } });
    
    // Delete related comprobantes first if not set up with cascading deletes
    await prisma.comprobanteElectronico.deleteMany({ where: { ventaId: parseInt(id), ventaType: 'lead' } });

    await prisma.lead.delete({
      where: { id: parseInt(id) },
    });
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    (res as Response).status(204).send();
  } catch (error) {
    console.error(`Error deleting lead ${id}:`, error);
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    (res as Response).status(500).json({ message: 'Error deleting lead', error: (error as Error).message });
  }
};