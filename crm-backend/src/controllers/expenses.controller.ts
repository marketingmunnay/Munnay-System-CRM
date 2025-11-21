import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
// import { Egreso } from '@prisma/client';

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const expenses = await prisma.egreso.findMany();
    
    // Serializar fechas como ISO 8601 UTC (frontend convertirá a display/input según necesite)
    const formattedExpenses = expenses.map(expense => ({
      ...expense,
      fechaRegistro: expense.fechaRegistro.toISOString(),
      fechaPago: expense.fechaPago ? expense.fechaPago.toISOString() : undefined,
    }));
    
    res.status(200).json(formattedExpenses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expenses', error: (error as Error).message });
  }
};

export const getExpenseById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    const expense = await prisma.egreso.findUnique({ where: { id: id } });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    // Serializar fechas como ISO 8601 UTC
    const formattedExpense = {
      ...expense,
      fechaRegistro: expense.fechaRegistro.toISOString(),
      fechaPago: expense.fechaPago ? expense.fechaPago.toISOString() : undefined,
    };
    
    res.status(200).json(formattedExpense);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expense', error: (error as Error).message });
  }
};

export const createExpense = async (req: Request, res: Response) => {
  const { id, fechaRegistro, fechaPago, comprobantes, ...data } = req.body;
  
  // Helper para parsear fechas correctamente
  const parseDate = (dateStr: string | undefined): Date | undefined => {
    if (!dateStr || dateStr === 'undefined' || dateStr === '') return undefined;
    // Aceptar ya sea ISO completo o fecha-only. Para fecha-only asumimos UTC midnight.
    const normalized = dateStr.match(/^\d{4}-\d{2}-\d{2}$/) ? `${dateStr}T00:00:00Z` : dateStr;
    const date = new Date(normalized);
    return isNaN(date.getTime()) ? undefined : date;
  };
  
  try {
    const parsedFechaPago = parseDate(fechaPago);

    // If frontend sent comprobantes array, map first comprobante to fotoUrl fields
    const firstComp = Array.isArray(comprobantes) && comprobantes.length > 0 ? comprobantes[0] : undefined;

    const payload: any = {
      ...data,
      fechaRegistro: parseDate(fechaRegistro) || new Date(),
      ...(parsedFechaPago && { fechaPago: parsedFechaPago }),
    };

    if (firstComp && firstComp.url) {
      payload.fotoUrl = firstComp.url;
      payload.fotoMimeType = firstComp.mimeType || undefined;
      payload.fotoName = firstComp.name || undefined;
    }

    const newExpense = await prisma.egreso.create({ data: payload });
    
    // Formatear fechas en la respuesta
    const formattedExpense = {
      ...newExpense,
      fechaRegistro: newExpense.fechaRegistro.toISOString(),
      fechaPago: newExpense.fechaPago ? newExpense.fechaPago.toISOString() : undefined,
    };
    
    res.status(201).json(formattedExpense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ message: 'Error creating expense', error: (error as Error).message });
  }
};

export const updateExpense = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { id: _, fechaRegistro, fechaPago, comprobantes, ...data } = req.body; // Exclude id from update data
  
  // Helper para parsear fechas correctamente
  const parseDate = (dateStr: string | undefined): Date | undefined => {
    if (!dateStr || dateStr === 'undefined' || dateStr === '') return undefined;
    const normalized = dateStr.match(/^\d{4}-\d{2}-\d{2}$/) ? `${dateStr}T00:00:00Z` : dateStr;
    const date = new Date(normalized);
    return isNaN(date.getTime()) ? undefined : date;
  };
  
  try {
    const parsedFechaRegistro = parseDate(fechaRegistro);
    const parsedFechaPago = parseDate(fechaPago);
    
    const payload: any = {
      ...data,
      ...(parsedFechaRegistro && { fechaRegistro: parsedFechaRegistro }),
      ...(parsedFechaPago !== undefined && { fechaPago: parsedFechaPago }),
    };

    // Map first comprobante to fotoUrl fields for backward compatibility
    const firstComp = Array.isArray(comprobantes) && comprobantes.length > 0 ? comprobantes[0] : undefined;
    if (firstComp && firstComp.url) {
      payload.fotoUrl = firstComp.url;
      payload.fotoMimeType = firstComp.mimeType || undefined;
      payload.fotoName = firstComp.name || undefined;
    }

    const updatedExpense = await prisma.egreso.update({ where: { id: id }, data: payload });
    
    // Formatear fechas en la respuesta
    const formattedExpense = {
      ...updatedExpense,
      fechaRegistro: updatedExpense.fechaRegistro.toISOString(),
      fechaPago: updatedExpense.fechaPago ? updatedExpense.fechaPago.toISOString() : undefined,
    };
    
    res.status(200).json(formattedExpense);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ message: 'Error updating expense', error: (error as Error).message });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    // Buscar el egreso para conocer si tiene comprobante asociado
    const expense = await prisma.egreso.findUnique({ where: { id } });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    // Si existe fotoUrl y apunta a /uploads/egresos, intentar eliminar el archivo del disco
    if (expense.fotoUrl) {
      try {
        const filename = path.basename(expense.fotoUrl);
        const filePath = path.join(egresosUploadDir, filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (e) {
        // Loguear pero no impedir la eliminación del registro
        console.warn('Could not remove comprobante file for expense', id, (e as Error).message);
      }
    }

    await prisma.egreso.delete({ where: { id: id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting expense', error: (error as Error).message });
  }
};

// --- File upload handler for comprobantes ---
// Storage config: save under ./uploads/egresos with original filename prefixed by timestamp
const egresosUploadDir = path.join(__dirname, '..', '..', 'uploads', 'egresos');
try { fs.mkdirSync(egresosUploadDir, { recursive: true }); } catch (e) { /* ignore */ }

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, egresosUploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${timestamp}_${safeName}`);
  }
});

// Allowed MIME types: images and PDF (validation handled after upload to avoid multer type mismatch)
const allowedMime = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

// Create multer instance with size limit only; we'll validate MIME after upload
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// Express middleware-ready handler to be used in routes
export const uploadComprobanteMiddleware = upload.single('comprobante');

export const uploadComprobante = async (req: Request, res: Response) => {
  // multer should have attached file info on req.file (typed by @types/multer)
  const file = req.file as Express.Multer.File | undefined;
  if (!file) return res.status(400).json({ message: 'No file uploaded' });
  // Validate MIME type server-side and remove file if invalid
  if (!(String(file.mimetype).startsWith('image/') || allowedMime.includes(file.mimetype))) {
    // Remove the saved file
    try {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    } catch (e) {
      console.warn('Failed to remove invalid upload:', (e as Error).message);
    }
    return res.status(400).json({ message: 'Invalid file type. Only images and PDF are allowed.' });
  }

  // Build public URL relative to server
  const publicPath = `/uploads/egresos/${path.basename(file.path)}`;

  return res.status(201).json({
    url: publicPath,
    mimeType: file.mimetype,
    name: file.originalname,
    size: file.size,
  });
};

// Bulk import for expenses (egresos)
export const bulkImportExpenses = async (req: Request, res: Response) => {
  try {
    const items = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'Los datos deben ser un array de egresos' });
    }

    const results: any[] = [];
    let successCount = 0;
    let errorCount = 0;

    const parseDate = (v: any): Date | undefined => {
      if (!v || v === 'undefined') return undefined;
      const normalized = String(v).match(/^\d{4}-\d{2}-\d{2}$/) ? `${v}T00:00:00Z` : v;
      const d = new Date(normalized);
      return isNaN(d.getTime()) ? undefined : d;
    };

    for (let i = 0; i < items.length; i++) {
      const row = items[i];
      try {
        const payload: any = {
          proveedor: row.proveedor || '',
          categoria: row.categoria || '',
          descripcion: row.descripcion || '',
          tipoComprobante: row.tipoComprobante || undefined,
          serieComprobante: row.serieComprobante || undefined,
          nComprobante: row.nComprobante || undefined,
          montoTotal: row.montoTotal !== undefined ? parseFloat(row.montoTotal) || 0 : 0,
          montoPagado: row.montoPagado !== undefined ? parseFloat(row.montoPagado) || 0 : 0,
          deuda: row.deuda !== undefined ? parseFloat(row.deuda) || 0 : 0,
          modoPago: row.modoPago || undefined,
          tipoMoneda: row.tipoMoneda || undefined,
          observaciones: row.observaciones || undefined,
          fechaRegistro: parseDate(row.fechaRegistro) || new Date(),
        };

        const parsedFechaPago = parseDate(row.fechaPago);
        if (parsedFechaPago) payload.fechaPago = parsedFechaPago;

        // Map first comprobante to fotoUrl for backward compatibility
        if (Array.isArray(row.comprobantes) && row.comprobantes.length > 0 && row.comprobantes[0].url) {
          const first = row.comprobantes[0];
          payload.fotoUrl = first.url;
          payload.fotoMimeType = first.mimeType || undefined;
          payload.fotoName = first.name || undefined;
        }

        const created = await prisma.egreso.create({ data: payload });

        results.push({ success: true, item: created });
        successCount++;
      } catch (err: any) {
        console.error(`Error importing expense ${i + 1}:`, err?.message || err);
        errorCount++;
        results.push({ success: false, index: i, error: err?.message || String(err) });
      }
    }

    res.status(200).json({ message: `Se importaron ${successCount} egresos. ${errorCount} errores.`, egresos: results, successCount, errorCount });
  } catch (error: any) {
    console.error('Error en bulkImportExpenses:', error);
    res.status(500).json({ message: 'Error en importación bulk de egresos', error: error?.message || String(error) });
  }
};