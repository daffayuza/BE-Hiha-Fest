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
