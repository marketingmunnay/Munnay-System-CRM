import { Request, Response } from 'express';
import prisma from '../lib/prisma';
// FIX: Removed `ParamsDictionary` import as it was causing type conflicts.

// Controller functions for Campaign (Anuncios)
export const getCampaigns = async (req: Request, res: Response) => {
  try {
    const campaigns = await prisma.campaign.findMany();
    // FIX: Use `res.status` directly.
    (res as Response).status(200).json(campaigns);
  } catch (error) {
    // FIX: Use `res.status` directly.
    (res as Response).status(500).json({ message: 'Error fetching campaigns', error: (error as Error).message });
  }
};

export const getCampaignById = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access `req.params.id` correctly.
  const id = (req as Request<{ id: string }>).params.id;
  try {
    const campaign = await prisma.campaign.findUnique({ where: { id: parseInt(id) } });
    if (!campaign) {
      // FIX: Use `res.status` directly.
      return (res as Response).status(404).json({ message: 'Campaign not found' });
    }
    // FIX: Use `res.status` directly.
    (res as Response).status(200).json(campaign);
  } catch (error) {
    // FIX: Use `res.status` directly.
    (res as Response).status(500).json({ message: 'Error fetching campaign', error: (error as Error).message });
  }
};

export const createCampaign = async (req: Request, res: Response) => {
  // FIX: Access `req.body` correctly.
  const { id, fecha, ...data } = req.body as any;
  try {
    const newCampaign = await prisma.campaign.create({
      data: {
        ...data,
        fecha: new Date(fecha),
      },
    });
    // FIX: Use `res.status` directly.
    (res as Response).status(201).json(newCampaign);
  } catch (error) {
    // FIX: Use `res.status` directly.
    (res as Response).status(500).json({ message: 'Error creating campaign', error: (error as Error).message });
  }
};

export const updateCampaign = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access `req.params.id` correctly.
  const id = (req as Request<{ id: string }>).params.id;
  // FIX: Access `req.body` correctly.
  const { fecha, ...data } = req.body as any;
  try {
    const updatedCampaign = await prisma.campaign.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        fecha: fecha ? new Date(fecha) : undefined,
      },
    });
    // FIX: Use `res.status` directly.
    (res as Response).status(200).json(updatedCampaign);
  } catch (error) {
    // FIX: Use `res.status` directly.
    (res as Response).status(500).json({ message: 'Error updating campaign', error: (error as Error).message });
  }
};

export const deleteCampaign = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access `req.params.id` correctly.
  const id = (req as Request<{ id: string }>).params.id;
  try {
    await prisma.campaign.delete({ where: { id: parseInt(id) } });
    // FIX: Use `res.status` directly.
    (res as Response).status(204).send();
  } catch (error) {
    // FIX: Use `res.status` directly.
    (res as Response).status(500).json({ message: 'Error deleting campaign', error: (error as Error).message });
  }
};

// Controller functions for MetaCampaign
export const getMetaCampaigns = async (req: Request, res: Response) => {
  try {
    const metaCampaigns = await prisma.metaCampaign.findMany();
    // FIX: Use `res.status` directly.
    (res as Response).status(200).json(metaCampaigns);
  } catch (error) {
    // FIX: Use `res.status` directly.
    (res as Response).status(500).json({ message: 'Error fetching meta campaigns', error: (error as Error).message });
  }
};

export const getMetaCampaignById = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access `req.params.id` correctly.
  const id = (req as Request<{ id: string }>).params.id;
  try {
    const metaCampaign = await prisma.metaCampaign.findUnique({ where: { id: parseInt(id) } });
    if (!metaCampaign) {
      // FIX: Use `res.status` directly.
      return (res as Response).status(404).json({ message: 'Meta Campaign not found' });
    }
    // FIX: Use `res.status` directly.
    (res as Response).status(200).json(metaCampaign);
  } catch (error) {
    // FIX: Use `res.status` directly.
    (res as Response).status(500).json({ message: 'Error fetching meta campaign', error: (error as Error).message });
  }
};

export const createMetaCampaign = async (req: Request, res: Response) => {
  // FIX: Access `req.body` correctly.
  const { id, fechaInicio, fechaFin, ...data } = req.body as any;
  try {
    const newMetaCampaign = await prisma.metaCampaign.create({
      data: {
        ...data,
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(fechaFin),
      },
    });
    // FIX: Use `res.status` directly.
    (res as Response).status(201).json(newMetaCampaign);
  } catch (error) {
    // FIX: Use `res.status` directly.
    (res as Response).status(500).json({ message: 'Error creating meta campaign', error: (error as Error).message });
  }
};

export const updateMetaCampaign = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access `req.params.id` correctly.
  const id = (req as Request<{ id: string }>).params.id;
  // FIX: Access `req.body` correctly.
  const { fechaInicio, fechaFin, ...data } = req.body as any;
  try {
    const updatedMetaCampaign = await prisma.metaCampaign.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : undefined,
        fechaFin: fechaFin ? new Date(fechaFin) : undefined,
      },
    });
    // FIX: Use `res.status` directly.
    (res as Response).status(200).json(updatedMetaCampaign);
  } catch (error) {
    // FIX: Use `res.status` directly.
    (res as Response).status(500).json({ message: 'Error updating meta campaign', error: (error as Error).message });
  }
};

export const deleteMetaCampaign = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access `req.params.id` correctly.
  const id = (req as Request<{ id: string }>).params.id;
  try {
    await prisma.metaCampaign.delete({ where: { id: parseInt(id) } });
    // FIX: Use `res.status` directly.
    (res as Response).status(204).send();
  } catch (error) {
    // FIX: Use `res.status` directly.
    (res as Response).status(500).json({ message: 'Error deleting meta campaign', error: (error as Error).message });
  }
};