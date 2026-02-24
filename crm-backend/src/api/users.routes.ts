import { Router } from 'express';
import { getUsers, createUser, getUserById, updateUser, deleteUser, loginUser, getCurrentUser, getUserProfile, getMe, getSellers } from '../controllers/users.controller';
import { requireRole } from '../middlewares/requireRole';
import { requireAdmin, requireAuth, requireSelfOrAdmin } from '../middleware/auth';

const router = Router();

router.post('/login', loginUser); // 👈 aquí agregas el login

router.use(requireAuth);

router.get('/me', requireAuth, getMe);
router.get('/sellers', requireAuth, getSellers);

// Solo admin puede ver todos los usuarios
router.get('/', requireRole('Admin'), getUsers);

// Endpoint para vendedores (Recepcionista, Call Center)
// router.get('/lead-sellers', requireAuth, getLeadSellers); // Eliminado, no existe
router.post('/', requireAdmin, createUser);
router.get('/:id', requireSelfOrAdmin(), getUserById);
router.get('/:id/profile', requireAuth, getUserProfile);
router.put('/:id', requireSelfOrAdmin(), updateUser);
router.delete('/:id', requireAdmin, deleteUser);

export default router;
