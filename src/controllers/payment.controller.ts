import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { generateQRCode, sendTicketEmail } from '../utils/email';

export const handlePaymentWebhook = async (req: Request, res: Response) => {
  try {
    const { orderNumber, status } = req.body;

    if (status !== 'PAID') {
      const trx = await prisma.transaction.update({
        where: { orderNumber },
        data: { status: status as any }
      });
      return res.json({ message: 'Transaction status updated', status: trx.status });
    }

    // 1. Process Success Payment
    const transaction = await prisma.$transaction(async (tx) => {
      const currentTrx = await tx.transaction.findUnique({
        where: { orderNumber },
        include: { concert: true, ticketCategory: true }
      });

      if (!currentTrx || currentTrx.status === 'PAID') return currentTrx;

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
      const qrBase64 = await generateQRCode(qrCodeData);

      const ticket = await prisma.ticket.create({
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
    sendTicketEmail(transaction.buyerEmail, transaction.buyerName, transaction.concert.name, tickets)
      .catch(err => console.error('Email failed:', err));

    res.json({ message: 'Payment processed and tickets sent' });

  } catch (error: any) {
    res.status(500).json({ message: 'Error processing webhook', error: error.message });
  }
};
