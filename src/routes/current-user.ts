import { readUser, resendEmail } from '@authentication/controllers/current-user';
import { renewToken } from '@authentication/controllers/refresh-token';
import express, { Router } from 'express';

const router: Router = express.Router();

const currentUserRoutes = (): Router => {
  router.get('/currentuser', readUser);
  router.get('/refresh-token/:username', renewToken);
  router.post('/resend-email', resendEmail);

  return router;
};

export { currentUserRoutes };
