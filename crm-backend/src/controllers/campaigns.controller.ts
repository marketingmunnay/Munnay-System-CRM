
import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Controller functions for Campaign (Anuncios)
export const getCampaigns = async (req: Request, res: Response) => {
  try {
    const campaigns = await prisma.campaign.findMany();
    res.status(200).json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching campaigns', error: (error as Error).message });
  }
};

export const getCampaignById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const campaign = await prisma.campaign.findUnique({ where: { id: parseInt(id) } });
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.status(200).json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching campaign', error: (error as Error).message });
  }
};

export const createCampaign = async (req: Request, res: Response) => {
  const { id, fecha, ...data } = req.body;
  try {
    const newCampaign = await prisma.campaign.create({
      data: {
        ...data,
        fecha: new Date(fecha),
      },
    });
    res.status(201).json(newCampaign);
  } catch (error) {
    res.status(500).json({ message: 'Error creating campaign', error: (error as Error).message });
  }
};

export const updateCampaign = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { fecha, ...data } = req.body;
  try {
    const updatedCampaign = await prisma.campaign.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        fecha: fecha ? new Date(fecha) : undefined,
      },
    });
    res.status(200).json(updatedCampaign);
  } catch (error) {
    res.status(500).json({ message: 'Error updating campaign', error: (error as Error).message });
  }
};

export const deleteCampaign = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.campaign.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting campaign', error: (error as Error).message });
  }
};


// Controller functions for MetaCampaign
export const getMetaCampaigns = async (req: Request, res: Response) => {
  try {
    const metaCampaigns = await prisma.metaCampaign.findMany();
    res.status(200).json(metaCampaigns);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching meta campaigns', error: (error as Error).message });
  }
};

export const getMetaCampaignById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const metaCampaign = await prisma.metaCampaign.findUnique({ where: { id: parseInt(id) } });
    if (!metaCampaign) return res.status(404).json({ message: 'MetaCampaign not found' });
    res.status(200).json(metaCampaign);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching meta campaign', error: (error as Error).message });
  }
};

export const createMetaCampaign = async (req: Request, res: Response) => {
  const { id, fechaInicio, fechaFin, ...data } = req.body;
  try {
    const newMetaCampaign = await prisma.metaCampaign.create({
      data: {
        ...data,
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(fechaFin),
      },
    });
    res.status(201).json(newMetaCampaign);
  } catch (error) {
    res.status(500).json({ message: 'Error creating meta campaign', error: (error as Error).message });
  }
};

export const updateMetaCampaign = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { fechaInicio, fechaFin, ...data } = req.body;
  try {
    const updatedMetaCampaign = await prisma.metaCampaign.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : undefined,
        fechaFin: fechaFin ? new Date(fechaFin) : undefined,
      },
    });
    res.status(200).json(updatedMetaCampaign);
  } catch (error) {
    res.status(500).json({ message: 'Error updating meta campaign', error: (error as Error).message });
  }
};

export const deleteMetaCampaign = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.metaCampaign.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting meta campaign', error: (error as Error).message });
  }
};