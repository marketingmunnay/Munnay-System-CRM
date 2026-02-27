import { Router } from 'express';
import {
	getUsers,
	createUser,
	getUserById,
	updateUser,
	deleteUser,
	loginUser,
	getCurrentUser,
	getUserProfile,
	getMe,
	getSellers
} from '../controllers/users.controller';
import { requireRole } from '../middlewares/requireRole';
import { requireAdmin, requireAuth, requireSelfOrAdmin } from '../middleware/auth';

const router = Router();

router.post('/login', loginUser); // 👈 aquí agregas el login


// ✅ Ruta para combo Vendedor(a)
router.get('/sellers', requireAuth, getSellers);
router.get('/me', requireAuth, getMe);

// Solo admin puede ver todos los usuarios
router.get('/', requireRole('Admin'), getUsers);

router.post('/', requireAdmin, createUser);
// Move /:id and /:id/profile routes below /sellers
router.get('/:id/profile', requireAuth, getUserProfile);
router.get('/:id', requireSelfOrAdmin(), getUserById);
router.put('/:id', requireSelfOrAdmin(), updateUser);
router.delete('/:id', requireAdmin, deleteUser);

export default router;
