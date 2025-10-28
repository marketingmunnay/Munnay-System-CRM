import express from 'express';
import prisma from '../prisma/client';
import bcrypt from 'bcrypt';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * POST /users - create user
 */
router.post('/', authenticate, async (req, res) => {
  const { email, password, name, roleId } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'email and password required' });
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, password: hashed, name, roleId } });
  res.status(201).json({ id: user.id, email: user.email, name: user.name, roleId: user.roleId });
});

/**
 * GET /users - list users
 */
router.get('/', authenticate, async (req, res) => {
  const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, roleId: true, createdAt: true } });
  res.json(users);
});

/**
 * GET /users/:id
 */
router.get('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true, name: true, roleId: true } });
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json(user);
});

/**
 * PUT /users/:id
 */
router.put('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { email, password, name, roleId } = req.body;
  const data: any = { email, name, roleId };
  if (password) {
    data.password = await bcrypt.hash(password, 10);
  }
  const user = await prisma.user.update({ where: { id }, data });
  res.json({ id: user.id, email: user.email, name: user.name, roleId: user.roleId });
});

/**
 * DELETE /users/:id
 */
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  await prisma.user.delete({ where: { id } });
  res.status(204).send();
});

export default router;