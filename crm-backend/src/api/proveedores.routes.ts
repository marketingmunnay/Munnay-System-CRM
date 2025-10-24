import { Router } from 'express';
import { 
    getProveedores, createProveedor, getProveedorById, updateProveedor, deleteProveedor,
    getTiposProveedor, createTipoProveedor, updateTipoProveedor, deleteTipoProveedor
} from '../controllers/proveedores.controller';

const router = Router();

// Tipos de Proveedor
router.get('/tipos', getTiposProveedor);
router.post('/tipos', createTipoProveedor);
router.put('/tipos/:id', updateTipoProveedor);
router.delete('/tipos/:id', deleteTipoProveedor);

// Proveedores
router.get('/', getProveedores);
router.post('/', createProveedor);
router.get('/:id', getProveedorById);
router.put('/:id', updateProveedor);
router.delete('/:id', deleteProveedor);

export default router;