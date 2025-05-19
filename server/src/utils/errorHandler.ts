import { Request, Response, NextFunction } from "express";

// Optional fallthrough error handler
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.statusCode = 500;
  res.end(`Server Error: ${(res as any).sentry}\n`);
};
