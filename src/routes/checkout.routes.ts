import { Router } from 'express';
import { createCheckout, orderLookup } from '../controllers/checkout.controller';
import { handlePaymentWebhook } from '../controllers/payment.controller';

const router = Router();

router.post('/', createCheckout);
router.get('/lookup', orderLookup);
router.post('/webhook', handlePaymentWebhook);

export default router;
