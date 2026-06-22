import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getEvents = async (req: Request, res: Response) => {
  try {
    const isAdmin = (req as any).admin !== undefined;
    const events = await prisma.event.findMany({
      where: isAdmin ? {} : { status: 'PUBLISHED' },
      include: { ticketCategories: true },
      orderBy: { date: 'asc' }
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const event = await prisma.event.findUnique({
      where: { id },
      include: { ticketCategories: true }
    });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event', error });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const { name, description, date, time, venue, city, category, poster, ticketCategories } = req.body;
    
    const event = await prisma.event.create({
      data: {
        name,
        description,
        date: new Date(date),
        time,
        venue,
        city,
        category,
        poster,
        ticketCategories: {
          create: ticketCategories
        }
      },
      include: { ticketCategories: true }
    });
    
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, description, date, time, venue, city, category, poster, status, ticketCategories } = req.body;
    
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Event core info
      const event = await tx.event.update({
        where: { id },
        data: {
          name,
          description,
          date: date ? new Date(date) : undefined,
          time,
          venue,
          city,
          category,
          poster,
          status
        }
      });

      if (ticketCategories) {
        // 2. Get existing categories
        const existingCategories = await tx.ticketCategory.findMany({
          where: { eventId: id }
        });

        const existingIds = existingCategories.map(c => c.id);
        const incomingIds = ticketCategories.map((c: any) => c.id).filter(Boolean);

        // 3. Delete removed categories
        const toDelete = existingIds.filter(id => !incomingIds.includes(id));
        if (toDelete.length > 0) {
          await tx.ticketCategory.deleteMany({
            where: { id: { in: toDelete } }
          });
        }

        // 4. Update or Create categories
        for (const cat of ticketCategories) {
          if (cat.id && existingIds.includes(cat.id)) {
            // Update
            await tx.ticketCategory.update({
              where: { id: cat.id },
              data: {
                name: cat.name,
                price: cat.price,
                quota: cat.quota
              }
            });
          } else {
            // Create
            await tx.ticketCategory.create({
              data: {
                eventId: id,
                name: cat.name,
                price: cat.price,
                quota: cat.quota
              }
            });
          }
        }
      }

      return event;
    });
    
    res.json(result);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Error updating event', error });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.event.delete({ where: { id } });
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event', error });
  }
};
