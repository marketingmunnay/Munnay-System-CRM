import { config } from 'dotenv';
config();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteAllLeads() {
    try {
        console.log('🗑️  Starting deletion of all leads...');
        
        // Count current leads
        const countBefore = await prisma.lead.count();
        console.log(`📊 Total leads before deletion: ${countBefore}`);
        
        if (countBefore === 0) {
            console.log('ℹ️  No leads to delete');
            await prisma.$disconnect();
            return;
        }
        
        // Delete all leads
        const result = await prisma.lead.deleteMany({});
        
        console.log(`✅ Successfully deleted ${result.count} leads`);
        
        // Verify deletion
        const countAfter = await prisma.lead.count();
        console.log(`📊 Total leads after deletion: ${countAfter}`);
        
        if (countAfter === 0) {
            console.log('✅ All leads have been removed from the database');
        }
    } catch (error) {
        console.error('❌ Error deleting leads:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

deleteAllLeads();
