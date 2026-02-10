import { Router } from 'express';
import { getUsers, createUser, getUserById, updateUser, deleteUser, loginUser, getCurrentUser } from '../controllers/users.controller';

const router = Router();

router.post('/login', loginUser); // 👈 aquí agregas el login
router.get('/', getUsers);
router.post('/', createUser);
router.get('/me', getCurrentUser);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
