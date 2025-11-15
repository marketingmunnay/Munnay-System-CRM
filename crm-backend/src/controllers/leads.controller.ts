import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Helper to map vendor strings to Seller enum values
const mapSeller = (value: any): string => {
  if (!value) return 'Vanesa';
  const s = String(value).toLowerCase();
  if (s.includes('vanesa')) return 'Vanesa';
  if (s.includes('liz')) return 'Liz';
  if (s.includes('elvira')) return 'Elvira';
  // Try simple name match: first name
  const first = s.split(' ')[0];
  if (first === 'vanesa' || first === 'vanessa') return 'Vanesa';
  if (first === 'liz' || first === 'liza') return 'Liz';
  if (first === 'elvira') return 'Elvira';
  // Default fallback
  return 'Vanesa';
};
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
        pagosRecepcion: true,
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
        pagosRecepcion: true,
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
    tratamientos, procedimientos, registrosLlamada, seguimientos, 
    alergias, membresiasAdquiridas, pagosRecepcion, ...leadData
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

    // Helper function to normalize ReceptionStatus values to valid enum tokens or undefined
    const normalizeEnum = (value: any): string | undefined => {
      if (!value && value !== 0) return undefined;
      if (typeof value !== 'string') return undefined;
      const cleaned = value.replace(/\s+/g, '').toLowerCase();
      const map: Record<string, string> = {
        'agendado': 'Agendado',
        'poratender': 'PorAtender',
        'atendido': 'Atendido',
        'reprogramado': 'Reprogramado',
        'cancelado': 'Cancelado',
        'noasistio': 'NoAsistio',
        'agendadoporllegar': 'Agendado',
        'enespera': 'PorAtender'
      };
      return map[cleaned] ?? undefined;
    };

    const newLead = await prisma.lead.create({
      data: {
        ...leadData,
        vendedor: mapSeller(leadData.vendedor),
        estadoRecepcion: normalizeEnum(leadData.estadoRecepcion),
        fechaLead: parseDate(leadData.fechaLead, true, new Date()),
        fechaHoraAgenda: parseDate(leadData.fechaHoraAgenda),
        fechaVolverLlamar: parseDate(leadData.fechaVolverLlamar),
        birthDate: parseDate(leadData.birthDate, true),
        // Handle relation for memberships if needed
        membresiasAdquiridas: {
          connect: (membresiasAdquiridas as {id: number}[])?.map((m: {id: number}) => ({id: m.id})) || []
        },
        // Create tratamientos if provided
        tratamientos: tratamientos && tratamientos.length > 0 ? {
          create: tratamientos.map((t: any) => ({
            nombre: t.nombre || '',
            cantidadSesiones: parseInt(t.cantidadSesiones) || 0,
            precio: parseFloat(t.precio) || 0,
            montoPagado: parseFloat(t.montoPagado) || 0,
            metodoPago: t.metodoPago || null,
            deuda: parseFloat(t.deuda) || 0
          }))
        } : undefined,
        // Create procedimientos if provided
        procedimientos: procedimientos && procedimientos.length > 0 ? {
          create: procedimientos.map((p: any) => ({
            fechaAtencion: parseDate(p.fechaAtencion, true) || new Date(),
            personal: p.personal || '',
            horaInicio: p.horaInicio || '',
            horaFin: p.horaFin || '',
            tratamientoId: (p.tratamientoId ? BigInt(String(p.tratamientoId)) : BigInt(0)) as any,
            nombreTratamiento: p.nombreTratamiento || '',
            sesionNumero: parseInt(p.sesionNumero) || 1,
            asistenciaMedica: Boolean(p.asistenciaMedica),
            medico: p.medico || null,
            observacion: p.observacion || null
          }))
        } : undefined,
        // Create registrosLlamada if provided
        registrosLlamada: registrosLlamada && registrosLlamada.length > 0 ? {
          create: registrosLlamada.map((r: any) => ({
            numeroLlamada: r.numeroLlamada,
            duracionLlamada: r.duracionLlamada,
            estadoLlamada: r.estadoLlamada,
            observacion: r.observacion,
          }))
        } : undefined,
        // Create seguimientos if provided
        seguimientos: seguimientos && seguimientos.length > 0 ? {
          create: seguimientos.map((s: any) => ({
            fecha: parseDate(s.fecha, true, new Date()),
            procedimientoId: s.procedimientoId,
            dolor: s.dolor || false,
            hinchazon: s.hinchazon || false,
            enrojecimiento: s.enrojecimiento || false,
            picazon: s.picazon || false,
            hematomas: s.hematomas || false,
            sensibilidad: s.sensibilidad || false,
            otrosSintomas: s.otrosSintomas || false,
            descripcionOtros: s.descripcionOtros,
            observaciones: s.observaciones,
          }))
        } : undefined,
        // Create alergias if provided
        alergias: alergias && alergias.length > 0 ? {
          create: alergias.map((a: any) => ({
            nombreAlergia: a.nombreAlergia,
          }))
        } : undefined,
        // Create pagos de recepción if provided
        pagosRecepcion: pagosRecepcion && pagosRecepcion.length > 0 ? {
          create: pagosRecepcion.map((p: any) => ({
            monto: p.monto,
            metodoPago: p.metodoPago,
            fechaPago: parseDate(p.fechaPago) || new Date(),
            observacion: p.observacion,
          }))
        } : undefined,
      },
      include: {
        tratamientos: true,
        procedimientos: true,
        registrosLlamada: true,
        seguimientos: true,
        alergias: true,
        pagosRecepcion: true,
        comprobantes: true,
      }
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

  console.log('🔍 DEBUGGING: UpdateLead received:', {
    leadId: id,
    procedimientos: procedimientos ? procedimientos.length : 'undefined',
    procedimientosData: procedimientos,
    estadoRecepcion: req.body.estadoRecepcion
  });

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
    const normalizeEnum = (value: string | undefined | null): string | undefined => {
      if (!value) return undefined;
      const cleaned = String(value).replace(/\s+/g, '').toLowerCase();
      const map: Record<string, string> = {
        'agendado': 'Agendado',
        'poratender': 'PorAtender',
        'atendido': 'Atendido',
        'cancelado': 'Cancelado',
        'noasistio': 'NoAsistio',
        'reprogramado': 'Reprogramado',
        'agendadoporllegar': 'Agendado',
        'enespera': 'PorAtender'
      };
      return map[cleaned] ?? undefined;
    };

    // Get existing lead to preserve fechaLead if not provided
    const existingLead = await prisma.lead.findUnique({
      where: { id: id }
    });

    const parsedFechaLead = parseDate(leadData.fechaLead, true);
    const finalFechaLead = parsedFechaLead !== undefined ? parsedFechaLead : existingLead?.fechaLead;

    // Handle treatments: Update existing or create new, but NEVER delete to preserve tratamientoId
    if (tratamientos !== undefined && Array.isArray(tratamientos)) {
      console.log('🔄 Processing treatments:', tratamientos.length);
      for (const tratamiento of tratamientos) {
        // Only update if ID is positive (existing records)
        // Negative IDs are temporary and should be created as new
        if (tratamiento.id && tratamiento.id > 0) {
          // Update existing treatment
          console.log('✏️ Updating existing treatment:', tratamiento.id);
          await prisma.treatment.update({
            where: { id: (BigInt(String(tratamiento.id)) as any) },
            data: {
              nombre: tratamiento.nombre || '',
              cantidadSesiones: parseInt(tratamiento.cantidadSesiones) || 0,
              precio: parseFloat(tratamiento.precio) || 0,
              montoPagado: parseFloat(tratamiento.montoPagado) || 0,
              metodoPago: tratamiento.metodoPago || null,
              deuda: parseFloat(tratamiento.deuda) || 0
            }
          });
        } else if (tratamiento.id && tratamiento.id < 0) {
          console.log('⏭️ Skipping temporary ID (will be created):', tratamiento.id);
        }
        // Note: New treatments will be created below in the prisma.lead.update call
      }
    }
    
    // Handle procedimientos: Delete and recreate only procedimientos (safe because they reference tratamientoId)
    if (procedimientos !== undefined && Array.isArray(procedimientos)) {
      console.log('🔄 Deleting existing procedimientos, will recreate:', procedimientos.length);
      await prisma.procedure.deleteMany({ where: { leadId: id } });
    }
    if (seguimientos !== undefined && Array.isArray(seguimientos)) {
      console.log('🔄 Deleting existing seguimientos, will recreate:', seguimientos.length);
      await prisma.seguimiento.deleteMany({ where: { leadId: id } });
    }
    if (pagosRecepcion !== undefined && Array.isArray(pagosRecepcion)) {
      console.log('🔄 Deleting existing pagosRecepcion, will recreate:', pagosRecepcion.length);
      await prisma.pagoRecepcion.deleteMany({ where: { leadId: id } });
    }

    // Update lead with all data including relations
    const updatedLead = await prisma.lead.update({
      where: { id: id },
      data: {
        ...leadData,
        vendedor: leadData.vendedor ? mapSeller(leadData.vendedor) : existingLead?.vendedor,
        fechaLead: finalFechaLead,
        fechaHoraAgenda: parseDate(leadData.fechaHoraAgenda),
        fechaVolverLlamar: parseDate(leadData.fechaVolverLlamar),
        birthDate: parseDate(leadData.birthDate, true),
        estadoRecepcion: normalizeEnum(leadData.estadoRecepcion),
        membresiasAdquiridas: {
          set: (membresiasAdquiridas as {id: number}[])?.map((m: {id: number}) => ({id: m.id})) || []
        },
        // Create only NEW treatments (those without an id)
        tratamientos: (tratamientos && Array.isArray(tratamientos) && tratamientos.length > 0) ? {
          create: tratamientos
            .filter((t: any) => !t.id || t.id < 0) // Create treatments without ID or with negative (temporary) IDs
            .map((t: any) => {
              console.log('✨ Creating NEW treatment:', t.nombre);
              return {
                nombre: t.nombre || '',
                cantidadSesiones: parseInt(t.cantidadSesiones) || 0,
                precio: parseFloat(t.precio) || 0,
                montoPagado: parseFloat(t.montoPagado) || 0,
                metodoPago: t.metodoPago || null,
                deuda: parseFloat(t.deuda) || 0
              };
            })
        } : undefined,
        procedimientos: (procedimientos && Array.isArray(procedimientos) && procedimientos.length > 0) ? {
          create: procedimientos
            .filter((p: any) => {
              // Skip procedimientos with invalid tratamientoId
              const tratamientoIdValue = parseInt(p.tratamientoId) || 0;
              if (tratamientoIdValue <= 0) {
                console.warn('⚠️ Skipping procedimiento with invalid tratamientoId:', {
                  nombreTratamiento: p.nombreTratamiento,
                  tratamientoId: tratamientoIdValue,
                  original: p.tratamientoId
                });
                return false;
              }
              return true;
            })
            .map((p: any) => {
              console.log('✨ Creating procedimiento:', p);
                const tratamientoIdValue = BigInt(String(p.tratamientoId)) as any;
              return {
                fechaAtencion: parseDate(p.fechaAtencion, true) || new Date(),
                personal: p.personal || '',
                horaInicio: p.horaInicio || '',
                horaFin: p.horaFin || '',
                    tratamientoId: tratamientoIdValue,
                nombreTratamiento: p.nombreTratamiento || '',
                sesionNumero: parseInt(p.sesionNumero) || 1,
                asistenciaMedica: Boolean(p.asistenciaMedica),
                medico: p.medico || null,
                observacion: p.observacion || null
              };
            })
        } : (() => {
          console.log('❌ NOT creating procedimientos - array empty or invalid:', {
            procedimientos,
            isArray: Array.isArray(procedimientos),
            length: procedimientos?.length
          });
          return undefined;
        })(),
        seguimientos: (seguimientos && Array.isArray(seguimientos) && seguimientos.length > 0) ? {
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
        } : undefined,
        // Create pagos de recepción if provided
        pagosRecepcion: (pagosRecepcion && Array.isArray(pagosRecepcion) && pagosRecepcion.length > 0) ? {
          create: pagosRecepcion.map((p: any) => ({
            monto: p.monto,
            metodoPago: p.metodoPago,
            fechaPago: parseDate(p.fechaPago) || new Date(),
            observacion: p.observacion,
          }))
        } : undefined
      },
      include: {
        tratamientos: true,
        procedimientos: true,
        registrosLlamada: true,
        seguimientos: true,
        alergias: true,
        pagosRecepcion: true,
        comprobantes: true,
      }
    });
    res.status(200).json(updatedLead);
  } catch (error: any) {
    console.error(`❌ Error updating lead ${id}:`, {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Error updating lead', 
      error: error.message,
      code: error.code,
      details: error.meta
    });
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