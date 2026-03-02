import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { startOfWeek, endOfWeek, addWeeks } from 'date-fns';

// Helper: parse dateKey to UTC noon to avoid timezone offset issues with @db.Date
export function parseDateKeyToUTCNoon(dateKey: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) throw new Error('dateKey inválido');
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

export function parseDateKeyRangeUTCNoon(startKey: string, endKey: string) {
  const start = parseDateKeyToUTCNoon(startKey);
  const end = parseDateKeyToUTCNoon(endKey);
  return { start, end };
}

export const saveShift = async (req: Request, res: Response) => {
  try {
    const { userId, date, timeBlocks, location, isDayOff } = req.body;

    if (!userId || !date) {
      return res.status(400).json({ message: 'userId y date son requeridos' });
    }

    const shiftDate = parseDateKeyToUTCNoon(date);

    const shift = await prisma.shift.upsert({
      where: {
        userId_date: {
          userId: Number(userId),
          date: shiftDate,
        },
      },
      update: {
        timeBlocks: timeBlocks || [],
        location: location || 'Principal',
        isDayOff: isDayOff || false,
      },
      create: {
        userId: Number(userId),
        date: shiftDate,
        timeBlocks: timeBlocks || [],
        location: location || 'Principal',
        isDayOff: isDayOff || false,
      },
    });

    res.status(200).json(shift);
  } catch (error) {
    console.error('Error saving shift:', error);
    res.status(500).json({ message: 'Error saving shift', error: (error as Error).message });
  }
};

export const getShifts = async (req: Request, res: Response) => {
  try {
    const { start, end, location } = req.query;
    let startDate, endDate;
    if (start && end && typeof start === 'string' && typeof end === 'string') {
      ({ start: startDate, end: endDate } = parseDateKeyRangeUTCNoon(start, end));
    } else {
      startDate = startOfWeek(new Date());
      endDate = endOfWeek(new Date());
    }
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
            position: true
          }
        }
      }
    });
    const shiftsWithDateKey = shifts.map((s: any) => ({
      ...s,
      dateKey: s.date.toISOString().slice(0, 10),
    }));
    res.json(shiftsWithDateKey);
  } catch (error) {
    console.error('Error fetching shifts:', error);
    res.status(500).json({ message: 'Error fetching shifts' });
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

    // Helper to ensure YYYY-MM-DD string is parsed as UTC noon to avoid timezone offset
    const parseToUtc = (d: string | Date) => {
        if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
             return parseDateKeyToUTCNoon(d);
        }
        return new Date(d);
    };

    const sDate = parseToUtc(sourceDate);

    const sourceShift = await prisma.shift.findUnique({
      where: {
        userId_date: {
            userId: Number(userId),
            date: sDate
        }
      }
    });

    if (!sourceShift) {
      return res.status(404).json({ message: 'Source shift not found' });
    }

    const createdShifts = [];

    if (mode === 'specific_date' && targetDate) {
         const specificDate = parseToUtc(targetDate);
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
    } else {
        let iterations = 0;

        if (mode === 'until_date' && untilDate) {
            const end = parseToUtc(untilDate);
            const start = sDate;
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            iterations = Math.floor(diffDays / 7);
        } else {
            iterations = Number(weeksToRepeat) || 1;
        }

        for (let i = 1; i <= iterations; i++) {
            const nextDate = addWeeks(sDate, i);

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

export const getShiftByUserAndDate = async (req: Request, res: Response) => {
  try {
    const { userId, date } = req.params;

    let shiftDate: Date;
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      shiftDate = parseDateKeyToUTCNoon(date);
    } else {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const shift = await prisma.shift.findUnique({
      where: {
        userId_date: {
          userId: Number(userId),
          date: shiftDate,
        }
      },
      include: {
        user: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            avatarUrl: true,
            position: true
          }
        }
      }
    });

    if (!shift) {
      return res.json(null);
    }

    res.json(shift);
  } catch (error) {
    console.error('Error fetching shift by user and date:', error);
    res.status(500).json({ message: 'Error fetching shift' });
  }
};
