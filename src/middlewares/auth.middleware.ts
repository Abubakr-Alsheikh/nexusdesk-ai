import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../services/db.service';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        createdAt: Date;
      };
    }
  }
}

export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError(
          'You are not logged in. Please log in to get access.',
          401,
        ),
      );
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };

    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
    });
    if (!currentUser) {
      return next(
        new AppError('The user belonging to this token no longer exists.', 401),
      );
    }

    req.user = {
      id: currentUser.id,
      email: currentUser.email,
      name: currentUser.name,
      createdAt: currentUser.createdAt,
    };
    next();
  },
);
