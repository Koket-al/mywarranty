import { ZodError } from 'zod';

/**
 * Centralized API error handling middleware.
 * Intercepts Zod validation errors, MongoDB duplicate keys, and generic application exceptions.
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function errorHandler(err, req, res, next) {
  console.error('[API Error]', err);

  if (err instanceof ZodError) {
    const errorDetails = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errorDetails
    });
  }

  // MongoDB duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      error: `A record with this ${field} already exists.`
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message
  });
}

