import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(__dirname, '..', '..', 'data', 'calendar.json');

function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { appointments: [] };
  }
}

function writeData(obj: any) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2), 'utf8');
}

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
  const from = req.query.from as string | undefined;
  const to = req.query.to as string | undefined;
  const data = readData();
  let items = data.appointments || [];
  if (from) {
    items = items.filter((a: any) => new Date(a.startAt) >= new Date(from));
  }
  if (to) {
    items = items.filter((a: any) => new Date(a.endAt) <= new Date(to));
  }
  res.status(200).json(items);
};

export const createAppointment = async (req: Request, res: Response) => {
  const { startAt, endAt, resourceId, title } = req.body;
  if (!startAt || !endAt || !resourceId) return res.status(400).json({ message: 'startAt, endAt and resourceId required' });
  const data = readData();
  const nextId = (data.appointments?.reduce((max: number, a: any) => Math.max(max, a.id), 0) || 0) + 1;
  const appt = { id: nextId, startAt, endAt, resourceId, title: title || 'Cita' };
  data.appointments = [...(data.appointments || []), appt];
  writeData(data);
  res.status(201).json(appt);
};

export const deleteAppointment = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const data = readData();
  data.appointments = (data.appointments || []).filter((a: any) => a.id !== id);
  writeData(data);
  res.status(204).send();
};
