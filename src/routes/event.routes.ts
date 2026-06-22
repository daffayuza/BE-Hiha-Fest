import { Router } from 'express';
import { getEvents, getEventById, createEvent, updateEvent, deleteEvent } from '../controllers/event.controller';
import { adminAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', (req, res, next) => {
  // Optional auth for getEvents to show drafts for admin
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    return adminAuth(req, res, next);
  }
  next();
}, getEvents);
router.get('/:id', getEventById);
router.post('/', adminAuth, createEvent);
router.put('/:id', adminAuth, updateEvent);
router.delete('/:id', adminAuth, deleteEvent);

export default router;
