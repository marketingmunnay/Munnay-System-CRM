import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

/**
 * DELETE /admin/leads/truncate
 * ⚠️ DANGER: Permanently deletes ALL leads from the database
 * Requires admin authentication
 */
router.delete('/leads/truncate', async (req: Request, res: Response) => {
    try {
        // Simple security check - could be enhanced with JWT verification
        const adminKey = req.headers['x-admin-key'];
        const expectedKey = process.env.ADMIN_DELETE_KEY || 'CHANGE_ME_IN_ENV';
        
        if (adminKey !== expectedKey) {
            return res.status(403).json({ message: 'Unauthorized: Invalid admin key' });
        }
        
        console.log('🗑️  [ADMIN] Starting deletion of all leads...');
        
        // Count before
        const countBefore = await prisma.lead.count();
        console.log(`📊 Leads before deletion: ${countBefore}`);
        
        if (countBefore === 0) {
            return res.json({ 
                success: true, 
                message: 'No leads to delete',
                deletedCount: 0,
                countBefore,
                countAfter: 0
            });
        }
        
        // Delete all leads
        const result = await prisma.lead.deleteMany({});
        
        // Verify
        const countAfter = await prisma.lead.count();
        
        console.log(`✅ [ADMIN] Successfully deleted ${result.count} leads`);
        console.log(`📊 Leads after deletion: ${countAfter}`);
        
        res.json({ 
            success: true,
            message: `Successfully deleted ${result.count} leads`,
            deletedCount: result.count,
            countBefore,
            countAfter
        });
    } catch (error) {
        console.error('❌ [ADMIN] Error deleting leads:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error deleting leads',
            error: (error as Error).message 
        });
    }
});

export default router;
