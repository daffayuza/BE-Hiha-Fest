"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePaymentWebhook = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const email_1 = require("../utils/email");
const handlePaymentWebhook = async (req, res) => {
    try {
        const { orderNumber, status } = req.body;
        if (status !== 'PAID') {
            const trx = await prisma_1.default.transaction.update({
                where: { orderNumber },
                data: { status: status }
            });
            return res.json({ message: 'Transaction status updated', status: trx.status });
        }
        // 1. Process Success Payment
        const transaction = await prisma_1.default.$transaction(async (tx) => {
            const currentTrx = await tx.transaction.findUnique({
                where: { orderNumber },
                include: { concert: true, ticketCategory: true }
            });
            if (!currentTrx || currentTrx.status === 'PAID')
                return currentTrx;
            // Update Sold Count
            await tx.ticketCategory.update({
                where: { id: currentTrx.ticketCategoryId },
                data: { sold: { increment: currentTrx.quantity } }
            });
            // Update Transaction Status
            return tx.transaction.update({
                where: { orderNumber },
                data: { status: 'PAID' },
                include: { concert: true, ticketCategory: true }
            });
        });
        if (!transaction || transaction.status !== 'PAID') {
            return res.json({ message: 'Transaction already processed or not found' });
        }
        // 2. Generate Tickets
        const tickets = [];
        for (let i = 0; i < transaction.quantity; i++) {
            const ticketNumber = `TKT-${transaction.orderNumber}-${i + 1}`;
            const qrCodeData = `https://hahahihifest.com/check-in/${ticketNumber}`;
            const qrBase64 = await (0, email_1.generateQRCode)(qrCodeData);
            const ticket = await prisma_1.default.ticket.create({
                data: {
                    transactionId: transaction.id,
                    ticketCategoryId: transaction.ticketCategoryId,
                    ticketNumber,
                    qrCode: qrCodeData
                }
            });
            tickets.push({ ...ticket, qrBase64, category: transaction.ticketCategory.name });
        }
        // 3. Send Email (Async)
        (0, email_1.sendTicketEmail)(transaction.buyerEmail, transaction.buyerName, transaction.concert.name, tickets)
            .catch(err => console.error('Email failed:', err));
        res.json({ message: 'Payment processed and tickets sent' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error processing webhook', error: error.message });
    }
};
exports.handlePaymentWebhook = handlePaymentWebhook;
