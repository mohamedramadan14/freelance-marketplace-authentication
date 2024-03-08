import crypto from 'crypto';

import {
  getUserByEmail,
  getUserByPasswordToken,
  getUserByUsername,
  updatePassword,
  updatePasswordToken
} from '@authentication/services/auth.service';
import { changePasswordSchema, emailSchema, passwordSchema } from '@authentication/validation/schemes/password';
import { BadRequestError, IAuthDocument, IEmailMessageDetails } from '@mohamedramadan14/freelance-shared';
import { Request, Response } from 'express';
import { config } from '@authentication/config';
import { publishMessage } from '@authentication/queues/auth.producer';
import { authChannel } from '@authentication/server';
import { StatusCodes } from 'http-status-codes';
import { AuthModel } from '@authentication/models/auth.schema';

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { error } = emailSchema.validate(req.body);
  if (error?.details) {
    throw new BadRequestError(
      error.details[0].message,
      'Authentication Service - password : create() in Password Reset Process : invalid email'
    );
  }
  const { email } = req.body;
  const existingUser: IAuthDocument = await getUserByEmail(email);

  if (!existingUser) {
    throw new BadRequestError(
      'Invalid credentials',
      'Authentication Service - password : create() in Password Reset Process : User not exist'
    );
  }

  const randombytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
  const randomChars: string = randombytes.toString('hex');
  const date: Date = new Date();
  date.setHours(date.getHours() + 1); // set expiration date for change password token to expire after 1 hour from now
  await updatePasswordToken(existingUser.id!, randomChars, date);

  const resetLink = `${config.CLIENT_URL}/reset_password?token=${randomChars}`;
  const messageDetails: IEmailMessageDetails = {
    receiverEmail: existingUser.email!,
    resetLink,
    username: existingUser.username!,
    template: 'forgotPassword'
  };

  await publishMessage(
    authChannel,
    'email-notification',
    'auth-email',
    JSON.stringify(messageDetails),
    'Forgot Password : Password Reset Link sent to user by notification service'
  );
  res.status(StatusCodes.OK).json({ message: 'Password reset email is sent. Please check your inbox.' });
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { error } = await Promise.resolve(passwordSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(
      error.details[0].message,
      'Authentication Service - password : resetPassword() in Password update Process : invalid password'
    );
  }
  const { password, confirmPassword } = req.body;
  const { token } = req.params;
  if (password !== confirmPassword) {
    throw new BadRequestError(
      'Passwords do not match',
      'Authentication Service - password : resetPassword() in Password update Process : Passwords do not match'
    );
  }

  const existingUser: IAuthDocument = await getUserByPasswordToken(token);
  if (!existingUser) {
    throw new BadRequestError(
      'Reset token is invalid or has expired',
      'Authentication Service - password : resetPassword() in Password update Process : token is invalid or has expired'
    );
  }

  const hashedPassword: string = AuthModel.prototype.hashPassword(password);
  await updatePassword(existingUser.id!, hashedPassword);

  const messageDetails: IEmailMessageDetails = {
    username: existingUser.username!,
    template: 'resetPasswordSuccess'
  };

  await publishMessage(
    authChannel,
    'email-notification',
    'auth-email',
    JSON.stringify(messageDetails),
    'Reset Password Success : message sent to user by notification service'
  );
  res.status(StatusCodes.OK).json({ message: 'Password updated successfully' });
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  const { error } = await Promise.resolve(changePasswordSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(
      error.details[0].message,
      'Authentication Service - password : changePassword() in Password update Process : invalid password'
    );
  }
  const { currentPassword, newPassword } = req.body;

  if (currentPassword === newPassword) {
    throw new BadRequestError(
      'Your new password must be different from your current password',
      'Authentication Service - password : changePassword() in Password update Process : currentPassword is the same as newPassword'
    );
  }

  const existingUser: IAuthDocument = await getUserByUsername(`${req.currentUser?.username}`);

  if (!existingUser) {
    throw new BadRequestError(
      'User not exist',
      'Authentication Service - password : changePassword() in Password update Process : token is invalid or has expired'
    );
  }

  const hashedPassword: string = AuthModel.prototype.hashPassword(newPassword);
  await updatePassword(existingUser.id!, hashedPassword);

  const messageDetails: IEmailMessageDetails = {
    username: existingUser.username!,
    template: 'resetPasswordSuccess'
  };

  await publishMessage(
    authChannel,
    'email-notification',
    'auth-email',
    JSON.stringify(messageDetails),
    'Change Password Success : message sent to user by notification service'
  );

  res.status(StatusCodes.OK).json({ message: 'Password updated successfully' });
};
