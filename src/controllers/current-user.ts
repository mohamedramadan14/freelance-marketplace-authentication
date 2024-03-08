import crypto from 'crypto';

import { getUserByEmail, getUserById, updateVerifyEmail } from '@authentication/services/auth.service';
import { BadRequestError, IAuthDocument, IEmailMessageDetails, lowerCase } from '@mohamedramadan14/freelance-shared';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { config } from '@authentication/config';
import { authChannel } from '@authentication/server';
import { publishMessage } from '@authentication/queues/auth.producer';

export const readUser = async (req: Request, res: Response): Promise<void> => {
  let user = undefined;
  const existingUser: IAuthDocument = await getUserById(req.currentUser!.id);
  if (Object.keys(existingUser).length) {
    user = existingUser;
  }
  res.status(StatusCodes.OK).json({ message: 'User authenticated successfully', user: user });
};

export const resendEmail = async (req: Request, res: Response): Promise<void> => {
  const { email, userId } = req.body;
  const isUserExist: IAuthDocument = await getUserByEmail(lowerCase(email));
  if (!isUserExist) {
    throw new BadRequestError('Invalid email', 'Authentication Service - resendEmail() : Email does not exist');
  }

  const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
  const randomChars: string = randomBytes.toString('hex');

  const verificationLink: string = `${config.CLIENT_URL}/confirm-email?v_token${randomChars}`;

  await updateVerifyEmail(parseInt(userId), 0, randomChars);
  const messageDetails: IEmailMessageDetails = {
    receiverEmail: lowerCase(email),
    verifyLink: verificationLink,
    template: 'verifyEmail'
  };

  await publishMessage(
    authChannel,
    'email-notification',
    'auth-email',
    JSON.stringify(messageDetails),
    'Resent email  details sent to notification service for email verification'
  );
  const updatedUser = await getUserById(parseInt(userId));
  res.status(StatusCodes.OK).json({ message: 'Email Verification sent successfully', user: updatedUser });
};
