import { Request, Response } from 'express';
import prisma from '../lib/prisma';
// import { Egreso } from '@prisma/client';

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const expenses = await prisma.egreso.findMany();
    
    // Formatear fechas a YYYY-MM-DD para compatibilidad con inputs type="date"
    const formattedExpenses = expenses.map(expense => ({
      ...expense,
      fechaRegistro: expense.fechaRegistro.toISOString().split('T')[0],
      fechaPago: expense.fechaPago ? expense.fechaPago.toISOString().split('T')[0] : undefined,
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
    
    // Formatear fechas a YYYY-MM-DD
    const formattedExpense = {
      ...expense,
      fechaRegistro: expense.fechaRegistro.toISOString().split('T')[0],
      fechaPago: expense.fechaPago ? expense.fechaPago.toISOString().split('T')[0] : undefined,
    };
    
    res.status(200).json(formattedExpense);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expense', error: (error as Error).message });
  }
};

export const createExpense = async (req: Request, res: Response) => {
  const { id, fechaRegistro, fechaPago, ...data } = req.body;
  
  // Helper para parsear fechas correctamente
  const parseDate = (dateStr: string | undefined): Date | undefined => {
    if (!dateStr || dateStr === 'undefined' || dateStr === '') return undefined;
    const date = new Date(dateStr + 'T00:00:00');
    return isNaN(date.getTime()) ? undefined : date;
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
    
    // Formatear fechas en la respuesta
    const formattedExpense = {
      ...newExpense,
      fechaRegistro: newExpense.fechaRegistro.toISOString().split('T')[0],
      fechaPago: newExpense.fechaPago ? newExpense.fechaPago.toISOString().split('T')[0] : undefined,
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
  
  // Helper para parsear fechas correctamente
  const parseDate = (dateStr: string | undefined): Date | undefined => {
    if (!dateStr || dateStr === 'undefined' || dateStr === '') return undefined;
    const date = new Date(dateStr + 'T00:00:00');
    return isNaN(date.getTime()) ? undefined : date;
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
    
    // Formatear fechas en la respuesta
    const formattedExpense = {
      ...updatedExpense,
      fechaRegistro: updatedExpense.fechaRegistro.toISOString().split('T')[0],
      fechaPago: updatedExpense.fechaPago ? updatedExpense.fechaPago.toISOString().split('T')[0] : undefined,
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