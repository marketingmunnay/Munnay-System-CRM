import type { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getGoals = async (req: Request, res: Response) => {
  try {
    const goals = await prisma.goal.findMany();
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching goals', error: (error as Error).message });
  }
};

export const getGoalById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const goal = await prisma.goal.findUnique({ where: { id: parseInt(id) } });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching goal', error: (error as Error).message });
  }
};

export const createGoal = async (req: Request, res: Response) => {
  const { id, startDate, endDate, ...data } = req.body;
  try {
    const newGoal = await prisma.goal.create({
      data: {
        ...data,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });
    res.status(201).json(newGoal);
  } catch (error) {
    res.status(500).json({ message: 'Error creating goal', error: (error as Error).message });
  }
};

export const updateGoal = async (req: Request, res: Response) => {
  const { id } = req.params;
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
    res.status(200).json(updatedGoal);
  } catch (error) {
    res.status(500).json({ message: 'Error updating goal', error: (error as Error).message });
  }
};

export const deleteGoal = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.goal.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting goal', error: (error as Error).message });
  }
};