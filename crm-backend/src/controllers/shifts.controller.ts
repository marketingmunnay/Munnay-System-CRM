import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { startOfWeek, endOfWeek, addWeeks, format } from 'date-fns';

export const getShifts = async (req: Request, res: Response) => {
  try {
    const { start, end, location } = req.query;
    
    // Helper
    const parseToUtc = (d: string | Date | undefined, defaultDate: Date) => {
        if (!d) return defaultDate;
        if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
             const [y, m, day] = d.split('-').map(Number);
             return new Date(Date.UTC(y, m - 1, day));
        }
        return new Date(d);
    };

    const startDate = parseToUtc(start as string, startOfWeek(new Date()));
    const endDate = parseToUtc(end as string, endOfWeek(new Date()));

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
    console.log("=== SAVE SHIFT REQUEST ===");
    console.log("Body:", JSON.stringify(req.body, null, 2));

    const { userId, date, timeBlocks, location, isDayOff } = req.body;

    let shiftDate: Date;

    // Robust Date Parsing
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        // Handle "YYYY-MM-DD" string explicitly to avoid any timezone conversion
        const [year, month, day] = date.split('-').map(Number);
        shiftDate = new Date(Date.UTC(year, month - 1, day));
    } else {
        // Fallback for full ISO strings or Date objects
        const inputDate = new Date(date);
        if (isNaN(inputDate.getTime())) {
            console.error("Invalid Date parsed:", date);
            return res.status(400).json({ message: "Invalid date format" });
        }
        // Attempt to extract calendar date. 
        // Note: this relies on server local time if input is ISO. 
        // Ideally frontend always sends YYYY-MM-DD now.
        shiftDate = new Date(Date.UTC(
            inputDate.getFullYear(), 
            inputDate.getMonth(), 
            inputDate.getDate()
        ));
    }

    console.log("Normalized Date for DB:", shiftDate.toISOString());

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
    
    console.log("Shift Saved:", shift);
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
    
    // Helper to ensure YYYY-MM-DD string is parsed as UTC midnight
    const parseToUtc = (d: string | Date) => {
        if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
             const [y, m, day] = d.split('-').map(Number);
             return new Date(Date.UTC(y, m - 1, day));
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
    
    // MODE: Specific Date (Copy to one specific date)
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
    } 
    // MODE: Weeks (Repeat for X weeks) OR Until Date (Calculate weeks)
    else {
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

    // Parse date (YYYY-MM-DD format)
    let shiftDate: Date;
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [year, month, day] = date.split('-').map(Number);
      shiftDate = new Date(Date.UTC(year, month - 1, day));
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
      // Return null if no shift found for this user/date
      return res.json(null);
    }

    res.json(shift);
  } catch (error) {
    console.error('Error fetching shift by user and date:', error);
    res.status(500).json({ message: 'Error fetching shift' });
  }
};
