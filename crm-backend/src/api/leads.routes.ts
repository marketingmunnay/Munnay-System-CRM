import { Router } from 'express';
// FIX: Added getNextHistoryNumber to imports
import { getLeads, createLead, getLeadById, updateLead, deleteLead, getNextHistoryNumber, bulkImportLeads } from '../controllers/leads.controller';
import { requireAdmin, requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

// FIX: Added route for getNextHistoryNumber
router.get('/next-history-number', getNextHistoryNumber);
router.get('/', getLeads);
router.post('/', createLead);
router.post('/bulk', requireAdmin, bulkImportLeads);
router.get('/:id', getLeadById);
router.put('/:id', updateLead);
// Permitir eliminar leads a usuarios autenticados (previamente solo admin)
router.delete('/:id', deleteLead);

export default router;