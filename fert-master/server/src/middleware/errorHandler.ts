import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import { ZodError } from 'zod';

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

class AppError extends Error implements ApiError {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
}

class ValidationError extends AppError {
  constructor(msg: string) {
    super(msg, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor(msg?: string) {
    super(msg ?? 'Unauthorized', 401);
  }
}

class ForbiddenError extends AppError {
  constructor(msg?: string) {
    super(msg ?? 'Forbidden', 403);
  }
}

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val: any) => val.message)
      .join(', ');
    err = new AppError(message, 400);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const message = `${field} already exists`;
    err = new AppError(message, 409);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    err = new AppError('Invalid token', 401);
  }
  if (err.name === 'TokenExpiredError') {
    err = new AppError('Token expired', 401);
  }

  // Zod validation error
  let errors: any = undefined;
  if (err instanceof ZodError) {
    errors = err.issues;
    err = new AppError('Validation Error', 400);
  }

  logger.error({
    message: err.message,
    statusCode: err.statusCode,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    stack: err.stack,
  });

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    statusCode: err.statusCode,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

export { AppError, NotFoundError, ValidationError, UnauthorizedError, ForbiddenError, errorHandler as default };
