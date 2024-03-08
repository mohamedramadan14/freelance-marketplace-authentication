import { Request, Response } from 'express';
import * as auth from '@authentication/services/auth.service';
import * as helper from '@mohamedramadan14/freelance-shared';
import * as MessageBroker from '@authentication/queues/auth.producer';
import { authMock, authMockRequest, authMockResponse, authUserPayload } from '@authentication/controllers/test/mocks/auth.mock';
import { readUser, resendEmail } from '@authentication/controllers/current-user';
import { IAuthDocument } from '@mohamedramadan14/freelance-shared';
import { StatusCodes } from 'http-status-codes';

jest.mock('@authentication/services/auth.service');
jest.mock('@mohamedramadan14/freelance-shared');
jest.mock('@authentication/queues/auth.producer');
jest.mock('@elastic/elasticsearch');

const USERNAME = 'username_test_A';
const PASSWORD = 'password_test_A';

describe('current user controller', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('read user ()', () => {
    it('should return authenticated user', async () => {
      const req: Request = authMockRequest(
        {},
        {
          username: USERNAME,
          password: PASSWORD
        },
        authUserPayload
      ) as unknown as Request;

      const res: Response = authMockResponse();

      jest.spyOn(auth, 'getUserById').mockResolvedValue(authMock);

      await readUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User authenticated successfully',
        user: authMock
      });
    });

    it('should return empty user', async () => {
      const req: Request = authMockRequest(
        {},
        {
          username: USERNAME,
          password: PASSWORD
        },
        authUserPayload
      ) as unknown as Request;

      const res: Response = authMockResponse();

      jest.spyOn(auth, 'getUserById').mockResolvedValue({} as unknown as IAuthDocument);

      await readUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User authenticated successfully',
        user: undefined
      });
    });
  });

  describe('resend email ()', () => {
    it('should call BadRequestError for invalid email', async () => {
      const req: Request = authMockRequest(
        {},
        {
          username: USERNAME,
          password: PASSWORD
        },
        authUserPayload
      ) as unknown as Request;

      const res: Response = authMockResponse();

      jest.spyOn(auth, 'getUserByEmail').mockResolvedValue({} as unknown as IAuthDocument);
      jest.spyOn(MessageBroker, 'publishMessage').mockResolvedValue(undefined);

      resendEmail(req, res).catch((err) => {
        expect(helper.BadRequestError).toHaveBeenCalledWith(
          ' Invalid email',
          'Authentication Service - resendEmail() : Email does not exist'
        );
        expect(err).toBeInstanceOf(helper.BadRequestError);
      });
    });

    it('should call updateVerifyEmail ', async () => {
      const req: Request = authMockRequest(
        {},
        {
          username: USERNAME,
          password: PASSWORD
        },
        authUserPayload
      ) as unknown as Request;

      const res: Response = authMockResponse();

      jest.spyOn(auth, 'getUserByEmail').mockResolvedValue(authMock);

      await resendEmail(req, res);
      expect(auth.updateVerifyEmail).toHaveBeenCalled();
      expect(auth.updateVerifyEmail).toHaveBeenCalledTimes(1);
    });

    it('should send verification email to user', async () => {
      const req: Request = authMockRequest(
        {},
        {
          username: USERNAME,
          password: PASSWORD
        },
        authUserPayload
      ) as unknown as Request;

      const res: Response = authMockResponse();

      jest.spyOn(auth, 'getUserByEmail').mockResolvedValue(authMock);
      jest.spyOn(auth, 'getUserById').mockResolvedValue(authMock);

      await resendEmail(req, res);

      expect(auth.updateVerifyEmail).toHaveBeenCalled();
      expect(MessageBroker.publishMessage).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email Verification sent successfully', user: authMock });
    });
  });
});
