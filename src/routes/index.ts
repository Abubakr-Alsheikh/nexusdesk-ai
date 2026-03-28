import { Router } from 'express';
import ticketRoutes from './ticket.routes';
import authRoutes from './auth.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tickets', ticketRoutes);

export default router;
