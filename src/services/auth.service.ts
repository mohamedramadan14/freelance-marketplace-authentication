import { config } from '@authentication/config';
import { publishMessage } from '@authentication/queues/auth.producer';
import { AuthModel } from '@authentication/models/auth.schema';
import { authChannel } from '@authentication/server';
import { IAuthBuyerMessageDetails, IAuthDocument, firstLetterUppercase, lowerCase } from '@mohamedramadan14/freelance-shared';
import { sign } from 'jsonwebtoken';
import { omit } from 'lodash';
import { Model, Op } from 'sequelize';

const createUser = async (data: IAuthDocument): Promise<IAuthDocument> => {
  const newUser: Model = await AuthModel.create(data);
  const messageDetails: IAuthBuyerMessageDetails = {
    username: newUser.dataValues.username!,
    email: newUser.dataValues.email!,
    profilePicture: newUser.dataValues.profilePicture!,
    country: newUser.dataValues.country!,
    createdAt: newUser.dataValues.createdAt!,
    type: 'auth'
  };

  await publishMessage(
    authChannel,
    'buyer-updates',
    'user-buyer',
    JSON.stringify(messageDetails),
    'Buyer Created and its details sent to buyer service'
  );

  const userData: IAuthDocument = omit(newUser.dataValues, ['password']) as IAuthDocument;

  return userData;
};

const getUserById = async (authId: number): Promise<IAuthDocument> => {
  const user: Model = (await AuthModel.findOne({
    where: { id: authId },
    attributes: {
      exclude: ['password']
    }
  })) as Model;
  return user.dataValues;
};

const getUserByEmailOrUsername = async (username: string, email: string): Promise<IAuthDocument> => {
  const user: Model = (await AuthModel.findOne({
    where: { [Op.or]: [{ username: firstLetterUppercase(username), email: lowerCase(email) }] }
  })) as Model;
  return user?.dataValues;
};

const getUserByUsername = async (username: string): Promise<IAuthDocument> => {
  const user: Model = (await AuthModel.findOne({
    where: { username: firstLetterUppercase(username) }
  })) as Model;
  return user.dataValues;
};

const getUserByEmail = async (email: string): Promise<IAuthDocument> => {
  const user: Model = (await AuthModel.findOne({
    where: { email: lowerCase(email) }
  })) as Model;

  return user.dataValues;
};

const getUserByEmailVerificationToken = async (token: string): Promise<IAuthDocument> => {
  const user: Model = (await AuthModel.findOne({
    where: { emailVerificationToken: token },
    attributes: {
      exclude: ['password']
    }
  })) as Model;
  return user.dataValues;
};

const getUserByPasswordToken = async (token: string): Promise<IAuthDocument> => {
  const user: Model = (await AuthModel.findOne({
    where: { [Op.and]: [{ passwordResetToken: token }, { passwordResetExpires: { [Op.gt]: new Date() } }] },
    attributes: {
      exclude: ['password']
    }
  })) as Model;

  return user.dataValues;
};

const updateVerifyEmail = async (id: number, emailVerified: number, emailVerificationToken: string): Promise<void> => {
  await AuthModel.update(
    {
      emailVerified,
      emailVerificationToken
    },
    {
      where: { id }
    }
  );
};

const updatePasswordToken = async (id: number, token: string, tokenExpiration: Date): Promise<void> => {
  await AuthModel.update(
    {
      passwordResetToken: token,
      passwordResetExpires: tokenExpiration
    },
    {
      where: { id }
    }
  );
};

const updatePassword = async (id: number, password: string): Promise<void> => {
  await AuthModel.update(
    {
      password,
      passwordResetToken: '',
      passwordResetExpires: new Date()
    },
    {
      where: { id }
    }
  );
};

const signToken = (id: number, email: string, username: string): string => {
  return sign({ id, email, username }, config.JWT_TOKEN!);
};

export {
  getUserByPasswordToken,
  getUserByEmailVerificationToken,
  getUserByEmail,
  getUserByUsername,
  getUserByEmailOrUsername,
  getUserById,
  createUser,
  updateVerifyEmail,
  updatePasswordToken,
  updatePassword,
  signToken
};
