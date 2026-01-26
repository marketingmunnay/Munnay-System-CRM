import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AppointmentStatus, Prisma } from '@prisma/client';

export const getAppointments = async (req: Request, res: Response) => {
    try {
        const { start, end, professionalId } = req.query;
        
        const where: any = {
           status: { not: 'CANCELLED' } // Default filter
        };
        
        if (start && end) {
            where.startTime = {
                gte: new Date(start as string),
                lte: new Date(end as string)
            };
        }
        
        if (professionalId) {
            where.professionalId = parseInt(professionalId as string);
        }

        const appointments = await prisma.appointment.findMany({
            where,
            include: {
                lead: {
                    select: {
                        id: true,
                        nombres: true,
                        apellidos: true,
                        numero: true,
                        nHistoria: true
                    }
                },
                professional: {
                    select: {
                        id: true,
                        nombres: true,
                        apellidos: true,
                        avatarUrl: true
                    }
                },
                service: true,
                resource: true
            }
        });
        
        res.json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching appointments' });
    }
};

export const createAppointment = async (req: Request, res: Response) => {
    try {
        const { leadId, professionalId, serviceId, resourceId, date, time, notes } = req.body;
        
        // 1. Calculate Start/End
        // Input expected: date "YYYY-MM-DD", time "HH:mm"
        const start = new Date(`${date}T${time}:00`); 
        let duration = 60;
        
        if (serviceId) {
            const service = await prisma.service.findUnique({ where: { id: parseInt(serviceId) }});
            if (service) duration = service.duracionMinutos;
        }
        
        const end = new Date(start.getTime() + duration * 60000);

        // ==========================================
        // VALIDACIÓN DE TURNOS (SHIFTS)
        // ==========================================
        if (professionalId) {
            const shiftDate = new Date(date); // Validar la fecha exacta 'YYYY-MM-DD'
            // Consultar si el profesional tiene turno ese día
            const shift = await prisma.shift.findUnique({
                where: {
                    userId_date: {
                        userId: parseInt(professionalId),
                        date: shiftDate
                    }
                }
            });

            // 1. Si no hay turno definido o es día libre
            if (!shift || shift.isDayOff) {
                return res.status(409).json({ 
                    message: 'El profesional no está disponible o tiene día libre en esta fecha.' 
                });
            }

            // 2. Validar que la hora esté dentro de los TimeBlocks
            // timeBlocks espera formato JSON: [ { "start": "09:00", "end": "13:00" }, ... ]
            const timeBlocks = shift.timeBlocks as any[]; 
            if (timeBlocks && timeBlocks.length > 0) {
                const appStartMinutes = start.getHours() * 60 + start.getMinutes();
                const appEndMinutes = end.getHours() * 60 + end.getMinutes();

                const isWithinRange = timeBlocks.some((block: { start: string, end: string }) => {
                    const [startH, startM] = block.start.split(':').map(Number);
                    const [endH, endM] = block.end.split(':').map(Number);
                    
                    const blockStartMinutes = startH * 60 + startM;
                    const blockEndMinutes = endH * 60 + endM;

                    // La cita debe empezar >= bloque_inicio Y terminar <= bloque_fin
                    return appStartMinutes >= blockStartMinutes && appEndMinutes <= blockEndMinutes;
                });

                if (!isWithinRange) {
                    return res.status(409).json({ 
                        message: `La cita está fuera del horario laboral del profesional (${timeBlocks.map(t => `${t.start}-${t.end}`).join(', ')})` 
                    });
                }
            }
        }
        
        // 2. Resource Collision Check
        // If resource is Selected, check availability
        if (resourceId) {
            const existingResourceAppt = await prisma.appointment.findFirst({
                where: {
                    resourceId: parseInt(resourceId),
                    status: { not: 'CANCELLED' },
                    startTime: { lt: end },
                    endTime: { gt: start }
                }
            });
            
            if (existingResourceAppt) {
                return res.status(409).json({ message: 'El recurso/consultorio seleccionado ya está ocupado en ese horario.' });
            }
        }
        
        // 3. Professional Collision Check
        if (professionalId) {
             const existingProfAppt = await prisma.appointment.findFirst({
                where: {
                    professionalId: parseInt(professionalId),
                    status: { not: 'CANCELLED' },
                    startTime: { lt: end },
                    endTime: { gt: start }
                }
            });
            
            if (existingProfAppt) {
                return res.status(409).json({ message: 'El profesional seleccionado ya tiene una cita en ese horario.' });
            }
        }

        // 4. Create
        const appointment = await prisma.appointment.create({
            data: {
                leadId: leadId ? parseInt(leadId) : null,
                professionalId: professionalId ? parseInt(professionalId) : null,
                serviceId: serviceId ? parseInt(serviceId) : null,
                resourceId: resourceId ? parseInt(resourceId) : null,
                startTime: start,
                endTime: end,
                notes,
                status: 'SCHEDULED'
            }
        });
        
        // Sync with Lead Agenda (Legacy support)
        if (leadId) {
             await prisma.lead.update({
                 where: { id: parseInt(leadId) },
                 data: { fechaHoraAgenda: start, estado: 'Agendado', estadoRecepcion: 'Agendado' }
             }).catch(console.error);
        }
        
        res.status(201).json(appointment);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating appointment' });
    }
};

export const updateAppointment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { startTime, endTime, status, resourceId, professionalId, leadId, serviceId } = req.body;
        const appointmentId = parseInt(id);

        // Get current appt to merge
        const currentAppt = await prisma.appointment.findUnique({ where: { id: appointmentId } });
        if (!currentAppt) return res.status(404).json({ message: 'Cita no encontrada' });

        const targetStart = startTime ? new Date(startTime) : currentAppt.startTime;
        const targetEnd = endTime ? new Date(endTime) : currentAppt.endTime;
        const targetResource = resourceId ? parseInt(resourceId) : currentAppt.resourceId;
        const targetProfessional = professionalId ? parseInt(professionalId) : currentAppt.professionalId;

        // 1. Resource Collision Check (Excluding self)
        if (targetResource) {
            const collision = await prisma.appointment.findFirst({
                where: {
                    id: { not: appointmentId },
                    resourceId: targetResource,
                    status: { not: 'CANCELLED' }, // Ignorar canceladas
                    startTime: { lt: targetEnd },
                    endTime: { gt: targetStart }
                }
            });
            if (collision) {
                return res.status(409).json({ message: 'El recurso ya está ocupado en el nuevo horario (Collision Detected).' });
            }
        }

        // 2. Professional Collision Check (Excluding self)
        if (targetProfessional) {
             const collision = await prisma.appointment.findFirst({
                where: {
                    id: { not: appointmentId },
                    professionalId: targetProfessional,
                    status: { not: 'CANCELLED' },
                    startTime: { lt: targetEnd },
                    endTime: { gt: targetStart }
                }
            });
            if (collision) {
                 return res.status(409).json({ message: 'El profesional ya tiene una cita en el nuevo horario (Collision Detected).' });
            }
        }

        const updated = await prisma.appointment.update({
            where: { id: appointmentId },
            data: {
                startTime: targetStart,
                endTime: targetEnd,
                status: status as AppointmentStatus,
                resourceId: targetResource,
                professionalId: targetProfessional,
                leadId: leadId ? parseInt(leadId) : undefined,
                serviceId: serviceId ? parseInt(serviceId) : undefined
            }
        });
        res.json(updated);
    } catch (error) {
         console.error(error);
         res.status(500).json({ message: 'Error updating appointment' });
    }
};

export const updateAppointmentStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // ARRIVED, COMPLETED...
        
        if (!Object.values(AppointmentStatus).includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const appt = await prisma.appointment.update({
            where: { id: parseInt(id) },
            data: { status: status as AppointmentStatus },
            include: { lead: true }
        });
        
        // AUTOMATION TRIGGERS logic moved to specialized functions below
        // This function remains generic for quick edits
        
        res.json(appt);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating status' });
    }
};

// ==========================================
// FRESHA-STYLE WORKFLOW HANDLERS
// ==========================================

export const checkIn = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Status IN_ROOM = "En Sala" / "Por Atender"
    const appointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { status: 'IN_ROOM' },
      include: { lead: true } 
    });

    if (appointment.leadId) {
        await prisma.lead.update({
             where: { id: appointment.leadId },
             data: { estadoRecepcion: 'PorAtender' } 
        });
    }

    res.json({ message: "Paciente en sala (Check-in)", appointment });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error en check-in' });
  }
};

export const startService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Status IN_PROGRESS = "En Atención" / "En Modulo"
    const appointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { status: 'IN_PROGRESS' }
    });
    
    if (appointment.leadId) {
        await prisma.lead.update({
             where: { id: appointment.leadId },
             data: { estadoRecepcion: 'PorAtender' } // Mantenemos estado 'PorAtender' o creamos uno nuevo 'En Modulo'
        });
    }

    res.json({ message: "Atención iniciada", appointment });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error iniciando servicio' });
  }
};

export const completeAppointment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const appointment = await prisma.appointment.update({
        where: { id: parseInt(id) },
        data: { status: 'COMPLETED' }
      });
      
      if (appointment.leadId) {
        await prisma.lead.update({
             where: { id: appointment.leadId },
             data: { estadoRecepcion: 'Atendido' } 
        });
      }
  
      res.json({ message: "Cita finalizada con éxito", appointment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error finalizando cita' });
    }
};

export const noShow = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const appointment = await prisma.appointment.update({
        where: { id: parseInt(id) },
        data: { status: 'NOSHOW' }
      });
      
      if (appointment.leadId) {
        await prisma.lead.update({
             where: { id: appointment.leadId },
             data: { estadoRecepcion: 'NoAsistio' } 
        });
      }
      
      res.json({ message: "Registrada inasistencia", appointment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registrando No Show' });
    }
};

export const deleteAppointment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.appointment.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting' });
    }
};

export const getResources = async (req: Request, res: Response) => {
    try {
        const resources = await prisma.resource.findMany({
            where: { isActive: true }
        });
        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching resources' });
    }
};

export const getAmbientes = async (req: Request, res: Response) => {
    try {
        const resources = await prisma.resource.findMany();
        
        const ambientes = resources.map(r => ({
            id: r.id,
            nombre: r.name,
            tipo: r.type,
            estado: r.isActive ? 'activo' : 'inactivo',
            capacidad: r.capacity
        }));
        
        res.json(ambientes);
    } catch (error) {
        console.error("Error getting ambientes:", error);
        res.status(500).json({ message: 'Error fetching ambientes' });
    }
};

export const moveAppointment = async (req: Request, res: Response) => {
  try {
    const { appointmentId, newStaffId, newStart, newEnd, newResourceId } = req.body;
    
    // Validar integridad básica
    if (!appointmentId || !newStart || !newEnd) {
        return res.status(400).json({ message: "Datos incompletos para mover la cita" });
    }

    // Convertir IDs si vienen como string
    const targetStaffId = newStaffId ? parseInt(newStaffId) : undefined;
    const targetResourceId = newResourceId ? parseInt(newResourceId) : undefined;
    const apptId = typeof appointmentId === 'string' ? parseInt(appointmentId.replace('appointment-', '')) : parseInt(appointmentId);

    const startDate = new Date(newStart);
    const endDate = new Date(newEnd);

    // 0. Validación de Pasado (Solicitado por UX)
    // if (startDate < new Date()) {
    //    return res.status(400).json({ message: "No puedes mover una cita al pasado." });
    // }

    // 1. Validar Colisión con Staff (Si aplica)
    if (targetStaffId) {
        const isOccupied = await prisma.appointment.findFirst({
            where: {
                id: { not: apptId }, // Ignore self
                professionalId: targetStaffId,
                status: { not: 'CANCELLED' },
                startTime: { lt: endDate },
                endTime: { gt: startDate }
            }
        });
        if (isOccupied) return res.status(409).json({ message: "El profesional ya está ocupado en ese horario." });
    }

    // 1.1 Validar Colisión con Recurso (Si aplica)
    if (targetResourceId) {
         const isOccupiedResource = await prisma.appointment.findFirst({
            where: {
                id: { not: apptId }, // Ignore self
                resourceId: targetResourceId,
                status: { not: 'CANCELLED' },
                startTime: { lt: endDate },
                endTime: { gt: startDate }
            }
        });
        if (isOccupiedResource) return res.status(409).json({ message: "El recurso/espacio ya está ocupado en ese horario." });
    }

    // 2. Actualizar
    const updated = await prisma.appointment.update({
        where: { id: apptId },
        data: {
            professionalId: targetStaffId, // Puede ser undefined si no cambió
            resourceId: targetResourceId,
            startTime: startDate,
            endTime: endDate
        },
        include: { lead: true, service: true, professional: true } // Return full object for frontend update
    });

    res.json(updated);

  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error moving appointment' });
  }
};
