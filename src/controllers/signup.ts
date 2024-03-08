/**
 * 1 - check if username or password is in database if no -->
 * 2- upload profile picture if it succeed -->
 * 3- create user and send message to notification service
 */

import crypto from 'crypto';

import { createUser, getUserByEmailOrUsername, signToken } from '@authentication/services/auth.service';
import { signupSchema } from '@authentication/validation/schemes/signup';
import { BadRequestError, IAuthDocument, IEmailMessageDetails, firstLetterUppercase, lowerCase } from '@mohamedramadan14/freelance-shared';
import { Request, Response } from 'express';
import { v4 as uuidV4 } from 'uuid';
import { config } from '@authentication/config';
import { publishMessage } from '@authentication/queues/auth.producer';
import { authChannel } from '@authentication/server';
import { StatusCodes } from 'http-status-codes';
import { UploadApiResponse } from 'cloudinary';
import { uploads } from '@authentication/utils/cloudinary-uploads';

const createNewUser = async (req: Request, res: Response): Promise<void> => {
  console.log('FROM createNewUser()');
  const { error } = await Promise.resolve(signupSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'Authentication Service - createNewUser()');
  }
  console.log('FROM createNewUser() VALIDATION: SUCCESS');

  const { username, email, password, country, profilePicture } = req.body;

  const isUserExist: IAuthDocument = await getUserByEmailOrUsername(username, email);
  if (isUserExist) {
    throw new BadRequestError('Email or Username already exist', 'Authentication Service - createNewUser()');
  }

  console.log('USER IS NOT ALREADY EXIST');

  const profilePublicId: string = uuidV4();

  console.log('FROM createNewUser() CREATED', profilePublicId, 'CLOUDINARY: START');

  const uploadResult: UploadApiResponse = (await uploads(profilePicture, profilePublicId, true, true)) as UploadApiResponse;

  console.log('FROM createNewUser() CREATED', profilePublicId, 'CLOUDINARY: SUCCESS');

  if (!uploadResult?.public_id) {
    throw new BadRequestError('Failed to upload profile picture. Please try again', 'Authentication Service - createNewUser()');
  }
  console.log('FROM createNewUser() UPLOAD: SUCCESS');

  const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
  const randomChars: string = randomBytes.toString('hex');

  const authData: IAuthDocument = {
    username: firstLetterUppercase(username),
    email: lowerCase(email),
    profilePublicId,
    password,
    profilePicture: uploadResult?.secure_url,
    country,
    emailVerificationToken: randomChars
  } as IAuthDocument;

  const result: IAuthDocument = await createUser(authData);

  // construct verification link
  const verificationLink = `${config.CLIENT_URL}/confirm-email?v_token=${authData.emailVerificationToken}`;
  const messageDetails: IEmailMessageDetails = {
    receiverEmail: result.email!,
    verifyLink: verificationLink,
    template: 'verifyEmail'
  };

  await publishMessage(
    authChannel,
    'email-notification',
    'auth-email',
    JSON.stringify(messageDetails),
    'User created and its details sent to notification service for email verification'
  );

  const userJWT: string = signToken(result.id!, result.email!, result.username!);

  res.status(StatusCodes.CREATED).json({ message: 'User created successfully', user: result, token: userJWT });
};

export { createNewUser };
