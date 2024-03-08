import { getUserByEmailVerificationToken, getUserById, updateVerifyEmail } from '@authentication/services/auth.service';
import { BadRequestError, IAuthDocument } from '@mohamedramadan14/freelance-shared';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const update = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body;
  console.log('FROM update() EMAIL VERIFICATION: START ', token);
  const checkIfUserExist: IAuthDocument = await getUserByEmailVerificationToken(token);
  if (!checkIfUserExist) {
    throw new BadRequestError('Invalid verification token', 'Authentication Service - update() Email Verification Process');
  }
  await updateVerifyEmail(checkIfUserExist.id!, 1, '');
  const updatedUser = await getUserById(checkIfUserExist.id!);
  res.status(StatusCodes.OK).json({ message: 'Email verified successfully', user: updatedUser });
};
