import { changePassword, forgotPassword, resetPassword } from '@authentication/controllers/password';
import { read } from '@authentication/controllers/signin';
import { createNewUser } from '@authentication/controllers/signup';
import { update } from '@authentication/controllers/verify-emails';
import express, { Router } from 'express';

const router: Router = express.Router();

const authRoutes = (): Router => {
  router.post('/signup', createNewUser);
  router.post('/signin', read);
  router.put('/verify-email', update);
  router.put('/forgot-password', forgotPassword);
  router.put('/reset-password/:token', resetPassword);
  router.put('/change-password', changePassword);
  return router;
};

export { authRoutes };
