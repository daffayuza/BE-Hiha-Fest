import { Router } from 'express';
import { getDashboardStats, getTransactions, getTransactionById } from '../controllers/admin.controller';
import { adminAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/dashboard', adminAuth, getDashboardStats);
router.get('/transactions', adminAuth, getTransactions);
router.get('/transactions/:id', adminAuth, getTransactionById);

export default router;
