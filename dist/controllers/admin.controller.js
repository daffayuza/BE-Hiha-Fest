"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionById = exports.getTransactions = exports.getDashboardStats = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const getDashboardStats = async (req, res) => {
    try {
        const activeEvents = await prisma_1.default.event.count({
            where: { status: 'PUBLISHED' }
        });
        const totalTicketsSold = await prisma_1.default.ticket.count();
        const transactions = await prisma_1.default.transaction.findMany({
            where: { status: 'PAID' }
        });
        const totalRevenue = transactions.reduce((sum, t) => sum + t.totalPrice, 0);
        const recentTransactions = await prisma_1.default.transaction.findMany({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard stats', error });
    }
};
exports.getDashboardStats = getDashboardStats;
const getTransactions = async (req, res) => {
    try {
        const transactions = await prisma_1.default.transaction.findMany({
            include: {
                concert: true,
                ticketCategory: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(transactions);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching transactions', error });
    }
};
exports.getTransactions = getTransactions;
const getTransactionById = async (req, res) => {
    try {
        const id = req.params.id;
        const transaction = await prisma_1.default.transaction.findUnique({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching transaction detail', error });
    }
};
exports.getTransactionById = getTransactionById;
