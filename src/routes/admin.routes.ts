import { Router } from 'express';
import { getDashboardStats, getTransactions, getTransactionById, getSalesSummary } from '../controllers/admin.controller';
import { adminAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/dashboard', adminAuth, getDashboardStats);
router.get('/sales-summary', adminAuth, getSalesSummary);
router.get('/transactions', adminAuth, getTransactions);
router.get('/transactions/:id', adminAuth, getTransactionById);

export default router;
