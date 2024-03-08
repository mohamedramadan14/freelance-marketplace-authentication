import { IAuthDocument, IAuthPayload } from '@mohamedramadan14/freelance-shared';
import { Response } from 'express';

export interface IJWT {
  jwt?: string;
}

export interface IAuthMock {
  id?: number;
  username?: string;
  email?: string;
  password?: string;
  createdAt?: Date | string;
}

export const authUserPayload: IAuthPayload = {
  id: 1,
  username: 'mocked_user',
  email: 'mocked_email@gmail.com',
  iat: 1234567890
};

export const authMock: IAuthDocument = {
  id: 1,
  profilePublicId: '1256427563366545656',
  username: 'mocked_username',
  email: 'mocked_email@gmail.com',
  country: 'EGYPT',
  profilePicture: '',
  emailVerified: 1,
  createdAt: '2023-12-1T07:42:24.23Z',
  comparePassword: () => {},
  hashPassword: () => {}
} as unknown as IAuthDocument;

export const authMockRequest = (sessionData: IJWT, body: IAuthMock, currentUser?: IAuthPayload | null, params?: unknown) => {
  return {
    session: sessionData,
    body,
    params,
    currentUser
  };
};

export const authMockResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
