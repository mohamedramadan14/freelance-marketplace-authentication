import crypto from 'crypto';

import { createUser, getUserByEmailOrUsername } from '@authentication/services/auth.service';
import { faker } from '@faker-js/faker';
import { BadRequestError, firstLetterUppercase, IAuthDocument, lowerCase } from '@mohamedramadan14/freelance-shared';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuidV4 } from 'uuid';

export const createSeededUsers = async (req: Request, res: Response): Promise<void> => {
  const { count } = req.params;
  for (let i = 0; i < parseInt(count, 10); i++) {
    const username = faker.internet.userName();
    const email = faker.internet.email();
    const password = 'kawaki';
    const country = faker.location.country();
    const profilePicture = faker.image.urlPicsumPhotos();
    const userExists: IAuthDocument = await getUserByEmailOrUsername(username, email);
    if (userExists) {
      throw new BadRequestError('Username or Email already exist', 'Authentication Service - create() - seed data');
    }
    const profilePublicId: string = uuidV4();
    const randombytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomChars: string = randombytes.toString('hex');

    const authData: IAuthDocument = {
      username: firstLetterUppercase(username),
      email: lowerCase(email),
      password,
      profilePublicId,
      profilePicture,
      country,
      emailVerificationToken: randomChars,
      emailVerified: Math.random() > 0.5 ? 1 : 0
    } as IAuthDocument;
    await createUser(authData);
  }
  res.status(StatusCodes.CREATED).json({ message: 'Users seeded successfully.' });
};
