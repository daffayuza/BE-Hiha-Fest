"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderLookup = exports.createCheckout = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const createCheckout = async (req, res) => {
    try {
        const { concertId, ticketCategoryId, quantity, buyerName, buyerEmail, buyerPhone } = req.body;
        // 1. Initial validation
        const ticketCategory = await prisma_1.default.ticketCategory.findUnique({
            where: { id: ticketCategoryId },
            include: { event: true }
        });
        if (!ticketCategory) {
            return res.status(404).json({ message: 'Ticket category not found' });
        }
        if (ticketCategory.quota - ticketCategory.sold < quantity) {
            return res.status(400).json({ message: 'Insufficient ticket quota' });
        }
        // 2. Create Transaction with prisma transaction for atomicity
        const orderNumber = `ORD-2026-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`;
        const totalPrice = ticketCategory.price * quantity;
        const transaction = await prisma_1.default.$transaction(async (tx) => {
            // Re-verify quota inside transaction
            const currentCategory = await tx.ticketCategory.findUnique({
                where: { id: ticketCategoryId },
            });
            if (!currentCategory || currentCategory.quota - currentCategory.sold < quantity) {
                throw new Error('Sold out or insufficient quota');
            }
            // Create transaction record
            return tx.transaction.create({
                data: {
                    orderNumber,
                    concertId,
                    ticketCategoryId, // Added missing field
                    quantity, // Added missing field
                    buyerName,
                    buyerEmail,
                    buyerPhone,
                    totalPrice,
                    status: 'PENDING'
                }
            });
        });
        res.status(201).json({
            message: 'Checkout successful. Proceed to payment.',
            transaction
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error creating checkout', error });
    }
};
exports.createCheckout = createCheckout;
const orderLookup = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query)
            return res.status(400).json({ message: 'Query parameter is required' });
        const transactions = await prisma_1.default.transaction.findMany({
            where: {
                OR: [
                    { buyerEmail: { equals: query } },
                    { orderNumber: { equals: query } }
                ]
            },
            include: {
                concert: true,
                tickets: {
                    include: { ticketCategory: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(transactions);
    }
    catch (error) {
        res.status(500).json({ message: 'Error looking up order', error });
    }
};
exports.orderLookup = orderLookup;
