import { Router } from 'express';
import { getUsers, createUser, getUserById, updateUser, deleteUser, loginUser, getCurrentUser } from '../controllers/users.controller';
import { requireAdmin, requireAuth, requireSelfOrAdmin } from '../middleware/auth';

const router = Router();

router.post('/login', loginUser); // 👈 aquí agregas el login

router.use(requireAuth);

router.get('/me', getCurrentUser);

router.get('/', requireAdmin, getUsers);
router.post('/', requireAdmin, createUser);
router.get('/:id', requireSelfOrAdmin(), getUserById);
router.put('/:id', requireSelfOrAdmin(), updateUser);
router.delete('/:id', requireAdmin, deleteUser);

export default router;
