import { NextFunction, Request, Response } from 'express';

export function logMiddleware(req: Request, res: Response, next: NextFunction) {
  next();
}
