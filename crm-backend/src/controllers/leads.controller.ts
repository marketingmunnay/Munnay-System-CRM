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
    pagosRecepcion, // Extract pagosRecepcion to prevent it from going to leadData
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

    // Helper function to normalize enum values (remove spaces)
    const normalizeEnum = (value: string | undefined | null): string | undefined | null => {
      if (!value) return value;
      return value.replace(/\s+/g, ''); // Remove all spaces
    };

    // Get existing lead to preserve fechaLead if not provided
    const existingLead = await prisma.lead.findUnique({
      where: { id: id }
    });

    const parsedFechaLead = parseDate(leadData.fechaLead, true);
    const finalFechaLead = parsedFechaLead !== undefined ? parsedFechaLead : existingLead?.fechaLead;

    // Delete existing related records first
    await prisma.treatment.deleteMany({ where: { leadId: id } });
    await prisma.procedure.deleteMany({ where: { leadId: id } });
    await prisma.seguimiento.deleteMany({ where: { leadId: id } });

    // Update lead with all data including relations
    const updatedLead = await prisma.lead.update({
      where: { id: id },
      data: {
        ...leadData,
        fechaLead: finalFechaLead,
        fechaHoraAgenda: parseDate(leadData.fechaHoraAgenda),
        fechaVolverLlamar: parseDate(leadData.fechaVolverLlamar),
        birthDate: parseDate(leadData.birthDate, true),
        estadoRecepcion: normalizeEnum(leadData.estadoRecepcion),
        membresiasAdquiridas: {
          set: (membresiasAdquiridas as {id: number}[])?.map((m: {id: number}) => ({id: m.id})) || []
        },
        // Create related records
        tratamientos: tratamientos ? {
          create: tratamientos.map((t: any) => ({
            nombre: t.nombre,
            cantidadSesiones: t.cantidadSesiones,
            precio: t.precio,
            montoPagado: t.montoPagado,
            metodoPago: t.metodoPago,
            deuda: t.deuda
          }))
        } : undefined,
        procedimientos: procedimientos ? {
          create: procedimientos.map((p: any) => ({
            fechaAtencion: parseDate(p.fechaAtencion, true) || new Date(),
            personal: p.personal,
            horaInicio: p.horaInicio,
            horaFin: p.horaFin,
            tratamientoId: p.tratamientoId,
            nombreTratamiento: p.nombreTratamiento,
            sesionNumero: p.sesionNumero,
            asistenciaMedica: p.asistenciaMedica,
            medico: p.medico,
            observacion: p.observacion
          }))
        } : undefined,
        seguimientos: seguimientos ? {
          create: seguimientos.map((s: any) => ({
            procedimientoId: s.procedimientoId,
            nombreProcedimiento: s.nombreProcedimiento,
            fechaSeguimiento: parseDate(s.fechaSeguimiento, true) || new Date(),
            personal: s.personal,
            inflamacion: s.inflamacion,
            ampollas: s.ampollas,
            alergias: s.alergias,
            malestarGeneral: s.malestarGeneral,
            brote: s.brote,
            dolorDeCabeza: s.dolorDeCabeza,
            moretones: s.moretones,
            observacion: s.observacion
          }))
        } : undefined
      },
      include: {
        tratamientos: true,
        procedimientos: true,
        registrosLlamada: true,
        seguimientos: true,
        alergias: true,
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