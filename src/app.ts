import express, {
  Application,
  Request,
  Response,
  NextFunction,
  Express,
} from 'express';
import path from 'path';
import router from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { AppError } from './utils/AppError';
import { setupSwagger } from './config/swagger';

const app: Application = express();

// 1. Standard Middlewares
app.use(express.json({ limit: '10kb' }));

// 2. Static Files (Dashboard)
app.use(express.static(path.join(__dirname, '../public')));

// 3. Swagger Documentation
setupSwagger(app as unknown as Express);

// 4. Your API Routes
app.use('/api/v1', router);

// 5. The 404 Catch-All
// We remove the path string entirely. If the request reaches here, it's a 404.
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 4. Global Error Handler
app.use(errorHandler);

export default app;
