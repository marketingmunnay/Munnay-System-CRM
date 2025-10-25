import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getGoals = async (req: Request, res: Response) => {
  try {
    const goals = await prisma.goal.findMany();
    // FIX: Add .status() method to the response object.
    res.status(200).json(goals);
  } catch (error) {
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error fetching goals', error: (error as Error).message });
  }
};

export const getGoalById = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access params from the request object directly.
  const { id } = req.params;
  try {
    const goal = await prisma.goal.findUnique({ where: { id: parseInt(id) } });
    if (!goal) {
      // FIX: Add .status() method to the response object.
      return res.status(404).json({ message: 'Goal not found' });
    }
    // FIX: Add .status() method to the response object.
    res.status(200).json(goal);
  } catch (error) {
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error fetching goal', error: (error as Error).message });
  }
};

export const createGoal = async (req: Request<any, any, any>, res: Response) => {
  // FIX: Access body from the request object directly.
  const { id, startDate, endDate, ...data } = req.body;
  try {
    const newGoal = await prisma.goal.create({
      data: {
        ...data,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });
    // FIX: Add .status() method to the response object.
    res.status(201).json(newGoal);
  } catch (error) {
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error creating goal', error: (error as Error).message });
  }
};

export const updateGoal = async (req: Request<{ id: string }, any, any>, res: Response) => {
  // FIX: Access params from the request object directly.
  const { id } = req.params;
  // FIX: Access body from the request object directly.
  const { startDate, endDate, ...data } = req.body;
  try {
    const updatedGoal = await prisma.goal.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    });
    // FIX: Add .status() method to the response object.
    res.status(200).json(updatedGoal);
  } catch (error) {
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error updating goal', error: (error as Error).message });
  }
};

export const deleteGoal = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access params from the request object directly.
  const { id } = req.params;
  try {
    await prisma.goal.delete({ where: { id: parseInt(id) } });
    // FIX: Add .status() method to the response object.
    res.status(204).send();
  } catch (error) {
    // FIX: Add .status() method to the response object.
    res.status(500).json({ message: 'Error deleting goal', error: (error as Error).message });
  }
};