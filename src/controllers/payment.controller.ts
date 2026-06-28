import { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../config/prisma';
import { generateQRCode, sendTicketEmail } from '../utils/email';

/**
 * Midtrans Notification Handler (Webhook)
 * Receives payment notifications from Midtrans server.
 * Verifies signature before processing.
 */
export const handleMidtransNotification = async (req: Request, res: Response) => {
  try {
    const notification = req.body;

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = notification;

    // 1. Verify Signature Key
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const expectedSignature = crypto
      .createHash('sha512')
      .update(order_id + status_code + gross_amount + serverKey)
      .digest('hex');

    if (signature_key !== expectedSignature) {
      console.error('Invalid Midtrans signature');
      return res.status(403).json({ message: 'Invalid signature' });
    }

    // 2. Determine transaction status
    let newStatus: 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED' = 'PENDING';

    if (transaction_status === 'capture') {
      // For credit card: check fraud_status
      newStatus = fraud_status === 'accept' ? 'PAID' : 'FAILED';
    } else if (transaction_status === 'settlement') {
      newStatus = 'PAID';
    } else if (transaction_status === 'pending') {
      newStatus = 'PENDING';
    } else if (transaction_status === 'deny' || transaction_status === 'cancel') {
      newStatus = 'FAILED';
    } else if (transaction_status === 'expire') {
      newStatus = 'EXPIRED';
    }

    // 3. If not PAID, just update status
    if (newStatus !== 'PAID') {
      await prisma.transaction.update({
        where: { orderNumber: order_id },
        data: { status: newStatus },
      });
      return res.status(200).json({ message: `Transaction status updated to ${newStatus}` });
    }

    // 4. Process successful payment
    const transaction = await prisma.$transaction(async (tx) => {
      const currentTrx = await tx.transaction.findUnique({
        where: { orderNumber: order_id },
        include: { concert: true, ticketCategory: true },
      });

      if (!currentTrx || currentTrx.status === 'PAID') return currentTrx;

      // Update Sold Count
      await tx.ticketCategory.update({
        where: { id: currentTrx.ticketCategoryId },
        data: { sold: { increment: currentTrx.quantity } },
      });

      // Update Transaction Status
      return tx.transaction.update({
        where: { orderNumber: order_id },
        data: { status: 'PAID' },
        include: { concert: true, ticketCategory: true },
      });
    });

    if (!transaction || transaction.status !== 'PAID') {
      return res.status(200).json({ message: 'Transaction already processed or not found' });
    }

    // 5. Generate Tickets
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
          qrCode: qrCodeData,
        },
      });
      tickets.push({ ...ticket, qrBase64, category: transaction.ticketCategory.name });
    }

    // 6. Send Email (Async)
    sendTicketEmail(
      transaction.buyerEmail,
      transaction.buyerName,
      transaction.concert.name,
      tickets
    ).catch((err) => console.error('Email failed:', err));

    // Always return 200 to Midtrans
    res.status(200).json({ message: 'Payment processed and tickets sent' });
  } catch (error: any) {
    console.error('Midtrans notification error:', error);
    // Still return 200 to prevent Midtrans from retrying
    res.status(200).json({ message: 'Error processing notification', error: error.message });
  }
};

/**
 * Frontend callback handler — called by frontend after Snap popup closes
 * to ensure the transaction status is synced.
 */
export const handlePaymentStatus = async (req: Request, res: Response) => {
  try {
    const { orderNumber } = req.params;

    const transaction = await prisma.transaction.findUnique({
      where: { orderNumber },
      include: { concert: true, ticketCategory: true },
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({
      orderNumber: transaction.orderNumber,
      status: transaction.status,
      concertName: transaction.concert.name,
      buyerEmail: transaction.buyerEmail,
      totalPrice: transaction.totalPrice,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching payment status', error: error.message });
  }
};
