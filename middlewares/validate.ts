import { NextFunction,Request, Response } from 'express';
import { ZodError, ZodObject } from 'zod';

export const validate = (schema: ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          success: false,
          error: 'Validation Error',
          details: errors,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
      });
      return;
    }
  };
};

