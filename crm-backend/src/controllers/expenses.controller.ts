// Endpoint temporal para ver fechas crudas de los últimos 10 egresos
export const getRawEgresoDates = async (req: Request, res: Response) => {
  try {
    const egresos = await prisma.egreso.findMany({
      orderBy: { id: 'desc' },
      take: 10,
      select: { id: true, fechaRegistro: true, fechaPago: true }
    });
    res.status(200).json(egresos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching raw egreso dates', error: (error as Error).message });
  }
};
import { Request, Response } from 'express';
import prisma from '../lib/prisma';
// import { Egreso } from '@prisma/client';

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const expenses = await prisma.egreso.findMany();
    
    // Formatear fechas a YYYY-MM-DD (local, no UTC)
    const formatLocalDate = (date: Date) => {
      const y = date.getFullYear();
      const m = (date.getMonth() + 1).toString().padStart(2, '0');
      const d = date.getDate().toString().padStart(2, '0');
      return `${y}-${m}-${d}`;
    };
    const formattedExpenses = expenses.map(expense => ({
      ...expense,
      fechaRegistro: formatLocalDate(expense.fechaRegistro),
      fechaPago: expense.fechaPago ? formatLocalDate(expense.fechaPago) : undefined,
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
    
    // Formatear fechas a YYYY-MM-DD (local, no UTC)
    const formatLocalDate = (date: Date) => {
      const y = date.getFullYear();
      const m = (date.getMonth() + 1).toString().padStart(2, '0');
      const d = date.getDate().toString().padStart(2, '0');
      return `${y}-${m}-${d}`;
    };
    const formattedExpense = {
      ...expense,
      fechaRegistro: formatLocalDate(expense.fechaRegistro),
      fechaPago: expense.fechaPago ? formatLocalDate(expense.fechaPago) : undefined,
    };
    
    res.status(200).json(formattedExpense);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expense', error: (error as Error).message });
  }
};

export const createExpense = async (req: Request, res: Response) => {
  const { id, fechaRegistro, fechaPago, ...data } = req.body;
  
  // Helper para parsear fechas correctamente (como local, no UTC)
  const parseDate = (dateStr: string | undefined): Date | undefined => {
    if (!dateStr || dateStr === 'undefined' || dateStr === '') return undefined;
    // Crear fecha local (YYYY-MM-DD)
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return undefined;
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  };
  
  try {
    const parsedFechaPago = parseDate(fechaPago);
    const newExpense = await prisma.egreso.create({
      data: {
        ...data,
        fechaRegistro: parseDate(fechaRegistro) || new Date(),
        ...(parsedFechaPago && { fechaPago: parsedFechaPago }),
      },
    });
    
    // Formatear fechas en la respuesta (local, no UTC)
    const formatLocalDate = (date: Date) => {
      const y = date.getFullYear();
      const m = (date.getMonth() + 1).toString().padStart(2, '0');
      const d = date.getDate().toString().padStart(2, '0');
      return `${y}-${m}-${d}`;
    };
    const formattedExpense = {
      ...newExpense,
      fechaRegistro: formatLocalDate(newExpense.fechaRegistro),
      fechaPago: newExpense.fechaPago ? formatLocalDate(newExpense.fechaPago) : undefined,
    };
    
    res.status(201).json(formattedExpense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ message: 'Error creating expense', error: (error as Error).message });
  }
};

export const updateExpense = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { id: _, fechaRegistro, fechaPago, ...data } = req.body; // Exclude id from update data
  
  // Helper para parsear fechas correctamente (como local, no UTC)
  const parseDate = (dateStr: string | undefined): Date | undefined => {
    if (!dateStr || dateStr === 'undefined' || dateStr === '') return undefined;
    // Crear fecha local (YYYY-MM-DD)
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return undefined;
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  };
  
  try {
    const parsedFechaRegistro = parseDate(fechaRegistro);
    const parsedFechaPago = parseDate(fechaPago);
    
    const updatedExpense = await prisma.egreso.update({
      where: { id: id },
      data: {
        ...data,
        ...(parsedFechaRegistro && { fechaRegistro: parsedFechaRegistro }),
        ...(parsedFechaPago !== undefined && { fechaPago: parsedFechaPago }),
      },
    });
    
    // Formatear fechas en la respuesta (local, no UTC)
    const formatLocalDate = (date: Date) => {
      const y = date.getFullYear();
      const m = (date.getMonth() + 1).toString().padStart(2, '0');
      const d = date.getDate().toString().padStart(2, '0');
      return `${y}-${m}-${d}`;
    };
    const formattedExpense = {
      ...updatedExpense,
      fechaRegistro: formatLocalDate(updatedExpense.fechaRegistro),
      fechaPago: updatedExpense.fechaPago ? formatLocalDate(updatedExpense.fechaPago) : undefined,
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
    await prisma.egreso.delete({ where: { id: id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting expense', error: (error as Error).message });
  }
};

export const bulkImportExpenses = async (req: Request, res: Response) => {
  const egresos = req.body;

  if (!Array.isArray(egresos)) {
    return res.status(400).json({ message: 'Expected an array of expenses' });
  }

  const parseDate = (dateStr: string | undefined): Date | undefined => {
    if (!dateStr || dateStr === 'undefined' || dateStr === '') return undefined;
    const date = new Date(dateStr + 'T00:00:00');
    return isNaN(date.getTime()) ? undefined : date;
  };

  const results: any[] = [];
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < egresos.length; i++) {
    const egreso = egresos[i];
    
    try {
      const { id, fechaRegistro, fechaPago, ...data } = egreso;
      
      // Validar campos requeridos
      if (!data.proveedor || !data.categoria || !data.descripcion || data.montoTotal === undefined) {
        throw new Error('Faltan campos requeridos: proveedor, categoria, descripcion, montoTotal');
      }

      const parsedFechaPago = parseDate(fechaPago);
      
      const newExpense = await prisma.egreso.create({
        data: {
          ...data,
          fechaRegistro: parseDate(fechaRegistro) || new Date(),
          ...(parsedFechaPago && { fechaPago: parsedFechaPago }),
        },
      });

      results.push({
        success: true,
        index: i,
        data: newExpense
      });
      successCount++;
    } catch (error) {
      results.push({
        success: false,
        index: i,
        error: (error as Error).message
      });
      errorCount++;
    }
  }

  res.status(200).json({
    message: `Importación completada: ${successCount} exitosos, ${errorCount} errores`,
    successCount,
    errorCount,
    egresos: results
  });
};