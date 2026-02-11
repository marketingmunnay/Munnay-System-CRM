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
    
    // Status CONFIRMED = "En Sala" / "Por Atender"
    const appointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { status: 'CONFIRMED' },
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

// ==========================================
// RESOURCE & CONFIGURATION MANAGEMENT
// (Refactored for Unified Personnel/Room Management)
// ==========================================

export const getResources = async (req: Request, res: Response) => {
    try {
        // 1. Recursos físicos (salas, equipos)
        const dbResources = await prisma.resource.findMany({
            where: { isActive: true },
            include: { resourceUsers: { include: { user: true } } }
        });

        // 2. Usuarios vinculados como recursos del calendario
        const resourceUsers = await prisma.resourceUser.findMany({
            include: { user: true, resource: true }
        });

        // Mapear recursos físicos
        const mappedResources = dbResources.map(r => ({
            id: `room-${r.id}`,
            originalId: r.id,
            title: r.name,
            name: r.name,
            nombre: r.name, // Legacy Compatibility
            type: 'room',
            capacity: r.capacity,
            users: r.resourceUsers.map(ru => ru.user)
        }));

        // Mapear usuarios vinculados como recursos
        const mappedStaff = resourceUsers.map(ru => ({
            id: `user-${ru.user.id}`,
            originalId: ru.user.id,
            title: `${ru.user.nombres} ${ru.user.apellidos}`,
            name: `${ru.user.nombres} ${ru.user.apellidos}`,
            nombre: `${ru.user.nombres} ${ru.user.apellidos}`,
            type: 'personal',
            avatarUrl: ru.user.avatarUrl
        }));

        res.json([...mappedStaff, ...mappedResources]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching resources' });
    }
};

export const getAmbientes = async (req: Request, res: Response) => {
    try {
        const resources = await prisma.resource.findMany({
            include: { resourceUsers: { include: { user: true } } }
        });
        
        const ambientes = resources.map(r => ({
            id: r.id,
            nombre: r.name,
            tipo: r.type,
            estado: r.isActive ? 'activo' : 'inactivo',
            capacidad: r.capacity,
            usuariosVinculados: r.resourceUsers.map(ru => ru.user)
        }));
        
        res.json(ambientes);
    } catch (error) {
        console.error("Error getting ambientes:", error);
        res.status(500).json({ message: 'Error fetching ambientes' });
    }
};

export const createResource = async (req: Request, res: Response) => {
    try {
        console.log("=== CREATE RESOURCE REQUEST ===");
        console.log("Body:", req.body);
        const { name, type, linkedUserIds, capacity } = req.body;
        
        let newRes;
        
        if (type === 'personal') {
            const role = await prisma.role.findFirst({ where: { nombre: 'Profesional' }}); 
            // Simple User Creation for 'Personal' type
            const newUser = await prisma.user.create({
                data: {
                    nombres: name,
                    apellidos: '.', 
                    usuario: name.replace(/\s+/g, '').toLowerCase() + Date.now().toString().slice(-4),
                    password: 'defaultPassword123',
                    rolId: role ? role.id : 1
                }
            });
            console.log("Created User Resource:", newUser);
            // Destructure id to avoid "specified more than once" error
            const { id: newId, ...restUser } = newUser;
            newRes = { id: `user-${newId}`, ...restUser, type: 'personal' };
            return res.json(newRes);
        } else {
            // Room Creation
            console.log("Creating Room/Equipment...");
            const resource = await prisma.resource.create({
                data: {
                    name,
                    type: 'ROOM',
                    capacity: capacity ? parseInt(capacity) : 1,
                    resourceUsers: linkedUserIds && linkedUserIds.length > 0 ? {
                        create: linkedUserIds.map((uid: any) => ({ userId: parseInt(uid) }))
                    } : undefined
                },
                include: { resourceUsers: { include: { user: true } } }
            });
            console.log("Created Room Resource:", resource);
            const { id: resId, ...restRes } = resource;
            newRes = { id: `room-${resId}`, ...restRes, type: 'infrastructure' };
            return res.json(newRes);
        }
    } catch (error: any) {
        console.error("Error creating resource:", error);
        res.status(500).json({ message: 'Error creating resource: ' + error.message });
    }
};

export const updateResource = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, linkedUserIds, capacity } = req.body;
        
        if (id.startsWith('user-')) {
            const userId = parseInt(id.replace('user-', ''));
            // Fix: User model uses 'nombres', not 'names'
            const updated = await prisma.user.update({
                where: { id: userId },
                data: { nombres: name }
            });
            return res.json(updated);
        } else if (id.startsWith('room-')) {
            const resId = parseInt(id.replace('room-', ''));
            if (linkedUserIds) {
                await prisma.resourceUser.deleteMany({ where: { resourceId: resId } });
                await prisma.resourceUser.createMany({
                    data: linkedUserIds.map((uId: any) => ({ userId: parseInt(uId), resourceId: resId }))
                });
            }
            const updated = await prisma.resource.update({
                where: { id: resId },
                data: { 
                    name,
                    capacity: capacity ? parseInt(capacity) : undefined,
                },
                include: { resourceUsers: { include: { user: true } } }
            });
            return res.json(updated);
        }
        res.status(404).json({ message: 'ID format not recognized' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating' });
    }
};

export const deleteResource = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (id.startsWith('user-')) {
            const userId = parseInt(id.replace('user-', ''));
            // Solo desvincular de ResourceUser, no borrar usuario
            await prisma.resourceUser.deleteMany({ where: { userId } });
        } else if (id.startsWith('room-')) {
            const resId = parseInt(id.replace('room-', ''));
            await prisma.resource.delete({ where: { id: resId } });
        }
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting' });
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
    const parseId = (val: any) => {
        if (!val) return undefined;
        const str = String(val);
        if (str.startsWith('user-')) return parseInt(str.replace('user-', ''));
        if (str.startsWith('room-')) return parseInt(str.replace('room-', ''));
        return parseInt(str);
    };

    const targetStaffId = parseId(newStaffId);
    const targetResourceId = parseId(newResourceId);
    const apptId = typeof appointmentId === 'string' ? parseInt(appointmentId.replace('appointment-', '')) : parseInt(appointmentId);

    const startDate = new Date(newStart);
    const endDate = new Date(newEnd);

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
            professionalId: targetStaffId, 
            resourceId: targetResourceId,
            startTime: startDate,
            endTime: endDate
            // Removed 'fecha'
        },
        include: { lead: true, service: true, professional: true } 
    });

    res.json(updated);

  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error moving appointment' });
  }
};

// ==========================================
// CHECK AVAILABILITY
// ==========================================
export const checkAvailability = async (req: Request, res: Response) => {
    try {
        const { fecha, horaInicio, duracionMinutos, servicioIds, profesionalId, ambienteId } = req.query;

        if (!fecha || !horaInicio) {
            return res.status(400).json({ message: 'fecha y horaInicio son requeridos' });
        }

        const dateStr = String(fecha);
        const timeStr = String(horaInicio);
        const duration = duracionMinutos ? parseInt(String(duracionMinutos)) : 60;

        const start = new Date(`${dateStr}T${timeStr}:00`);
        const end = new Date(start.getTime() + duration * 60000);

        let isAvailable = true;
        const suggestions: Array<{ fecha: string; horaInicio: string; profesionalId?: string; ambienteId?: number }> = [];
        const slots: Array<{ profesionalId: string; ambienteId?: number; disponible: boolean; motivo?: string }> = [];

        // 1. Check professional availability
        if (profesionalId) {
            const profId = parseInt(String(profesionalId));
            
            // Validate profId is a valid number
            if (isNaN(profId)) {
                return res.status(400).json({ message: 'profesionalId debe ser un número válido' });
            }

            // Check shift
            const shiftDate = new Date(dateStr);
            const shift = await prisma.shift.findUnique({
                where: {
                    userId_date: {
                        userId: profId,
                        date: shiftDate
                    }
                }
            });

            if (!shift || shift.isDayOff) {
                isAvailable = false;
                slots.push({ profesionalId: String(profesionalId), disponible: false, motivo: 'El profesional no tiene turno o tiene día libre en esta fecha.' });
            } else {
                // Validate time blocks
                const timeBlocks = shift.timeBlocks as any[];
                if (timeBlocks && timeBlocks.length > 0) {
                    const appStartMinutes = start.getHours() * 60 + start.getMinutes();
                    const appEndMinutes = end.getHours() * 60 + end.getMinutes();

                    const isWithinRange = timeBlocks.some((block: { start: string; end: string }) => {
                        const [startH, startM] = block.start.split(':').map(Number);
                        const [endH, endM] = block.end.split(':').map(Number);
                        const blockStartMinutes = startH * 60 + startM;
                        const blockEndMinutes = endH * 60 + endM;
                        return appStartMinutes >= blockStartMinutes && appEndMinutes <= blockEndMinutes;
                    });

                    if (!isWithinRange) {
                        isAvailable = false;
                        slots.push({
                            profesionalId: String(profesionalId),
                            disponible: false,
                            motivo: `La cita está fuera del horario laboral del profesional (${timeBlocks.map((t: any) => `${t.start}-${t.end}`).join(', ')})`
                        });
                    }
                }

                // Check collision with existing appointments
                const existingAppt = await prisma.appointment.findFirst({
                    where: {
                        professionalId: profId,
                        status: { not: 'CANCELLED' },
                        startTime: { lt: end },
                        endTime: { gt: start }
                    }
                });
                if (existingAppt) {
                    isAvailable = false;
                    slots.push({ profesionalId: String(profesionalId), disponible: false, motivo: 'El profesional ya tiene una cita en ese horario.' });
                }
            }
        }

        // 2. Check resource/ambiente availability
        if (ambienteId) {
            const resId = parseInt(String(ambienteId));
            const existingResourceAppt = await prisma.appointment.findFirst({
                where: {
                    resourceId: resId,
                    status: { not: 'CANCELLED' },
                    startTime: { lt: end },
                    endTime: { gt: start }
                }
            });
            if (existingResourceAppt) {
                isAvailable = false;
                slots.push({ profesionalId: profesionalId ? String(profesionalId) : '0', ambienteId: resId, disponible: false, motivo: 'El recurso/consultorio ya está ocupado en ese horario.' });
            }
        }

        // If not available, suggest next available slots (next 3 hours in 30min increments)
        if (!isAvailable) {
            for (let offset = 30; offset <= 180; offset += 30) {
                const sugStart = new Date(start.getTime() + offset * 60000);
                const sugEnd = new Date(sugStart.getTime() + duration * 60000);

                let sugOk = true;

                if (profesionalId) {
                    const profConflict = await prisma.appointment.findFirst({
                        where: {
                            professionalId: parseInt(String(profesionalId)),
                            status: { not: 'CANCELLED' },
                            startTime: { lt: sugEnd },
                            endTime: { gt: sugStart }
                        }
                    });
                    if (profConflict) sugOk = false;
                }

                if (ambienteId && sugOk) {
                    const resConflict = await prisma.appointment.findFirst({
                        where: {
                            resourceId: parseInt(String(ambienteId)),
                            status: { not: 'CANCELLED' },
                            startTime: { lt: sugEnd },
                            endTime: { gt: sugStart }
                        }
                    });
                    if (resConflict) sugOk = false;
                }

                if (sugOk) {
                    const sugHH = sugStart.getHours().toString().padStart(2, '0');
                    const sugMM = sugStart.getMinutes().toString().padStart(2, '0');
                    suggestions.push({
                        fecha: dateStr,
                        horaInicio: `${sugHH}:${sugMM}`,
                        profesionalId: profesionalId ? String(profesionalId) : undefined,
                        ambienteId: ambienteId ? parseInt(String(ambienteId)) : undefined
                    });
                }
            }
        }

        // If no professional or resource specified, always available
        if (!profesionalId && !ambienteId) {
            isAvailable = true;
        }

        res.json({ isAvailable, slots, suggestions });
    } catch (error) {
        console.error('Error checking availability:', error);
        res.status(500).json({ message: 'Error checking availability' });
    }
};
