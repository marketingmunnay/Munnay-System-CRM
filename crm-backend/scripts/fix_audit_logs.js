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

    // Eliminar registros de auditoría relacionados a Inventario, Incidencias, Historia de Pacientes y Facturación
    const deleteModulesQuery = `
      DELETE FROM "AuditLog"
      WHERE "accion" IN ('inventario', 'incidencia', 'historia_paciente', 'facturacion');
    `;
    const resDeleteModules = await client.query(deleteModulesQuery);
    console.log(`Deleted ${resDeleteModules.rowCount} audit logs for removed modules.`);

  } catch (err) {
    console.error('Error executing script:', err);
  } finally {
    await client.end();
  }
}

main();
