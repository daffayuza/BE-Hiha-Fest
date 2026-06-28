import { Router } from 'express';
import { createCheckout, orderLookup } from '../controllers/checkout.controller';
import { handleMidtransNotification, handlePaymentStatus } from '../controllers/payment.controller';

const router = Router();

router.post('/', createCheckout);
router.get('/lookup', orderLookup);

// Midtrans webhook notification endpoint
router.post('/webhook/midtrans', handleMidtransNotification);

// Frontend: check payment status after Snap popup closes
router.get('/status/:orderNumber', handlePaymentStatus);

export default router;
