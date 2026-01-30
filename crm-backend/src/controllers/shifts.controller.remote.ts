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
    console.log("=== SAVE SHIFT REQUEST ===");
    console.log("Body:", JSON.stringify(req.body, null, 2));

    const { userId, date, timeBlocks, location, isDayOff } = req.body;

    // Normalizing Date to UTC Midnight to ensure consistency with @db.Date
    const inputDate = new Date(date);
    if (isNaN(inputDate.getTime())) {
        console.error("Invalid Date parsed:", date);
        return res.status(400).json({ message: "Invalid date format" });
    }
    
    // Create Date object pointing to UTC Midnight of that date
    // This avoids timezone offsets causing the date to shift to the previous day
    const shiftDate = new Date(Date.UTC(
         inputDate.getFullYear(), 
         inputDate.getMonth(), 
         inputDate.getDate()
    ));

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
    
    // Normalize sourceDate same as saveShift
    const inputDate = new Date(sourceDate);
    const sourceDateNormalized = new Date(Date.UTC(
         inputDate.getFullYear(), 
         inputDate.getMonth(), 
         inputDate.getDate()
    ));

    const sourceShift = await prisma.shift.findUnique({
      where: {
        userId_date: {
            userId: Number(userId),
            date: sourceDateNormalized
        }
      }
    });

    if (!sourceShift) {
      return res.status(404).json({ message: 'Source shift not found' });
    }

    const createdShifts = [];
    const source = new Date(sourceDateNormalized);

    // MODE: Specific Date (Copy to one specific date)
    if (mode === 'specific_date' && targetDate) {
         const targetInput = new Date(targetDate);
         const specificDate = new Date(Date.UTC(
            targetInput.getFullYear(), 
            targetInput.getMonth(), 
            targetInput.getDate()
         ));

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
    // MODE: Weeks Or Until
    else {
        let iterations = 0;
        
        if (mode === 'until_date' && untilDate) {
            const end = new Date(untilDate);
            // Diff in days
            const diffTime = Math.abs(end.getTime() - source.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            iterations = Math.floor(diffDays / 7);
        } else {
            iterations = Number(weeksToRepeat) || 1;
        }

        for (let i = 1; i <= iterations; i++) {
            const nextDate = addWeeks(source, i);
            // Ensure nextDate is also UTC midnight? addWeeks preserves time usually. 
            // If source is UTC midnight, nextDate should be too.
            
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
