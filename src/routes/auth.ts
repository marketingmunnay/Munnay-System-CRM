import express from 'express';
import prisma from '../prisma/client';
import bcrypt from 'bcrypt';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';

const router = express.Router();

/**
 * POST /auth/login
 * body: { email, password }
 * returns: { accessToken, refreshToken }
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing credentials' });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: 'Invalid credentials' });

  const payload = { sub: user.id, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // store refresh token
  const rt = await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000) }
  });

  res.json({ accessToken, refreshToken });
});

/**
 * POST /auth/refresh
 * body: { refreshToken }
 * returns: { accessToken, refreshToken }
 */
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: 'Missing refresh token' });
  try {
    const payload: any = verifyRefreshToken(refreshToken);
    // check token exists and not revoked
    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.revoked) return res.status(401).json({ message: 'Invalid refresh token' });

    const newPayload = { sub: payload.sub, email: payload.email };
    const accessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);

    // revoke old token and store new one
    await prisma.refreshToken.update({ where: { token: refreshToken }, data: { revoked: true } });
    await prisma.refreshToken.create({
      data: { token: newRefreshToken, userId: stored.userId, expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000) }
    });

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
});

/**
 * GET /auth/me
 * header: Authorization: Bearer <accessToken>
 */
import { authenticate } from '../middleware/auth';
router.get('/me', authenticate, async (req: any, res) => {
  const user = req.user;
  res.json({ id: user.id, email: user.email, name: user.name, roleId: user.roleId });
});

/**
 * POST /auth/logout
 * body: { refreshToken }
 */
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: 'Missing refresh token' });
  await prisma.refreshToken.updateMany({ where: { token: refreshToken }, data: { revoked: true } });
  res.json({ message: 'Logged out' });
});

export default router;