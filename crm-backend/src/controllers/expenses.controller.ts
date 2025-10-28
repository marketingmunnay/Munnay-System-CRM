import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { Egreso } from '@prisma/client';

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const expenses = await prisma.egreso.findMany();
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expenses', error: (error as Error).message });
  }
};

export const getExpenseById = async (req: Request<{ id: string }>, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    const expense = await prisma.egreso.findUnique({ where: { id: id } });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expense', error: (error as Error).message });
  }
};

export const createExpense = async (req: Request<any, any, Egreso>, res: Response) => {
  const { id, fechaRegistro, fechaPago, ...data } = req.body;
  try {
    const newExpense = await prisma.egreso.create({
      data: {
        ...data,
        fechaRegistro: new Date(fechaRegistro),
        fechaPago: new Date(fechaPago),
      },
    });
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({ message: 'Error creating expense', error: (error as Error).message });
  }
};

export const updateExpense = async (req: Request<{ id: string }, any, Egreso>, res: Response) => {
  const id = parseInt(req.params.id);
  const { fechaRegistro, fechaPago, ...data } = req.body;
  try {
    const updatedExpense = await prisma.egreso.update({
      where: { id: id },
      data: {
        ...data,
        fechaRegistro: fechaRegistro ? new Date(fechaRegistro) : undefined,
        fechaPago: fechaPago ? new Date(fechaPago) : undefined,
      },
    });
    res.status(200).json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: 'Error updating expense', error: (error as Error).message });
  }
};

export const deleteExpense = async (req: Request<{ id: string }>, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.egreso.delete({ where: { id: id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting expense', error: (error as Error).message });
  }
};