import express, { Application, Request, Response, NextFunction } from 'express';
import router from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { AppError } from './utils/AppError';

const app: Application = express();

app.use(express.json({ limit: '10kb' }));

app.use('/api/v1', router);

app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

export default app;