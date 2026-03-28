import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

interface ValidationError {
  path: string[];
  message: string;
}

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const statusCode = (err as { statusCode?: number }).statusCode || 500;
  const message =
    (err as { message?: string }).message || 'Internal Server Error';

  if ((err as { code?: string }).code === 'P2002') {
    return res.status(400).json({
      status: 'error',
      message: 'Duplicate field value entered',
    });
  }

  if ((err as { name?: string }).name === 'ZodError') {
    const zodErr = err as {
      errors?: ValidationError[];
      issues?: ValidationError[];
    };
    const issues = zodErr.errors || zodErr.issues || [];
    const formattedErrors = issues.map((e: ValidationError) => ({
      field: e.path.length > 0 ? e.path[e.path.length - 1] : 'unknown',
      message: e.message,
    }));
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }

  if (env.NODE_ENV === 'development') {
    res.status(statusCode).json({
      status: 'error',
      message,
      stack: (err as { stack?: string }).stack,
      error: err,
    });
  } else {
    res.status(statusCode).json({
      status: 'error',
      message: (err as { isOperational?: boolean }).isOperational
        ? message
        : 'Something went very wrong',
    });
  }
};
