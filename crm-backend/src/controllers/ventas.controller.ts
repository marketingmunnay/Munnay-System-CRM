import { Request, Response } from 'express';
import prisma from '../lib/prisma';
// import { VentaExtra } from '@prisma/client';

export const getVentas = async (req: Request, res: Response) => {
  try {
    const ventas = await prisma.ventaExtra.findMany({ orderBy: { fechaVenta: 'desc' } });
    res.status(200).json(ventas);
  } catch (error) {
    console.error("Error fetching ventas:", error);
    res.status(500).json({ message: 'Error fetching ventas', error: (error as Error).message });
  }
};

export const getVentaById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    const venta = await prisma.ventaExtra.findUnique({ where: { id: id } });
    if (!venta) {
      return res.status(404).json({ message: 'Venta not found' });
    }
    res.status(200).json(venta);
  }  catch (error) {
    console.error(`Error fetching venta ${id}:`, error);
    res.status(500).json({ message: 'Error fetching venta', error: (error as Error).message });
  }
};


export const createVenta = async (req: Request, res: Response) => {
  const { id, fechaVenta, ...data } = req.body;
  
  // Extract inventory specific fields
  const { productoId, entregado, fechaEntrega, categoria, ...cleanData } = data;

  try {
    // Determine Timezone
    let timezone = 'America/Lima';
    const businessInfo = await prisma.businessInfo.findFirst();
    if (businessInfo && businessInfo.timezone) {
      timezone = businessInfo.timezone;
    }

    // Ensure nombrePaciente is present if pacienteId is provided
    if (!cleanData.nombrePaciente && cleanData.pacienteId) {
      const patient = await prisma.lead.findUnique({
        where: { id: Number(cleanData.pacienteId) }
      });
      if (patient) {
        cleanData.nombrePaciente = `${patient.nombres} ${patient.apellidos}`.trim();
        cleanData.nHistoria = patient.nHistoria; // Also ensure nHistoria is set
      }
    }

    // Fallback if nombrePaciente is still missing (e.g. unknown patient or not found)
    if (!cleanData.nombrePaciente) {
        cleanData.nombrePaciente = 'Paciente Desconocido';
    }

    // Sanitize Date fields that might be empty strings
    if (cleanData.fechaPagoDeuda === '') {
        cleanData.fechaPagoDeuda = null;
    }

    // Parse fechaVenta (YYYY-MM-DD) to Midnight in the Target Timezone
    let fechaVentaDate = new Date(fechaVenta); // Default UTC
    
    if (typeof fechaVenta === 'string' && fechaVenta.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Create a UTC date at noon to ensure it falls on the correct day in most timezones,
        // OR try to match specifically 00:00 in the target timezone.
        // Given the known "Shift by 1 day" issue (-5h), simply forcing it to 12:00 (Noon) UTC often solves it for Americas.
        // "2026-01-16T12:00:00.000Z" -> Lima (07:00). Same day.
        
        // However, let's try to be precise if we can.
        // We want the DB to store a Timestamp that equals YYYY-MM-DD 00:00:00 in `timezone`.
        // We will approximate this by adding 5 hours if timezone is Lima.
        
        if (timezone === 'America/Lima' || timezone === 'America/Bogota') {
             fechaVentaDate = new Date(`${fechaVenta}T05:00:00.000Z`);
        } else if (timezone === 'America/Mexico_City') {
             fechaVentaDate = new Date(`${fechaVenta}T06:00:00.000Z`);
        } else if (timezone === 'Europe/Madrid') {
             fechaVentaDate = new Date(`${fechaVenta}T00:00:00.000Z`); // -1h = Previous day 11pm. Wait.
             // Madrid (UTC+1). Midnight is 23:00 UTC prev day.
             // So we want `2026-01-15T23:00:00.000Z`.
             // Simplest universal fix for "Date Only" display: Store as Noon UTC.
             fechaVentaDate = new Date(`${fechaVenta}T12:00:00.000Z`);
        } else {
             // Fallback to Noon UTC to be safe for date-only fields
             fechaVentaDate = new Date(`${fechaVenta}T12:00:00.000Z`);
        }
    }

    // Inventory Logic: If it is a Product Sale and marked as Delivered

    if (productoId && entregado) {
       const config = await prisma.configuracionProducto.findUnique({
          where: { productoId: parseInt(productoId) }
       });
       
       if (config) {
          if (config.stockActual <= 0) {
             return res.status(400).json({ message: 'No hay stock disponible para entregar este producto inmediatamente.' });
          }
          
          // Deduct Stock
          await prisma.movimientoInventario.create({
            data: {
              configuracionProductoId: config.id,
              tipoMovimiento: 'salida',
              cantidad: 1,
              stockAnterior: config.stockActual,
              stockNuevo: config.stockActual - 1,
              precioVenta: data.montoPagado || 0, // Or precio total
              motivo: `Venta Extra (Recepción) ${data.codigoVenta || ''}`,
              referencia: 'VentaExtra',
              creadoPor: 'Sistema' // TODO: Get user from req
            }
          });

          await prisma.configuracionProducto.update({
             where: { id: config.id },
             data: { stockActual: config.stockActual - 1 }
          });
       }
    }


    const newVenta = await prisma.ventaExtra.create({
      data: {
        ...cleanData,
        categoria: categoria || 'Venta', // Asegurar que categoria siempre tenga valor
        fechaVenta: fechaVentaDate,
        entregado: entregado || false,
        fechaEntrega: fechaEntrega ? new Date(fechaEntrega) : (entregado ? new Date() : null),
        productoId: productoId ? parseInt(productoId) : null
      },
    });


    // ==========================================
    // FRESHA-STYLE LOGIC: AUTO-TREATMENT
    // ==========================================
    // Si la venta es de un SERVICIO y tiene un paciente asociado,
    // se crea(n) automáticamente un procedimiento pendiente.
    if (categoria === 'Servicio' && cleanData.pacienteId) {
       
       await prisma.lead.update({
           where: { id: parseInt(cleanData.pacienteId) },
           data: {
              // Actualizar metadata financiera del lead
              montoPagado: { increment: data.montoPagado || 0 }
           }
       });
       
       // Create Pending Procedure (Ticket for Clinical Area)
       try {
           await prisma.procedure.create({
               data: {
                   fechaAtencion: new Date(),
                   personal: 'Por Asignar',
                   horaInicio: '00:00',
                   horaFin: '00:00',
                   tratamientoId: BigInt(0), // Placeholder
                   nombreTratamiento: cleanData.servicio || 'Servicio General',
                   sesionNumero: 1,
                   asistenciaMedica: false,
                   status: 'PENDING_TREATMENT', 
                   leadId: parseInt(cleanData.pacienteId)
               }
           });
       } catch (procError) {
           console.error("Error creating auto-procedure:", procError);
           // Non-blocking error
       }
       
       // Si incluimos el appointmentId en el body de la venta (ideal para Fresha)
       // actualizamos la cita a completada/pagada.
       if (req.body.appointmentId) {
            await prisma.appointment.update({
                where: { id: parseInt(req.body.appointmentId) },
                data: { status: 'COMPLETED' } 
            });
       }
    }

    res.status(201).json(newVenta);
  } catch (error) {
    console.error("Error creating venta:", error);
    res.status(500).json({ message: 'Error creating venta', error: (error as Error).message });
  }
};

export const updateVenta = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { id: _, fechaVenta, ...data } = req.body; // Exclude id from update data
  
  // Extract special fields to format them correctly
  const { productoId, entregado, fechaEntrega, ...cleanData } = data;

  try {
    // Determine Timezone for Date Correction
    let timezone = 'America/Lima';
    const businessInfo = await prisma.businessInfo.findFirst();
    if (businessInfo && businessInfo.timezone) {
      timezone = businessInfo.timezone;
    }

    let fechaVentaDate = undefined;
    if (fechaVenta) {
        fechaVentaDate = new Date(fechaVenta);
        if (typeof fechaVenta === 'string' && fechaVenta.match(/^\d{4}-\d{2}-\d{2}$/)) {
            if (timezone === 'America/Lima' || timezone === 'America/Bogota') {
                fechaVentaDate = new Date(`${fechaVenta}T05:00:00.000Z`);
            } else if (timezone === 'America/Mexico_City') {
                fechaVentaDate = new Date(`${fechaVenta}T06:00:00.000Z`);
            } else {
                fechaVentaDate = new Date(`${fechaVenta}T12:00:00.000Z`);
            }
        }
    }

    // 1. Check existing sale to handle Stock Deduction on Status Change
    const existingVenta = await prisma.ventaExtra.findUnique({ where: { id } });
    if (!existingVenta) {
        return res.status(404).json({ message: 'Venta not found' });
    }

    // Only deduct stock if it satisfies: 
    // - Is being marked as delivered (entregado=true)
    // - Was NOT delivered before (existingVenta.entregado=false/null)
    // - Has a valid product ID
    if (entregado && !existingVenta.entregado) {
         const targetProductId = productoId ? parseInt(productoId) : existingVenta.productoId;
         
         if (targetProductId) {
             const config = await prisma.configuracionProducto.findUnique({
                where: { productoId: targetProductId }
             });

             if (config) {
                 if (config.stockActual <= 0) {
                     return res.status(400).json({ message: 'No hay stock disponible para realizar la entrega. Actualice el inventario.' });
                 }
                 
                 // Deduct Stock
                 await prisma.movimientoInventario.create({
                    data: {
                      configuracionProductoId: config.id,
                      tipoMovimiento: 'salida',
                      cantidad: 1,
                      stockAnterior: config.stockActual,
                      stockNuevo: config.stockActual - 1,
                      precioVenta: Number(data.montoPagado) || existingVenta.montoPagado || 0,
                      motivo: `Entrega Diferida - Venta ${existingVenta.codigoVenta || id}`,
                      referencia: 'VentaExtra',
                      creadoPor: 'Sistema' 
                    }
                 });

                 await prisma.configuracionProducto.update({
                     where: { id: config.id },
                     data: { stockActual: config.stockActual - 1 }
                 });
             }
         }
    }

    const updatedVenta = await prisma.ventaExtra.update({
      where: { id: id },
      data: {
        ...cleanData,
        fechaVenta: fechaVentaDate,
        entregado: entregado, // Allow update
        fechaEntrega: fechaEntrega ? new Date(fechaEntrega) : undefined,
        productoId: productoId ? parseInt(productoId) : undefined
      },
    });
    res.status(200).json(updatedVenta);
  } catch (error) {
    console.error(`Error updating venta ${id}:`, error);
    res.status(500).json({ message: 'Error updating venta', error: (error as Error).message });
  }
};

export const deleteVenta = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    // Delete related comprobantes where ventaExtraId matches
    await prisma.comprobanteElectronico.deleteMany({ where: { ventaExtraId: id } });

    await prisma.ventaExtra.delete({ where: { id: id } });
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting venta ${id}:`, error);
    res.status(500).json({ message: 'Error deleting venta', error: (error as Error).message });
  }
};

export const bulkCreateVentas = async (req: Request, res: Response) => {
  const ventas = req.body;
  
  if (!Array.isArray(ventas)) {
    return res.status(400).json({ message: 'Input must be an array of ventas' });
  }

  try {
    // 1. Get System Timezone
    let timezone = 'America/Lima';
    const businessInfo = await prisma.businessInfo.findFirst();
    if (businessInfo && businessInfo.timezone) {
      timezone = businessInfo.timezone;
    }

    // 2. Resolve Patients from nHistoria
    // Collect all nHistoria values to single query
    const historias = ventas
        .map((v: any) => v.nHistoria)
        .filter((h: any) => typeof h === 'string' && h.trim().length > 0);

    const patients = await prisma.lead.findMany({
        where: { nHistoria: { in: historias } },
        select: { id: true, nHistoria: true, nombres: true, apellidos: true }
    });
    
    // Map nHistoria -> Lead (ID and Name)
    const patientMap = new Map();
    patients.forEach(p => {
        patientMap.set(p.nHistoria, p);
    });

    const validVentas: any[] = [];
    const errors: any[] = [];

    // 3. Process each item
    for (const [index, venta] of ventas.entries()) {
        const { id, fechaVenta, productoId, entregado, fechaEntrega, categoria, ...cleanData } = venta;
        
        const nHistoria = venta.nHistoria;
        const patient = patientMap.get(nHistoria); // Strict match by nHistoria

        if (!patient) {
            errors.push({ index, message: `Paciente con N° Historia '${nHistoria}' no encontrado.` });
            continue;
        }

        // Date Handling: Same logic as createVenta (Noon UTC)
        let fechaVentaDate = new Date(fechaVenta);
        if (typeof fechaVenta === 'string' && fechaVenta.match(/^\d{4}-\d{2}-\d{2}$/)) {
            // Force Noon UTC to avoid date shifting
            fechaVentaDate = new Date(`${fechaVenta}T12:00:00.000Z`);
        } else if (timezone === 'America/Lima' || timezone === 'America/Bogota') {
             // If full ISO string, we might want to respect timezone but usually imports are YYYY-MM-DD
             // If it's YYYY-MM-DD, handled above.
        }

        // Validate MetodoPago
        // Enum: Efectivo, Tarjeta, Transferencia, TransferenciaBCP, TransferenciaInterbank, Yape, Plin
        let metodoPago = venta.metodoPago;
        // Normalize common variations if necessary or default to Efectivo
        if (!metodoPago) metodoPago = 'Efectivo'; 
        // We trust the frontend sends valid string, or DB will throw. 
        // Ideally we validate against the Enum values here.

        validVentas.push({
            ...cleanData,
            fechaVenta: fechaVentaDate,
            categoria: categoria || 'Venta',
            pacienteId: patient.id,
            // Ensure nHistoria/nombrePaciente are consistent with DB or Input
            nHistoria: patient.nHistoria,
            nombrePaciente: queryPatientName(patient, venta.nombrePaciente),
            // Default required fields if missing in CSV
            precio: Number(venta.precio) || 0,
            montoPagado: Number(venta.montoPagado) || 0,
            deuda: Number(venta.deuda) || 0,
            metodoPago: metodoPago,
            codigoVenta: venta.codigoVenta || generateTempCode(index) 
        });
    }

    if (validVentas.length === 0) {
        return res.status(400).json({ 
            message: 'No valid ventas found to import.', 
            errors: errors.slice(0, 100) // Limit error output
        });
    }

    // 4. Bulk Insert using createMany
    const result = await prisma.ventaExtra.createMany({
        data: validVentas,
        skipDuplicates: true
    });
    
    // Check if result.count matches validVentas.length
    // If skipDuplicates skipped some, we don't know exactly which ones unless we query back.

    res.status(201).json({ 
        message: 'Ventas imported successfully', 
        count: result.count,
        skipped: validVentas.length - result.count,
        errors: errors.length > 0 ? errors : undefined,
        ventas: [] // We don't return all created objects with createMany
    });

  } catch (error) {
    console.error('Error importing ventas:', error);
    res.status(500).json({ message: 'Error importing ventas', error: (error as Error).message });
  }
};

function queryPatientName(patient: any, inputName: string): string {
    if (patient.nombres && patient.apellidos) return `${patient.nombres} ${patient.apellidos}`;
    if (inputName) return inputName;
    return 'Paciente Desconocido';
}

function generateTempCode(index: number): string {
    return `IMP-${Date.now()}-${index}`;
}