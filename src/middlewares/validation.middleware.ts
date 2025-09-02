// # Zod-based input validation

// src/middlewares/validation.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { ValidationError } from '@utils/errorHandler';
import { logger } from '@utils/logger';

// OPTIMIZATION: Define a type for the schema object for clarity.
// It allows for optional body, query, and params schemas.
type ValidationSchema = z.ZodObject<{
  body?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
}>;

export const validate = (schema: ValidationSchema) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // OPTIMIZATION: Parse and replace request data.
      // This sanitizes inputs and ensures downstream handlers get typed data.
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Replace original request parts with the parsed & validated data
      if (req.body) {
        parsed.body ?? req.body;
      }
      if (req.query) {
        (parsed.query as any) ?? req.query;
      }
      if (parsed.params) {
        req.params = parsed.params as any;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        // Create the numbered error message string.
        const numberedErrorMessage = formattedErrors
          .map((err, index) => `${index + 1}. ${err.message}`)
          .join(' ');

        logger.warn(`Validation failed: ${JSON.stringify(formattedErrors)}`);

        next(new ValidationError(numberedErrorMessage, formattedErrors));
      } else {
        logger.error(
          `An unexpected error occurred during validation: ${(error as Error).message}`
        );
        next(new ValidationError('Invalid request data'));
      }
    }
  };
};
