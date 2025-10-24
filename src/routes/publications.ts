import express from 'express';
import prisma from '../prisma/client';
import { authenticate } from '../middleware/auth';
import { Request, Response } from 'express';

const router = express.Router();

/**
 * Publication fields in prisma/schema:
 * id, content, platform, scheduledAt, createdAt, updatedAt
 */

// Create publication
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { content, platform, scheduledAt } = req.body;
    if (!content) return res.status(400).json({ message: 'content is required' });
    if (!platform) return res.status(400).json({ message: 'platform is required' });

    const pub = await prisma.publication.create({
      data: {
        content,
        platform,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      },
    });

    return res.status(201).json(pub);
  } catch (err) {
    console.error('POST /publications error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// List publications
router.get('/', authenticate, async (_req: Request, res: Response) => {
  try {
    const pubs = await prisma.publication.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json(pubs);
  } catch (err) {
    console.error('GET /publications error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single publication
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pub = await prisma.publication.findUnique({ where: { id } });
    if (!pub) return res.status(404).json({ message: 'Not found' });
    return res.json(pub);
  } catch (err) {
    console.error('GET /publications/:id error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Update publication
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, platform, scheduledAt } = req.body;
    const data: any = {};
    if (content !== undefined) data.content = content;
    if (platform !== undefined) data.platform = platform;
    if (scheduledAt !== undefined) data.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;

    const updated = await prisma.publication.update({ where: { id }, data });
    return res.json(updated);
  } catch (err: any) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Not found' });
    console.error('PUT /publications/:id error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete publication
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.publication.delete({ where: { id } });
    return res.status(204).send();
  } catch (err: any) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Not found' });
    console.error('DELETE /publications/:id error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;