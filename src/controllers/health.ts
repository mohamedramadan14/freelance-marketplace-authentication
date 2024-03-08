import { Request, Response } from 'express';

export const health = (_req: Request, res: Response): void => {
  console.log('FROM health() : AuthController');
  res.status(200).json({ message: 'Authentication Service - healthy - OK' });
};
