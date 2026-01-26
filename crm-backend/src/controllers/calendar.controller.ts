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
        const { startTime, endTime, status, resourceId, professionalId } = req.body;
        
        // If changing time/resource, should re-run collision checks (simplified here)
        
        const updated = await prisma.appointment.update({
            where: { id: parseInt(id) },
            data: {
                startTime: startTime ? new Date(startTime) : undefined,
                endTime: endTime ? new Date(endTime) : undefined,
                status: status as AppointmentStatus,
                resourceId: resourceId ? parseInt(resourceId) : undefined,
                professionalId: professionalId ? parseInt(professionalId) : undefined
            }
        });
        res.json(updated);
    } catch (error) {
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
    
    // Status ARRIVED = "En Sala" / "Por Atender"
    const appointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { status: 'ARRIVED' },
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
        data: { status: 'NO_SHOW' }
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
