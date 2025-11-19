import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Convert BigInt values (returned by Prisma for BigInt columns) into JSON-serializable
// values. If the BigInt fits into a safe JS number we convert to Number, otherwise to string.
const convertBigInts = (value: any): any => {
  if (typeof value === 'bigint') {
    const num = Number(value);
    return Number.isSafeInteger(num) ? num : String(value);
  }
  if (Array.isArray(value)) return value.map(v => convertBigInts(v));
  if (value && typeof value === 'object') {
    const out: any = {};
    for (const k of Object.keys(value)) {
      out[k] = convertBigInts((value as any)[k]);
    }
    return out;
  }
  return value;
};

// Helper to map estado strings to LeadStatus enum values
const mapLeadStatus = (value: any): string => {
  if (!value) return 'Nuevo';
  const s = String(value).toLowerCase().trim();
  if (s.includes('nuevo')) return 'Nuevo';
  if (s.includes('seguimiento')) return 'Seguimiento';
  if (s.includes('por pagar') || s.includes('porpagar')) return 'PorPagar';
  if (s.includes('agendado')) return 'Agendado';
  if (s.includes('perdido')) return 'Perdido';
  if (s.includes('completado') || s.includes('completadas')) return 'Seguimiento'; // Map to Seguimiento
  // Default fallback
  return 'Nuevo';
};
// Helper to map various payment labels to Prisma MetodoPago enum tokens
const mapMetodoPago = (value: any): string | undefined => {
  if (value === null || value === undefined) return undefined;
  const s = String(value).trim();
  // If already a valid token, return it
  const valid = ['Efectivo', 'Tarjeta', 'Transferencia', 'Yape', 'Plin'];
  if (valid.includes(s)) return s;
  const cleaned = s.replace(/\s+/g, '').toLowerCase();
  const map: Record<string, string> = {
    'efectivo': 'Efectivo',
    'cash': 'Efectivo',
    'tarjeta': 'Tarjeta',
    'card': 'Tarjeta',
    'transferencia': 'Transferencia',
    'transferenciabcp': 'Transferencia',
    'transferenciabcp.': 'Transferencia',
    'transferenciabcp ': 'Transferencia',
    'deposito': 'Transferencia',
    'yape': 'Yape',
    'plin': 'Plin'
  };
  return map[cleaned] ?? undefined;
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
    res.status(200).json(convertBigInts(leads));
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
    res.status(200).json(convertBigInts(lead));
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
        // Map 'agendado por llegar' to the existing 'Agendado' enum token
        'agendadoporllegar': 'Agendado',
        'enespera': 'PorAtender'
      };
      return map[cleaned] ?? undefined;
    };

    // Decide final estadoRecepcion: prefer provided value, otherwise if procedimientos exist treat as 'Atendido' (so procedures move to En Seguimiento)
    // If estadoRecepcion explicitly provided, prefer it. If it's 'Agendado' and fechaHoraAgenda exists,
    // treat it as 'AgendadoPorLlegar'. Otherwise, if procedimientos are present assume 'Atendido'.
    let finalEstadoRecepcionCreate = normalizeEnum(leadData.estadoRecepcion);
    const hasFechaHoraAgendaCreate = !!(leadData.fechaHoraAgenda);
    if (!finalEstadoRecepcionCreate && (procedimientos && Array.isArray(procedimientos) && procedimientos.length > 0)) {
      finalEstadoRecepcionCreate = 'Atendido';
    }
    // Keep DB token as 'Agendado' even if fechaHoraAgenda exists. The frontend will display
    // 'Agendado por llegar' when appropriate (estadoRecepcion === 'Agendado' && fechaHoraAgenda present).

    const newLead = await prisma.lead.create({
      data: {
        ...leadData,
        vendedor: mapSeller(leadData.vendedor),
        metodoPago: mapMetodoPago(leadData.metodoPago) as any,
        estadoRecepcion: finalEstadoRecepcionCreate,
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
              metodoPago: (mapMetodoPago(t.metodoPago) as any) ?? null,
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
            metodoPago: (mapMetodoPago(p.metodoPago) as any) ?? undefined,
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
    res.status(201).json(convertBigInts(newLead));
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
        // Map 'agendado por llegar' to the existing 'Agendado' enum token
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

    // Handle treatments: Try to update existing treatments; if update fails because the record
    // does not exist (P2025), create it and remember the new id mapping so procedimientos
    // referencing the original id can be mapped to the newly created treatment.
    const tratamientoIdMap: Record<string, any> = {}; // maps originalId -> prisma id (BigInt)
    if (tratamientos !== undefined && Array.isArray(tratamientos)) {
      console.log('🔄 Processing treatments:', tratamientos.length);
      for (const tratamiento of tratamientos) {
        const originalId = tratamiento.id;
        try {
          if (originalId && originalId > 0) {
            // Attempt to update existing treatment
            console.log('✏️ Attempting update treatment:', originalId);
            const updated = await prisma.treatment.update({
              where: { id: (BigInt(String(originalId)) as any) },
              data: {
                nombre: tratamiento.nombre || '',
                cantidadSesiones: parseInt(tratamiento.cantidadSesiones) || 0,
                precio: parseFloat(tratamiento.precio) || 0,
                montoPagado: parseFloat(tratamiento.montoPagado) || 0,
                  metodoPago: (mapMetodoPago(tratamiento.metodoPago) as any) ?? null,
                deuda: parseFloat(tratamiento.deuda) || 0
              }
            });
            tratamientoIdMap[String(originalId)] = updated.id;
            continue;
          }
          // If ID is negative or falsy, create a new treatment
          if (!originalId || originalId < 0) {
            console.log('✨ Creating treatment for temp id:', originalId);
            const created = await prisma.treatment.create({
              data: {
                leadId: id,
                nombre: tratamiento.nombre || '',
                cantidadSesiones: parseInt(tratamiento.cantidadSesiones) || 0,
                precio: parseFloat(tratamiento.precio) || 0,
                montoPagado: parseFloat(tratamiento.montoPagado) || 0,
                metodoPago: (mapMetodoPago(tratamiento.metodoPago) as any) ?? null,
                deuda: parseFloat(tratamiento.deuda) || 0
              }
            });
            tratamientoIdMap[String(originalId ?? created.id)] = created.id;
            continue;
          }
        } catch (tErr: any) {
          // If the update failed because record not found (P2025), create it instead
          if (tErr && tErr.code === 'P2025') {
            console.warn('⚠️ Treatment update not found, creating instead for id:', originalId);
            const created = await prisma.treatment.create({
              data: {
                leadId: id,
                nombre: tratamiento.nombre || '',
                cantidadSesiones: parseInt(tratamiento.cantidadSesiones) || 0,
                precio: parseFloat(tratamiento.precio) || 0,
                montoPagado: parseFloat(tratamiento.montoPagado) || 0,
                metodoPago: (mapMetodoPago(tratamiento.metodoPago) as any) ?? null,
                deuda: parseFloat(tratamiento.deuda) || 0
              }
            });
            tratamientoIdMap[String(originalId)] = created.id;
            continue;
          }
          // Re-throw unexpected errors
          throw tErr;
        }
      }
    }

    // Handle procedimientos: Delete existing procedimientos so we can recreate them with correct tratamientoId mappings
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

    // Decide final estadoRecepcion for update: prefer provided value, otherwise if procedimientos being created treat as 'Atendido'
    // Determine final estadoRecepcion for update.
    // Prefer explicitly provided normalized value. If not provided and procedimientos will be created, set 'Atendido'.
    // If the result is 'Agendado' but there is a fechaHoraAgenda (existing or provided), map to 'AgendadoPorLlegar'.
    const normalizedProvidedEstado = normalizeEnum(leadData.estadoRecepcion as any);
    const willCreateProcedimientos = procedimientos && Array.isArray(procedimientos) && procedimientos.length > 0;
    let finalEstadoRecepcionUpdate = normalizedProvidedEstado;
    const hasFechaHoraAgendaUpdate = leadData.fechaHoraAgenda !== undefined ? !!leadData.fechaHoraAgenda : !!existingLead?.fechaHoraAgenda;
    if (!finalEstadoRecepcionUpdate && willCreateProcedimientos) {
      finalEstadoRecepcionUpdate = 'Atendido';
    }
    // Do not write a non-existent enum token to the DB. Keep 'Agendado' in DB and
    // let the frontend display "Agendado por llegar" when appropriate.
    if (finalEstadoRecepcionUpdate === 'Agendado' && hasFechaHoraAgendaUpdate) {
      finalEstadoRecepcionUpdate = 'Agendado';
    }

    // Update lead with all data including relations
    const updatedLead = await prisma.lead.update({
      where: { id: id },
      data: {
        // Spread incoming data but override fields that must be normalized/mapped
        ...leadData,
        vendedor: leadData.vendedor ? mapSeller(leadData.vendedor) : existingLead?.vendedor,
        metodoPago: leadData.metodoPago !== undefined ? (mapMetodoPago(leadData.metodoPago) as any) : existingLead?.metodoPago,
        fechaLead: finalFechaLead,
        fechaHoraAgenda: parseDate(leadData.fechaHoraAgenda),
        fechaVolverLlamar: parseDate(leadData.fechaVolverLlamar),
        birthDate: parseDate(leadData.birthDate, true),
        estadoRecepcion: finalEstadoRecepcionUpdate,
        membresiasAdquiridas: {
          set: (membresiasAdquiridas as {id: number}[])?.map((m: {id: number}) => ({id: m.id})) || []
        },
        // Note: tratamientos and procedimientos are handled outside this nested update
        // to allow more robust update/create logic and mapping of IDs.
        // seguimientos and pagosRecepcion are handled after the lead update to ensure
        // procedimiento ids and treatment mappings are available.
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
    // Create procedimientos now that tratamientos have been updated/created and we have a mapping
    const procedimientoIdMap: Record<string, any> = {};
    if (procedimientos !== undefined && Array.isArray(procedimientos) && procedimientos.length > 0) {
      for (const p of procedimientos) {
        try {
          // Determine tratamientoId to use: prefer mapped id from tratamientoIdMap
          let tratamientoIdToUse: any = undefined;
          if (p.tratamientoId !== undefined && tratamientoIdMap[String(p.tratamientoId)]) {
            tratamientoIdToUse = tratamientoIdMap[String(p.tratamientoId)];
          } else if (p.tratamientoId) {
            tratamientoIdToUse = (BigInt(String(p.tratamientoId)) as any);
          } else {
            console.warn('⚠️ Skipping procedimiento with missing tratamientoId:', p);
            continue;
          }

          const createdProc = await prisma.procedure.create({
            data: {
              leadId: id,
              fechaAtencion: parseDate(p.fechaAtencion, true) || new Date(),
              personal: p.personal || '',
              horaInicio: p.horaInicio || '',
              horaFin: p.horaFin || '',
              tratamientoId: tratamientoIdToUse,
              nombreTratamiento: p.nombreTratamiento || '',
              sesionNumero: parseInt(p.sesionNumero) || 1,
              asistenciaMedica: Boolean(p.asistenciaMedica),
              medico: p.medico || null,
              observacion: p.observacion || null
            }
          });
          procedimientoIdMap[String(p.id ?? createdProc.id)] = createdProc.id;
        } catch (pErr) {
          console.error('Error creating procedimiento for lead', id, pErr);
        }
      }
    }

    // Create seguimientos, mapping procedimientoId when possible
    if (seguimientos !== undefined && Array.isArray(seguimientos) && seguimientos.length > 0) {
      for (const s of seguimientos) {
        try {
          let mappedProcId = undefined as any;
          if (s.procedimientoId !== undefined && procedimientoIdMap[String(s.procedimientoId)]) {
            mappedProcId = procedimientoIdMap[String(s.procedimientoId)];
          } else if (s.procedimientoId) {
            mappedProcId = (BigInt(String(s.procedimientoId)) as any);
          }
          await prisma.seguimiento.create({
            data: {
              leadId: id,
              procedimientoId: mappedProcId,
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
            }
          });
        } catch (sErr) {
          console.error('Error creating seguimiento for lead', id, sErr);
        }
      }
    }

    // Create pagosRecepcion if provided
    if (pagosRecepcion !== undefined && Array.isArray(pagosRecepcion) && pagosRecepcion.length > 0) {
      for (const p of pagosRecepcion) {
        try {
          await prisma.pagoRecepcion.create({
            data: {
              leadId: id,
              monto: p.monto,
              metodoPago: (mapMetodoPago(p.metodoPago) as any) ?? undefined,
              fechaPago: parseDate(p.fechaPago) || new Date(),
              observacion: p.observacion,
            }
          });
        } catch (payErr) {
          console.error('Error creating pagoRecepcion for lead', id, payErr);
        }
      }
    }

    // Re-fetch the lead with relations to return fresh data
    const refreshedLead = await prisma.lead.findUnique({
      where: { id: id },
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
    res.status(200).json(convertBigInts(refreshedLead));
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

export const bulkImportLeads = async (req: Request, res: Response) => {
  try {
    const leads = req.body;

    if (!Array.isArray(leads)) {
      return res.status(400).json({ message: 'Los datos deben ser un array de leads' });
    }

    console.log(`📥 Iniciando importación bulk de ${leads.length} leads`);

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < leads.length; i++) {
      const leadData = leads[i];
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
            // Map 'agendado por llegar' to the existing 'Agendado' enum token
            'agendadoporllegar': 'Agendado',
            'enespera': 'PorAtender'
          };
          return map[cleaned] ?? undefined;
        };

        // Clean leadData: only include valid fields and omit undefined values
        const cleanLeadData = {
          fechaLead: parseDate(leadData.fechaLead, true, new Date()),
          nombres: leadData.nombres || '',
          apellidos: leadData.apellidos || '',
          numero: leadData.numero || '',
          email: leadData.email || undefined,
          sexo: leadData.sexo || '',
          redSocial: leadData.redSocial || '',
          anuncio: leadData.anuncio || '',
          vendedor: mapSeller(leadData.vendedor),
          estado: mapLeadStatus(leadData.estado), // Map to valid LeadStatus
          montoPagado: parseFloat(leadData.montoPagado) || 0,
          metodoPago: mapMetodoPago(leadData.metodoPago) as any,
          fechaHoraAgenda: parseDate(leadData.fechaHoraAgenda),
          servicios: Array.isArray(leadData.servicios) ? leadData.servicios : [],
          categoria: leadData.categoria || '',
          profesionalAsignado: leadData.profesionalAsignado || undefined,
          observacionesGenerales: leadData.observacionesGenerales || undefined,
          fechaVolverLlamar: parseDate(leadData.fechaVolverLlamar),
          horaVolverLlamar: leadData.horaVolverLlamar || undefined,
          notas: leadData.notas || undefined,
          nHistoria: leadData.nHistoria || undefined,
          aceptoTratamiento: leadData.aceptoTratamiento || undefined,
          motivoNoCierre: leadData.motivoNoCierre || undefined,
          estadoRecepcion: normalizeEnum(leadData.estadoRecepcion),
          recursoId: leadData.recursoId || undefined,
          birthDate: parseDate(leadData.birthDate, true),
          precioCita: leadData.precioCita ? parseFloat(leadData.precioCita) : undefined,
          deudaCita: leadData.deudaCita ? parseFloat(leadData.deudaCita) : undefined,
          metodoPagoDeuda: mapMetodoPago(leadData.metodoPagoDeuda) as any,
          documentType: leadData.documentType || undefined,
          documentNumber: leadData.documentNumber || undefined,
          razonSocial: leadData.razonSocial || undefined,
          direccionFiscal: leadData.direccionFiscal || undefined,
        };

        // Skip if nHistoria already exists
        if (cleanLeadData.nHistoria) {
          const existingLead = await prisma.lead.findUnique({
            where: { nHistoria: cleanLeadData.nHistoria }
          });
          if (existingLead) {
            console.log(`⏭️ Skipping lead ${i + 1}: nHistoria ${cleanLeadData.nHistoria} already exists`);
            continue; // Skip this lead
          }
        }

        // Decide final estadoRecepcion: prefer provided value, otherwise if procedimientos exist treat as 'Atendido'
        let finalEstadoRecepcionCreate = cleanLeadData.estadoRecepcion;
        const hasFechaHoraAgendaCreate = !!(cleanLeadData.fechaHoraAgenda);
        if (!finalEstadoRecepcionCreate && (leadData.procedimientos && Array.isArray(leadData.procedimientos) && leadData.procedimientos.length > 0)) {
          finalEstadoRecepcionCreate = 'Atendido';
        }

        const newLead = await prisma.lead.create({
          data: {
            fechaLead: cleanLeadData.fechaLead as Date,
            nombres: cleanLeadData.nombres,
            apellidos: cleanLeadData.apellidos,
            numero: cleanLeadData.numero,
            email: cleanLeadData.email,
            sexo: cleanLeadData.sexo,
            redSocial: cleanLeadData.redSocial,
            anuncio: cleanLeadData.anuncio,
            vendedor: cleanLeadData.vendedor as any,
            estado: cleanLeadData.estado as any,
            montoPagado: cleanLeadData.montoPagado,
            metodoPago: cleanLeadData.metodoPago,
            fechaHoraAgenda: cleanLeadData.fechaHoraAgenda,
            servicios: cleanLeadData.servicios,
            categoria: cleanLeadData.categoria,
            profesionalAsignado: cleanLeadData.profesionalAsignado,
            observacionesGenerales: cleanLeadData.observacionesGenerales,
            fechaVolverLlamar: cleanLeadData.fechaVolverLlamar,
            horaVolverLlamar: cleanLeadData.horaVolverLlamar,
            notas: cleanLeadData.notas,
            nHistoria: cleanLeadData.nHistoria,
            aceptoTratamiento: cleanLeadData.aceptoTratamiento,
            motivoNoCierre: cleanLeadData.motivoNoCierre,
            estadoRecepcion: finalEstadoRecepcionCreate as any,
            recursoId: cleanLeadData.recursoId,
            birthDate: cleanLeadData.birthDate,
            precioCita: cleanLeadData.precioCita,
            deudaCita: cleanLeadData.deudaCita,
            metodoPagoDeuda: cleanLeadData.metodoPagoDeuda,
            documentType: cleanLeadData.documentType as any,
            documentNumber: cleanLeadData.documentNumber,
            razonSocial: cleanLeadData.razonSocial,
            direccionFiscal: cleanLeadData.direccionFiscal,
            // Handle relation for memberships if needed
            membresiasAdquiridas: {
              connect: (leadData.membresiasAdquiridas as {id: number}[])?.map((m: {id: number}) => ({id: m.id})) || []
            },
            // Create tratamientos if provided
            tratamientos: leadData.tratamientos && Array.isArray(leadData.tratamientos) && leadData.tratamientos.length > 0 ? {
                create: leadData.tratamientos.map((t: any) => ({
                nombre: t.nombre || '',
                cantidadSesiones: parseInt(t.cantidadSesiones) || 0,
                precio: parseFloat(t.precio) || 0,
                montoPagado: parseFloat(t.montoPagado) || 0,
                  metodoPago: (mapMetodoPago(t.metodoPago) as any) ?? null,
                deuda: parseFloat(t.deuda) || 0
              }))
            } : undefined,
            // Create procedimientos if provided
            procedimientos: leadData.procedimientos && Array.isArray(leadData.procedimientos) && leadData.procedimientos.length > 0 ? {
              create: leadData.procedimientos.map((p: any) => ({
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
            registrosLlamada: leadData.registrosLlamada && Array.isArray(leadData.registrosLlamada) && leadData.registrosLlamada.length > 0 ? {
              create: leadData.registrosLlamada.map((r: any) => ({
                numeroLlamada: r.numeroLlamada,
                duracionLlamada: r.duracionLlamada,
                estadoLlamada: r.estadoLlamada,
                observacion: r.observacion,
              }))
            } : undefined,
            // Create seguimientos if provided
            seguimientos: leadData.seguimientos && Array.isArray(leadData.seguimientos) && leadData.seguimientos.length > 0 ? {
              create: leadData.seguimientos.map((s: any) => ({
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
            alergias: leadData.alergias && Array.isArray(leadData.alergias) && leadData.alergias.length > 0 ? {
              create: leadData.alergias.map((a: any) => ({
                nombreAlergia: a.nombreAlergia,
              }))
            } : undefined,
            // Create pagos de recepción if provided
            pagosRecepcion: leadData.pagosRecepcion && Array.isArray(leadData.pagosRecepcion) && leadData.pagosRecepcion.length > 0 ? {
              create: leadData.pagosRecepcion.map((p: any) => ({
                monto: p.monto,
                metodoPago: (mapMetodoPago(p.metodoPago) as any) ?? undefined,
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

        results.push(convertBigInts(newLead));
        successCount++;

        // Log progress every 10 items
        if ((i + 1) % 10 === 0) {
          console.log(`✅ Procesados ${i + 1}/${leads.length} leads`);
        }

      } catch (error: any) {
        console.error(`❌ Error procesando lead ${i + 1}:`, error.message);
        errorCount++;
        results.push({
          error: true,
          index: i,
          data: leadData,
          errorMessage: error.message
        });
      }
    }

    console.log(`📊 Importación completada: ${successCount} exitosos, ${errorCount} errores`);

    res.status(200).json({
      message: `Se importaron ${successCount} leads exitosamente${errorCount > 0 ? `, ${errorCount} con errores` : ''}`,
      leads: results,
      successCount,
      errorCount
    });

  } catch (error: any) {
    console.error('❌ Error en bulk import de leads:', error);
    res.status(500).json({
      message: 'Error en la importación bulk de leads',
      error: error.message
    });
  }
};