import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(err);

  if (err instanceof ZodError) {
    // Zod v4 uses `issues`; fall back to `errors` for older compatible shapes
    const details = err.issues ?? (err as { errors?: unknown }).errors;
    res.status(400).json({
      error: 'Validation failed',
      details,
    });
    return;
  }

  if ((err as { name?: string }).name === 'UnauthorizedError') {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // Never expose internal details to clients
  res.status(500).json({ error: 'Internal Server Error' });
};
