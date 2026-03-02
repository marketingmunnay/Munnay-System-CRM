import { Router } from 'express';
import {
	getUsers,
	createUser,
	getUserById,
	updateUser,
	deleteUser,
	loginUser,
	getCurrentUser,
	getUsersForProfile,
	getSellers
} from '../controllers/users.controller';
import { requireAdmin, requireAuth, requireSelfOrAdmin } from '../middleware/auth';

const router = Router();

router.post('/login', loginUser); // 👈 aquí agregas el login

router.use(requireAuth);

// ✅ Ruta para combo Vendedor(a)
router.get('/sellers', getSellers);
router.get('/me', getCurrentUser);

// Cualquier usuario autenticado puede listar el equipo
router.get('/', getUsers);

router.post('/', requireAdmin, createUser);
// Move /:id and /:id/profile routes below /sellers
router.get('/:id/profile', getUsersForProfile);
router.get('/:id', requireSelfOrAdmin(), getUserById);
router.put('/:id', requireSelfOrAdmin(), updateUser);
router.delete('/:id', requireAdmin, deleteUser);

export default router;
