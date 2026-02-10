import { Router } from 'express';
// FIX: Added getNextHistoryNumber to imports
import { getLeads, createLead, getLeadById, updateLead, deleteLead, getNextHistoryNumber, bulkImportLeads } from '../controllers/leads.controller';

const router = Router();

// FIX: Added route for getNextHistoryNumber
router.get('/next-history-number', getNextHistoryNumber);
router.get('/', getLeads);
router.post('/', createLead);
router.post('/bulk', bulkImportLeads);
router.get('/:id', getLeadById);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);

export default router;