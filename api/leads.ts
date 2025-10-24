import { Pool } from 'pg';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Lead } from '../types';

// Create a new pool instance.
// IMPORTANT: These credentials should be set as Environment Variables in your Vercel project settings.
const pool = new Pool({
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT || '5432', 10),
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  ssl: {
    rejectUnauthorized: false // Required for some cloud database providers
  }
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    switch (req.method) {
      case 'GET':
        {
          const { rows } = await pool.query('SELECT * FROM leads ORDER BY "fechaLead" DESC');
          // Convert snake_case from DB to camelCase for JS if necessary
          // For now, assuming your DB columns match the camelCase type properties.
          res.status(200).json(rows);
          break;
        }
      case 'POST':
        {
          const lead: Lead = req.body;
          
          // Use an UPSERT operation: UPDATE if exists, INSERT if not.
          const query = `
            INSERT INTO leads (
              id, "fechaLead", nombres, apellidos, numero, sexo, "redSocial", anuncio, vendedor, estado, "montoPagado", "metodoPago", "fechaHoraAgenda", servicios, categoria, "nHistoria", "aceptoTratamiento", "motivoNoCierre", tratamientos, "estadoRecepcion", "recursoId", procedimientos, seguimientos, "birthDate", alergias, "membresiasAdquiridas"
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26
            )
            ON CONFLICT (id) DO UPDATE SET
              "fechaLead" = EXCLUDED."fechaLead",
              nombres = EXCLUDED.nombres,
              apellidos = EXCLUDED.apellidos,
              numero = EXCLUDED.numero,
              sexo = EXCLUDED.sexo,
              "redSocial" = EXCLUDED."redSocial",
              anuncio = EXCLUDED.anuncio,
              vendedor = EXCLUDED.vendedor,
              estado = EXCLUDED.estado,
              "montoPagado" = EXCLUDED."montoPagado",
              "metodoPago" = EXCLUDED."metodoPago",
              "fechaHoraAgenda" = EXCLUDED."fechaHoraAgenda",
              servicios = EXCLUDED.servicios,
              categoria = EXCLUDED.categoria,
              "nHistoria" = EXCLUDED."nHistoria",
              "aceptoTratamiento" = EXCLUDED."aceptoTratamiento",
              "motivoNoCierre" = EXCLUDED."motivoNoCierre",
              tratamientos = EXCLUDED.tratamientos,
              "estadoRecepcion" = EXCLUDED."estadoRecepcion",
              "recursoId" = EXCLUDED."recursoId",
              procedimientos = EXCLUDED.procedimientos,
              seguimientos = EXCLUDED.seguimientos,
              "birthDate" = EXCLUDED."birthDate",
              alergias = EXCLUDED.alergias,
              "membresiasAdquiridas" = EXCLUDED."membresiasAdquiridas"
            RETURNING *;
          `;
          
          // Note: PostgreSQL requires JSON data to be stringified for json/jsonb columns.
          const values = [
            lead.id || Date.now(),
            lead.fechaLead,
            lead.nombres,
            lead.apellidos,
            lead.numero,
            lead.sexo,
            lead.redSocial,
            lead.anuncio,
            lead.vendedor,
            lead.estado,
            lead.montoPagado,
            lead.metodoPago,
            lead.fechaHoraAgenda,
            lead.servicios,
            lead.categoria,
            lead.nHistoria,
            lead.aceptoTratamiento,
            lead.motivoNoCierre,
            JSON.stringify(lead.tratamientos || []),
            lead.estadoRecepcion,
            lead.recursoId,
            JSON.stringify(lead.procedimientos || []),
            JSON.stringify(lead.seguimientos || []),
            lead.birthDate,
            JSON.stringify(lead.alergias || []),
            JSON.stringify(lead.membresiasAdquiridas || [])
          ];
          
          const { rows } = await pool.query(query, values);
          res.status(201).json(rows[0]);
          break;
        }
      case 'DELETE':
        {
          const { id } = req.body;
          if (!id) {
            return res.status(400).json({ message: 'Lead ID is required for deletion.' });
          }
          await pool.query('DELETE FROM leads WHERE id = $1', [id]);
          res.status(200).json({ id });
          break;
        }
      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error instanceof Error ? error.message : String(error) });
  }
}
