import express, { Application, Request, Response, NextFunction } from 'express';
import router from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { AppError } from './utils/AppError';

const app: Application = express();

// 1. Standard Middlewares
app.use(express.json({ limit: '10kb' }));

// 2. Your API Routes
app.use('/api/v1', router);

// 3. The 404 Catch-All
// We remove the path string entirely. If the request reaches here, it's a 404.
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 4. Global Error Handler
app.use(errorHandler);

export default app;
