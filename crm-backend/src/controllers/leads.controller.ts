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
    // Helper function to safely parse dates for creation
    const parseDate = (dateStr: any, addTime: boolean = false, defaultValue: Date | null = null): Date | null => {
      if (dateStr === null || !dateStr || dateStr === '' || dateStr === 'undefined') return defaultValue;
      
      try {
        const dateValue = addTime ? new Date(dateStr + 'T00:00:00') : new Date(dateStr);
        // Check if date is valid
        if (isNaN(dateValue.getTime())) return defaultValue;
        return dateValue;
      } catch {
        return defaultValue;
      }
    };

    const newLead = await prisma.lead.create({
      data: {
        ...leadData,
        fechaLead: parseDate(leadData.fechaLead, true, new Date()),
        fechaHoraAgenda: parseDate(leadData.fechaHoraAgenda),
        fechaVolverLlamar: parseDate(leadData.fechaVolverLlamar),
        birthDate: parseDate(leadData.birthDate, true),
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
    // Helper function to safely parse dates
    const parseDate = (dateStr: any, addTime: boolean = false): Date | null | undefined => {
      if (dateStr === null) return null;
      if (!dateStr || dateStr === '' || dateStr === 'undefined') return undefined;
      
      try {
        const dateValue = addTime ? new Date(dateStr + 'T00:00:00') : new Date(dateStr);
        // Check if date is valid
        if (isNaN(dateValue.getTime())) return undefined;
        return dateValue;
      } catch {
        return undefined;
      }
    };

    // NOTE: This is a simplified update that only handles scalar fields.
    // A real-world scenario requires complex logic to handle updates, creations,
    // and deletions of related records (treatments, procedures, etc.) within a transaction.
    const updatedLead = await prisma.lead.update({
      where: { id: id },
      data: {
        ...leadData,
        fechaLead: parseDate(leadData.fechaLead, true),
        fechaHoraAgenda: parseDate(leadData.fechaHoraAgenda),
        fechaVolverLlamar: parseDate(leadData.fechaVolverLlamar),
        birthDate: parseDate(leadData.birthDate, true),
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
// Retorna solo el número correlativo (empezando en 100)
// El frontend construye el formato completo: LetraApellido + 00 + número
export const getNextHistoryNumber = async (req: Request, res: Response) => {
  try {
    // Buscar todos los leads que tengan número de historia
    const allLeadsWithHistory = await prisma.lead.findMany({
      where: {
        nHistoria: {
          not: null,
        },
      },
      select: {
        nHistoria: true,
      },
    });

    // Extraer números de todos los formatos (ej: H00100, A00101, etc.)
    const numbers = allLeadsWithHistory
      .map((lead: any) => {
        if (lead.nHistoria) {
          // Extraer dígitos después de "00" (formato: Letra + 00 + número)
          const match = lead.nHistoria.match(/00(\d+)$/);
          return match ? parseInt(match[1]) : 0;
        }
        return 0;
      })
      .filter((num: number) => num > 0);

    // Encontrar el máximo y sumar 1, o empezar en 100
    let nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 100;

    // Retornar solo el número correlativo como string
    res.status(200).json(String(nextNumber));
  } catch (error) {
    console.error("Error generating next history number:", error);
    res.status(500).json({ message: 'Error generating next history number', error: (error as Error).message });
  }
};