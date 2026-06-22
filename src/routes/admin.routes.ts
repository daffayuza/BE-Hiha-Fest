import { Router } from 'express';
import { getDashboardStats } from '../controllers/admin.controller';
import { adminAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/dashboard', adminAuth, getDashboardStats);

export default router;
