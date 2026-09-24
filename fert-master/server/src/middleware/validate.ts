import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from './errorHandler';

export const validate = (source: 'body' | 'query' | 'params', schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsedData = schema.parse(req[source]);
      req[source] = parsedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Pass ZodError to our global error handler which will format it
        next(error);
      } else {
        next(new ValidationError('Invalid request data'));
      }
    }
  };
};
