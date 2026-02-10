import express from 'express';
import { generateContent, generateAnalysis, generateCommercialReport } from '../controllers/ai.controller';

const router = express.Router();

// POST /api/ai/generate - Generate AI content with custom prompt
router.post('/generate', generateContent);

// POST /api/ai/analysis - Generate analysis for patient follow-ups
router.post('/analysis', generateAnalysis);

// POST /api/ai/commercial-report - Generate commercial analysis report
router.post('/commercial-report', generateCommercialReport);

export default router;