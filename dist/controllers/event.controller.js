"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEvent = exports.updateEvent = exports.createEvent = exports.getEventById = exports.getEvents = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const getEvents = async (req, res) => {
    try {
        const isAdmin = req.admin !== undefined;
        const events = await prisma_1.default.event.findMany({
            where: isAdmin ? {} : { status: 'PUBLISHED' },
            include: { ticketCategories: true },
            orderBy: { date: 'asc' }
        });
        res.json(events);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching events', error });
    }
};
exports.getEvents = getEvents;
const getEventById = async (req, res) => {
    try {
        const id = req.params.id;
        const event = await prisma_1.default.event.findUnique({
            where: { id },
            include: { ticketCategories: true }
        });
        if (!event)
            return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching event', error });
    }
};
exports.getEventById = getEventById;
const createEvent = async (req, res) => {
    try {
        const { name, description, date, time, venue, city, category, poster, ticketCategories } = req.body;
        const event = await prisma_1.default.event.create({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating event', error });
    }
};
exports.createEvent = createEvent;
const updateEvent = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, description, date, time, venue, city, category, poster, status, ticketCategories } = req.body;
        const result = await prisma_1.default.$transaction(async (tx) => {
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
                const incomingIds = ticketCategories.map((c) => c.id).filter(Boolean);
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
                    }
                    else {
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
    }
    catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({ message: 'Error updating event', error });
    }
};
exports.updateEvent = updateEvent;
const deleteEvent = async (req, res) => {
    try {
        const id = req.params.id;
        await prisma_1.default.event.delete({ where: { id } });
        res.json({ message: 'Event deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting event', error });
    }
};
exports.deleteEvent = deleteEvent;
