import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.code === 'P2002') {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  if (err.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation Error';
    return res.status(statusCode).json({
      status: 'error',
      message,
      errors: err.errors,
    });
  }

  if (env.NODE_ENV === 'development') {
    res.status(statusCode).json({
      status: 'error',
      message,
      stack: err.stack,
      error: err,
    });
  } else {
    res.status(statusCode).json({
      status: 'error',
      message: err.isOperational ? message : 'Something went very wrong',
    });
  }
};
