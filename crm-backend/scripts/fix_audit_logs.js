const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    await client.connect();
    console.log('Connected to database.');

    // Check for orphaned logs
    const checkQuery = `
      SELECT COUNT(*) 
      FROM "AuditLog" 
      WHERE "usuarioId" NOT IN (SELECT id FROM "User");
    `;
    
    const resCheck = await client.query(checkQuery);
    const count = parseInt(resCheck.rows[0].count);
    
    console.log(`Found ${count} orphaned AuditLog records.`);

    if (count > 0) {
      console.log('Deleting orphaned records...');
      const deleteQuery = `
        DELETE FROM "AuditLog" 
        WHERE "usuarioId" NOT IN (SELECT id FROM "User");
      `;
      const resDelete = await client.query(deleteQuery);
      console.log(`Successfully deleted ${resDelete.rowCount} orphaned records.`);
    } else {
      console.log('No cleanup needed.');
    }

  } catch (err) {
    console.error('Error executing script:', err);
  } finally {
    await client.end();
  }
}

main();
