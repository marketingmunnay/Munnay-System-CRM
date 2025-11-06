import { Request, Response } from 'express';
import prisma from '../lib/prisma';
// FIX: Removed unused model imports that were causing errors.
// import { Lead, Treatment, Procedure, RegistroLlamada, Seguimiento, Alergia, Membership, ComprobanteElectronico } from '@prisma/client';

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
    res.status(200).json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ message: 'Error fetching leads', error: (error as Error).message });
  }
};

export const getLeadById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: id },
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
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.status(200).json(lead);
  } catch (error) {
    console.error(`Error fetching lead ${id}:`, error);
    res.status(500).json({ message: 'Error fetching lead', error: (error as Error).message });
  }
};

export const createLead = async (req: Request, res: Response) => {
  const { 
    id, createdAt, updatedAt, 
    tratamientos, procedimientos, registrosLlamada, seguimientos, 
    alergias, membresiasAdquiridas, comprobantes, 
    ...leadData
  } = req.body;

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
    res.status(201).json(newLead);
  } catch (error) {
    console.error("Error creating lead:", error);
    res.status(500).json({ message: 'Error creating lead', error: (error as Error).message });
  }
};

export const updateLead = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { 
    id: _, // Exclude id from update data
    createdAt, updatedAt, 
    tratamientos, procedimientos, registrosLlamada, seguimientos, 
    alergias, membresiasAdquiridas, comprobantes, 
    ...leadData
  } = req.body;

  try {
    // NOTE: This is a simplified update that only handles scalar fields.
    // A real-world scenario requires complex logic to handle updates, creations,
    // and deletions of related records (treatments, procedures, etc.) within a transaction.
    const updatedLead = await prisma.lead.update({
      where: { id: id },
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
    res.status(200).json(updatedLead);
  } catch (error) {
    console.error(`Error updating lead ${id}:`, error);
    res.status(500).json({ message: 'Error updating lead', error: (error as Error).message });
  }
};

export const deleteLead = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    // Prisma requires deleting related records first if not using cascading deletes in the schema.
    // The schema has been updated with onDelete: Cascade, so these manual deletes are a safeguard.
    // However, for Many-to-Many relationships or if specific logic is needed, more complex handling is required.

    // Disconnect memberships first if it's a Many-to-Many with onDelete: SetNull or not Cascade
    await prisma.lead.update({
      where: { id: id },
      data: {
        membresiasAdquiridas: {
          set: [], // Disconnect all related memberships
        },
      },
    });

    // These should cascade due to onDelete: Cascade in schema.prisma, but keeping them as a fallback if not configured correctly
    await prisma.registroLlamada.deleteMany({ where: { leadId: id } });
    await prisma.treatment.deleteMany({ where: { leadId: id } });
    await prisma.procedure.deleteMany({ where: { leadId: id } });
    await prisma.seguimiento.deleteMany({ where: { leadId: id } });
    await prisma.alergia.deleteMany({ where: { leadId: id } });
    
    // Delete related comprobantes where leadId matches
    await prisma.comprobanteElectronico.deleteMany({ where: { leadId: id } });

    await prisma.lead.delete({
      where: { id: id },
    });
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting lead ${id}:`, error);
    res.status(500).json({ message: 'Error deleting lead', error: (error as Error).message });
  }
};

// FIX: Added getNextHistoryNumber controller function
export const getNextHistoryNumber = async (req: Request, res: Response) => {
  try {
    const lastLeadWithHistory = await prisma.lead.findFirst({
      where: {
        nHistoria: {
          startsWith: 'H-',
        },
      },
      orderBy: {
        nHistoria: 'desc',
      },
      select: {
        nHistoria: true,
      },
    });

    let nextNumber = 1;
    if (lastLeadWithHistory && lastLeadWithHistory.nHistoria) {
      const lastNumber = parseInt(lastLeadWithHistory.nHistoria.split('-')[1]);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    const nextHistoryNumber = `H-${String(nextNumber).padStart(5, '0')}`;
    res.status(200).json(nextHistoryNumber);
  } catch (error) {
    console.error("Error generating next history number:", error);
    res.status(500).json({ message: 'Error generating next history number', error: (error as Error).message });
  }
};