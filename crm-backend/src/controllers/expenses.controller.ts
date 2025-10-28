import * as express from 'express'; // FIX: Import express as a namespace
import prisma from '../lib/prisma';

export const getExpenses = async (req: express.Request, res: express.Response) => { // FIX: Use express.Request and express.Response
  try {
    const expenses = await prisma.egreso.findMany();
    // FIX: Use `res.status` directly.
    res.status(200).json(expenses);
  } catch (error) {
    // FIX: Use `res.status` directly.
    res.status(500).json({ message: 'Error fetching expenses', error: (error as Error).message });
  }
};

export const getExpenseById = async (req: express.Request<{ id: string }>, res: express.Response) => { // FIX: Use express.Request and express.Response
  // FIX: Access `req.params.id` correctly.
  const id = req.params.id;
  try {
    const expense = await prisma.egreso.findUnique({ where: { id: parseInt(id) } });
    if (!expense) {
      // FIX: Use `res.status` directly.
      return res.status(404).json({ message: 'Expense not found' });
    }
    // FIX: Use `res.status` directly.
    res.status(200).json(expense);
  } catch (error) {
    // FIX: Use `res.status` directly.
    res.status(500).json({ message: 'Error fetching expense', error: (error as Error).message });
  }
};

export const createExpense = async (req: express.Request, res: express.Response) => { // FIX: Use express.Request and express.Response
  // FIX: Access `req.body` correctly.
  const { id, fechaRegistro, fechaPago, ...data } = req.body as any;
  try {
    const newExpense = await prisma.egreso.create({
      data: {
        ...data,
        fechaRegistro: new Date(fechaRegistro),
        fechaPago: new Date(fechaPago),
      },
    });
    // FIX: Use `res.status` directly.
    res.status(201).json(newExpense);
  } catch (error) {
    // FIX: Use `res.status` directly.
    res.status(500).json({ message: 'Error creating expense', error: (error as Error).message });
  }
};

export const updateExpense = async (req: express.Request<{ id: string }>, res: express.Response) => { // FIX: Use express.Request and express.Response
  // FIX: Access `req.params.id` correctly.
  const id = req.params.id;
  // FIX: Access `req.body` correctly.
  const { fechaRegistro, fechaPago, ...data } = req.body as any;
  try {
    const updatedExpense = await prisma.egreso.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        fechaRegistro: fechaRegistro ? new Date(fechaRegistro) : undefined,
        fechaPago: fechaPago ? new Date(fechaPago) : undefined,
      },
    });
    // FIX: Use `res.status` directly.
    res.status(200).json(updatedExpense);
  } catch (error) {
    // FIX: Use `res.status` directly.
    res.status(500).json({ message: 'Error updating expense', error: (error as Error).message });
  }
};

export const deleteExpense = async (req: express.Request<{ id: string }>, res: express.Response) => { // FIX: Use express.Request and express.Response
  // FIX: Access `req.params.id` correctly.
  const id = req.params.id;
  try {
    await prisma.egreso.delete({ where: { id: parseInt(id) } });
    // FIX: Use `res.status` directly.
    res.status(204).send();
  } catch (error) {
    // FIX: Use `res.status` directly.
    res.status(500).json({ message: 'Error deleting expense', error: (error as Error).message });
  }
};