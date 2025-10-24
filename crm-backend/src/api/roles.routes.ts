import { Router } from 'express';
import { getRoles, createRole, getRoleById, updateRole, deleteRole } from '../controllers/roles.controller';

const router = Router();

router.get('/', getRoles);
router.post('/', createRole);
router.get('/:id', getRoleById);
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);

export default router;