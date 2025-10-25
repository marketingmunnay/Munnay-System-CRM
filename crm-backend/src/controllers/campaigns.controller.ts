import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Controller functions for Campaign (Anuncios)
export const getCampaigns = async (req: Request, res: Response) => {
  try {
    const campaigns = await prisma.campaign.findMany();
    // FIX: Add .status() method to the response object.
    res.status(200).json(campaigns);
  } catch (error) {
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error fetching campaigns', error: (error as Error).message });
  }
};

export const getCampaignById = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access params from the request object directly.
  const { id } = req.params;
  try {
    const campaign = await prisma.campaign.findUnique({ where: { id: parseInt(id) } });
    if (!campaign) {
      // FIX: Add .status() method to the response object.
      return res.status(404).json({ message: 'Campaign not found' });
    }
    // FIX: Add .status() method to the response object.
    res.status(200).json(campaign);
  } catch (error) {
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error fetching campaign', error: (error as Error).message });
  }
};

export const createCampaign = async (req: Request<any, any, any>, res: Response) => {
  // FIX: Access body from the request object directly.
  const { id, fecha, ...data } = req.body;
  try {
    const newCampaign = await prisma.campaign.create({
      data: {
        ...data,
        fecha: new Date(fecha),
      },
    });
    // FIX: Add .status() method to the response object.
    res.status(201).json(newCampaign);
  } catch (error) {
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error creating campaign', error: (error as Error).message });
  }
};

export const updateCampaign = async (req: Request<{ id: string }, any, any>, res: Response) => {
  // FIX: Access params from the request object directly.
  const { id } = req.params;
  // FIX: Access body from the request object directly.
  const { fecha, ...data } = req.body;
  try {
    const updatedCampaign = await prisma.campaign.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        fecha: fecha ? new Date(fecha) : undefined,
      },
    });
    // FIX: Add .status() method to the response object.
    res.status(200).json(updatedCampaign);
  } catch (error) {
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error updating campaign', error: (error as Error).message });
  }
};

export const deleteCampaign = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access params from the request object directly.
  const { id } = req.params;
  try {
    await prisma.campaign.delete({ where: { id: parseInt(id) } });
    // FIX: Add .status() method to the response object.
    res.status(204).send();
  } catch (error) {
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error deleting campaign', error: (error as Error).message });
  }
};


// Controller functions for MetaCampaign
export const getMetaCampaigns = async (req: Request, res: Response) => {
  try {
    const metaCampaigns = await prisma.metaCampaign.findMany();
    // FIX: Add .status() method to the response object.
    res.status(200).json(metaCampaigns);
  } catch (error) {
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error fetching meta campaigns', error: (error as Error).message });
  }
};

export const getMetaCampaignById = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access params from the request object directly.
  const { id } = req.params;
  try {
    const metaCampaign = await prisma.metaCampaign.findUnique({ where: { id: parseInt(id) } });
    if (!metaCampaign) {
      // FIX: Add .status() method to the response object.
      return res.status(404).json({ message: 'MetaCampaign not found' });
    }
    // FIX: Add .status() method to the response object.
    res.status(200).json(metaCampaign);
  } catch (error) {
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error fetching meta campaign', error: (error as Error).message });
  }
};

export const createMetaCampaign = async (req: Request<any, any, any>, res: Response) => {
  // FIX: Access body from the request object directly.
  const { id, fechaInicio, fechaFin, ...data } = req.body;
  try {
    const newMetaCampaign = await prisma.metaCampaign.create({
      data: {
        ...data,
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(fechaFin),
      },
    });
    // FIX: Add .status() method to the response object.
    res.status(201).json(newMetaCampaign);
  } catch (error) {
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error creating meta campaign', error: (error as Error).message });
  }
};

export const updateMetaCampaign = async (req: Request<{ id: string }, any, any>, res: Response) => {
  // FIX: Access params from the request object directly.
  const { id } = req.params;
  // FIX: Access body from the request object directly.
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
    // FIX: Add .status() method to the response object.
    res.status(200).json(updatedMetaCampaign);
  } catch (error) {
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error updating meta campaign', error: (error as Error).message });
  }
};

export const deleteMetaCampaign = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access params from the request object directly.
  const { id } = req.params;
  try {
    await prisma.metaCampaign.delete({ where: { id: parseInt(id) } });
    // FIX: Add .status() method to the response object.
    res.status(204).send();
  } catch (error) {
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error deleting meta campaign', error: (error as Error).message });
  }
};