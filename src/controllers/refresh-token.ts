import { getUserByUsername, signToken } from '@authentication/services/auth.service';
import { BadRequestError, IAuthDocument } from '@mohamedramadan14/freelance-shared';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const renewToken = async (req: Request, res: Response): Promise<void> => {
  console.log('FROM renewToken() : AuthController');
  const existingUser: IAuthDocument = await getUserByUsername(req.params.username);
  if (!existingUser) {
    throw new BadRequestError('Invalid credentials', 'Authentication Service - renewToken() : Username does not exist');
  }
  const userJWT: string = signToken(existingUser.id!, existingUser.email!, existingUser.username!);
  res.status(StatusCodes.OK).json({ message: 'Refreshed token successfully', token: userJWT, user: existingUser });
};
