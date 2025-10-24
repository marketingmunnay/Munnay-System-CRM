import express from 'express';
import prisma from '../prisma/client';
import { authenticate } from '../middleware/auth';
import { Request, Response } from 'express';

const router = express.Router();

/**
 * Follower fields in prisma/schema:
 * id, platform, count, date
 */

// Create follower record
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { platform, count, date } = req.body;
    if (!platform) return res.status(400).json({ message: 'platform is required' });
    if (count === undefined || count === null) return res.status(400).json({ message: 'count is required' });

    const rec = await prisma.follower.create({
      data: {
        platform,
        count: Number(count),
        date: date ? new Date(date) : undefined,
      },
    });
    return res.status(201).json(rec);
  } catch (err) {
    console.error('POST /followers error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// List follower records
router.get('/', authenticate, async (_req: Request, res: Response) => {
  try {
    const list = await prisma.follower.findMany({ orderBy: { date: 'desc' } });
    return res.json(list);
  } catch (err) {
    console.error('GET /followers error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single follower record
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const rec = await prisma.follower.findUnique({ where: { id } });
    if (!rec) return res.status(404).json({ message: 'Not found' });
    return res.json(rec);
  } catch (err) {
    console.error('GET /followers/:id error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Update follower record
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { platform, count, date } = req.body;
    const data: any = {};
    if (platform !== undefined) data.platform = platform;
    if (count !== undefined) data.count = Number(count);
    if (date !== undefined) data.date = date ? new Date(date) : null;

    const updated = await prisma.follower.update({ where: { id }, data });
    return res.json(updated);
  } catch (err: any) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Not found' });
    console.error('PUT /followers/:id error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete follower record
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.follower.delete({ where: { id } });
    return res.status(204).send();
  } catch (err: any) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Not found' });
    console.error('DELETE /followers/:id error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;