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
    const { userId, sourceDate, weeksToRepeat, mode, targetDate, untilDate } = req.body;
    
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
    const source = new Date(sourceDate);

    // MODE: Specific Date (Copy to one specific date)
    if (mode === 'specific_date' && targetDate) {
         const specificDate = new Date(targetDate);
         const newShift = await prisma.shift.upsert({
            where: {
                userId_date: { userId: Number(userId), date: specificDate }
            },
            update: {
                timeBlocks: sourceShift.timeBlocks as any,
                location: sourceShift.location,
                isDayOff: sourceShift.isDayOff
            },
            create: {
                userId: Number(userId),
                date: specificDate,
                timeBlocks: sourceShift.timeBlocks as any || [],
                location: sourceShift.location || 'Principal',
                isDayOff: sourceShift.isDayOff || false
            }
        });
        createdShifts.push(newShift);
    } 
    // MODE: Weeks (Repeat for X weeks) OR Until Date (Calculate weeks)
    else {
        let iterations = 0;
        
        if (mode === 'until_date' && untilDate) {
            const end = new Date(untilDate);
            const start = new Date(sourceDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            iterations = Math.floor(diffDays / 7);
        } else {
            iterations = Number(weeksToRepeat) || 1;
        }

        for (let i = 1; i <= iterations; i++) {
            const nextDate = addWeeks(source, i);
            
            const newShift = await prisma.shift.upsert({
                where: {
                    userId_date: {
                        userId: Number(userId),
                        date: nextDate
                    }
                },
                update: {
                    timeBlocks: sourceShift.timeBlocks as any,
                    location: sourceShift.location,
                    isDayOff: sourceShift.isDayOff
                },
                create: {
                    userId: Number(userId),
                    date: nextDate,
                    timeBlocks: sourceShift.timeBlocks as any || [],
                    location: sourceShift.location || 'Principal',
                    isDayOff: sourceShift.isDayOff || false
                }
            });
            createdShifts.push(newShift);
        }
    }

    res.json({ message: 'Shifts generated', count: createdShifts.length });
  } catch (error) {
    console.error('Error in recurring shifts:', error);
    res.status(500).json({ message: 'Error generating recurring shifts' });
  }
};
