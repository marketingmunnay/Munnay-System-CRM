import * as express from 'express'; // FIX: Import express as a namespace
import prisma from '../lib/prisma';

export const getGoals = async (req: express.Request, res: express.Response) => { // FIX: Use express.Request and express.Response
  try {
    const goals = await prisma.goal.findMany();
    // FIX: Use `res.status` directly.
    res.status(200).json(goals);
  } catch (error) {
    // FIX: Use `res.status` directly.
    res.status(500).json({ message: 'Error fetching goals', error: (error as Error).message });
  }
};

export const getGoalById = async (req: express.Request<{ id: string }>, res: express.Response) => { // FIX: Use express.Request and express.Response
  // FIX: Access `req.params.id` correctly.
  const id = req.params.id;
  try {
    const goal = await prisma.goal.findUnique({ where: { id: parseInt(id) } });
    if (!goal) {
      // FIX: Use `res.status` directly.
      return res.status(404).json({ message: 'Goal not found' });
    }
    // FIX: Use `res.status` directly.
    res.status(200).json(goal);
  } catch (error) {
    // FIX: Use `res.status` directly.
    res.status(500).json({ message: 'Error fetching goal', error: (error as Error).message });
  }
};

// FIX: Added createGoal implementation
export const createGoal = async (req: express.Request, res: express.Response) => { // FIX: Use express.Request and express.Response
  const { id, startDate, endDate, ...data } = req.body as any;
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

// FIX: Added updateGoal implementation
export const updateGoal = async (req: express.Request<{ id: string }>, res: express.Response) => { // FIX: Use express.Request and express.Response
  const id = req.params.id;
  const { startDate, endDate, ...data } = req.body as any;
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

// FIX: Added deleteGoal implementation
export const deleteGoal = async (req: express.Request<{ id: string }>, res: express.Response) => { // FIX: Use express.Request and express.Response
  const id = req.params.id;
  try {
    await prisma.goal.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting goal', error: (error as Error).message });
  }
};