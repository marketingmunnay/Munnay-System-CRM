import { Request, Response } from 'express';
import prisma from '../lib/prisma';
// FIX: Removed `ParamsDictionary` import as it was causing type conflicts.

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const expenses = await prisma.egreso.findMany();
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    (res as Response).status(200).json(expenses);
  } catch (error) {
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    (res as Response).status(500).json({ message: 'Error fetching expenses', error: (error as Error).message });
  }
};

export const getExpenseById = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access `req.params.id` correctly (added explicit cast for clarity).
  const id = (req.params as any).id;
  try {
    const expense = await prisma.egreso.findUnique({ where: { id: parseInt(id) } });
    if (!expense) {
      // FIX: Use `res.status` directly (added explicit cast for clarity).
      return (res as Response).status(404).json({ message: 'Expense not found' });
    }
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    (res as Response).status(200).json(expense);
  } catch (error) {
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    (res as Response).status(500).json({ message: 'Error fetching expense', error: (error as Error).message });
  }
};

export const createExpense = async (req: Request, res: Response) => {
  // FIX: Access `req.body` correctly (added explicit cast for clarity).
  const { id, fechaRegistro, fechaPago, ...data } = (req.body as any);
  try {
    const newExpense = await prisma.egreso.create({
      data: {
        ...data,
        fechaRegistro: new Date(fechaRegistro),
        fechaPago: new Date(fechaPago),
      },
    });
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    (res as Response).status(201).json(newExpense);
  } catch (error) {
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    (res as Response).status(500).json({ message: 'Error creating expense', error: (error as Error).message });
  }
};

export const updateExpense = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access `req.params.id` correctly (added explicit cast for clarity).
  const id = (req.params as any).id;
  // FIX: Access `req.body` correctly (added explicit cast for clarity).
  const { fechaRegistro, fechaPago, ...data } = (req.body as any);
  try {
    const updatedExpense = await prisma.egreso.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        fechaRegistro: fechaRegistro ? new Date(fechaRegistro) : undefined,
        fechaPago: fechaPago ? new Date(fechaPago) : undefined,
      },
    });
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    (res as Response).status(200).json(updatedExpense);
  } catch (error) {
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    (res as Response).status(500).json({ message: 'Error updating expense', error: (error as Error).message });
  }
};

export const deleteExpense = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access `req.params.id` correctly (added explicit cast for clarity).
  const id = (req.params as any).id;
  try {
    await prisma.egreso.delete({ where: { id: parseInt(id) } });
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    (res as Response).status(204).send();
  } catch (error) {
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    (res as Response).status(500).json({ message: 'Error deleting expense', error: (error as Error).message });
  }
};