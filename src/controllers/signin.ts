import { AuthModel } from '@authentication/models/auth.schema';
import { getUserByEmail, getUserByUsername, signToken } from '@authentication/services/auth.service';
import { signinSchema } from '@authentication/validation/schemes/signin';
import { BadRequestError, IAuthDocument, isEmail } from '@mohamedramadan14/freelance-shared';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { omit } from 'lodash';

export const read = async (req: Request, res: Response): Promise<void> => {
  const { error } = await Promise.resolve(signinSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'Authentication Service - read() in SignIn Process');
  }
  const { username, password } = req.body;
  const isValidEmail: boolean = isEmail(username);
  const existingUser: IAuthDocument = !isValidEmail ? await getUserByUsername(username) : await getUserByEmail(username);

  if (!existingUser) {
    throw new BadRequestError('Invalid credentials', 'Authentication Service - read() in SignIn Process : User not exist');
  }
  const isPasswordMatch: boolean = await AuthModel.prototype.comparePassword(password, existingUser.password);

  if (!isPasswordMatch) {
    throw new BadRequestError('Invalid credentials', 'Authentication Service - read() in SignIn Process : Password not Match');
  }
  const userJWT: string = signToken(existingUser.id!, existingUser.email!, existingUser.username!);

  const userData: IAuthDocument = omit(existingUser, ['password']) as IAuthDocument;

  res.status(StatusCodes.OK).json({ message: 'User signed in successfully', user: userData, token: userJWT });
};
