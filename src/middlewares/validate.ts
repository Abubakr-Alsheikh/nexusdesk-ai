import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';

export const validate = <T extends ZodType<any>>(schema: T) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      return next(error);
    }
  };
};