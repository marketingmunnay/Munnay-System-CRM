import { Router } from 'express';
import { getTipoCambio } from '../controllers/tipoCambio.controller';

const router = Router();

router.get('/', getTipoCambio);

export default router;
