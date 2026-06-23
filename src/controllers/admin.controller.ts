import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const activeEvents = await prisma.event.count({
      where: { status: 'PUBLISHED' }
    });

    const totalTicketsSold = await prisma.ticket.count();

    const transactions = await prisma.transaction.findMany({
      where: { status: 'PAID' }
    });
    const totalRevenue = transactions.reduce((sum, t) => sum + t.totalPrice, 0);

    const recentTransactions = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { concert: true }
    });

    res.json({
      stats: {
        activeEvents,
        totalTicketsSold,
        totalRevenue,
        totalTransactions: transactions.length
      },
      recentTransactions
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error });
  }
};

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        concert: true,
        ticketCategory: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error });
  }
};

export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        concert: true,
        ticketCategory: true,
        tickets: true
      }
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transaction detail', error });
  }
};
