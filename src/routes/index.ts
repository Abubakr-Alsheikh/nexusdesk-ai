import { Router } from 'express';
import ticketRoutes from './ticket.routes';

const router = Router();

router.use('/tickets', ticketRoutes);

export default router;