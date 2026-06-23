import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const createCheckout = async (req: Request, res: Response) => {
  try {
    const { concertId, ticketCategoryId, quantity, buyerName, buyerEmail, buyerPhone } = req.body;

    // 1. Initial validation
    const ticketCategory = await prisma.ticketCategory.findUnique({
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

    const transaction = await prisma.$transaction(async (tx) => {
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
          quantity,        // Added missing field
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

  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error creating checkout', error });
  }
};

export const orderLookup = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: 'Query parameter is required' });

    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { buyerEmail: { equals: query as string } },
          { orderNumber: { equals: query as string } }
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
  } catch (error) {
    res.status(500).json({ message: 'Error looking up order', error });
  }
};
