import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { startOfWeek, endOfWeek, addWeeks, format } from 'date-fns';

export const getShifts = async (req: Request, res: Response) => {
  try {
    const { start, end, location } = req.query;
    
    // Default to current week if not specified
    const startDate = start ? new Date(start as string) : startOfWeek(new Date());
    const endDate = end ? new Date(end as string) : endOfWeek(new Date());

    const whereClause: any = {
      date: {
        gte: startDate,
        lte: endDate,
      }
    };

    if (location) {
      whereClause.location = location;
    }

    const shifts = await prisma.shift.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            avatarUrl: true,
            position: true // Assuming position exists or similar
          }
        }
      }
    });

    res.json(shifts);
  } catch (error) {
    console.error('Error fetching shifts:', error);
    res.status(500).json({ message: 'Error fetching shifts' });
  }
};

export const saveShift = async (req: Request, res: Response) => {
  try {
    const { userId, date, timeBlocks, location, isDayOff } = req.body;

    const shiftDate = new Date(date);

    const shift = await prisma.shift.upsert({
      where: {
        userId_date: {
          userId: Number(userId),
          date: shiftDate,
        }
      },
      update: {
        timeBlocks,
        location,
        isDayOff
      },
      create: {
        userId: Number(userId),
        date: shiftDate,
        timeBlocks: timeBlocks || [],
        location: location || 'Principal',
        isDayOff: isDayOff || false
      }
    });

    res.json(shift);
  } catch (error) {
    console.error('Error saving shift:', error);
    res.status(500).json({ message: 'Error saving shift' });
  }
};

export const deleteShift = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.shift.delete({
      where: { id: Number(id) }
    });
    res.json({ message: 'Shift deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting shift' });
  }
};

export const generateRecurringShifts = async (req: Request, res: Response) => {
  try {
    const { userId, sourceDate, weeksToRepeat } = req.body;
    
    // Logic: Fetch the source shift, then replicate it for X weeks
    const sourceShift = await prisma.shift.findUnique({
      where: {
        userId_date: {
            userId: Number(userId),
            date: new Date(sourceDate)
        }
      }
    });

    if (!sourceShift) {
      return res.status(404).json({ message: 'Source shift not found' });
    }

    const createdShifts = [];
    
    for (let i = 1; i <= Number(weeksToRepeat); i++) {
        const nextDate = addWeeks(new Date(sourceDate), i);
        
        const newShift = await prisma.shift.upsert({
            where: {
                userId_date: {
                    userId: Number(userId),
                    date: nextDate
                }
            },
            update: {
                timeBlocks: sourceShift.timeBlocks,
                location: sourceShift.location,
                isDayOff: sourceShift.isDayOff
            },
            create: {
                userId: Number(userId),
                date: nextDate,
                timeBlocks: sourceShift.timeBlocks ?? [],
                location: sourceShift.location,
                isDayOff: sourceShift.isDayOff
            }
        });
        createdShifts.push(newShift);
    }

    res.json({ message: `Generated ${createdShifts.length} shifts`, shifts: createdShifts });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error generating recurring shifts' });
  }
};
