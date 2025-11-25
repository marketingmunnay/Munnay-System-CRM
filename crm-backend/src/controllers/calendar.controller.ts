import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getResources = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, nombres: true, apellidos: true, avatarUrl: true, position: true } });
    const resources = users.map(u => ({ id: u.id, name: `${u.nombres} ${u.apellidos}`, avatarUrl: u.avatarUrl, position: u.position }));
    res.status(200).json(resources);
  } catch (error) {
    console.error('getResources error', error);
    res.status(500).json({ message: 'Error fetching resources' });
  }
};

export const getAppointments = async (req: Request, res: Response) => {
  try {
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;

    const where: any = {};
    if (from) where.startAt = { gte: new Date(from) };
    if (to) where.endAt = { lte: new Date(to) };

    const items = await prisma.appointment.findMany({ where, orderBy: { startAt: 'asc' } });
    const result = items.map(i => ({ id: i.id, startAt: i.startAt, endAt: i.endAt, resourceId: i.resourceId, title: i.title, leadId: i.leadId }));
    res.status(200).json(result);
  } catch (error) {
    console.error('getAppointments error', error);
    res.status(500).json({ message: 'Error fetching appointments' });
  }
};

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { startAt, endAt, resourceId, title, leadId } = req.body;
    if (!startAt || !endAt || !resourceId) return res.status(400).json({ message: 'startAt, endAt and resourceId required' });

    const s = new Date(startAt);
    const e = new Date(endAt);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return res.status(400).json({ message: 'Invalid dates' });
    if (s >= e) return res.status(400).json({ message: 'startAt must be before endAt' });

    // overlap check for same resource
    const conflict = await prisma.appointment.findFirst({
      where: {
        resourceId: Number(resourceId),
        AND: [
          { startAt: { lt: e } },
          { endAt: { gt: s } }
        ]
      }
    });
    if (conflict) return res.status(409).json({ message: 'Appointment conflict' });

    const appt = await prisma.appointment.create({
      data: {
        startAt: s,
        endAt: e,
        resourceId: Number(resourceId),
        title: title || 'Cita',
        leadId: leadId ? Number(leadId) : undefined
      }
    });

    res.status(201).json({ id: appt.id, startAt: appt.startAt, endAt: appt.endAt, resourceId: appt.resourceId, title: appt.title, leadId: appt.leadId });
  } catch (error) {
    console.error('createAppointment error', error);
    res.status(500).json({ message: 'Error creating appointment' });
  }
};

export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid id' });
    await prisma.appointment.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('deleteAppointment error', error);
    res.status(500).json({ message: 'Error deleting appointment' });
  }
};
