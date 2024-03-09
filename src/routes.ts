import { Application } from 'express';
import { authRoutes } from '@authentication/routes/auth';
import { verifyGatewayRequest } from '@authentication/utils/verify-request-middleware';
import { currentUserRoutes } from '@authentication/routes/current-user';
import { healthRoutes } from '@authentication/routes/health';
import { searchRoutes } from '@authentication/routes/search';
import { seedRoutes } from '@authentication/routes/seed';

const BASE_PATH = '/api/v1/auth';
export const appRoutes = (app: Application): void => {
  app.use('', healthRoutes());
  app.use(BASE_PATH, searchRoutes());
  app.use(BASE_PATH, seedRoutes());
  app.use(BASE_PATH, verifyGatewayRequest, authRoutes());
  app.use(BASE_PATH, verifyGatewayRequest, currentUserRoutes());
};
