import { Request, Response } from 'express';
import prisma from '../lib/prisma';
// import { Goal } from '@prisma/client';

export const getGoals = async (req: Request, res: Response) => {
  try {
    const goals = await prisma.goal.findMany();
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching goals', error: (error as Error).message });
  }
};

export const getGoalById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    const goal = await prisma.goal.findUnique({ where: { id: id } });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
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
    console.error("Error creating goal:", error);
    res.status(500).json({ message: 'Error creating goal', error: (error as Error).message });
  }
};

export const updateGoal = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { id: _, startDate, endDate, ...data } = req.body; // Exclude id from update data
  try {
    const updatedGoal = await prisma.goal.update({
      where: { id: id },
      data: {
        ...data,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    });
    res.status(200).json(updatedGoal);
  } catch (error) {
    console.error(`Error updating goal ${id}:`, error);
    res.status(500).json({ message: 'Error updating goal', error: (error as Error).message });
  }
};

export const deleteGoal = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.goal.delete({ where: { id: id } });
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting goal ${id}:`, error);
    res.status(500).json({ message: 'Error deleting goal', error: (error as Error).message });
  }
};