import { Router } from 'express';
import { 
    getCampaigns, createCampaign, getCampaignById, updateCampaign, deleteCampaign, bulkCreateCampaigns,
    getMetaCampaigns, createMetaCampaign, getMetaCampaignById, updateMetaCampaign, deleteMetaCampaign
} from '../controllers/campaigns.controller';

const router = Router();

// MetaCampaigns routes
router.get('/meta', getMetaCampaigns);
router.post('/meta', createMetaCampaign);
router.get('/meta/:id', getMetaCampaignById);
router.put('/meta/:id', updateMetaCampaign);
router.delete('/meta/:id', deleteMetaCampaign);

// Campaigns (Anuncios) routes
router.get('/', getCampaigns);
router.post('/', createCampaign);
router.post('/bulk', bulkCreateCampaigns);
router.get('/:id', getCampaignById);
router.put('/:id', updateCampaign);
router.delete('/:id', deleteCampaign);


export default router;