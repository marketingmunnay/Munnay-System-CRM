import { Request, Response } from 'express';
import prisma from '../lib/prisma';
// FIX: Removed `ParamsDictionary` import as it was causing type conflicts.

export const getGoals = async (req: Request, res: Response) => {
  try {
    const goals = await prisma.goal.findMany();
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    (res as Response).status(200).json(goals);
  } catch (error) {
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    (res as Response).status(500).json({ message: 'Error fetching goals', error: (error as Error).message });
  }
};

export const getGoalById = async (req: Request<{ id: string }>, res: Response) => {
  // FIX: Access `req.params.id` correctly (added explicit cast for clarity).
  const id = (req.params as any).id;
  try {
    const goal = await prisma.goal.findUnique({ where: { id: parseInt(id) } });
    if (!goal) {
      // FIX: Use `res.status` directly (added explicit cast for clarity).
      return (res as Response).status(404).json({ message: 'Goal not found' });
    }
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    (res as Response).status(200).json(goal);
  } catch (error) {
    // FIX: Use `res.status` directly (added explicit cast for clarity).
    (res as Response).status(500).json({ message: 'Error fetching goal', error: (error as Error).message });
  }
};

// FIX: Added createGoal implementation
export const createGoal = async (req: Request, res: Response) => {
  const { id, startDate, endDate, ...data } = (req.body as any);
  try {
    const newGoal = await prisma.goal.create({
      data: {
        ...data,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });
    (res as Response).status(201).json(newGoal);
  } catch (error) {
    (res as Response).status(500).json({ message: 'Error creating goal', error: (error as Error).message });
  }
};

// FIX: Added updateGoal implementation
export const updateGoal = async (req: Request<{ id: string }>, res: Response) => {
  const id = (req.params as any).id;
  const { startDate, endDate, ...data } = (req.body as any);
  try {
    const updatedGoal = await prisma.goal.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    });
    (res as Response).status(200).json(updatedGoal);
  } catch (error) {
    (res as Response).status(500).json({ message: 'Error updating goal', error: (error as Error).message });
  }
};

// FIX: Added deleteGoal implementation
export const deleteGoal = async (req: Request<{ id: string }>, res: Response) => {
  const id = (req.params as any).id;
  try {
    await prisma.goal.delete({ where: { id: parseInt(id) } });
    (res as Response).status(204).send();
  } catch (error) {
    (res as Response).status(500).json({ message: 'Error deleting goal', error: (error as Error).message });
  }
};