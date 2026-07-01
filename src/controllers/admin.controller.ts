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

export const getSalesSummary = async (req: Request, res: Response) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { status: 'PAID' },
      select: {
        quantity: true,
        totalPrice: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Aggregate per month
    const monthMap: Record<string, { month: string; tiketTerjual: number; revenue: number }> = {};
    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    for (const t of transactions) {
      const d = new Date(t.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
      if (!monthMap[key]) {
        monthMap[key] = { month: label, tiketTerjual: 0, revenue: 0 };
      }
      monthMap[key].tiketTerjual += t.quantity;
      monthMap[key].revenue += t.totalPrice;
    }

    const result = Object.values(monthMap);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sales summary', error });
  }
};
